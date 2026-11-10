# Spec Delta

## Purpose

Permitir que cada usuario guarde artículos como favoritos, los quite y los liste, y que en la portada pueda marcarlos y filtrar el feed para ver solo sus favoritos. El listado del feed está en `article-feed` y el control de acceso general en `auth`.

## ADDED Requirements

### Requirement: Añadir un favorito
`POST /api/favorites` con `articleId` SHALL guardar ese artículo como favorito del usuario de la sesión y responder 201 con el favorito (`id`, `userId`, `articleId`, `createdAt`). MUST responder 400 con `{ "error": "articleId is required" }` si falta `articleId` y con `{ "error": "User already has this article as a favorite" }` si el usuario ya lo tenía como favorito.

#### Scenario: Nuevo favorito
- **WHEN** un usuario añade como favorito un artículo que no lo era
- **THEN** el sistema responde 201 con el favorito, asociado a ese usuario y a ese artículo

#### Scenario: Favorito repetido
- **WHEN** un usuario añade de nuevo un artículo que ya es su favorito
- **THEN** el sistema responde 400 con `{ "error": "User already has this article as a favorite" }`

#### Scenario: Sin artículo
- **WHEN** se llama sin `articleId`
- **THEN** el sistema responde 400 con `{ "error": "articleId is required" }`

### Requirement: Quitar un favorito
`DELETE /api/favorites/{articleId}`, donde el parámetro es el id del artículo, SHALL quitar ese artículo de los favoritos del usuario de la sesión y responder `{ "message": "Favorite deleted" }`. MUST NOT afectar a los favoritos de otros usuarios.

#### Scenario: Quitar un favorito propio
- **WHEN** un usuario quita un artículo de sus favoritos
- **THEN** el artículo deja de estar entre sus favoritos

#### Scenario: Mismo artículo favorito de otro usuario
- **WHEN** dos usuarios tienen el mismo artículo como favorito y uno lo quita
- **THEN** el artículo sigue siendo favorito del otro usuario

### Requirement: Listar los favoritos
`GET /api/favorites` SHALL devolver solo los favoritos del usuario de la sesión, cada uno con `id`, `userId`, `articleId` y `createdAt`.

#### Scenario: Favoritos de varios usuarios
- **WHEN** dos usuarios tienen favoritos y uno pide su listado
- **THEN** la respuesta solo contiene los favoritos de ese usuario

### Requirement: APIs de favoritos solo con sesión
Las APIs de favoritos MUST NOT atender peticiones sin sesión.

#### Scenario: Añadir sin sesión
- **WHEN** alguien sin sesión llama a `POST /api/favorites`
- **THEN** no se guarda ningún favorito

#### Scenario: Listar sin sesión
- **WHEN** alguien sin sesión llama a `GET /api/favorites`
- **THEN** la respuesta no devuelve favoritos de ningún usuario

### Requirement: Favoritos en la portada
Con sesión, cada tarjeta del feed SHALL mostrar un corazón que añade o quita el artículo de favoritos, cambia de estado al pulsarlo sin esperar al servidor y no abre el artículo original. La portada SHALL mostrar una pastilla «Favoritos» que alterna entre el feed completo y solo los artículos que son favoritos; si no hay ninguno, SHALL mostrar «Aún no tienes favoritos». Sin sesión MUST NOT mostrar ni el corazón ni la pastilla.

#### Scenario: Marcar un favorito
- **WHEN** un usuario con sesión pulsa el corazón de un artículo que no es favorito
- **THEN** el corazón aparece relleno, el artículo se guarda como favorito y no se abre el artículo original

#### Scenario: Filtrar por favoritos
- **WHEN** un usuario con sesión pulsa la pastilla «Favoritos»
- **THEN** el feed muestra solo los artículos que son sus favoritos

#### Scenario: Sin favoritos
- **WHEN** un usuario sin favoritos pulsa la pastilla «Favoritos»
- **THEN** la portada muestra «Aún no tienes favoritos»

#### Scenario: Visitante sin sesión
- **WHEN** alguien sin sesión abre la portada
- **THEN** las tarjetas no muestran el corazón y no aparece la pastilla «Favoritos»
