# Spec Delta

## Purpose

Story Timeline: que cada usuario pueda seguir como historia el tema de un artículo y ver en un timeline los artículos relacionados, tanto los anteriores como los que lleguen después, hasta que deje de seguirla.

## ADDED Requirements

### Requirement: Seguir un artículo crea una historia
Un usuario con sesión SHALL poder seguir un artículo con `POST /api/stories` y `{ "articleId": "<id>" }`. El sistema SHALL crear una historia activa del usuario a partir de ese artículo, incluir el propio artículo en ella con similitud 1 y responder 201 con `id`, `name` y `summary`. Un cuerpo no JSON o sin `articleId` de tipo texto SHALL responder 400; un artículo inexistente, 404.

#### Scenario: Seguir un artículo existente
- **WHEN** un usuario con sesión sigue un artículo que existe y que no seguía
- **THEN** el sistema responde 201 con el id, el nombre y el resumen de la nueva historia, y el artículo aparece en su timeline con similitud 1

#### Scenario: Falta el articleId
- **WHEN** el cuerpo de la petición no incluye `articleId`
- **THEN** el sistema responde 400 con `{ "error": "articleId is required" }`

#### Scenario: Artículo inexistente
- **WHEN** se sigue un id de artículo que no existe
- **THEN** el sistema responde 404 con `{ "error": "Article not found" }`

### Requirement: Una historia por usuario y artículo
El sistema MUST impedir que un usuario siga dos veces el mismo artículo: la pareja (usuario, artículo de origen) es única. Distintos usuarios SHALL poder seguir el mismo artículo de forma independiente.

#### Scenario: Seguir de nuevo el mismo artículo
- **WHEN** un usuario intenta seguir un artículo que ya sigue
- **THEN** el sistema responde 400 con `{ "error": "You are already following this story" }` y no crea otra historia

#### Scenario: Dos usuarios siguen el mismo artículo
- **WHEN** dos usuarios siguen el mismo artículo
- **THEN** cada uno tiene su propia historia

### Requirement: Nombre y resumen de la historia
El sistema SHALL generar con un modelo de lenguaje un nombre corto (hasta 80 caracteres) y un resumen (hasta 280) que describan el tema en curso, no el artículo concreto. Si no hay `GROQ_API_KEY`, el modelo falla o no devuelve nombre, SHALL usar el título del artículo como nombre (recortado a 57 caracteres más «...» si pasa de 60) y los primeros 200 caracteres de la descripción como resumen, o el título si no hay descripción.

#### Scenario: Sin clave de Groq
- **WHEN** se sigue un artículo con un título de 80 caracteres y sin `GROQ_API_KEY`
- **THEN** la historia se llama con los primeros 57 caracteres del título seguidos de «...»

### Requirement: Umbral de similitud fijado al crear la historia
Cada historia SHALL guardar al crearse un umbral de similitud entre 0 y 1, tomado de `STORY_SIMILARITY_THRESHOLD` (0.55 por defecto). Ese umbral SHALL ser el que se aplique a la historia en adelante, aunque la configuración cambie después.

#### Scenario: Cambio posterior de la configuración
- **WHEN** una historia se creó con umbral 0.55 y luego se configura `STORY_SIMILARITY_THRESHOLD=0.7`
- **THEN** la historia existente sigue emparejando artículos con umbral 0.55

### Requirement: Relleno inicial con artículos anteriores
Al crear una historia, el sistema SHALL añadirle los artículos publicados en los últimos 90 días cuya similitud semántica con el artículo de origen sea mayor o igual que el umbral de la historia, guardando la similitud de cada uno.

#### Scenario: Artículo relacionado de hace un mes
- **WHEN** se sigue un artículo y existe otro publicado hace 30 días con similitud 0.60 y umbral 0.55
- **THEN** ese artículo aparece en el timeline de la nueva historia con similitud 0.60

#### Scenario: Artículo relacionado demasiado antiguo
- **WHEN** el artículo parecido se publicó hace 120 días
- **THEN** no se añade a la historia

### Requirement: Emparejamiento de artículos nuevos con las historias
Cada artículo nuevo que se ingiere SHALL compararse con todas las historias activas, de todos los usuarios, y añadirse a cada una cuya similitud sea mayor o igual que su umbral. Un artículo MUST aparecer como mucho una vez por historia. Cuando una historia alcance un número de artículos múltiplo de 5, el sistema SHALL recalcular su representación como la media de las de sus artículos.

#### Scenario: Artículo nuevo relacionado
- **WHEN** se ingiere un artículo con similitud 0.62 respecto a una historia activa de umbral 0.55
- **THEN** el artículo se añade al timeline de esa historia

#### Scenario: Artículo nuevo no relacionado
- **WHEN** la similitud del artículo con todas las historias activas es menor que su umbral
- **THEN** no se añade a ninguna historia

### Requirement: Listado de historias del usuario
`GET /api/stories` SHALL devolver solo las historias del usuario de la sesión, de la más reciente a la más antigua, cada una con `id`, `name`, `summary`, `sourceArticleId`, `threshold`, `active`, `createdAt`, el número de artículos (`articleCount`) y la fecha de publicación del artículo más reciente (`latestArticleAt`).

#### Scenario: Usuario con dos historias
- **WHEN** un usuario con dos historias pide su listado
- **THEN** recibe esas dos historias con su recuento de artículos y no recibe las de otros usuarios

### Requirement: Timeline de una historia
`GET /api/stories/{id}` SHALL devolver la historia (`id`, `name`, `summary`, `threshold`, `sourceArticleId`, `createdAt`) y sus artículos ordenados por fecha de publicación descendente, cada uno con su similitud. SHALL responder 404 si la historia no existe y 403 si pertenece a otro usuario.

#### Scenario: Historia propia
- **WHEN** un usuario pide el timeline de una de sus historias
- **THEN** recibe sus artículos del más reciente al más antiguo con la similitud de cada uno

#### Scenario: Historia ajena
- **WHEN** un usuario pide el timeline de una historia de otro usuario
- **THEN** el sistema responde 403 con `{ "error": "Forbidden" }`

### Requirement: Dejar de seguir una historia
`DELETE /api/stories/{id}` SHALL borrar la historia del usuario junto con su timeline y responder `{ "ok": true }`. SHALL responder 404 si la historia no existe y 403 si es de otro usuario. Tras dejar de seguirla, el usuario SHALL poder volver a seguir el mismo artículo.

#### Scenario: Dejar de seguir y volver a seguir
- **WHEN** un usuario deja de seguir una historia y luego sigue otra vez su artículo de origen
- **THEN** el sistema crea una historia nueva y responde 201

#### Scenario: Borrar una historia ajena
- **WHEN** un usuario intenta borrar una historia de otro usuario
- **THEN** el sistema responde 403 y la historia sigue existiendo

### Requirement: Acceso solo con sesión
Las APIs de historias MUST responder 401 con `{ "error": "Unauthorized" }` si no hay sesión. Las páginas de historias SHALL redirigir a `/login` a quien entre sin sesión.

#### Scenario: API sin sesión
- **WHEN** se llama a `GET /api/stories` sin sesión
- **THEN** el sistema responde 401

#### Scenario: Página sin sesión
- **WHEN** alguien sin sesión abre la página de historias
- **THEN** se le redirige a `/login`
