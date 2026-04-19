# Causas Cajoneadas — Frontend

## Referencia

Ver especificación completa en [`observatorio-justicia-argentina-backend/docs/causas-cajoneadas.md`](../../observatorio-justicia-argentina-backend/docs/causas-cajoneadas.md).

---

## Vistas

### `/causas` — Ranking global

**Archivo:** `app/causas/page.tsx`

Tabla de todas las causas del sistema ordenadas por `diasDesdeInicio` DESC. Las sin resolución aparecen primero.

#### Columnas

| Columna | Dato | Notas |
|---|---|---|
| Juez | `judgeName` | Link a `/juez/:judgeSlug` |
| Jurisdicción | `provincia` + `fuero` | Dos líneas: provincia arriba, fuero abajo |
| Expediente | `expediente` | Texto |
| Tipo de causa | `delito` | Texto |
| Días | `diasDesdeInicio` | Número destacado |
| Estado | `estadoCausa` | Badge con color |

#### Estados (badge)

| Estado | Color | Días |
|---|---|---|
| 🟢 Activa | Verde | < 365 |
| 🟡 Demorada | Amarillo | 365–730 |
| 🔴 Cajoneada | Rojo | > 730 |
| ✅ Resuelta | Gris | — |

#### Filtros

El objetivo de los filtros es permitir que cada usuario construya su propio análisis
sobre los datos del observatorio — sin que el sitio emita juicio, el usuario puede
cruzar jurisdicción + tipo de causa + estado y ver patrones por sí mismo.

| Filtro | Tipo | Opciones |
|---|---|---|
| **Estado** | Pills / toggle | Todas · Activa · Demorada · Cajoneada · Resuelta |
| **Jurisdicción** | Dropdown | Por provincia (CABA, Buenos Aires, Córdoba...) |
| **Fuero** | Dropdown | Criminal Nacional · Penal Federal · Correccional... |
| **Alcance** | Pills | Nacional · Federal · Provincial |
| **Tipo de causa** | Input libre | Búsqueda en el campo delito |

Todos los filtros son acumulables (AND). La URL refleja el estado de los filtros
para que el análisis sea compartible: `/causas?estado=cajoneada&provincia=CABA&fuero=Penal+Federal`.

---

### Sección en `/juez/:slug` — Ranking por juez

**Archivo:** `app/juez/[slug]/page.tsx` (sección nueva)

Misma tabla pero filtrada al juez del perfil. Se ubica después del Expediente Reputacional y antes de Fuentes oficiales.

---

### `/metodologia` — Transparencia metodológica

**Archivo:** `app/metodologia/page.tsx`

Página estática que explica públicamente el criterio detrás de los datos.

#### Secciones

1. **Cómo definimos "cajoneada"**
   - Definición objetiva (tiempo, no opinión)
   - Tabla de umbrales con justificación

2. **Fuentes estadísticas**
   - Procuración General de la Nación — duración del proceso penal
   - CSJN Anuario Estadístico 2025
   - Portal de Datos Abiertos de la Justicia Argentina
   - Cada fuente con link directo al documento original

3. **Dato duro vs. dato de contexto**
   - Explicación de la distinción usada en el Expediente Reputacional
   - Qué datos son objetivos y cuáles son contextuales

4. **Limitaciones actuales**
   - Datos demo/ficticios en la versión actual
   - Qué cambiará cuando haya datos reales

---

## Funciones de API

```typescript
// app/lib/api.ts

fetchCausasRanking(page?: number, limit?: number, estado?: EstadoCausa | 'todas'): Promise<PaginatedResult<CausaRanking>>
// GET /causas?page=1&limit=20&estado=cajoneada

fetchJudgeCausasRanking(slug: string): Promise<CausaRanking[]>
// GET /judges/:slug/causas-ranking
```

---

## Tipos

```typescript
export type EstadoCausa = 'activa' | 'demorada' | 'cajoneada' | 'resuelta';

export interface CausaRanking {
  expediente: string;
  judgeSlug: string;
  judgeName: string;
  delito: string;
  fechaInicio: string;       // ISO date
  diasDesdeInicio: number;
  estadoCausa: EstadoCausa;
  tieneResolucion: boolean;
}
```

---

## Navegación

Agregar "Causas" al navbar principal con link a `/causas`.
