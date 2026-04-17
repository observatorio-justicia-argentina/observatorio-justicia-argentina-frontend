/**
 * Genera public/buenos-aires-departments.json
 * Fuente de polígonos: OpenStreetMap Overpass API (admin_level=6, Buenos Aires province)
 * Mapeo partido → departamento judicial: Ley Orgánica del Poder Judicial PBA
 *
 * Ejecutar: node scripts/generate-ba-departments.mjs
 */

// Mapeo partido (nombre OSM) → departamento judicial SCBA
const PARTIDO_TO_DEPTO = {
  // ── Departamento La Plata ─────────────────────────────────────────────────
  "La Plata": "La Plata",
  "Berisso": "La Plata",
  "Ensenada": "La Plata",
  "Magdalena": "La Plata",
  "Brandsen": "La Plata",
  "San Vicente": "La Plata",
  "Cañuelas": "La Plata",
  "Punta Indio": "La Plata",

  // ── Departamento Mercedes ─────────────────────────────────────────────────
  "Mercedes": "Mercedes",
  "General Las Heras": "Mercedes",
  "Luján": "Mercedes",
  "Navarro": "Mercedes",
  "Suipacha": "Mercedes",
  "Carmen de Areco": "Mercedes",
  "San Antonio de Areco": "Mercedes",
  "San Andrés de Giles": "Mercedes",
  "Chivilcoy": "Mercedes",
  "Lobos": "Mercedes",
  "General Alvear": "Mercedes",
  "Roque Pérez": "Mercedes",
  "Saladillo": "Mercedes",

  // ── Departamento Zárate-Campana ───────────────────────────────────────────
  "Zárate": "Zárate-Campana",
  "Campana": "Zárate-Campana",
  "Exaltación de la Cruz": "Zárate-Campana",
  "Pilar": "Zárate-Campana",
  "Escobar": "Zárate-Campana",

  // ── Departamento San Nicolás ──────────────────────────────────────────────
  "San Nicolás": "San Nicolás",
  "Baradero": "San Nicolás",
  "Colón": "San Nicolás",
  "Ramallo": "San Nicolás",
  "San Pedro": "San Nicolás",

  // ── Departamento Pergamino ────────────────────────────────────────────────
  "Pergamino": "Pergamino",
  "Arrecifes": "Pergamino",
  "Capitán Sarmiento": "Pergamino",
  "Rojas": "Pergamino",
  "Salto": "Pergamino",

  // ── Departamento Junín ────────────────────────────────────────────────────
  "Junín": "Junín",
  "Alberti": "Junín",
  "Bragado": "Junín",
  "Chacabuco": "Junín",
  "General Arenales": "Junín",
  "General Pinto": "Junín",
  "Leandro N. Alem": "Junín",
  "Lincoln": "Junín",
  "Nueve de Julio": "Junín",
  "Florentino Ameghino": "Junín",
  "General Viamonte": "Junín",

  // ── Departamento Trenque Lauquen ──────────────────────────────────────────
  "Trenque Lauquen": "Trenque Lauquen",
  "Carlos Tejedor": "Trenque Lauquen",
  "Carlos Casares": "Trenque Lauquen",
  "Daireaux": "Trenque Lauquen",
  "General Villegas": "Trenque Lauquen",
  "Hipólito Yrigoyen": "Trenque Lauquen",
  "Pehuajó": "Trenque Lauquen",
  "Pellegrini": "Trenque Lauquen",
  "Rivadavia": "Trenque Lauquen",
  "Salliqueló": "Trenque Lauquen",
  "Tres Lomas": "Trenque Lauquen",
  "Veinticinco de Mayo": "Trenque Lauquen",
  "Guaminí": "Trenque Lauquen",

  // ── Departamento Dolores ──────────────────────────────────────────────────
  "Dolores": "Dolores",
  "Castelli": "Dolores",
  "Chascomús": "Dolores",
  "General Belgrano": "Dolores",
  "General Lavalle": "Dolores",
  "General Madariaga": "Dolores",
  "General Paz": "Dolores",
  "Lezama": "Dolores",
  "Maipú": "Dolores",
  "Monte": "Dolores",
  "Pila": "Dolores",
  "Tordillo": "Dolores",
  "General Guido": "Dolores",
  "Ayacucho": "Dolores",

  // ── Departamento Azul ─────────────────────────────────────────────────────
  "Azul": "Azul",
  "Benito Juárez": "Azul",
  "General La Madrid": "Azul",
  "Las Flores": "Azul",
  "Olavarría": "Azul",
  "Rauch": "Azul",
  "Tandil": "Azul",
  "Tapalqué": "Azul",
  "Laprida": "Azul",
  "Bolívar": "Azul",

  // ── Departamento Necochea ─────────────────────────────────────────────────
  "Necochea": "Necochea",
  "Lobería": "Necochea",
  "San Cayetano": "Necochea",
  "Tres Arroyos": "Necochea",
  "González Chaves": "Necochea",
  "Adolfo Gonzales Chaves": "Necochea",
  "Coronel Dorrego": "Necochea",

  // ── Departamento Mar del Plata ────────────────────────────────────────────
  "General Pueyrredón": "Mar del Plata",
  "General Alvarado": "Mar del Plata",
  "Balcarce": "Mar del Plata",
  "Mar Chiquita": "Mar del Plata",
  "Villa Gesell": "Mar del Plata",
  "Pinamar": "Mar del Plata",
  "La Costa": "Mar del Plata",

  // ── Departamento Bahía Blanca ─────────────────────────────────────────────
  "Bahía Blanca": "Bahía Blanca",
  "Coronel de Marina Leonardo Rosales": "Bahía Blanca",
  "Coronel Rosales": "Bahía Blanca",
  "Monte Hermoso": "Bahía Blanca",
  "Coronel Suárez": "Bahía Blanca",
  "Puán": "Bahía Blanca",
  "Puan": "Bahía Blanca",
  "Tornquist": "Bahía Blanca",
  "Saavedra": "Bahía Blanca",
  "Coronel Pringles": "Bahía Blanca",
  "Adolfo Alsina": "Bahía Blanca",
  "Villarino": "Bahía Blanca",
  "Patagones": "Bahía Blanca",

  // ── GBA: Departamento San Isidro ──────────────────────────────────────────
  "San Isidro": "San Isidro",
  "San Fernando": "San Isidro",
  "Tigre": "San Isidro",
  "Vicente López": "San Isidro",

  // ── GBA: Departamento San Martín ──────────────────────────────────────────
  "General San Martín": "San Martín",
  "Tres de Febrero": "San Martín",
  "José C. Paz": "San Martín",
  "Malvinas Argentinas": "San Martín",
  "San Miguel": "San Martín",

  // ── GBA: Departamento Morón ───────────────────────────────────────────────
  "Morón": "Morón",
  "Hurlingham": "Morón",
  "Ituzaingó": "Morón",

  // ── GBA: Departamento Moreno-General Rodríguez ───────────────────────────
  "Moreno": "Moreno-Gral. Rodríguez",
  "General Rodríguez": "Moreno-Gral. Rodríguez",
  "Marcos Paz": "Moreno-Gral. Rodríguez",
  "Merlo": "Moreno-Gral. Rodríguez",

  // ── GBA: Departamento La Matanza ──────────────────────────────────────────
  "La Matanza": "La Matanza",

  // ── GBA: Departamento Lomas de Zamora ────────────────────────────────────
  "Lomas de Zamora": "Lomas de Zamora",
  "Almirante Brown": "Lomas de Zamora",
  "Esteban Echeverría": "Lomas de Zamora",
  "Ezeiza": "Lomas de Zamora",
  "Presidente Perón": "Lomas de Zamora",

  // ── GBA: Departamento Quilmes ─────────────────────────────────────────────
  "Quilmes": "Quilmes",
  "Berazategui": "Quilmes",
  "Florencio Varela": "Quilmes",

  // ── GBA: Departamento Avellaneda-Lanús ────────────────────────────────────
  "Avellaneda": "Avellaneda-Lanús",
  "Lanús": "Avellaneda-Lanús",
  "Lomas de Zamora": "Lomas de Zamora", // ya está arriba, no pisará
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// OSM relation ID 1632167 = Provincia de Buenos Aires
// area id = relation_id + 3,600,000,000 = 3601632167
// admin_level=5 son los 135 partidos (verificado)
const QUERY = `
[out:json][timeout:180];
area(3601632167)->.pba;
(
  relation["boundary"="administrative"]["admin_level"="5"](area.pba);
);
out body;
>;
out skel qt;
`.trim();

async function fetchOverpass(query) {
  console.log("Fetching partido boundaries from Overpass API...");
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
  return res.json();
}

function osmToGeoJson(osmData) {
  const nodeMap = new Map(osmData.elements.filter(e => e.type === "node").map(n => [n.id, n]));
  const wayMap = new Map(osmData.elements.filter(e => e.type === "way").map(w => [w.id, w]));

  const features = [];

  for (const rel of osmData.elements.filter(e => e.type === "relation")) {
    const name = rel.tags?.name;
    if (!name) continue;

    // Recolectar outer rings
    const outerWayIds = rel.members.filter(m => m.type === "way" && m.role === "outer").map(m => m.ref);
    if (outerWayIds.length === 0) continue;

    // Construir rings conectando ways
    const rings = buildRings(outerWayIds, wayMap, nodeMap);
    if (rings.length === 0) continue;

    const coordinates = rings.map(ring => ring.map(nid => {
      const n = nodeMap.get(nid);
      return [n.lon, n.lat];
    }));

    const geometry = coordinates.length === 1
      ? { type: "Polygon", coordinates }
      : { type: "MultiPolygon", coordinates: coordinates.map(r => [r]) };

    features.push({
      type: "Feature",
      properties: { name, osm_id: rel.id },
      geometry,
    });
  }
  return features;
}

function buildRings(wayIds, wayMap, nodeMap) {
  // Conecta ways en orden para formar rings cerrados
  const segments = wayIds
    .map(id => wayMap.get(id))
    .filter(Boolean)
    .map(w => [...w.nodes]);

  const rings = [];
  let current = segments.shift();
  if (!current) return rings;

  let safety = 0;
  while (segments.length > 0 && safety++ < 10000) {
    const last = current[current.length - 1];
    if (last === current[0]) {
      // ring cerrado
      rings.push(current);
      current = segments.shift();
      if (!current) break;
      continue;
    }
    const idx = segments.findIndex(s => s[0] === last || s[s.length - 1] === last);
    if (idx === -1) break;
    const next = segments.splice(idx, 1)[0];
    if (next[next.length - 1] === last) next.reverse();
    current = [...current, ...next.slice(1)];
  }
  if (current && current.length > 0) rings.push(current);
  return rings;
}

// Proyección exacta WGS84 → sistema de coordenadas HC del mapa
// Parámetros extraídos del hc-transform de @highcharts/map-collection/countries/ar/ar-all.geo.json
import proj4pkg from "proj4";
const proj4 = proj4pkg.default ?? proj4pkg;

const HC_TRANSFORM = {
  crs: "+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  scaleEff: 0.000189588229007 * 15.5, // scale × jsonres
  jsonmarginX: -999,
  jsonmarginY: 9851,
  xoffset: 2951044.94643,
  yoffset: 7591131.55463,
};

// Tolerancia de simplificación en unidades HC (~1-2px a escala de pantalla típica)
const SIMPLIFY_TOL = 4;

function projectRing(ring) {
  return ring.map(([lon, lat]) => {
    const [E, N] = proj4(HC_TRANSFORM.crs, [lon, lat]);
    const x = (E - HC_TRANSFORM.xoffset) * HC_TRANSFORM.scaleEff + HC_TRANSFORM.jsonmarginX;
    const y = (N - HC_TRANSFORM.yoffset) * HC_TRANSFORM.scaleEff + HC_TRANSFORM.jsonmarginY;
    return [Math.round(x), Math.round(y)];
  });
}

function simplifyRing(ring) {
  if (ring.length < 4) return ring;
  const out = [ring[0]];
  for (let i = 1; i < ring.length - 1; i++) {
    const [px, py] = out[out.length - 1];
    const [cx, cy] = ring[i];
    if (Math.abs(cx - px) >= SIMPLIFY_TOL || Math.abs(cy - py) >= SIMPLIFY_TOL) {
      out.push(ring[i]);
    }
  }
  out.push(ring[ring.length - 1]); // keep closing vertex
  return out.length >= 4 ? out : ring;
}

function projectGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: geometry.coordinates.map(r => simplifyRing(projectRing(r))) };
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(poly => poly.map(r => simplifyRing(projectRing(r)))),
  };
}

async function main() {
  const osmData = await fetchOverpass(QUERY);
  console.log(`Got ${osmData.elements.length} OSM elements`);

  const partidos = osmToGeoJson(osmData);
  console.log(`Parsed ${partidos.length} partido features`);

  // Ver todos los nombres para diagnóstico
  const allNames = partidos.map(p => p.properties.name).sort();
  console.log("Todos los nombres:", allNames.join(" | "));

  // Filtrar cuarteles y subdivisiones internas (no son partidos)
  // Normalizar nombres: quitar prefijo "Partido de/del "
  for (const p of partidos) {
    p.properties.name = p.properties.name
      .replace(/^Partido del?\s+/i, "");
  }

  const filteredPartidos = partidos.filter(p => !p.properties.name.startsWith("Cuartel") && !p.properties.name.startsWith("Empalme"));
  console.log(`After filtering sub-divisions: ${filteredPartidos.length} partidos`);

  // Agrupar por departamento
  const deptMap = new Map();
  const unmatched = [];

  for (const partido of filteredPartidos) {
    const name = partido.properties.name;
    const depto = PARTIDO_TO_DEPTO[name];
    if (!depto) {
      unmatched.push(name);
      continue;
    }
    if (!deptMap.has(depto)) deptMap.set(depto, []);
    deptMap.get(depto).push(partido);
  }

  if (unmatched.length > 0) {
    console.warn("⚠️  Partidos sin mapeo de departamento:", unmatched.join(", "));
  }

  // Construir FeatureCollection con partidos proyectados al sistema HC (mismo CRS que argentina-provinces.json)
  const enriched = filteredPartidos.map(p => ({
    ...p,
    geometry: projectGeometry(p.geometry),
    properties: {
      ...p.properties,
      depto: PARTIDO_TO_DEPTO[p.properties.name] ?? null,
    },
  }));

  const geojson = { type: "FeatureCollection", features: enriched };

  const { writeFileSync } = await import("fs");
  const { fileURLToPath } = await import("url");
  const { join, dirname } = await import("path");
  const outPath = join(dirname(fileURLToPath(import.meta.url)), "../public/buenos-aires-partidos.json");
  writeFileSync(outPath, JSON.stringify(geojson));
  console.log(`✅  Guardado en public/buenos-aires-partidos.json (${enriched.length} partidos, ${deptMap.size} deptos)`);
}

main().catch(err => { console.error(err); process.exit(1); });
