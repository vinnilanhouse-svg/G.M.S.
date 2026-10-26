"""Gera símbolos geográficos locais a partir do Natural Earth (domínio público).
Uso: python3 scripts/build-country-icons.py
Fonte: https://www.naturalearthdata.com/about/terms-of-use/
"""
import json
import math
from pathlib import Path
from urllib.request import urlopen

BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
COUNTRIES = [
    ('BRA', 'brasil', 'Brasil'), ('ARG', 'argentina', 'Argentina'), ('CHL', 'chile', 'Chile'),
    ('MEX', 'mexico', 'México'), ('USA', 'estados-unidos', 'Estados Unidos'), ('CAN', 'canada', 'Canadá'),
    ('PRT', 'portugal', 'Portugal'), ('ESP', 'espanha', 'Espanha'), ('FRA', 'franca', 'França'),
    ('DEU', 'alemanha', 'Alemanha'), ('ITA', 'italia', 'Itália'), ('GBR', 'reino-unido', 'Reino Unido'),
    ('EGY', 'egito', 'Egito'), ('ZAF', 'africa-do-sul', 'África do Sul'),
    ('CHN', 'china', 'China'), ('IND', 'india', 'Índia'), ('JPN', 'japao', 'Japão'), ('RUS', 'russia', 'Rússia'),
    ('AUS', 'australia', 'Austrália'), ('NZL', 'nova-zelandia', 'Nova Zelândia'),
]

def source(name):
    with urlopen(BASE + name + '.geojson', timeout=30) as response:
        return json.load(response)

def polygons(feature):
    geometry = feature['geometry']
    return [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']

def path(points, close=True):
    return 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in points) + ('Z' if close else '')

def area(ring):
    return abs(sum(a[0]*b[1] - b[0]*a[1] for a, b in zip(ring, ring[1:])))

features = source('ne_110m_admin_0_countries')['features']
by_iso = {feature['properties']['ADM0_A3']: feature for feature in features}
icons = []
for iso, slug, label in COUNTRIES:
    shapes = polygons(by_iso[iso])
    # Os símbolos de EUA e França mostram o território continental principal.
    if iso in ['USA', 'FRA']:
        shapes = [max(shapes, key=lambda polygon: area(polygon[0]))]
    rings = [ring for polygon in shapes for ring in polygon]
    if iso == 'RUS':
        rings = [[(lon if lon > 0 else lon + 360, lat) for lon, lat in ring] for ring in rings]
    points = [point for ring in rings for point in ring]
    latitude = (max(point[1] for point in points) + min(point[1] for point in points)) / 2
    aspect = math.cos(math.radians(latitude))
    projected = [[(lon * aspect, -lat) for lon, lat in ring] for ring in rings]
    xs = [x for ring in projected for x, _ in ring]
    ys = [y for ring in projected for _, y in ring]
    scale = 82 / max(max(xs)-min(xs), max(ys)-min(ys))
    cx, cy = (max(xs)+min(xs))/2, (max(ys)+min(ys))/2
    drawing = ''.join(path([(50+(x-cx)*scale, 50+(y-cy)*scale) for x, y in ring]) for ring in projected)
    icons.append({'id': 'pais-' + slug, 'label': label, 'iso': iso, 'path': drawing})

# Projeção ortográfica: costas visíveis do globo, centradas no Atlântico.
lambda0, phi0 = math.radians(-20), math.radians(15)
coasts = []
for feature in source('ne_110m_land')['features']:
    for polygon in polygons(feature):
        for ring in polygon[:1]:
            segment = []
            for lon, lat in ring:
                lam, phi = math.radians(lon)-lambda0, math.radians(lat)
                visible = math.sin(phi0)*math.sin(phi)+math.cos(phi0)*math.cos(phi)*math.cos(lam) >= 0
                if visible:
                    x = 50+42*math.cos(phi)*math.sin(lam)
                    y = 50-42*(math.cos(phi0)*math.sin(phi)-math.sin(phi0)*math.cos(phi)*math.cos(lam))
                    segment.append((x,y))
                elif segment:
                    if len(segment)>1: coasts.append(path(segment, False))
                    segment = []
            if len(segment)>1: coasts.append(path(segment, False))

output = Path(__file__).resolve().parents[1] / 'src' / 'country-icons.js'
output.write_text('// Gerado por scripts/build-country-icons.py. Natural Earth 1:110m, domínio público.\n'
                  '// Mapas esquemáticos para identificação, sem função de navegação.\n'
                  'export const countryIcons = ' + json.dumps(icons, ensure_ascii=False, indent=2) + ';\n\n'
                  'export const earthCoastline = ' + json.dumps(''.join(coasts)) + ';\n')
print(f'{len(icons)} países e Terra: {output.stat().st_size:,} bytes')
