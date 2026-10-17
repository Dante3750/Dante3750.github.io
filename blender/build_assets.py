"""Builds the 3D models and the rendered images for the portfolio with Blender.

    pip install bpy          (Blender as a Python module, Python 3.11 to 3.13)
    python3 blender/build_assets.py            models + images
    python3 blender/build_assets.py models     models only (fast)
    python3 blender/build_assets.py render     images only

Writes  models/phone.glb  models/headset.glb  models/controller.glb   (loaded by the website)
        images/og.png     images/hero-lite.png                        (link preview and no-3D fallback)
Edit the colours below, run it again, commit the new files.
"""
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, "models")
IMAGES = os.path.join(ROOT, "images")
os.makedirs(MODELS, exist_ok=True)
os.makedirs(IMAGES, exist_ok=True)

# colours, same family as the website theme
SHELL = (0.075, 0.105, 0.19)
BLUE = (0.07, 0.27, 1.0)
AMBER = (1.0, 0.45, 0.06)


# ---------- helpers ----------
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, metal=0.0, rough=0.5, coat=0.0, emit=None, emit_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if coat and "Coat Weight" in b.inputs:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.15
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_strength
    return m


def rr_points(w, h, r, seg=10):
    pts = []
    cx, cz = w / 2 - r, h / 2 - r
    for ci, (sx, sz) in enumerate([(1, 1), (-1, 1), (-1, -1), (1, -1)]):
        a0 = ci * math.pi / 2
        for k in range(seg + 1):
            a = a0 + k / seg * math.pi / 2
            pts.append((sx * cx + r * math.cos(a), sz * cz + r * math.sin(a)))
    return pts


def finish(ob, material, bevel=0.0, segs=4, smooth=True):
    ob.data.materials.append(material)
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    if bevel:
        md = ob.modifiers.new("Bevel", "BEVEL")
        md.width = bevel
        md.segments = segs
        md.limit_method = "ANGLE"
        md.angle_limit = math.radians(35)
    return ob


def prism(name, w, h, r, depth, y, material, bevel=0.0, seg=10):
    """Rounded rectangle in the X/Z plane, extruded along Y from y to y+depth."""
    pts = rr_points(w, h, r, seg)
    bm = bmesh.new()
    v0 = [bm.verts.new((x, y, z)) for x, z in pts]
    v1 = [bm.verts.new((x, y + depth, z)) for x, z in pts]
    n = len(pts)
    bm.faces.new(v0[::-1])
    bm.faces.new(v1)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((v0[i], v0[j], v1[j], v1[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return finish(ob, material, bevel)


def rr_face(name, w, h, r, y, material, seg=10):
    """Single rounded face facing -Y with UVs 0..1 (so a canvas texture fits exactly)."""
    pts = rr_points(w, h, r, seg)
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, z)) for x, z in pts]
    f = bm.faces.new(vs)
    if f.normal.y > 0:
        f.normal_flip()
    uv = bm.loops.layers.uv.new("UVMap")
    for loop in f.loops:
        x, _, z = loop.vert.co
        loop[uv].uv = (x / w + 0.5, z / h + 0.5)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    return ob


def cyl(name, radius, depth, loc, material, axis="Y", verts=32, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc)
    ob = bpy.context.object
    ob.name = name
    if axis == "Y":
        ob.rotation_euler = (math.pi / 2, 0, 0)
    return finish(ob, material, bevel, 3)


def sphere(name, radius, loc, material, seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=radius, location=loc)
    ob = bpy.context.object
    ob.name = name
    return finish(ob, material)


def torus(name, major, minor, loc, material, rot=(0, 0, 0), maj_seg=64, min_seg=16):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=maj_seg, minor_segments=min_seg, location=loc, rotation=rot)
    ob = bpy.context.object
    ob.name = name
    return finish(ob, material)


def box(name, size, loc, material, bevel=0.01):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    ob = bpy.context.object
    ob.name = name
    ob.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    return finish(ob, material, bevel, 3)


def root(name, parts):
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    for p in parts:
        p.parent = e
    return e


# ---------- models (front faces -Y in Blender, which becomes +Z in three.js) ----------
def build_phone():
    body_m = mat("PhoneBody", (0.12, 0.17, 0.3), 0.85, 0.24, 0.8)
    black = mat("Bezel", (0.004, 0.005, 0.008), 0.0, 0.08, 0.5)
    glass = mat("LensGlass", (0.005, 0.01, 0.02), 0.0, 0.03, 1.0)
    ring = mat("LensRing", (0.5, 0.55, 0.65), 1.0, 0.2)
    flash = mat("Flash", (1, 0.9, 0.7), 0.0, 0.4, 0.0, (1, 0.85, 0.6), 1.5)
    screen_m = mat("ScreenMat", (0.02, 0.03, 0.05), 0.0, 0.2)
    W, H, D = 1.0, 2.08, 0.1
    parts = [
        prism("Body", W, H, 0.16, D, -D / 2, body_m, bevel=0.028, seg=14),
        prism("Bezel", W - 0.03, H - 0.03, 0.15, 0.004, -D / 2 - 0.0035, black, seg=14),
        rr_face("Screen", W - 0.09, H - 0.09, 0.125, -D / 2 - 0.0042, screen_m, seg=14),
        prism("CameraBar", W - 0.02, 0.3, 0.12, 0.022, D / 2, mat("Bar", (0.03, 0.04, 0.06), 0.9, 0.2, 0.9), bevel=0.01, seg=10),
    ]
    zc = H / 2 - 0.2
    for i, x in enumerate((-0.22, 0.04)):
        parts.append(cyl("Lens%d" % i, 0.085, 0.03, (x, D / 2 + 0.035, zc), glass, verts=40))
        parts.append(torus("LensRing%d" % i, 0.09, 0.012, (x, D / 2 + 0.05, zc), ring, rot=(math.pi / 2, 0, 0)))
    parts.append(cyl("Flash", 0.03, 0.01, (0.3, D / 2 + 0.03, zc), flash, verts=20))
    parts.append(box("ButtonPower", (0.012, 0.012, 0.22), (W / 2 + 0.002, 0, 0.2), body_m, 0.004))
    parts.append(box("ButtonVol", (0.012, 0.012, 0.3), (W / 2 + 0.002, 0, 0.62), body_m, 0.004))
    return root("Phone", parts)


def build_headset():
    shell = mat("Shell", (0.12, 0.17, 0.3), 0.55, 0.3, 0.7)
    dark = mat("Cushion", (0.01, 0.012, 0.018), 0.0, 0.92)
    plate_m = mat("Plate", (0.004, 0.005, 0.008), 0.9, 0.1, 1.0)
    cam_m = mat("TrackCam", BLUE, 0.0, 0.1, 0.0, BLUE, 3.0)
    ir_m = mat("IRDot", (1, 1, 1), 0.0, 0.2, 0.0, (1, 1, 1), 3.0)
    lens_m = mat("LensGlow", BLUE, 0.0, 0.1, 0.0, BLUE, 2.0)
    strap_m = mat("Strap", (0.05, 0.065, 0.1), 0.2, 0.7)
    W, H, D = 2.0, 1.0, 0.55
    parts = [
        prism("Visor", W, H, 0.36, D, -D / 2, shell, bevel=0.07, seg=16),
        prism("Plate", W - 0.14, H - 0.14, 0.3, 0.012, -D / 2 - 0.008, plate_m, bevel=0.004, seg=14),
        prism("Cushion", W - 0.2, H - 0.18, 0.3, 0.13, D / 2 - 0.01, dark, bevel=0.03, seg=14),
    ]
    for i, (x, z) in enumerate([(-0.78, 0.3), (0.78, 0.3), (-0.78, -0.3), (0.78, -0.3)]):
        parts.append(cyl("TrackCam%d" % i, 0.05, 0.02, (x, -D / 2 - 0.018, z), cam_m, verts=24))
    for i, x in enumerate((-0.22, 0.22)):
        parts.append(cyl("IR%d" % i, 0.032, 0.02, (x, -D / 2 - 0.018, 0.05), ir_m, verts=20))
    for name, x in (("Lens_L", -0.42), ("Lens_R", 0.42)):
        parts.append(cyl(name, 0.3, 0.012, (x, D / 2 + 0.13, 0), lens_m, verts=48))
        parts.append(torus(name + "Rim", 0.31, 0.027, (x, D / 2 + 0.12, 0), shell, rot=(math.pi / 2, 0, 0)))
    # head strap: a flat band that arcs behind the visor
    cu = bpy.data.curves.new("StrapCurve", "CURVE")
    cu.dimensions = "3D"
    sp = cu.splines.new("POLY")
    N = 40
    sp.points.add(N)
    for i in range(N + 1):
        a = math.pi * i / N
        sp.points[i].co = (1.04 * math.cos(a), 0.2 + 1.7 * math.sin(a), 0, 1)
    cu.bevel_depth = 0.06
    cu.extrude = 0.12
    cu.use_fill_caps = True
    st = bpy.data.objects.new("Strap", cu)
    bpy.context.collection.objects.link(st)
    bpy.context.view_layer.objects.active = st
    st.select_set(True)
    bpy.ops.object.convert(target="MESH")
    st.data.materials.append(strap_m)
    parts.append(st)
    for x in (-1.04, 1.04):
        parts.append(cyl("Pod", 0.1, 0.2, (x, 0.25, 0), shell, axis="X", bevel=0.02))
        parts[-1].rotation_euler = (math.pi / 2, 0, math.pi / 2)
    return root("Headset", parts)


def build_controller():
    body = mat("CtrlBody", (0.12, 0.17, 0.3), 0.55, 0.3, 0.7)
    led = mat("LED", (1, 1, 1), 0.0, 0.2, 0.0, (1, 1, 1), 4.0)
    stick = mat("Stick", BLUE, 0.0, 0.2, 0.0, BLUE, 2.5)
    parts = [
        torus("Ring", 0.26, 0.045, (0, 0, 0.42), body, rot=(0.2, 0, 0)),
        cyl("Grip", 0.085, 0.62, (0, 0, 0), body, axis="Z", bevel=0.02),
        sphere("Stick", 0.05, (0, -0.09, 0.2), stick),
    ]
    parts[0].name = "Ring"
    for k in range(6):
        a = k / 6 * math.tau
        # LEDs sit on the tilted ring: ring plane is spanned by X and (0, cos t, sin t)
        t = 0.2
        parts.append(sphere("Led%d" % k, 0.018, (math.cos(a) * 0.26, math.sin(a) * 0.26 * math.cos(t), 0.42 + math.sin(a) * 0.26 * math.sin(t)), led, 8))
    return root("Controller", parts)


def export(name, obj):
    bpy.ops.object.select_all(action="DESELECT")
    stack = [obj]
    while stack:
        o = stack.pop()
        o.select_set(True)
        stack.extend(o.children)
    path = os.path.join(MODELS, name + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
                              export_materials="EXPORT", export_cameras=False, export_lights=False)
    print("wrote", path, os.path.getsize(path) // 1024, "KB")


def build_models():
    for name, fn in (("phone", build_phone), ("headset", build_headset), ("controller", build_controller)):
        reset()
        export(name, fn())


# ---------- renders ----------
def render(name, w, h, samples, transparent, layout):
    reset()
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.film_transparent = transparent
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast" if "AgX - Medium High Contrast" in [l.name for l in bpy.types.ColorManagedViewSettings.bl_rna.properties["look"].enum_items] else "None"
    # world
    wd = bpy.data.worlds.new("W")
    wd.use_nodes = True
    sc.world = wd
    bg = wd.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.006, 0.009, 0.016, 1)
    bg.inputs["Strength"].default_value = 1.0
    # objects
    h_obj = build_headset()
    h_obj.location = (-0.9, 0, 0.55)
    h_obj.rotation_euler = (math.radians(4), 0, math.radians(-26))
    h_obj.scale = (1.15, 1.15, 1.15)
    p = build_phone()
    p.location = (1.95, -0.6, 0.15)
    p.rotation_euler = (math.radians(-6), 0, math.radians(24))
    p.scale = (0.78, 0.78, 0.78)
    c = build_controller()
    c.location = (0.55, -1.0, -0.15)
    c.rotation_euler = (math.radians(8), math.radians(-18), math.radians(-22))
    # the phone screen: paint something so it is not a black slab
    scr = [o for o in p.children if o.name == "Screen"][0]
    sm = bpy.data.materials.new("ScreenLit")
    sm.use_nodes = True
    nt = sm.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.02, 0.03, 0.06, 1)
    grad = nt.nodes.new("ShaderNodeTexGradient")
    mp = nt.nodes.new("ShaderNodeMapping")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.01, 0.03, 0.12, 1)
    ramp.color_ramp.elements[1].color = (0.04, 0.2, 0.9, 1)
    nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], grad.inputs["Vector"])
    nt.links.new(grad.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 1.2
    scr.data.materials.clear()
    scr.data.materials.append(sm)
    # lights
    def area(loc, rot, color, power, size):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
        l = bpy.context.object
        l.data.energy, l.data.size, l.data.color = power, size, color
        return l
    area((-5, -4, 4), (math.radians(60), 0, math.radians(-50)), (0.35, 0.55, 1.0), 900, 5)
    area((6, 3, 3), (math.radians(70), 0, math.radians(120)), (1.0, 0.6, 0.25), 700, 4)
    area((0, -2, 6), (0, 0, 0), (0.85, 0.9, 1.0), 260, 6)
    # camera
    cd = bpy.data.cameras.new("Cam")
    cd.lens = 55
    cam = bpy.data.objects.new("Cam", cd)
    bpy.context.collection.objects.link(cam)
    sc.camera = cam
    shift = -1.9 if layout == "og" else 0.0   # the link-preview image keeps its left side free for the name
    tgt = Vector((0.45 + shift, 0, 0.1))
    cam.location = Vector((0.2 + shift, -9.6, 1.6))
    d = tgt - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    out = os.path.join(IMAGES, name + ".png")
    sc.render.filepath = out
    sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    return out


def glow(path, strength=0.9, vignette=True, keep_alpha=False):
    """Soft bloom and a light vignette, like the live site."""
    from PIL import Image, ImageFilter, ImageChops
    import numpy as np
    im = Image.open(path).convert("RGBA")
    rgb, a = im.convert("RGB"), im.split()[3]
    arr = np.asarray(rgb).astype("float32") / 255
    lum = arr.max(axis=2, keepdims=True)
    bright = Image.fromarray((np.clip((arr - 0.62) * 2.5, 0, 1) * (lum > 0.62) * 255).astype("uint8"))
    bl = ImageChops.add(bright.filter(ImageFilter.GaussianBlur(18)), bright.filter(ImageFilter.GaussianBlur(6)))
    out = np.clip(arr + np.asarray(bl).astype("float32") / 255 * strength, 0, 1)
    if vignette:
        h, w = out.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w]
        r2 = ((xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2)
        out *= (1 - np.clip(r2 * 1.1, 0, 0.5))[..., None]
    res = Image.fromarray((out * 255).astype("uint8")).convert("RGBA")
    if keep_alpha:
        res.putalpha(a)
    res.save(path, optimize=True)


def font(size, bold=True):
    from PIL import ImageFont
    for f in ("/usr/share/fonts/opentype/inter/Inter-Bold.otf" if bold else "/usr/share/fonts/opentype/inter/Inter-Regular.otf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def og_text(path):
    from PIL import Image, ImageDraw
    im = Image.open(path).convert("RGB")
    d = ImageDraw.Draw(im)
    d.text((70, 190), "Himanshu", font=font(104), fill=(232, 236, 243))
    d.text((70, 300), "Upadhyay", font=font(104), fill=(232, 236, 243))
    d.text((74, 440), "Senior Android Engineer", font=font(36, False), fill=(255, 179, 71))
    d.text((74, 490), "AR/VR, BLE and real-time streaming apps", font=font(26, False), fill=(141, 153, 171))
    im.save(path, optimize=True)


def build_images():
    p = render("og", 1200, 630, 96, False, "og")
    glow(p)
    og_text(p)
    p = render("hero-lite", 1100, 900, 96, True, "lite")
    glow(p, 0.6, False, True)


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "models"):
        build_models()
    if what in ("all", "render"):
        build_images()
