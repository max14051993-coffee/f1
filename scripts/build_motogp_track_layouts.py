import json
import math
import tempfile
from pathlib import Path
from typing import Dict
from urllib.request import Request, urlopen

import numpy as np
from PIL import Image
from skimage import measure
from svgpathtools import svg2paths2

VIEWBOX = "0 0 1000 1000"

TRACK_SOURCES: Dict[str, Dict[str, str]] = {
    "sepang-international-circuit": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Circuit_Sepang.svg",
        "type": "svg",
    },
    "chang-international-circuit": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/79/Buriram_circuit_map.svg",
        "type": "svg",
    },
    "circuito-de-jerez-angel-nieto": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Jerez_Grand_prix_Circuit_1994-2003.svg",
        "type": "svg",
    },
    "motorland-aragon": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/2/28/Circuit_Alca%C3%B1iz-Aragon_Spain.svg",
        "type": "svg",
    },
    "misano-world-circuit-marco-simoncelli": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Misano_World_Circuit_2007.svg",
        "type": "svg",
    },
    "sachsenring": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Sachsenring.svg",
        "type": "svg",
    },
    "termas-de-rio-hondo": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/6/63/Circuito_Termas_de_R%C3%ADo_Hondo_2013.svg",
        "type": "svg",
    },
    "bugatti-circuit": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/6/69/Bugatti_Circuit.svg",
        "type": "svg",
    },
    "autodromo-internazionale-del-mugello": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mugello_Racing_Circuit_track_map.svg",
        "type": "svg",
    },
    "tt-circuit-assen": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/8/84/TT_Circuit_Assen_2005.svg",
        "type": "svg",
    },
    "automotodrom-brno": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Brno_%28formerly_Masaryk%C5%AFv_okruh%29.svg",
        "type": "svg",
    },
    "mobility-resort-motegi": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Twin_Ring_Motegi_road_course_map.svg",
        "type": "svg",
    },
    "mandalika-international-street-circuit": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/15/Mandalika_International_Street_Circuit.svg",
        "type": "svg",
    },
    "phillip-island": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/8/88/Phillip_Island_Grand_Prix_Circuit_v2022.svg",
        "type": "svg",
    },
    "autodromo-internacional-do-algarve": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Aut%C3%B3dromo_do_Algarve_moto.svg",
        "type": "svg",
    },
    "circuit-ricardo-tormo": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Valencia_%28Ricardo_Tormo%29_track_map.svg",
        "type": "svg",
    },
    "balaton-park": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Balaton_Park_Circuit_Track_Map.png",
        "type": "png",
    },
}


def rdp(points: np.ndarray, epsilon: float) -> np.ndarray:
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    line = end - start
    line_norm = math.hypot(line[0], line[1])
    max_dist = -1.0
    index = -1
    for i in range(1, len(points) - 1):
        point = points[i]
        if line_norm == 0:
            dist = math.hypot(point[0] - start[0], point[1] - start[1])
        else:
            dist = abs(line[0] * (start[1] - point[1]) - line[1] * (start[0] - point[0])) / line_norm
        if dist > max_dist:
            max_dist = dist
            index = i
    if max_dist > epsilon and index > 0:
        first = rdp(points[: index + 1], epsilon)
        second = rdp(points[index:], epsilon)
        return np.vstack((first[:-1], second))
    return np.vstack((start, end))


def normalize_points(points: np.ndarray) -> np.ndarray:
    min_x = points[:, 0].min()
    max_x = points[:, 0].max()
    min_y = points[:, 1].min()
    max_y = points[:, 1].max()
    width = max_x - min_x
    height = max_y - min_y
    scale = 1000.0 / max(width, height)
    xs = (points[:, 0] - min_x) * scale
    ys = (max_y - points[:, 1]) * scale
    scaled_width = width * scale
    scaled_height = height * scale
    offset_x = (1000 - scaled_width) / 2
    offset_y = (1000 - scaled_height) / 2
    xs += offset_x
    ys += offset_y
    return np.column_stack((xs, ys))


def build_path(points: np.ndarray) -> str:
    commands = [f"M{points[0, 0]:.2f},{points[0, 1]:.2f}"]
    for x, y in points[1:]:
        commands.append(f"L{float(x):.2f},{float(y):.2f}")
    commands.append("Z")
    return " ".join(commands)


def extract_from_svg(data: bytes) -> np.ndarray:
    with tempfile.NamedTemporaryFile(suffix=".svg") as tmp:
        tmp.write(data)
        tmp.flush()
        paths, _, _ = svg2paths2(tmp.name)
    lengths = [p.length(error=1e-4) for p in paths]
    candidates = [i for i, p in enumerate(paths) if len(p) > 10]
    if not candidates:
        candidates = list(range(len(paths)))
    idx = max(candidates, key=lambda i: lengths[i])
    path = paths[idx]
    samples = np.linspace(0, 1, 1200, endpoint=True)
    points = np.array([[complex(path.point(t)).real, complex(path.point(t)).imag] for t in samples])
    mask = np.ones(len(points), dtype=bool)
    mask[1:] = np.any(np.abs(np.diff(points, axis=0)) > 1e-6, axis=1)
    return points[mask]


def extract_from_png(data: bytes) -> np.ndarray:
    with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
        tmp.write(data)
        tmp.flush()
        img = Image.open(tmp.name).convert("L")
    max_dim = 1200
    ratio = max(img.size) / max_dim
    resized = img.resize((max(1, int(img.size[0] / ratio)), max(1, int(img.size[1] / ratio))))
    arr = np.array(resized)
    mask = arr < 200
    contours = measure.find_contours(mask.astype(float), 0.5)
    if not contours:
        raise RuntimeError("No contours found in PNG")
    main = max(contours, key=len)
    coords = main * ratio
    return np.column_stack((coords[:, 1], coords[:, 0]))


def process_points(raw_points: np.ndarray) -> str:
    simplified = rdp(raw_points, epsilon=3.0)
    normalized = normalize_points(simplified)
    return build_path(normalized)


def main() -> None:
    output: Dict[str, Dict[str, str]] = {}
    for slug, info in TRACK_SOURCES.items():
        print(f"Processing {slug}...")
        req = Request(info["url"], headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req) as resp:
            data = resp.read()
        if info["type"] == "svg":
            points = extract_from_svg(data)
        else:
            points = extract_from_png(data)
        path_data = process_points(points)
        output[slug] = {"viewBox": VIEWBOX, "path": path_data}
    target_path = Path("data/track-layouts.json")
    existing = json.loads(target_path.read_text())
    existing.update(output)
    ordered = {k: existing[k] for k in sorted(existing.keys())}
    target_path.write_text(json.dumps(ordered, indent=2) + "\n")


if __name__ == "__main__":
    main()
