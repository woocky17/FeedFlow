# Spec Delta

## Purpose

Identificar a los usuarios con email y contraseña, mantener su sesión con rol e idioma y restringir el acceso a las páginas y APIs privadas y a las de administración. Las reglas de acceso propias de cada feature (favoritos, notificaciones, fuentes, categorías) se detallan en sus capabilities.

## ADDED Requirements

### Requirement: Registro de usuario
`POST /api/auth/register` con `email` y `password` SHALL crear un usuario con rol `user` e idioma `es`, guardar solo un hash de la contraseña y responder 201 con `id` y `email`. Tras registrarse desde el formulario, el usuario SHALL ser llevado a `/login`.

#### Scenario: Registro correcto
- **WHEN** se registra un email válido que no existe con una contraseña
- **THEN** el sistema responde 201 con el id y el email del nuevo usuario, que tiene rol `user` e idioma `es`

#### Scenario: La contraseña no se guarda en claro
- **WHEN** se registra un usuario con la contraseña «secreto123»
- **THEN** lo almacenado es un hash y no el texto «secreto123»

### Requirement: Rechazo de registros inválidos
El registro MUST responder 400 con un mensaje de error si falta el email o la contraseña, si el email no tiene formato válido o si ya está registrado. El formulario de registro SHALL impedir el envío si la contraseña y su confirmación no coinciden.

#### Scenario: Email ya registrado
- **WHEN** se registra un email que ya existe
- **THEN** el sistema responde 400 con `{ "error": "Email is already registered" }`

#### Scenario: Faltan campos
- **WHEN** se llama al registro sin contraseña
- **THEN** el sistema responde 400 con `{ "error": "Email and password are required" }`

#### Scenario: Email mal formado
- **WHEN** se registra el email «usuario-sin-arroba»
- **THEN** el sistema responde 400 y no crea el usuario

#### Scenario: Confirmación distinta
- **WHEN** en el formulario la confirmación no coincide con la contraseña
- **THEN** se muestra un error y no se llama a la API

### Requirement: Inicio de sesión con credenciales
El sistema SHALL iniciar sesión cuando el email existe y la contraseña coincide con su hash, y llevar al usuario a la portada. Si el email no existe o la contraseña no coincide, MUST rechazar el inicio de sesión con el mismo mensaje de credenciales inválidas, sin revelar cuál de los dos falló.

#### Scenario: Credenciales correctas
- **WHEN** un usuario introduce su email y su contraseña correctos en `/login`
- **THEN** queda con sesión iniciada y se le lleva a `/`

#### Scenario: Email desconocido o contraseña incorrecta
- **WHEN** se intenta iniciar sesión con un email inexistente, o con un email existente y una contraseña incorrecta
- **THEN** el formulario muestra el mismo mensaje de credenciales inválidas en ambos casos

### Requirement: Sesión con identidad, rol e idioma
La sesión de un usuario autenticado SHALL exponer su id, su rol (`user` o `admin`) y su idioma, con `es` si no hay idioma. Cuando el usuario cambie de idioma y se actualice la sesión, la sesión SHALL reflejar el nuevo idioma sin volver a iniciar sesión.

#### Scenario: Sesión de un administrador
- **WHEN** inicia sesión un usuario con rol `admin` e idioma `en`
- **THEN** su sesión expone rol `admin` e idioma `en`

#### Scenario: Cambio de idioma
- **WHEN** un usuario con sesión cambia su idioma a `en`
- **THEN** la sesión pasa a tener idioma `en`

### Requirement: Cierre de sesión
El usuario con sesión SHALL poder cerrarla desde la interfaz; al hacerlo, la sesión se elimina y se le lleva a la portada.

#### Scenario: Cerrar sesión
- **WHEN** un usuario con sesión pulsa cerrar sesión
- **THEN** deja de tener sesión y se le lleva a `/`

### Requirement: Recuperación de contraseña sin revelar cuentas
`POST /api/auth/recover-password` con `email` SHALL responder siempre con el mismo mensaje genérico, exista o no la cuenta e incluso si el proceso interno falla, de modo que la respuesta no revele si el email está registrado. Sin `email` SHALL responder 400.

#### Scenario: Email registrado y no registrado
- **WHEN** se pide recuperar la contraseña de un email registrado y después de uno que no existe
- **THEN** las dos respuestas son el mismo mensaje genérico

#### Scenario: Fallo interno
- **WHEN** falla el proceso de recuperación de un email
- **THEN** la respuesta sigue siendo el mismo mensaje genérico

#### Scenario: Sin email
- **WHEN** se llama sin `email`
- **THEN** el sistema responde 400 con `{ "error": "Email is required" }`

### Requirement: Protección de páginas privadas
Las páginas de categorías, fuentes, notificaciones y administración, con sus subrutas, MUST exigir sesión: quien entre sin sesión SHALL ser redirigido a `/login` con la URL original en el parámetro `callbackUrl`.

#### Scenario: Página privada sin sesión
- **WHEN** alguien sin sesión abre `/notifications`
- **THEN** se le redirige a `/login?callbackUrl=<url de /notifications>`

#### Scenario: Página privada con sesión
- **WHEN** un usuario con sesión abre `/categories`
- **THEN** la página se sirve sin redirección

### Requirement: APIs de usuario sin sesión responden 401
Las APIs que dependen del usuario y comprueban la sesión en la propia petición, como las de historias y las de categorías personales, MUST responder 401 con `{ "error": "Unauthorized" }` cuando no hay sesión.

#### Scenario: Categorías sin sesión
- **WHEN** se llama a `GET /api/categories` sin sesión
- **THEN** el sistema responde 401 con `{ "error": "Unauthorized" }`

### Requirement: APIs de administración restringidas al rol admin
Las APIs de administración (fuentes y categorías globales) MUST responder 403 con `{ "error": "Forbidden" }` a cualquier sesión cuyo rol no sea `admin`, y SHALL atender la petición solo si el rol es `admin`.

#### Scenario: Usuario normal en la API de administración
- **WHEN** un usuario con rol `user` llama a `GET /api/admin/sources`
- **THEN** el sistema responde 403 con `{ "error": "Forbidden" }`

#### Scenario: Administrador
- **WHEN** un usuario con rol `admin` llama a `GET /api/admin/sources`
- **THEN** el sistema responde con el listado de fuentes
