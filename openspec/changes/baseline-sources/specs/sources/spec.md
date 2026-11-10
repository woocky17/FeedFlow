# Spec Delta

## Purpose

Gestionar las fuentes de noticias de las que se obtienen los artículos: alta, edición, activación y desactivación y borrado por parte de los administradores, con dos tipos de fuente (feed RSS/Atom y WorldNewsAPI) y la clave de API de WorldNewsAPI protegida. La restricción de estas APIs al rol `admin` está en `auth` y la forma en que se leen las fuentes al sincronizar está en `article-ingestion`.

## ADDED Requirements

### Requirement: Tipos de fuente y alta
`POST /api/admin/sources` con `name`, `baseUrl` y, opcionalmente, `kind`, `apiKey` y `language` SHALL crear una fuente activa y responder 201 con ella. `kind` SHALL ser `rss` si se envía `rss` y `worldnews` en cualquier otro caso. `language` SHALL ser `es` o `en` si se envía uno de esos valores y `en` en cualquier otro caso. Una fuente de tipo `rss` SHALL poder crearse sin clave de API.

#### Scenario: Alta de un feed RSS
- **WHEN** un administrador crea una fuente con `kind: "rss"`, un nombre y la URL de un feed, sin `apiKey`
- **THEN** el sistema responde 201 con una fuente de tipo `rss`, activa y con idioma `en`

### Requirement: Validación del alta de fuentes
El alta MUST responder 400 sin crear la fuente si falta `name` o `baseUrl` (`{ "error": "name and baseUrl are required" }`), si una fuente de tipo `worldnews` no trae `apiKey` (`{ "error": "apiKey is required for WorldNewsAPI sources" }`), si el nombre está en blanco o si `baseUrl` no es una URL válida.

#### Scenario: WorldNewsAPI sin clave
- **WHEN** un administrador crea una fuente sin `kind` y sin `apiKey`
- **THEN** el sistema responde 400 con `{ "error": "apiKey is required for WorldNewsAPI sources" }`

#### Scenario: URL no válida
- **WHEN** un administrador crea una fuente RSS con `baseUrl: "no-es-una-url"`
- **THEN** el sistema responde 400 y no crea la fuente

### Requirement: Listado de fuentes para administradores
`GET /api/admin/sources` SHALL devolver todas las fuentes, activas e inactivas, con su nombre, URL, tipo, idioma y estado de activación.

#### Scenario: Fuentes activas e inactivas
- **WHEN** hay una fuente activa y otra inactiva y un administrador pide el listado
- **THEN** la respuesta contiene las dos con su valor de `active`

### Requirement: Edición de una fuente
`PUT /api/admin/sources/{id}` SHALL actualizar los campos enviados (`name`, `baseUrl`, `apiKey`, `kind`, `language`) y conservar los demás, incluido el estado de activación. Un `kind` o un `language` no soportados SHALL ignorarse. La fuente resultante MUST cumplir las mismas validaciones que en el alta; si no, MUST responder 400 sin modificarla. Si la fuente no existe, MUST responder 400 con `{ "error": "Source not found" }`.

#### Scenario: Cambio de nombre
- **WHEN** un administrador envía solo un `name` nuevo para una fuente inactiva
- **THEN** la fuente cambia de nombre y sigue inactiva, con su URL, tipo e idioma intactos

#### Scenario: Pasar a WorldNewsAPI sin clave
- **WHEN** un administrador cambia a `kind: "worldnews"` una fuente RSS sin clave de API y sin enviar `apiKey`
- **THEN** el sistema responde 400 y la fuente sigue siendo RSS

### Requirement: Activar y desactivar una fuente
`PUT /api/admin/sources/{id}` con un cuerpo que solo contiene `active` SHALL cambiar únicamente el estado de activación de la fuente y responder con la fuente actualizada. Las fuentes inactivas no se sincronizan.

#### Scenario: Desactivar
- **WHEN** un administrador envía `{ "active": false }` para una fuente activa
- **THEN** la fuente queda inactiva y el resto de sus datos no cambia

### Requirement: Borrado de una fuente
`DELETE /api/admin/sources/{id}` SHALL borrar la fuente junto con sus artículos y responder `{ "message": "Source deleted" }`. Si la fuente no existe, MUST responder 400 con `{ "error": "Source not found" }`.

#### Scenario: Borrar una fuente con artículos
- **WHEN** un administrador borra una fuente que tiene artículos guardados
- **THEN** la fuente y sus artículos dejan de existir

#### Scenario: Fuente inexistente
- **WHEN** un administrador borra un id que no existe
- **THEN** el sistema responde 400 con `{ "error": "Source not found" }`

### Requirement: Confidencialidad de la clave de API
La clave de API de una fuente MUST NOT incluirse en las respuestas de las APIs que no son de administración (artículos, eventos e historias) ni escribirse en los registros del sistema. El panel de administración SHALL mostrar de una fuente WorldNewsAPI solo los 8 primeros caracteres de su clave seguidos de «...», o «Sin clave de API» si no tiene; de una fuente RSS SHALL mostrar «No necesita clave de API».

#### Scenario: Feed de artículos
- **WHEN** se pide `GET /api/articles`
- **THEN** ningún artículo de la respuesta incluye la clave de API de su fuente

#### Scenario: Panel de administración
- **WHEN** un administrador abre `/admin` y hay una fuente WorldNewsAPI con la clave «abcdef1234567890»
- **THEN** la fila de esa fuente muestra «abcdef12...»

### Requirement: Pantallas de gestión de fuentes
Para un administrador, el panel `/admin` SHALL ofrecer un formulario para añadir fuentes, en el que el campo de clave de API solo aparece si el tipo es WorldNewsAPI, y una lista de fuentes con su tipo, su estado activa o inactiva y los botones de editar y borrar. La página `/sources` SHALL listar las fuentes con su tipo y su idioma, un interruptor para activarlas o desactivarlas y un botón de borrado. Sin fuentes, ambas SHALL mostrar un estado vacío.

#### Scenario: Formulario con tipo RSS
- **WHEN** un administrador elige el tipo RSS en el formulario de alta
- **THEN** el campo de clave de API desaparece y la fuente se crea sin clave

#### Scenario: Interruptor en la página de fuentes
- **WHEN** un administrador pulsa el interruptor de una fuente activa en `/sources`
- **THEN** la fuente pasa a inactiva
