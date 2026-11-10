# Spec Delta

## Purpose

News Bias Radar: agrupar en un mismo evento los artículos de distintas fuentes que cubren el mismo suceso y mostrar, para cada uno, su sentimiento y su framing, de modo que se pueda comparar cómo lo cuenta cada medio. La forma en que el feed presenta los eventos se especifica en la capability del feed.

## ADDED Requirements

### Requirement: Agrupación de artículos en eventos por similitud
Al ingerir o reparar un artículo, el sistema SHALL compararlo por similitud semántica (título y descripción) con los eventos que han tenido actividad en los últimos 7 días y asignarlo al más parecido si la similitud es mayor o igual que el umbral configurable `NEWS_EVENT_SIMILARITY_THRESHOLD` (0.72 por defecto). Un artículo SHALL pertenecer como mucho a un evento.

#### Scenario: Artículo que encaja con un evento reciente
- **WHEN** llega un artículo cuya similitud con un evento activo en los últimos 7 días es 0.80 y el umbral es 0.72
- **THEN** el artículo queda asignado a ese evento

#### Scenario: Varios eventos por encima del umbral
- **WHEN** un artículo supera el umbral con dos eventos recientes
- **THEN** el artículo se asigna al evento con mayor similitud

#### Scenario: Evento sin actividad reciente
- **WHEN** el único evento parecido tuvo su última actividad hace 8 días
- **THEN** ese evento no se tiene en cuenta para el artículo

### Requirement: Creación de evento cuando no hay coincidencia
Si ningún evento reciente alcanza el umbral, el sistema SHALL crear un evento nuevo cuyo título es el del artículo, con fecha de primera y última actividad igual al momento de creación, y asignarle el artículo.

#### Scenario: Primer artículo de un suceso
- **WHEN** llega un artículo cuya similitud máxima con los eventos recientes es 0.50 y el umbral es 0.72
- **THEN** se crea un evento con el título del artículo y el artículo queda asignado a él

### Requirement: Actividad y representación del evento
Cada vez que un artículo se asigna a un evento existente, el sistema SHALL actualizar la fecha de última actividad del evento. Cuando el número de artículos del evento sea múltiplo de 3, SHALL recalcular su representación semántica como la media de las de sus artículos.

#### Scenario: Asignación a un evento existente
- **WHEN** se asigna un artículo a un evento cuya última actividad fue hace 5 días
- **THEN** la última actividad del evento pasa a ser el momento de la asignación y el evento sigue disponible para nuevos artículos durante otros 7 días

#### Scenario: Tercer artículo del evento
- **WHEN** un evento llega a 3 artículos
- **THEN** su representación pasa a ser la media de las de esos 3 artículos

### Requirement: Sentimiento y framing por artículo
El sistema SHALL analizar con un modelo de lenguaje el tono de la cobertura de cada artículo y guardar un sentimiento (`positive`, `neutral` o `negative`) y una frase de framing de hasta 180 caracteres. Si el modelo no da un framing, SHALL guardarse «Factual report». Si el sentimiento devuelto no es uno de los tres valores, el resultado MUST descartarse y el artículo queda sin sentimiento.

#### Scenario: Respuesta válida
- **WHEN** el modelo devuelve `{"sentiment": "Negative", "framing": "Destaca las críticas al gobierno"}`
- **THEN** el artículo guarda sentimiento `negative` y ese framing

#### Scenario: Sentimiento no reconocido
- **WHEN** el modelo devuelve `{"sentiment": "mixed"}`
- **THEN** el artículo no guarda sentimiento ni framing

### Requirement: Análisis de sentimiento en lote
Al reparar artículos sin sentimiento, el sistema SHALL analizarlos en lotes (8 por defecto) con una sola petición por lote, y SHALL guardar solo los resultados que correspondan a artículos del lote; los artículos sin resultado válido se cuentan como omitidos.

#### Scenario: Resultado parcial de un lote
- **WHEN** se analiza un lote de 8 artículos y el modelo devuelve resultados válidos para 6
- **THEN** se guardan 6 sentimientos y se cuentan 2 artículos como omitidos

### Requirement: Degradación sin clave de Groq
Sin `GROQ_API_KEY`, o si el modelo falla, el sistema MUST seguir ingiriendo y agrupando artículos en eventos (la similitud se calcula en local) y SHALL dejar los artículos sin sentimiento ni framing, sin propagar el error.

#### Scenario: Sin clave configurada
- **WHEN** se ingiere un artículo sin `GROQ_API_KEY`
- **THEN** el artículo se guarda y se asigna a un evento, y queda sin sentimiento

### Requirement: API de detalle de evento
`GET /api/events/{id}` SHALL devolver el evento (`id`, `title`, `firstSeenAt`, `lastSeenAt`) y sus artículos ordenados por fecha de publicación descendente, cada uno con `id`, `title`, `url`, `description`, `image`, `sourceId`, `sourceName`, `publishedAt`, `sentiment` y `framingSummary`. Si el evento no existe, SHALL responder 404.

#### Scenario: Evento existente
- **WHEN** se pide un evento con tres artículos de dos fuentes
- **THEN** la respuesta incluye los datos del evento y los tres artículos, del más reciente al más antiguo, con el nombre de su fuente

#### Scenario: Evento inexistente
- **WHEN** se pide un id de evento que no existe
- **THEN** el sistema responde 404 con `{ "error": "Event not found" }`

### Requirement: Vista comparativa del evento
La página de un evento SHALL mostrar el título del evento, un recuento de cobertura igual al número de artículos del evento y una tarjeta por artículo con el nombre de la fuente, la fecha, la imagen y la descripción si existen, y un enlace al original que se abre en otra pestaña. Si el artículo tiene sentimiento, SHALL mostrarlo como etiqueta junto a su framing. Si la carga falla, SHALL mostrar un mensaje de error.

#### Scenario: Artículo con sentimiento
- **WHEN** se abre un evento con un artículo de sentimiento `negative` y framing
- **THEN** su tarjeta muestra la etiqueta de sentimiento negativo y el texto del framing

#### Scenario: Evento que no carga
- **WHEN** la API del evento responde con error
- **THEN** la página muestra el mensaje de error en lugar de las tarjetas
