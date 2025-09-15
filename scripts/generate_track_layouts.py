import json
import math
from pathlib import Path

import fastf1
import numpy as np

CACHE_DIR = Path('fastf1-cache')
CACHE_DIR.mkdir(exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

EVENTS = {
    'bahrain-international-circuit': {'year': 2024, 'event': 'Bahrain'},
    'jeddah-corniche-circuit': {'year': 2024, 'event': 'Saudi Arabia'},
    'albert-park-circuit': {'year': 2024, 'event': 'Australia'},
    'suzuka-international-racing-course': {'year': 2024, 'event': 'Japan'},
    'shanghai-international-circuit': {'year': 2024, 'event': 'China'},
    'miami-international-autodrome': {'year': 2024, 'event': 'Miami'},
    'imola': {'year': 2024, 'event': 'Emilia Romagna'},
    'circuit-de-monaco': {'year': 2024, 'event': 'Monaco'},
    'circuit-gilles-villeneuve': {'year': 2024, 'event': 'Canada'},
    'circuit-de-barcelona-catalunya': {'year': 2024, 'event': 'Spain'},
    'red-bull-ring': {'year': 2024, 'event': 'Austria'},
    'silverstone-circuit': {'year': 2024, 'event': 'Great Britain'},
    'hungaroring': {'year': 2024, 'event': 'Hungary'},
    'spa-francorchamps': {'year': 2024, 'event': 'Belgium'},
    'circuit-zandvoort': {'year': 2024, 'event': 'Netherlands'},
    'monza': {'year': 2024, 'event': 'Italy'},
    'baku-city-circuit': {'year': 2024, 'event': 'Azerbaijan'},
    'marina-bay-street-circuit': {'year': 2024, 'event': 'Singapore'},
    'circuit-of-the-americas': {'year': 2024, 'event': 'United States'},
    'autodromo-hermanos-rodriguez': {'year': 2024, 'event': 'Mexico'},
    'autodromo-jose-carlos-pace': {'year': 2024, 'event': 'Sao Paulo'},
    'las-vegas-street-circuit': {'year': 2024, 'event': 'Las Vegas'},
    'losail-international-circuit': {'year': 2024, 'event': 'Qatar'},
    'yas-marina-circuit': {'year': 2024, 'event': 'Abu Dhabi'},
}

DRIVER_PER_EVENT = {
    'autodromo-jose-carlos-pace': 'PER',
}

VIEWBOX_SIZE = 1000
EPSILON = 3.0


def _perpendicular_distance(point, start, end):
    if np.allclose(start, end):
        return float(np.linalg.norm(point - start))
    line = end - start
    numerator = abs(line[0] * (start[1] - point[1]) - line[1] * (start[0] - point[0]))
    denominator = math.hypot(float(line[0]), float(line[1]))
    if denominator == 0:
        return 0.0
    return numerator / denominator


def rdp(points, epsilon):
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    dmax = 0.0
    index = 0
    for i in range(1, len(points) - 1):
        d = _perpendicular_distance(points[i], start, end)
        if d > dmax:
            index = i
            dmax = d
    if dmax > epsilon:
        first = rdp(points[: index + 1], epsilon)
        second = rdp(points[index:], epsilon)
        return np.vstack((first[:-1], second))
    return np.vstack((start, end))


def normalize_points(points):
    min_x = points[:, 0].min()
    max_x = points[:, 0].max()
    min_y = points[:, 1].min()
    max_y = points[:, 1].max()

    width = max_x - min_x
    height = max_y - min_y
    scale = VIEWBOX_SIZE / max(width, height)

    xs = (points[:, 0] - min_x) * scale
    ys = (max_y - points[:, 1]) * scale

    scaled_width = width * scale
    scaled_height = height * scale

    offset_x = (VIEWBOX_SIZE - scaled_width) / 2
    offset_y = (VIEWBOX_SIZE - scaled_height) / 2

    xs += offset_x
    ys += offset_y

    return np.column_stack((xs, ys))


def build_path(points):
    commands = [f"M{points[0,0]:.2f},{points[0,1]:.2f}"]
    for x, y in points[1:]:
        commands.append(f"L{float(x):.2f},{float(y):.2f}")
    commands.append('Z')
    return ' '.join(commands)


def generate_layout(event_key, year, event_name, driver):
    session = fastf1.get_session(year, event_name, 'R')
    session.load()
    try:
        lap = session.laps.pick_drivers(driver).pick_fastest()
    except Exception:
        lap = session.laps.pick_fastest()
    telemetry = lap.get_telemetry()[['X', 'Y']].dropna().to_numpy()
    unique_points = [telemetry[0]]
    for point in telemetry[1:]:
        if not np.allclose(point, unique_points[-1]):
            unique_points.append(point)
    unique_points = np.array(unique_points)
    simplified = rdp(unique_points, EPSILON)
    normalized = normalize_points(simplified)
    return build_path(normalized)


layouts = {}
for key, info in EVENTS.items():
    driver = DRIVER_PER_EVENT.get(key, 'VER')
    path = generate_layout(key, info['year'], info['event'], driver)
    layouts[key] = {
        'viewBox': f"0 0 {VIEWBOX_SIZE} {VIEWBOX_SIZE}",
        'path': path,
    }
    print(f"Generated {key} ({len(path.split(' '))} commands)")

output_path = Path('data/track-layouts.json')
output_path.parent.mkdir(exist_ok=True)
output_path.write_text(json.dumps(layouts, indent=2))
print(f"Wrote {output_path}")
