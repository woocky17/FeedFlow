# Spec Delta

## Purpose

Presentar los artículos guardados en un feed: un listado público ordenado del más reciente al más antiguo, filtrable por categoría y por fuente, en el que los artículos de un mismo evento aparecen una sola vez con una pastilla que lleva a compararlos, y la portada que lo muestra en tarjetas. Las traducciones del feed están en `translation`, los favoritos en `favorites`, la vista del evento en `bias-radar` y seguir historias en `story-timeline`.

## ADDED Requirements

### Requirement: Listado público de artículos
`GET /api/articles` SHALL responder sin exigir sesión con los artículos ordenados por fecha de publicación, del más reciente al más antiguo. Cada elemento SHALL incluir `id`, `title`, `description`, `url`, `image`, `sourceId`, `publishedAt`, `newsEventId`, `sentiment`, `framingSummary`, `language`, `original`, `translation`, `displayedLanguage`, `isTranslated` y `eventMemberCount`.

#### Scenario: Visitante sin sesión
- **WHEN** alguien sin sesión llama a `GET /api/articles`
- **THEN** el sistema responde con el listado de artículos

#### Scenario: Orden por fecha
- **WHEN** hay un artículo publicado ayer y otro publicado hoy, sin evento compartido
- **THEN** el de hoy aparece antes que el de ayer

### Requirement: Filtros por categoría y por fuente
`GET /api/articles` SHALL aceptar los parámetros opcionales `categoryId`, que limita el listado a los artículos asignados a esa categoría, y `sourceId`, que lo limita a los artículos de esa fuente. Si se envían los dos, el listado SHALL cumplir ambos.

#### Scenario: Filtro por categoría
- **WHEN** se pide `GET /api/articles?categoryId=<id de Sports>`
- **THEN** la respuesta solo contiene artículos asignados a «Sports»

#### Scenario: Filtros combinados
- **WHEN** se pide el listado con un `categoryId` y un `sourceId`
- **THEN** la respuesta solo contiene artículos de esa fuente asignados a esa categoría

### Requirement: Un artículo por evento
Cuando varios artículos del listado pertenecen a un mismo evento con más de un artículo, el sistema SHALL incluir solo el primero según el orden del listado (el publicado más recientemente entre los que cumplen los filtros) y omitir los demás. `eventMemberCount` SHALL valer el número total de artículos del evento, cumplan o no los filtros; para un artículo sin evento o único en su evento, SHALL valer 1.

#### Scenario: Tres artículos del mismo evento
- **WHEN** tres artículos de distintas fuentes pertenecen al mismo evento
- **THEN** el listado incluye solo el más reciente de los tres, con `eventMemberCount: 3`

#### Scenario: Artículo sin evento
- **WHEN** un artículo no pertenece a ningún evento
- **THEN** aparece en el listado con `eventMemberCount: 1`

### Requirement: Tarjetas de la portada
La portada `/` SHALL mostrar los artículos del listado en tarjetas con la imagen si existe, el título, la descripción si existe y la fecha de publicación con el formato del idioma de la interfaz. Pulsar una tarjeta SHALL abrir el artículo original en otra pestaña. Mientras carga SHALL mostrar un indicador de carga y, si no hay artículos, el estado vacío «No hay noticias».

#### Scenario: Abrir un artículo
- **WHEN** un usuario pulsa una tarjeta del feed
- **THEN** se abre la URL original del artículo en una pestaña nueva

#### Scenario: Feed vacío
- **WHEN** no hay ningún artículo guardado
- **THEN** la portada muestra «No hay noticias»

### Requirement: Pastilla de fuentes del evento
La tarjeta de un artículo cuyo evento tiene más de un artículo SHALL mostrar una pastilla con el número de artículos de su evento (`eventMemberCount`). Pulsarla SHALL llevar a la página del evento (`/events/{id}`) sin abrir el artículo original. Los artículos sin evento o únicos en su evento MUST NOT mostrar la pastilla.

#### Scenario: Evento con tres artículos
- **WHEN** una tarjeta representa un evento con `eventMemberCount: 3`
- **THEN** muestra una pastilla con el número 3 y al pulsarla se navega a `/events/<id del evento>`

#### Scenario: Artículo suelto
- **WHEN** una tarjeta tiene `eventMemberCount: 1`
- **THEN** no muestra la pastilla

### Requirement: Filtro por categoría en la portada
Con sesión, la portada SHALL mostrar una pastilla «Todas» y una pastilla por cada categoría del usuario (por defecto y propias). Al pulsar una categoría, SHALL recargar el listado filtrado por esa categoría y marcar su pastilla como activa; al pulsar «Todas», SHALL volver al listado sin filtro.

#### Scenario: Elegir una categoría
- **WHEN** un usuario con sesión pulsa la pastilla «Sports»
- **THEN** el feed muestra solo los artículos de «Sports» y la pastilla queda activa

#### Scenario: Volver a todas
- **WHEN** el usuario pulsa «Todas»
- **THEN** el feed vuelve a mostrar el listado sin filtro de categoría
