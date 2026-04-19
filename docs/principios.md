# Principios editoriales del Observatorio

Ver documento completo en [`observatorio-justicia-argentina-backend/docs/principios.md`](../../observatorio-justicia-argentina-backend/docs/principios.md).

## Implicaciones para el frontend

- Los badges de estado (🔴 Cajoneada, 🟡 Demorada) muestran el dato, no un juicio
- Cada umbral tiene un tooltip o nota con su fuente estadística
- Las URLs de análisis filtrado son compartibles: `/causas?estado=cajoneada&provincia=CABA`
- La página `/metodologia` explica públicamente cómo y por qué se calculan los datos
- El texto de la UI evita lenguaje acusatorio ("este juez cajoneó X causas" → "X causas sin resolución en más de 730 días")
