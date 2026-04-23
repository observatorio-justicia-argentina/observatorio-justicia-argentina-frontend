# Expediente Reputacional — Fase 1 (Frontend)

## Contexto

Ver [`observatorio-justicia-argentina-backend/docs/expediente-reputacional-fase1.md`](../../observatorio-justicia-argentina-backend/docs/expediente-reputacional-fase1.md) para el diseño completo de la feature.

## Cambios en el frontend

### Nuevos tipos en `app/lib/api.ts`

```typescript
interface JudgeAssociation {
  name: string;
  role?: string;
  since?: number;
  sourceUrl?: string;
}

type PoliticalOrigin = "judicial" | "political" | "academic" | "mixed";

interface JudgeAppointmentDetail {
  politicalOrigin: PoliticalOrigin;
  politicalOriginDetail?: string;
  magistraturaScore?: number;
  magistraturaRank?: number;
  magistraturaCompetitionId?: string;
  magistraturaSourceUrl?: string;
  senateBackers?: string[];
  senateSession?: string;
  senateRecordUrl?: string;
}

// Agregados a Judge:
associations?: JudgeAssociation[];
appointmentDetail?: JudgeAppointmentDetail;
```

### Nueva sección en `app/juez/[slug]/page.tsx`

Sección **"Expediente reputacional"** renderizada entre el perfil y las fuentes oficiales. Aparece solo si el juez tiene `appointmentDetail` o `associations`.

#### Subsección: Origen de la designación

Badge de color codificado por `politicalOrigin`:

| Valor | Label | Color |
|---|---|---|
| `judicial` | Carrera judicial pura | Verde |
| `academic` | Origen académico | Azul |
| `mixed` | Trayectoria mixta | Amarillo |
| `political` | Designación política | Rojo |

Debajo: texto libre `politicalOriginDetail`, stats del concurso (puntaje + puesto en mérito + link al acta), y senadores que avalaron el pliego.

#### Subsección: Vínculos institucionales

Lista de asociaciones con nombre (linkeable), rol y año de adhesión.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/lib/api.ts` | Nuevos tipos + campos en `Judge` |
| `app/juez/[slug]/page.tsx` | Sección "Expediente reputacional" |
