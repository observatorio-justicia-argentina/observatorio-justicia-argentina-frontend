# Guía de contribución

Gracias por tu interés en contribuir al Observatorio Judicial Argentino. Este proyecto tiene un propósito de interés público: la transparencia del sistema judicial argentino. Cada contribución es bienvenida, siempre que respete las siguientes pautas.

---

## Código de conducta

Al participar en este proyecto aceptás nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

---

## Antes de empezar

1. **Abrí un issue primero.** Antes de escribir código, describí el problema o la propuesta en un issue para que podamos discutirla. Esto evita trabajo duplicado.
2. **Revisá los issues existentes.** Puede que alguien ya esté trabajando en lo mismo.
3. **Leé el README.** Entendé el stack, la arquitectura y los scripts disponibles.

---

## Flujo de trabajo

```
main (producción)
 └── develop (integración)
      └── feat/nombre-corto     ← tu rama de trabajo
      └── fix/nombre-del-bug
      └── docs/que-documentas
```

1. **Hacé fork** del repositorio.
2. Creá tu rama desde `develop` (nunca desde `main`):
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/mi-nueva-feature
   ```
3. Realizá tus cambios con commits pequeños y atómicos.
4. Pusheá tu rama y abrí un Pull Request contra `develop`.

---

## Convención de commits (obligatoria)

Este proyecto usa **Conventional Commits**. El hook `commit-msg` de Husky lo valida automáticamente.

### Formato

```
<tipo>(<alcance opcional>): <descripción corta en minúscula>

[cuerpo opcional]

[footer opcional: BREAKING CHANGE o refs a issues]
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato, espacios (sin cambio lógico) |
| `refactor` | Refactor sin feat ni fix |
| `perf` | Mejora de performance |
| `test` | Agregar o corregir tests |
| `chore` | Tareas de mantenimiento, deps |
| `ci` | Cambios en CI/CD |
| `revert` | Revertir un commit anterior |

### Ejemplos válidos

```bash
feat(auth): agregar endpoint de recuperación de contraseña
fix(judges): corregir cálculo de tasa de falla cuando total es cero
docs(readme): actualizar instrucciones de instalación
chore(deps): actualizar next a v16.3
```

### Ejemplos inválidos ✗

```bash
fix: arreglé cosas          # descripción demasiado corta o vaga
Fix: Arreglé el bug         # no usar mayúsculas
feat: agregué varias cosas  # un commit debe hacer UNA sola cosa
wip: trabajando             # nunca commitear WIPs
```

---

## Hooks de Husky

Al ejecutar `npm install`, Husky instala automáticamente tres hooks:

| Hook | Cuándo corre | Qué hace |
|------|-------------|----------|
| `pre-commit` | Antes de cada commit | `lint-staged`: Prettier + ESLint sobre archivos staged |
| `commit-msg` | Al escribir el mensaje | `commitlint`: valida el formato Conventional Commits |
| `pre-push` | Antes de cada push | `typecheck` + `build`: el código debe compilar sin errores |

**Si algún hook falla, el commit o push es bloqueado.** Corregí el error antes de continuar.

Para saltear hooks en casos excepcionales (no recomendado):
```bash
git commit --no-verify -m "..."   # omite pre-commit y commit-msg
git push --no-verify              # omite pre-push
```
Esto solo debe usarse en situaciones muy justificadas y nunca en ramas compartidas.

---

## Estilo de código

- **TypeScript estricto**: no uses `any` a menos que sea absolutamente necesario (genera warning de ESLint).
- **Prettier** define el formato. No lo configures a mano; dejá que el hook lo haga.
- **Componentes React**: un componente por archivo, nombre en PascalCase.
- **No agregar** comentarios innecesarios ni código muerto.
- **No agregar** abstracciones especulativas: resolvé el problema concreto, no el hipotético.

---

## Pull Requests

- Apuntá siempre a la rama `develop`, nunca a `main`.
- Completá **todos los campos** del template de PR.
- Un PR debe hacer **una sola cosa** (feature, fix, refactor, etc.).
- El PR pasa por revisión de al menos **un maintainer** antes del merge.
- El CI debe estar en verde (lint + typecheck + build).
- Si cambia el contrato de la API (endpoints, tipos), actualizá la documentación en el README.

---

## Reportar bugs

Usá el template de issue **Bug Report** con:
- Descripción clara del comportamiento esperado vs. el observado
- Pasos para reproducirlo
- Entorno (SO, Node.js, navegador)
- Logs o capturas de pantalla relevantes

---

## Proponer features

Usá el template de issue **Feature Request** con:
- Descripción del problema que resuelve
- Propuesta de solución
- Alternativas consideradas
- Impacto esperado en la experiencia de usuario

---

## Dudas

Si tenés preguntas sobre el proyecto, abrí un issue con el label `question`.
