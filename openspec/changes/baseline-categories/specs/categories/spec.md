# Spec Delta

## Purpose

Organizar los artículos en categorías: categorías por defecto, globales y gestionadas por administradores, y categorías propias que cada usuario crea, edita y borra; y clasificar automáticamente los artículos nuevos en una categoría por defecto. El control de acceso general está en `auth`, la reparación de artículos sin categoría en `article-ingestion` y el filtro del feed por categoría en `article-feed`.

## ADDED Requirements

### Requirement: Categorías visibles para el usuario
`GET /api/categories` SHALL devolver, para el usuario de la sesión, las categorías por defecto seguidas de sus categorías propias, cada una con `id`, `name` y `type` (`default` o `custom`). Las categorías propias de otros usuarios MUST NOT aparecer.

#### Scenario: Usuario con una categoría propia
- **WHEN** un usuario que ha creado la categoría «Ciclismo» pide sus categorías
- **THEN** la respuesta contiene todas las categorías por defecto con `type: "default"` y «Ciclismo» con `type: "custom"`

#### Scenario: Categorías de otro usuario
- **WHEN** otro usuario ha creado la categoría «Jardinería» y el usuario de la sesión pide sus categorías
- **THEN** «Jardinería» no aparece en la respuesta

### Requirement: Crear una categoría propia
`POST /api/categories` con `name` SHALL crear una categoría de tipo `custom` cuyo dueño es el usuario de la sesión y responder 201 con la categoría. MUST responder 400 si falta `name` (`{ "error": "name is required" }`), si el nombre está vacío o solo tiene espacios, o si el usuario ya tiene una categoría propia con exactamente el mismo nombre (`{ "error": "Category name already exists for this user" }`).

#### Scenario: Alta correcta
- **WHEN** un usuario crea la categoría «Ciclismo»
- **THEN** el sistema responde 201 con la categoría, de tipo `custom` y con el usuario como dueño

#### Scenario: Nombre repetido
- **WHEN** un usuario que ya tiene la categoría «Ciclismo» crea otra llamada «Ciclismo»
- **THEN** el sistema responde 400 con `{ "error": "Category name already exists for this user" }`

#### Scenario: Nombre en blanco
- **WHEN** un usuario crea una categoría con el nombre «   »
- **THEN** el sistema responde 400 y no crea la categoría

### Requirement: Editar y borrar una categoría propia
`PUT /api/categories/{id}` con `name` SHALL renombrar una categoría del usuario de la sesión y responder con ella. `DELETE /api/categories/{id}` SHALL borrarla y responder `{ "message": "Category deleted" }`. Renombrar sin `name` MUST responder 400 con `{ "error": "name is required" }`.

#### Scenario: Renombrar una categoría propia
- **WHEN** el dueño de «Ciclismo» la renombra a «Ciclismo en ruta»
- **THEN** el sistema responde con la categoría con el nuevo nombre

#### Scenario: Borrar una categoría propia
- **WHEN** el dueño de «Ciclismo» la borra
- **THEN** el sistema responde `{ "message": "Category deleted" }` y la categoría deja de aparecer en su listado

### Requirement: Sin cambios sobre categorías ajenas
Las APIs de categorías de usuario MUST NOT modificar ni borrar una categoría que no sea del usuario de la sesión. Si la categoría no existe, MUST responder 400 con `{ "error": "Category not found" }`; si es de otro usuario o es una categoría por defecto, MUST responder 400 con `{ "error": "Category does not belong to this user" }`.

#### Scenario: Borrar una categoría por defecto desde la API de usuario
- **WHEN** un usuario intenta borrar una categoría por defecto con `DELETE /api/categories/{id}`
- **THEN** el sistema responde 400 con `{ "error": "Category does not belong to this user" }` y la categoría sigue existiendo

#### Scenario: Categoría inexistente
- **WHEN** un usuario intenta renombrar una categoría con un id que no existe
- **THEN** el sistema responde 400 con `{ "error": "Category not found" }`

### Requirement: Gestión de categorías por defecto por administradores
Un administrador SHALL poder listar solo las categorías por defecto con `GET /api/admin/categories`, crearlas con `POST /api/admin/categories` (201), renombrarlas con `PUT /api/admin/categories/{id}` y borrarlas con `DELETE /api/admin/categories/{id}`. El nombre SHALL guardarse sin espacios al principio ni al final; si falta o queda vacío, MUST responder 400 con `{ "error": "name is required" }`.

#### Scenario: Crear una categoría por defecto
- **WHEN** un administrador crea la categoría «  Cultura  »
- **THEN** el sistema responde 201 con una categoría de tipo `default`, sin dueño y llamada «Cultura»

#### Scenario: Listado de administración
- **WHEN** un administrador pide `GET /api/admin/categories`
- **THEN** la respuesta contiene solo categorías por defecto

### Requirement: La administración solo toca categorías por defecto
Renombrar o borrar desde las APIs de administración un id que no existe o que no es una categoría por defecto MUST responder 404 con `{ "error": "Default category not found" }` sin modificar nada.

#### Scenario: Borrar una categoría propia desde la API de administración
- **WHEN** un administrador intenta borrar con `DELETE /api/admin/categories/{id}` una categoría propia de un usuario
- **THEN** el sistema responde 404 con `{ "error": "Default category not found" }` y la categoría sigue existiendo

### Requirement: Página de categorías
La página `/categories` SHALL listar las categorías del usuario con la etiqueta «Por defecto» o «Personalizada». SHALL mostrar editar y borrar en las categorías propias y, en las por defecto, solo a los administradores. Su formulario de alta SHALL crear categorías propias para un usuario normal y por defecto para un administrador. Sin categorías SHALL mostrar un estado vacío y, si el servidor rechaza un alta o un renombrado, el mensaje de error recibido.

#### Scenario: Usuario normal
- **WHEN** un usuario con rol `user` abre `/categories`
- **THEN** ve las categorías por defecto sin botones de editar ni borrar y sus categorías propias con ambos botones

#### Scenario: Administrador
- **WHEN** un administrador añade «Cultura» desde el formulario de `/categories`
- **THEN** se crea una categoría por defecto «Cultura» y aparece en la lista

### Requirement: Clasificación automática en una categoría por defecto
Al guardar un artículo nuevo, si el servicio de IA (Groq) está configurado, el sistema SHALL pedirle que elija la única categoría por defecto más relevante a partir del título y la descripción, y SHALL asignar el artículo a esa categoría con origen automático (`AUTO`), sin dueño.

#### Scenario: Artículo de deporte
- **WHEN** se guarda un artículo nuevo y el clasificador responde «Sports», que es una categoría por defecto
- **THEN** el artículo queda asignado a «Sports» con origen `AUTO`

### Requirement: Clasificación que no bloquea la ingesta
Si el clasificador responde «none», responde algo que no coincide con ninguna categoría por defecto, falla o no está configurado, el artículo SHALL guardarse sin categoría y la ingesta MUST continuar.

#### Scenario: Ninguna categoría encaja
- **WHEN** el clasificador responde «none»
- **THEN** el artículo se guarda sin ninguna categoría

#### Scenario: Sin clave de Groq
- **WHEN** se guarda un artículo nuevo y el servicio de IA no está configurado
- **THEN** el artículo se guarda sin categoría y la ingesta continúa
