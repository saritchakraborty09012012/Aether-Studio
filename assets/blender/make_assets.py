"""Build ALCHE WORKS 3D assets: glass crystal shards, extruded triangle logo, iridescent ring.
Run: blender --background --python make_assets.py
"""
import bpy
import bmesh
import math
import random
import os
from mathutils import Vector, Euler

OUT_DIR = os.path.dirname(os.path.abspath(bfile := __file__)) if False else os.path.dirname(os.path.abspath(__file__))

def clean():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves):
        for item in list(block):
            if item.users == 0:
                block.remove(item)

def make_glass_material(name="AlcheGlass", tint=(0.55, 0.7, 1.0, 1.0)):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = tint
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.03
    bsdf.inputs["IOR"].default_value = 1.5
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 1.0
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = 1.0
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 1.0
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def make_chrome_material(name="AlcheChrome"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.9, 0.93, 1.0, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.05
    return mat

def make_iridescent_material(name="AlcheIridescent"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    # thin-film like gradient via layer weight -> color ramp
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.1, 0.9, 0.4, 1)
    e1 = ramp.color_ramp.elements.new(0.35)
    e1.color = (0.95, 0.9, 0.15, 1)
    e2 = ramp.color_ramp.elements.new(0.65)
    e2.color = (0.6, 0.3, 0.95, 1)
    ramp.color_ramp.elements[-1].position = 1.0
    ramp.color_ramp.elements[-1].color = (0.95, 0.4, 0.8, 1)
    nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.6
    bsdf.inputs["Roughness"].default_value = 0.15
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def make_shard(name, size=1.0, seed=0):
    """Angular crystal shard: random convex-ish polyhedron."""
    rng = random.Random(seed)
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    # build an irregular octahedron-like crystal
    sx, sy, sz = size, size * rng.uniform(0.35, 0.7), size * rng.uniform(0.5, 1.4)
    pts = []
    n = rng.choice([5, 6, 7])
    for i in range(n):
        a = 2 * math.pi * i / n + rng.uniform(-0.2, 0.2)
        r = rng.uniform(0.55, 1.0)
        pts.append(bm.verts.new((math.cos(a) * sx * r, math.sin(a) * sy * r, rng.uniform(-0.3, 0.3) * sz)))
    top = bm.verts.new((rng.uniform(-0.2, 0.2) * sx, rng.uniform(-0.2, 0.2) * sy, sz * rng.uniform(0.9, 1.4)))
    bot = bm.verts.new((rng.uniform(-0.2, 0.2) * sx, rng.uniform(-0.2, 0.2) * sy, -sz * rng.uniform(0.9, 1.4)))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((pts[i], pts[j], top))
        bm.faces.new((pts[j], pts[i], bot))
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=0.001)
    bm.to_mesh(mesh)
    bm.free()
    # slight bevel for edge highlights
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = 0.015 * size
    mod.segments = 2
    return obj

def make_shards_collection():
    clean()
    glass = make_glass_material()
    chrome = make_chrome_material()
    root = bpy.data.objects.new("ShardsRoot", None)
    bpy.context.collection.objects.link(root)
    random.seed(42)
    for i in range(14):
        s = make_shard(f"Shard_{i:02d}", size=random.uniform(0.6, 2.2), seed=i * 7 + 3)
        s.parent = root
        s.location = (
            random.uniform(-4.5, 4.5),
            random.uniform(-1.2, 1.2),
            random.uniform(-3.2, 3.2),
        )
        s.rotation_euler = Euler((random.uniform(0, math.pi), random.uniform(0, math.pi), random.uniform(0, math.pi)))
        mat = chrome if i % 4 == 0 else glass
        s.data.materials.append(mat)
    # export root hierarchy as glb
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    for o in bpy.data.objects:
        if o.parent == root or o == root:
            o.select_set(True)
    path = os.path.join(OUT_DIR, "alche_shards.glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True)
    print("exported", path)

def make_triangle_logo():
    """Extruded hollow triangle (A logo) — thick chevron triangle like the site mark."""
    clean()
    mesh = bpy.data.meshes.new("AlcheA")
    obj = bpy.data.objects.new("AlcheA", mesh)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    # outer triangle points (equilateral-ish, flat bottom)
    w, h = 2.0, 1.75
    outer = [(-w, -h * 0.55), (w, -h * 0.55), (0.0, h)]
    iw, ih = w * 0.45, h * 0.42
    inner = [(-iw, -h * 0.55 + 0.02), (iw, -h * 0.55 + 0.02), (0.0, -h * 0.55 + 0.02 + ih)]
    # use shape with hole via two faces bridged manually: build as ring of quads
    vo = [bm.verts.new((x, y, 0)) for x, y in outer]
    vi = [bm.verts.new((x, y, 0)) for x, y in inner]
    # bridge outer to inner (triangular frame)
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((vo[i], vo[j], vi[j], vi[i]))
    # remove inner area verts? inner face hole stays open (good)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=0.0001)
    bm.to_mesh(mesh)
    bm.free()
    solid = obj.modifiers.new("Solidify", "SOLIDIFY")
    solid.thickness = 0.35
    solid.offset = 0
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.03
    bev.segments = 3
    mat = make_glass_material("LogoGlass", tint=(0.75, 0.85, 1.0, 1.0))
    obj.data.materials.append(mat)
    path = os.path.join(OUT_DIR, "alche_logo.glb")
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True)
    print("exported", path)

def make_iridescent_ring():
    clean()
    bpy.ops.mesh.primitive_torus_add(major_radius=1.6, minor_radius=0.22, major_segments=96, minor_segments=32)
    ring = bpy.context.active_object
    ring.name = "IriRing"
    mat = make_iridescent_material()
    ring.data.materials.append(mat)
    path = os.path.join(OUT_DIR, "alche_ring.glb")
    bpy.ops.object.select_all(action='DESELECT')
    ring.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True)
    print("exported", path)

if __name__ == "__main__":
    make_shards_collection()
    make_triangle_logo()
    make_iridescent_ring()
    print("ALL DONE")
