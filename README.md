# Observatorio Judicial Argentino — Frontend

[![CI](https://github.com/tu-org/observatorio-judicial-argentino/actions/workflows/ci.yml/badge.svg)](https://github.com/tu-org/observatorio-judicial-argentino/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Interfaz pública del Observatorio Judicial Argentino. Permite visualizar la tasa de falla procesal de jueces por jurisdicción, cargar información de casos con respaldo documental y gestionar la identidad de los reportantes.

---

## ¿Qué es el Observatorio Judicial Argentino?

Es una plataforma de transparencia judicial de código abierto que registra y analiza las resoluciones de jueces argentinos sobre libertades cautelares, con foco en los casos donde la persona liberada:

- **No compareció** a juicio (FTA)
- **Fue detenida nuevamente** por un nuevo delito
- **Le fue revocada** la medida cautelar

El sistema **no tiene fines punitivos ni políticos**. Es estadístico, trazable y basado en datos públicos del Poder Judicial.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Auth | JWT via cookie HTTP-only (backend) |
| Calidad | ESLint · Prettier · Husky · commitlint |

---

## Requisitos previos

- Node.js ≥ 20
- Backend corriendo en `http://localhost:3600` ([ver repo backend](../observatorio-backend/README.md))

---

## Instalación y desarrollo

```bash
# 1. Clonar
git clone https://github.com/tu-org/observatorio-judicial-argentino.git
cd observatorio-judicial-argentino

# 2. Instalar dependencias (también instala los hooks de Husky)
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
# → http://localhost:3000
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Verificar ESLint |
| `npm run lint:fix` | Corregir ESLint automáticamente |
| `npm run format` | Formatear con Prettier |
| `npm run format:check` | Verificar formato sin modificar |
| `npm run typecheck` | Verificar tipos TypeScript |

---

## Estructura del proyecto

```
app/
├── components/
│   ├── AuthModal.tsx           # Login / registro
│   ├── JudgeCard.tsx           # Tarjeta de juez
│   ├── JurisdictionStats.tsx   # Árbol jerárquico de jurisdicciones
│   ├── Navbar.tsx
│   ├── SubmitJudgeModal.tsx    # Carga de información de jueces
│   └── StatsBar.tsx
├── context/
│   └── AuthContext.tsx         # Estado global de autenticación
├── lib/
│   ├── api.ts                  # Fetch de jueces y jerarquía
│   └── auth-api.ts             # Funciones de auth
├── providers.tsx
├── page.tsx
└── layout.tsx
```

---

## Cómo contribuir

Leé [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un PR. En resumen:

1. Abrí un issue describiendo el cambio
2. Hacé fork y creá una rama (`feat/nombre-de-la-feature`)
3. Seguí los [Conventional Commits](https://conventionalcommits.org)
4. Los hooks de Husky verifican el formato y los tipos automáticamente
5. Abrí un PR con el template completo

---

## Licencia

[MIT](LICENSE) — Observatorio Judicial Argentino
