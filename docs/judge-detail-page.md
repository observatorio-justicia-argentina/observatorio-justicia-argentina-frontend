# Página de Detalle del Juez

## Ruta

```
/juez/[slug]
```

**Ejemplo:** `/juez/juan-carlos-perez-gomez-caba`

---

## Archivos

| Archivo | Rol |
|---|---|
| `app/juez/[slug]/page.tsx` | Componente de página (client component) |
| `app/juez/[slug]/layout.tsx` | Metadata SEO dinámica (server component) |

---

## Flujo de datos

```
URL /juez/[slug]
  → layout.tsx llama fetchJudgeBySlug(slug) → genera <title> y OG tags
  → page.tsx llama fetchJudgeBySlug(slug)   → renderiza perfil
  → page.tsx llama fetchJudgeCases(slug)    → tabla de casos paginada
  → page.tsx llama fetchJudgeArchivos(slug) → listado de archivos
```

Los tres endpoints usan el slug semántico — ningún ID numérico aparece en las llamadas del frontend.

---

## SEO — `layout.tsx`

Server component que implementa `generateMetadata()` de Next.js App Router.

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const judge = await fetchJudgeBySlug(slug);
  return {
    title: `${judge.name} | Observatorio de Justicia Argentina`,
    description: `${judge.name} — ${judge.court} (${judge.location.province}). Tasa de fracasos: ${failureRate}%...`,
    openGraph: { title, description, url: `/juez/${slug}`, type: "profile" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `/juez/${slug}` },
  };
}
```

**¿Por qué layout y no page?** La `page.tsx` usa `"use client"` para manejar estado (carga, paginación). `generateMetadata` solo puede exportarse desde server components. El `layout.tsx` actúa como wrapper server que inyecta la metadata antes de renderizar el client component.

---

## Secciones del perfil

### 1. Header
- Nombre, badge FICTICIO si aplica
- Tribunal, fuero, instancia, alcance/competencia
- Provincia

### 2. Métricas principales
Cuatro `StatBox` con: libertades otorgadas, no comparecencias (FTA), nuevos arrestos, revocadas.

Badge de tasa de falla procesal codificado por color:
- `> 20%` → rojo
- `10–20%` → amarillo
- `< 10%` → verde

### 3. Datos del cargo
Grid con: domicilio laboral, horario, remuneración bruta (Acordada + categoría), fecha de designación, organismo designante, antigüedad.

### 4. Bio pública
Texto libre `publicBio`. Se muestra solo si el campo existe.

### 5. Estadísticas extendidas *(opcional)*
Grid con: días promedio de resolución, causas pendientes, recusaciones, resoluciones apeladas, revocadas en Cámara, tasa de revocación.

### 6. Formación y trayectoria *(opcional)*
- `education[]` — lista de títulos con año e institución
- `careerHistory[]` — línea de tiempo de roles anteriores
- `notableDecisions[]` — resoluciones destacadas con descripción y resultado

### 7. Expediente Reputacional *(opcional — Fase 1)*
Ver [`expediente-reputacional-fase1.md`](./expediente-reputacional-fase1.md).

### 8. Tabla de casos
Paginada con `limit = 10`. Cada fila muestra:
- Nro. de expediente + fecha de resolución
- Tipo de medida
- Badge de resultado (`fta` / `nuevo_arresto` / `revocada` / `pendiente`)
- Observaciones (si existen)

Controles de paginación: anterior / siguiente + indicador `Página X de Y`.

### 9. Archivos públicos
Links a documentos asociados al juez (resoluciones, actas, etc.).

### 10. Fuentes oficiales
Links a portales institucionales de referencia (PJN, Consejo de la Magistratura, OA, SAIJ, etc.).

---

## Fallback a datos mock

Si `fetchJudgeCases` o `fetchJudgeArchivos` fallan (backend no disponible), la página muestra datos de ejemplo predefinidos en `page.tsx` y un aviso amarillo al pie:

> ⚠ Los casos y archivos mostrados son datos de ejemplo. El backend no está disponible en este momento.

El perfil del juez (`fetchJudgeBySlug`) no tiene fallback: si falla, muestra error y no renderiza el perfil.

---

## Funciones de API

```typescript
// app/lib/api.ts

fetchJudgeBySlug(slug: string): Promise<Judge>
// GET /judges/:slug

fetchJudgeCases(slug: string, page?: number, limit?: number): Promise<PaginatedResult<Caso>>
// GET /judges/:slug/casos?page=1&limit=10

fetchJudgeArchivos(slug: string): Promise<ArchivoPublico[]>
// GET /judges/:slug/archivos
```

---

## Migración de `[id]` a `[slug]`

La ruta original era `/juez/[id]` con ID numérico. Se migró a `/juez/[slug]` por:

1. **SEO**: Google indexa el nombre del juez directamente en la URL
2. **Compartibilidad**: `/juez/juan-carlos-perez-gomez-caba` es autoexplicativo en redes y medios
3. **Seguridad**: elimina la enumeración de perfiles por ID numérico secuencial
4. **Estabilidad**: el slug basado en nombre+provincia es estable ante migraciones de base de datos

---

## JudgeCard (home)

El componente `app/components/JudgeCard.tsx` muestra el resumen del juez en la home y linkea al perfil completo.

Se eliminó el panel acordeón ("Ver detalle completo") que duplicaba información ya disponible en esta página. El card ahora es un elemento limpio y completamente clickeable que navega al perfil.

Datos mostrados en el card:
- Nombre, tribunal, provincia
- Jurisdicción (fuero, instancia, alcance/competencia)
- Métricas: libertades, FTA, nuevo arresto, revocada
- Tasa de falla procesal (badge color)
- Escala salarial (badge color)
