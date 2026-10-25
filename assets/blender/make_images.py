"""Render project thumbnails with Cycles (headless CPU).
Each scene is a small cinematic still matching the project mood.
"""
import bpy
import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(OUT, exist_ok=True)

W, H = 1280, 720


def clean():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.materials, bpy.data.lights, bpy.data.worlds, bpy.data.cameras):
        for it in list(coll):
            if it.users == 0:
                coll.remove(it)


def setup_render(name):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 64
    sc.cycles.use_denoising = True
    sc.render.resolution_x = W
    sc.render.resolution_y = H
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 92
    sc.render.filepath = os.path.join(OUT, name)
    sc.view_settings.exposure = -0.15
    try:
        sc.view_settings.look = 'AgX - Punchy'
    except Exception:
        pass


def mat(name, base=(1, 1, 1, 1), rough=0.4, metal=0.0, emit=None, emit_str=1.0, transmission=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = base
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Transmission Weight" in b.inputs:
        b.inputs["Transmission Weight"].default_value = transmission
    if emit:
        b.inputs["Emission Color"].default_value = emit
        b.inputs["Emission Strength"].default_value = emit_str
    b.inputs["Alpha"].default_value = alpha
    return m


def world_gradient(c1, c2, c3=None):
    w = bpy.data.worlds.new("W")
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    grad = nt.nodes.new("ShaderNodeTexGradient")
    mapping = nt.nodes.new("ShaderNodeMapping")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = c1
    ramp.color_ramp.elements[1].color = c2
    if c3:
        e = ramp.color_ramp.elements.new(0.55)
        e.color = c3
    mapping.inputs["Rotation"].default_value[2] = math.radians(90)
    nt.links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], grad.inputs["Vector"])
    nt.links.new(grad.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.45
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bpy.context.scene.world = w


def cam(loc=(0, -6, 2), rot=(math.radians(78), 0, 0), lens=35):
    cam_data = bpy.data.cameras.new("C")
    cam_data.lens = lens
    c = bpy.data.objects.new("Cam", cam_data)
    bpy.context.collection.objects.link(c)
    c.location = loc
    c.rotation_euler = rot
    bpy.context.scene.camera = c
    return c


def light_sun(e=3, rot=(0.8, 0.2, 0.5), color=(1, 1, 1, 1)):
    ld = bpy.data.lights.new("Sun", 'SUN')
    ld.energy = e
    ld.color = color[:3]
    o = bpy.data.objects.new("Sun", ld)
    bpy.context.collection.objects.link(o)
    o.rotation_euler = rot
    return o


def light_area(e=200, loc=(2, -3, 4), size=5, color=(1, 1, 1, 1)):
    ld = bpy.data.lights.new("Area", 'AREA')
    ld.energy = e
    ld.size = size
    ld.color = color[:3]
    o = bpy.data.objects.new("Area", ld)
    bpy.context.collection.objects.link(o)
    o.location = loc
    return o


def render(name):
    setup_render(name)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)


# ---------- scenes ----------

def scene_kizuna():
    clean()
    world_gradient((0.12, 0.01, 0.22, 1), (0.85, 0.1, 0.45, 1), (0.05, 0.3, 0.9, 1))
    cam((0, -14, 2.5), (math.radians(82), 0, 0), 55)
    light_area(1500, (4, -6, 9), 8, (1, 0.35, 0.7))
    light_area(900, (-6, -4, 6), 7, (0.2, 0.5, 1))
    light_area(600, (0, 2, 7), 5, (1, 0.85, 0.4))
    # glowing orbs cluster — deeper in frame
    for i, (x, y, z, r, col, e) in enumerate([
        (0, 2, 0.5, 1.6, (1, 0.15, 0.5, 1), 14),
        (-2.8, 3, -0.6, 1.0, (0.15, 0.6, 1, 1), 16),
        (2.9, 2.5, 0.2, 0.9, (1, 0.65, 0.1, 1), 18),
        (0.9, 3.5, 1.8, 0.7, (0.65, 0.2, 1, 1), 20),
        (-1.2, 4, 1.4, 0.55, (0.2, 1, 0.8, 1), 16),
    ]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, y, z))
        bpy.context.active_object.data.materials.append(
            mat(f"k{i}", base=col, rough=0.12, emit=col, emit_str=e)
        )
    # chrome torus ring mid-frame
    bpy.ops.mesh.primitive_torus_add(major_radius=2.2, minor_radius=0.18, location=(0, 0.5, 0.3),
                                     rotation=(math.radians(65), 0.25, 0.35))
    bpy.context.active_object.data.materials.append(mat("chrome", base=(0.92, 0.94, 1, 1), metal=1, rough=0.04))
    # floating crystal shards
    gl = mat("kglass", base=(0.55, 0.75, 1, 1), rough=0.02, transmission=0.88)
    for x, z, s, rz in [(-3.5, 1.5, 0.7, 0.5), (3.6, 0.8, 0.55, -0.7), (1.8, 2.2, 0.4, 1.1)]:
        bpy.ops.mesh.primitive_cone_add(radius1=s * 0.4, depth=s * 2.4, location=(x, 1, z), rotation=(rz, 0, rz))
        bpy.context.active_object.data.materials.append(gl)
    render("kizuna.jpg")


def scene_weargo():
    clean()
    world_gradient((0.2, 0.55, 1, 1), (1, 0.35, 0.68, 1), (1, 0.7, 0.78, 1))
    cam((0, -13, 1.2), (math.radians(87), 0, 0), 48)
    light_sun(10, (0.55, 0.35, 0.25), (1, 0.94, 0.9))
    light_area(1100, (0, -6, 10), 10, (1, 0.7, 0.88))
    light_area(450, (-5, 0, 4), 5, (0.55, 0.8, 1))
    light_area(350, (5, -1, 2), 4, (1, 0.5, 0.75))
    # cloud blobs — spread wide, mid-depth
    cl = mat("cloud", base=(1, 1, 1, 1), rough=0.9)
    for x, y, z, s in [(-5, 6, 3.2, 1.6), (5, 7, 2.6, 2.0), (0, 9, 3.8, 1.4),
                       (-2.5, 3, -0.8, 0.9), (3, 4, -1.0, 1.0), (-6.5, 2, 1.5, 1.1)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=s, location=(x, y, z))
        bpy.context.active_object.scale = (1.7, 1, 0.5)
        bpy.context.active_object.data.materials.append(cl)
    # floating figures (elongated spheres) mid-air
    sk = mat("skin", base=(0.95, 0.78, 0.62, 1), rough=0.45)
    wh = mat("cloth", base=(1, 1, 1, 1), rough=0.55)
    for x, z, rz in [(-2.4, 0.6, -0.5), (0.3, 1.4, 0.2), (2.6, 0.3, 0.6)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.45, location=(x, 0, z))
        o = bpy.context.active_object
        o.scale = (0.65, 0.65, 1.7)
        o.rotation_euler = (0.3, rz, rz * 0.5)
        o.data.materials.append(sk)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.55, location=(x, 0, z - 0.6))
        o2 = bpy.context.active_object
        o2.scale = (1.2, 0.7, 0.9)
        o2.data.materials.append(wh)
    render("weargo.jpg")


def scene_discoat():
    clean()
    world_gradient((0.02, 0.07, 0.04, 1), (0.12, 0.28, 0.15, 1))
    cam((0, -10, 1.6), (math.radians(80), 0, 0), 42)
    light_area(350, (0, 2, 4), 4, (0.85, 1, 0.8))
    light_area(180, (-4, -4, 2.5), 3, (1, 0.35, 0.35))
    light_area(120, (4, -3, 2), 3, (0.9, 0.85, 0.6))
    # dark green room planes
    g = mat("grn", base=(0.09, 0.2, 0.11, 1), rough=0.65)
    bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 6, 0), rotation=(math.radians(90), 0, 0))
    bpy.context.active_object.data.materials.append(g)
    bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, -2.2))
    bpy.context.active_object.data.materials.append(mat("flr", base=(0.06, 0.12, 0.07, 1), rough=0.35))
    # red flower spheres
    r = mat("red", base=(0.8, 0.04, 0.08, 1), rough=0.3)
    r2 = mat("red2", base=(0.95, 0.15, 0.2, 1), rough=0.35)
    for x, z, s, m in [(-3.0, 1.2, 0.55, r), (-2.0, 0.4, 0.4, r2), (2.6, 1.4, 0.5, r),
                       (3.4, 0.5, 0.35, r2), (-0.5, 1.8, 0.3, r2)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=s, location=(x, 0, z))
        bpy.context.active_object.data.materials.append(m)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=2.8, location=(x, 0.3, z - 1.5))
        bpy.context.active_object.data.materials.append(mat(f"stem{x}", base=(0.12, 0.32, 0.14, 1)))
    # doorway glow
    bpy.ops.mesh.primitive_plane_add(size=2.2, location=(0.3, 5.9, 0.8), rotation=(math.radians(90), 0, 0))
    bpy.context.active_object.data.materials.append(mat("door", base=(0.9, 1, 0.85, 1), emit=(0.85, 1, 0.8, 1), emit_str=6))
    render("discoat.jpg")


def scene_matsusaka():
    clean()
    world_gradient((0.35, 0.7, 1, 1), (1, 0.82, 0.4, 1), (1, 0.5, 0.32, 1))
    cam((0, -10, 1.4), (math.radians(84), 0, 0), 46)
    light_sun(7, (0.5, 0.5, 0.3), (1, 0.95, 0.85))
    light_area(600, (3, -5, 5), 7, (1, 0.85, 0.6))
    light_area(250, (-4, -2, 3), 4, (0.6, 0.8, 1))
    # warm gradient spheres (abstract joyful row)
    cols = [(0.96, 0.78, 0.62, 1), (0.85, 0.62, 0.4, 1), (0.55, 0.35, 0.22, 1),
            (0.94, 0.72, 0.55, 1), (0.8, 0.55, 0.35, 1)]
    for i, c in enumerate(cols):
        x = -3.2 + i * 1.6
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.72, location=(x, 0, 0.3 + (i % 2) * 0.35))
        bpy.context.active_object.data.materials.append(mat(f"face{i}", base=c, rough=0.4))
    # rainbow arc torus — emissive
    arc_cols = [(1, 0.2, 0.3, 1), (1, 0.55, 0.1, 1), (1, 0.9, 0.2, 1), (0.3, 0.85, 0.3, 1), (0.3, 0.5, 1, 1)]
    for i, c in enumerate(arc_cols):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=4.0 - i * 0.22, minor_radius=0.09,
            location=(0, 5, 0.8), rotation=(math.radians(90), 0, 0),
            major_segments=64, minor_segments=12,
        )
        bpy.context.active_object.data.materials.append(
            mat(f"arc{i}", base=c, emit=c, emit_str=3.5)
        )
    render("matsusaka.jpg")


def scene_shinsekai():
    clean()
    world_gradient((0.005, 0.03, 0.1, 1), (0.02, 0.28, 0.5, 1), (0.3, 0.8, 1, 1))
    cam((0, -11, 2.0), (math.radians(82), 0, 0), 42)
    light_area(1600, (0, 0, 10), 10, (0.5, 0.9, 1))
    light_area(700, (-6, -3, 4), 5, (0.15, 0.6, 1))
    light_area(450, (6, -1, 3), 4, (0.7, 0.9, 1))
    # ice crystal shards
    ice = mat("ice", base=(0.7, 0.94, 1, 1), rough=0.03, transmission=0.92)
    ice.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.31
    ice2 = mat("ice2", base=(0.5, 0.85, 1, 1), rough=0.05, transmission=0.85)
    for x, z, s, rz in [(-3.2, 0.4, 2.0, 0.25), (0, -0.2, 3.0, 0), (3.2, 0.6, 1.8, -0.35),
                        (1.2, 1.6, 1.1, 0.55), (-1.5, 1.3, 0.9, -0.5), (0.6, 2.4, 0.6, 0.9)]:
        bpy.ops.mesh.primitive_cone_add(radius1=s * 0.32, depth=s * 2.4, location=(x, 1.5, z),
                                        rotation=(0, rz, 0))
        bpy.context.active_object.data.materials.append(ice if s > 1.5 else ice2)
    # glowing water plane with roughness variation
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 3, -1.8))
    bpy.context.active_object.data.materials.append(
        mat("sea", base=(0.06, 0.5, 0.75, 1), emit=(0.15, 0.75, 1, 1), emit_str=2.2, rough=0.08)
    )
    # underwater glow orbs
    for x, z, e in [(-2, 0.5, 8), (2.5, 0.8, 6), (0.5, 2.0, 10)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(x, 0.5, z))
        bpy.context.active_object.data.materials.append(
            mat(f"gl{x}", base=(0.5, 0.95, 1, 1), emit=(0.4, 0.9, 1, 1), emit_str=e)
        )
    render("shinsekai.jpg")


def scene_stella():
    clean()
    world_gradient((0.2, 0.45, 0.95, 1), (0.98, 0.5, 0.78, 1), (1, 0.78, 0.7, 1))
    cam((0, -12, 1.5), (math.radians(85), 0, 0), 50)
    light_sun(9, (0.65, 0.3, 0.45), (1, 0.85, 0.92))
    light_area(1200, (0, -5, 9), 12, (1, 0.7, 0.88))
    light_area(500, (5, 0, 3), 6, (0.45, 0.6, 1))
    light_area(400, (-5, -2, 1), 5, (1, 0.5, 0.75))
    # pastel clouds — pink-tinted so they read against sky
    cl = mat("pc", base=(1, 0.82, 0.9, 1), rough=0.9)
    cl2 = mat("pc2", base=(0.85, 0.75, 1, 1), rough=0.9)
    for x, y, z, s, m in [(-5.5, 7, 1.0, 2.2, cl), (5.2, 8, 1.8, 2.5, cl), (0, 10, 3.0, 1.8, cl2),
                          (-2, 4, -1.2, 1.2, cl2), (3.2, 3.5, -1.5, 1.1, cl), (-7, 2, 0.5, 1.4, cl)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=s, location=(x, y, z))
        bpy.context.active_object.scale = (1.8, 1, 0.48)
        bpy.context.active_object.data.materials.append(m)
    # floating white figure
    bpy.ops.mesh.primitive_cone_add(radius1=0.85, radius2=0.15, depth=2.2, location=(0, 1, 0.4))
    bpy.context.active_object.data.materials.append(mat("dress", base=(1, 0.98, 0.99, 1), rough=0.4))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, location=(0, 1, 1.75))
    bpy.context.active_object.data.materials.append(mat("head", base=(0.96, 0.78, 0.68, 1), rough=0.4))
    # sparkles
    sp = mat("sp", base=(1, 1, 1, 1), emit=(1, 0.95, 1, 1), emit_str=50)
    for x, y, z in [(2.0, 2, 2.6), (-2.4, 3, 2.0), (1.1, 5, 3.4), (-1.0, 4, 1.2)]:
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.1, location=(x, y, z), subdivisions=1)
        bpy.context.active_object.data.materials.append(sp)
    render("stella.jpg")


def scene_fortnite():
    clean()
    world_gradient((0.15, 0.55, 0.95, 1), (0.55, 0.8, 1, 1))
    cam((0, -9, 1.5), (math.radians(84), 0, 0), 35)
    light_sun(5, (0.5, 0.4, 0.3), (1, 1, 0.95))
    # lowpoly hills
    gr = mat("grass", base=(0.2, 0.55, 0.25, 1), rough=0.8)
    for x, s in [(-4, 3.5), (0, 4.5), (4.5, 3.8)]:
        bpy.ops.mesh.primitive_ico_sphere_add(radius=s, location=(x, 6, -s * 0.75), subdivisions=2)
        bpy.context.active_object.scale = (1.5, 1, 0.6)
        bpy.context.active_object.data.materials.append(gr)
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 4, -2))
    bpy.context.active_object.data.materials.append(mat("g2", base=(0.22, 0.5, 0.22, 1), rough=0.85))
    # clouds
    cl = mat("fc", base=(1, 1, 1, 1), rough=0.9)
    for x, z in [(-4, 3.2), (3.5, 2.8), (0.5, 3.6)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.9, location=(x, 8, z))
        bpy.context.active_object.scale = (1.8, 1, 0.5)
        bpy.context.active_object.data.materials.append(cl)
    render("fortnite.jpg")


def scene_unreal():
    clean()
    world_gradient((0.01, 0.02, 0.06, 1), (0.04, 0.12, 0.3, 1))
    cam((0, -8, 1.0), (math.radians(86), 0, 0), 40)
    light_area(250, (0, 0, 5), 6, (0.4, 0.65, 1))
    light_area(150, (-5, -2, 1), 3, (1, 1, 1))
    # light streak planes
    for i in range(10):
        bpy.ops.mesh.primitive_plane_add(
            size=1,
            location=(-4 + i * 0.9, 2 + i * 0.15, -0.5 + (i % 3) * 0.5),
            rotation=(math.radians(90), 0, math.radians(-18)),
        )
        o = bpy.context.active_object
        o.scale = (3.2, 0.04 + (i % 3) * 0.03, 1)
        col = (0.3, 0.7, 1, 1) if i % 2 else (1, 1, 1, 1)
        o.data.materials.append(mat(f"streak{i}", base=col, emit=col, emit_str=8 + i))
    # chrome speed form
    bpy.ops.mesh.primitive_cube_add(size=1.4, location=(0.2, 1, 0.1), rotation=(0, 0, 0.25))
    bpy.context.active_object.scale = (1.8, 0.7, 0.35)
    bpy.context.active_object.data.materials.append(
        mat("body", base=(0.75, 0.82, 0.95, 1), metal=1, rough=0.08)
    )
    bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 2, -1.2))
    bpy.context.active_object.data.materials.append(
        mat("road", base=(0.03, 0.04, 0.08, 1), metal=0.4, rough=0.2)
    )
    render("unreal.jpg")


if __name__ == "__main__":
    scene_kizuna()
    scene_weargo()
    scene_discoat()
    scene_matsusaka()
    scene_shinsekai()
    scene_stella()
    scene_fortnite()
    scene_unreal()
    print("ALL IMAGES DONE")
