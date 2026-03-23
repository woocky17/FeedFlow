# Future Features

Ideas de funcionalidades únicas para diferenciar FeedFlow de otros agregadores de noticias.

## 1. Story Timeline
Seguir la evolución de una noticia en el tiempo. Cuando un tema te interesa, lo "sigues" y la app agrupa automáticamente todos los artículos relacionados en una línea temporal.

## 2. News Bias Radar
Mostrar la misma noticia desde diferentes fuentes lado a lado, con un indicador de sesgo/sentimiento. Ayuda a ver cómo diferentes medios cubren el mismo evento.

## 3. News Diet Dashboard
Como un tracker de salud pero para consumo de noticias. Muestra qué categorías lees más, si estás en una burbuja informativa, y sugiere diversificar.

## 4. Smart Briefing
Genera un resumen diario personalizado con IA. En vez de scroll infinito, un briefing de 2 minutos con lo más relevante para ti cada mañana.

## 5. Collaborative Collections
Crear colecciones de artículos compartidas con otros usuarios. Tipo playlist de Spotify pero para noticias - útil para equipos o grupos de estudio.

## 6. Source Trust Score
Los usuarios votan la fiabilidad de las fuentes y se genera un score comunitario integrado en el agregador.

---

## Consideraciones técnicas

### Deduplicación de noticias
Una misma noticia puede aparecer en múltiples fuentes/diarios. Se debe implementar un sistema de detección de duplicados (por similitud de título/contenido usando LLM o embeddings) para agruparlos en vez de mostrarlos repetidos. Esto también alimenta el News Bias Radar (punto 2) al poder comparar cómo diferentes medios cubren la misma historia.
