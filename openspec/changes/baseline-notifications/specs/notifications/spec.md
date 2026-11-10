# Spec Delta

## Purpose

Generar periódicamente en segundo plano notificaciones dentro de la aplicación y por email, y permitir a cada usuario consultar las suyas y marcarlas como leídas. La protección de la página está en `auth` y la gestión de categorías en `categories`.

## ADDED Requirements

### Requirement: Generación periódica de notificaciones
El sistema SHALL ejecutar en segundo plano, de forma periódica, la generación de notificaciones para todos los usuarios registrados. El intervalo SHALL ser configurable y valer 86400 segundos (24 horas) por defecto.

#### Scenario: Ejecución periódica
- **WHEN** el proceso en segundo plano está en marcha y pasa el intervalo configurado
- **THEN** se ejecuta la generación de notificaciones para cada usuario registrado

#### Scenario: Intervalo por defecto
- **WHEN** no se configura el intervalo
- **THEN** la generación se ejecuta cada 24 horas

### Requirement: Aviso por email
Por cada notificación creada, el sistema SHALL enviar un email a la dirección del usuario que indica la categoría y el título del artículo.

#### Scenario: Email de una notificación
- **WHEN** se crea una notificación de un artículo en una categoría
- **THEN** se envía al email del usuario un correo con esa categoría y el título del artículo

### Requirement: Aislamiento de fallos por usuario
Un fallo al generar las notificaciones de un usuario SHALL registrarse en el resultado de esa ejecución sin impedir que se procesen los demás usuarios. El resultado SHALL informar del número de usuarios procesados.

#### Scenario: Falla el envío a un usuario
- **WHEN** falla el envío del email de un usuario durante la generación
- **THEN** el fallo queda registrado para ese usuario y el sistema sigue con los siguientes

### Requirement: Listado de notificaciones del usuario
`GET /api/notifications` SHALL devolver solo las notificaciones del usuario de la sesión, como máximo 100, de la más reciente a la más antigua, cada una con `id`, `message`, `read` y `createdAt` en formato ISO 8601.

#### Scenario: Más de 100 notificaciones
- **WHEN** un usuario con 150 notificaciones pide su listado
- **THEN** la respuesta contiene sus 100 notificaciones más recientes, ordenadas de la más nueva a la más antigua

#### Scenario: Notificaciones de otro usuario
- **WHEN** existen notificaciones de otro usuario
- **THEN** no aparecen en la respuesta del usuario de la sesión

### Requirement: Marcar una notificación como leída
`PUT /api/notifications/{id}/read` SHALL marcar como leída la notificación indicada si pertenece al usuario de la sesión y responder `{ "message": "Notification marked as read" }`. Si no existe o es de otro usuario, MUST responder 400 con `{ "error": "Notification not found or does not belong to this user" }` sin modificarla.

#### Scenario: Notificación propia
- **WHEN** un usuario marca como leída una de sus notificaciones
- **THEN** la notificación queda con `read: true`

#### Scenario: Notificación ajena
- **WHEN** un usuario intenta marcar como leída una notificación de otro usuario
- **THEN** el sistema responde 400 y la notificación sigue sin leer

### Requirement: APIs de notificaciones solo con sesión
Las APIs de notificaciones MUST NOT atender peticiones sin sesión.

#### Scenario: Listado sin sesión
- **WHEN** alguien sin sesión llama a `GET /api/notifications`
- **THEN** la respuesta no devuelve notificaciones de ningún usuario

#### Scenario: Marcar como leída sin sesión
- **WHEN** alguien sin sesión llama a `PUT /api/notifications/{id}/read`
- **THEN** la notificación no se modifica

### Requirement: Página de notificaciones
La página `/notifications` SHALL mostrar un indicador de carga y después separar las notificaciones, con su mensaje y su fecha, en «Nuevas (N)», las no leídas con un botón para marcarlas como leídas, y «Anteriores», las leídas. Al marcar una como leída, SHALL pasar a «Anteriores» sin recargar la página. Sin notificaciones SHALL mostrar un estado vacío y, si la carga falla, un mensaje de error que invita a recargar.

#### Scenario: Notificaciones nuevas y leídas
- **WHEN** un usuario con dos notificaciones sin leer y una leída abre `/notifications`
- **THEN** ve «Nuevas (2)» con las dos sin leer y «Anteriores» con la leída

#### Scenario: Marcar como leída desde la página
- **WHEN** el usuario pulsa «Marcar como leída» en una notificación nueva
- **THEN** la notificación pasa a la sección «Anteriores»

#### Scenario: Sin notificaciones
- **WHEN** un usuario sin notificaciones abre `/notifications`
- **THEN** ve el estado vacío «No tienes notificaciones»

#### Scenario: Error de carga
- **WHEN** la API de notificaciones responde con un error
- **THEN** la página muestra el mensaje de error en lugar del listado
