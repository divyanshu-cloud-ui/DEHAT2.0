"""Generate DEHAT's hand-painted brush swipe masks and paint texture tile.

Produces static vector SVG masks (swipe-1.svg .. swipe-6.svg) and paint.webp
for DEHAT 2.0 brush-swipe buttons, per Antigravity Handoff 159 specifications:

- swipe-1.svg .. swipe-6.svg: static vector masks. Each is one <polygon>
  of 50-70 points, viewBox="0 0 200 60", preserveAspectRatio="none",
  torn ends jittered with hand-like noise, top/bottom nearly straight.
  Safe zone: >= 5% inside each torn end (x in [10, 190] is completely solid).
  Zero <filter> elements.
- paint.webp: seamless 360 x 140 tile merging faint tone pools and horizontal
  bristle drag (alpha <= 0.10, light alpha <= 0.03 for WCAG AA >= 4.5:1 on crimson).
- Copies or generates linen-dark.png and linen-light.png.

Usage:
    python3 _internal/tools/make_paint.py [outdir]
"""

import os
import sys
import shutil
import numpy as np
import scipy.ndimage as ndi
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PROJECT_ROOT, 'assets', 'paper')
SEED_BASE = 20261003

def generate_swipe_svg(idx, seed):
    rng = np.random.default_rng(seed)
    
    # 1. Top edge: Left to Right
    n_top = int(rng.integers(8, 12))
    top_xs = np.linspace(7.0, 193.0, n_top)
    top_curve = np.sin(np.linspace(0, np.pi, n_top)) * float(rng.uniform(-0.9, 0.9))
    top_jitter = rng.normal(0, 0.35, n_top)
    top_ys = 2.8 + top_curve + top_jitter
    top_ys = np.clip(top_ys, 1.6, 4.8)
    
    # 2. Right torn edge: Top to Bottom
    n_right = int(rng.integers(18, 23))
    right_ys = np.linspace(top_ys[-1], 56.5, n_right)
    right_xs = np.zeros(n_right)
    base_r = float(rng.uniform(193.5, 195.5))
    for i in range(n_right):
        spike = float(rng.choice([-3.2, -1.8, -0.4, 1.4, 2.8], p=[0.15, 0.25, 0.25, 0.2, 0.15]))
        right_xs[i] = base_r + spike + float(rng.uniform(-0.7, 0.7))
    right_xs = np.clip(right_xs, 190.2, 199.2)
    
    # 3. Bottom edge: Right to Left
    n_bottom = int(rng.integers(8, 12))
    bot_xs = np.linspace(right_xs[-1], 7.0, n_bottom)
    bot_curve = np.sin(np.linspace(0, np.pi, n_bottom)) * float(rng.uniform(-0.9, 0.9))
    bot_jitter = rng.normal(0, 0.35, n_bottom)
    bot_ys = 56.8 + bot_curve + bot_jitter
    bot_ys = np.clip(bot_ys, 55.0, 58.4)
    
    # 4. Left torn edge: Bottom to Top
    n_left = int(rng.integers(18, 23))
    left_ys = np.linspace(bot_ys[-1], top_ys[0], n_left)
    left_xs = np.zeros(n_left)
    base_l = float(rng.uniform(4.5, 6.5))
    for i in range(n_left):
        spike = float(rng.choice([-2.8, -1.4, 0.4, 1.8, 3.2], p=[0.15, 0.2, 0.25, 0.25, 0.15]))
        left_xs[i] = base_l + spike + float(rng.uniform(-0.7, 0.7))
    left_xs = np.clip(left_xs, 0.8, 9.8)
    
    # Collect unique loop points (excluding duplicates at boundaries)
    points = []
    for x, y in zip(top_xs[:-1], top_ys[:-1]):
        points.append((round(float(x), 1), round(float(y), 1)))
    for x, y in zip(right_xs[:-1], right_ys[:-1]):
        points.append((round(float(x), 1), round(float(y), 1)))
    for x, y in zip(bot_xs[:-1], bot_ys[:-1]):
        points.append((round(float(x), 1), round(float(y), 1)))
    for x, y in zip(left_xs[:-1], left_ys[:-1]):
        points.append((round(float(x), 1), round(float(y), 1)))
        
    pts_str = " ".join(f"{x},{y}" for x, y in points)
    svg_content = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none"><polygon points="{pts_str}" fill="#000"/></svg>\n'
    
    filename = f"swipe-{idx}.svg"
    filepath = os.path.join(OUT, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
        
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return filename, len(points), min(xs), max(xs), min(ys), max(ys), os.path.getsize(filepath)

def generate_paint_webp():
    W, H = 360, 140
    rng = np.random.default_rng(SEED_BASE)
    
    # 1. Seamless pooling: wrapped Gaussian noise
    raw_pool = rng.normal(0, 1, (H, W))
    pool = ndi.gaussian_filter(raw_pool, (18.0, 36.0), mode='wrap')
    pool = (pool - pool.mean()) / pool.std()
    
    # 2. Seamless bristle drag: horizontal streakiness
    raw_drag = rng.normal(0, 1, (H, W))
    drag = ndi.gaussian_filter(raw_drag, (1.6, 28.0), mode='wrap')
    drag = (drag - drag.mean()) / drag.std()
    
    # 3. Micro-bristles: finer horizontal lines
    raw_micro = rng.normal(0, 1, (H, W))
    micro = ndi.gaussian_filter(raw_micro, (0.8, 12.0), mode='wrap')
    micro = (micro - micro.mean()) / micro.std()
    
    # Combined tone signal
    signal = pool * 0.55 + drag * 0.35 + micro * 0.10
    signal = signal / np.abs(signal).max()
    
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    
    # Dark regions: RGB = (0,0,0), Alpha up to ~0.07 (18/255)
    dark_mask = signal < 0
    dark_alpha = np.clip(-signal[dark_mask] * 18.0, 0, 18).astype(np.uint8)
    rgba[dark_mask, 0] = 0
    rgba[dark_mask, 1] = 0
    rgba[dark_mask, 2] = 0
    rgba[dark_mask, 3] = dark_alpha
    
    # Light regions: RGB = (255,255,255), Alpha capped at 0.027 (7/255 <= 0.03)
    light_mask = signal > 0
    light_alpha = np.clip(signal[light_mask] * 7.0, 0, 7).astype(np.uint8)
    rgba[light_mask, 0] = 255
    rgba[light_mask, 1] = 255
    rgba[light_mask, 2] = 255
    rgba[light_mask, 3] = light_alpha
    
    img = Image.fromarray(rgba)
    filepath = os.path.join(OUT, 'paint.webp')
    img.save(filepath, 'WEBP', lossless=True)
    
    # Measure contrast on crimson #D2305C
    arr = np.array(img, dtype=np.float32) / 255.0
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    base = np.array([210/255.0, 48/255.0, 92/255.0], dtype=np.float32)
    comp = alpha[..., None] * rgb + (1.0 - alpha[..., None]) * base
    lin = np.where(comp <= 0.04045, comp / 12.92, ((comp + 0.055) / 1.055) ** 2.4)
    lum = 0.2126 * lin[:, :, 0] + 0.7152 * lin[:, :, 1] + 0.0722 * lin[:, :, 2]
    cr = 1.05 / (lum + 0.05)
    
    return 'paint.webp', os.path.getsize(filepath), cr.min(), cr.mean(), cr.max()

def ensure_linen_tiles():
    linen_files = ['linen-dark.png', 'linen-light.png']
    for f in linen_files:
        dest = os.path.join(OUT, f)
        if not os.path.exists(dest):
            candidates = [
                os.path.join(PROJECT_ROOT, '_internal', 'qa', 'assets', 'paper', f),
                os.path.join(PROJECT_ROOT, '..', 'DEHAT2.0_FRESH_CLONE', '_internal', 'qa', 'assets', 'paper', f),
                os.path.join(PROJECT_ROOT, '..', 'DEHAT2.0_FRESH_CLONE_OLD', '_internal', 'qa', 'assets', 'paper', f),
            ]
            copied = False
            for c in candidates:
                if os.path.exists(c):
                    shutil.copyfile(c, dest)
                    copied = True
                    break
            if not copied:
                make_paper_script = os.path.join(SCRIPT_DIR, 'make_paper.py')
                if not os.path.exists(make_paper_script):
                    alt_paper = os.path.join(PROJECT_ROOT, '..', 'DEHAT2.0_FRESH_CLONE', '_internal', 'tools', 'make_paper.py')
                    if os.path.exists(alt_paper):
                        shutil.copyfile(alt_paper, make_paper_script)
                if os.path.exists(make_paper_script):
                    import subprocess
                    subprocess.run([sys.executable, make_paper_script, OUT], check=True)

def main():
    os.makedirs(OUT, exist_ok=True)
    print(f"Generating paper and paint assets in: {OUT}")
    
    ensure_linen_tiles()
    
    print("\n--- SVG Brush Swipe Masks (viewBox: 0 0 200 60) ---")
    for idx in range(1, 7):
        seed = SEED_BASE + idx * 101
        fn, n_pts, min_x, max_x, min_y, max_y, size = generate_swipe_svg(idx, seed)
        print(f"  {fn}: {n_pts} points | x: [{min_x:.1f}, {max_x:.1f}] | y: [{min_y:.1f}, {max_y:.1f}] | {size} B")
        assert 50 <= n_pts <= 70, f"{fn} point count {n_pts} out of [50, 70]"
        assert min_x < 10.0, f"{fn} min_x {min_x} exceeds safe zone 10px"
        assert max_x > 190.0, f"{fn} max_x {max_x} below safe zone 190px"
        
    print("\n--- Paint WebP Tile (360 x 140) ---")
    fn, size, cr_min, cr_mean, cr_max = generate_paint_webp()
    print(f"  {fn}: {size} bytes")
    print(f"  Crimson contrast (vs #FFFFFF): worst-pixel = {cr_min:.3f}:1 | mean = {cr_mean:.3f}:1 | best = {cr_max:.3f}:1")
    assert cr_min >= 4.5, f"Worst pixel contrast {cr_min:.3f} falls below 4.5:1 WCAG AA!"
    
    print("\n--- Assets Inventory & Budget Verification ---")
    total_bytes = 0
    for item in sorted(os.listdir(OUT)):
        ipath = os.path.join(OUT, item)
        if os.path.isfile(ipath):
            s = os.path.getsize(ipath)
            total_bytes += s
            print(f"  {item:20s}: {s:8d} bytes ({s/1024:.1f} KB)")
            
    print(f"\nTotal assets/paper/ size: {total_bytes} bytes ({total_bytes / 1024:.2f} KB)")
    assert total_bytes <= 200 * 1024, f"Total size {total_bytes} bytes exceeds 200 KB budget!"
    print("SUCCESS: All assets generated and verified within budget (<= 200 KB) and contrast specs!")

if __name__ == '__main__':
    main()
