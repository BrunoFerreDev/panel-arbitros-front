# Documentación de Endpoints del Backend

Listado completo y detallado de la API de Designaciones con especificación de responsabilidades por rol de usuario y matriz de autorización.

---

## Matriz de Responsabilidades por Rol

| Rol              | Alcance y Responsabilidades Principales                                                                                                                                                                                                                                        |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`SUPERUSER`**  | Acceso universal total a todos los módulos. Asignación masiva y unitaria de roles, reseteo administrativo de contraseñas y operaciones de backup/restauración de base de datos.                                                                                                |
| **`PRESIDENTE`** | Gestión y edición completa de Finanzas (gastos, préstamos, conceptos), Aranceles, Canchas y Árbitros. CRUD y edición de Designaciones y Designados. **Prohibido explícitamente:** Ejecutar comparaciones estadísticas de árbitros (`/designaciones/estadisticas/comparacion`). |
| **`SECRETARIO`** | **Solo lectura** en Designaciones y Finanzas (no puede crear, editar ni borrar). **Gestión y control total** sobre el módulo de Reuniones Arbitrales (`/reuniones/**`): creación de actas, temas, registro masivo de asistencias. Padrón y sanciones de árbitros.              |
| **`DESIGNADOR`** | CRUD operativo y asignación de Designaciones y Designados. Operación de simulaciones y algoritmos de Automatización. **Permitido:** Comparaciones estadísticas de árbitros (`/designaciones/estadisticas/comparacion`).                                                        |
| **`ARBITRO`**    | Autogestión de perfil propio (`/arbitros/me/**`): consulta de designaciones asignadas, reporte de disponibilidad de fin de semana, consulta de sanciones, cambio de contraseña propia y estado de cuenta consolidado (deuda préstamos y recuperos).                            |

---

## 1. Autenticación (`/auth`)

Control de acceso y seguridad mediante tokens JWT para cualquier árbitro activo del sistema.

| Método | Endpoint       | Roles Permitidos | Parámetros / Body                                 | Respuesta      | Descripción                                                                               |
| :----- | :------------- | :--------------- | :------------------------------------------------ | :------------- | :---------------------------------------------------------------------------------------- |
| `POST` | `/auth/login`  | Público          | **Body:** `AuthLogin` (`whatsapp`, `contrasenia`) | `AuthResponse` | Inicia sesión con WhatsApp y clave. Devuelve JWT con lista de roles y datos de identidad. |
| `POST` | `/auth/logout` | Autenticado      | **Header:** `Authorization: Bearer <token>`       | `String`       | Invalida sesión activa en el contexto de seguridad.                                       |

---

## 2. Árbitros (`/arbitros`)

Administración del padrón, credenciales, asignación de roles, disponibilidad y autogestión del árbitro.

| Método   | Endpoint                                | Roles Permitidos                                                       | Parámetros / Body                                                                                                                                            | Respuesta                          | Descripción                                                                                         |
| :------- | :-------------------------------------- | :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `GET`    | `/arbitros/me`                          | Autenticado                                                            | _Ninguno (del token)_                                                                                                                                        | `GetArbitroDTO`                    | Retorna el perfil completo del usuario autenticado.                                                 |
| `PUT`    | `/arbitros/me/contrasenia`              | Autenticado                                                            | **Body:** `CambiarContraseniaDTO`                                                                                                                            | `String`                           | Permite al árbitro logueado cambiar su contraseña validando la anterior.                            |
| `GET`    | `/arbitros/me/designaciones`            | Autenticado                                                            | **Query:** `page` (int, default: 0), `size` (int, default: 10)                                                                                               | `Page<GetDesignacionDTO>`          | Historial y próximos partidos asignados al árbitro autenticado.                                     |
| `GET`    | `/arbitros/me/disponibilidad`           | Autenticado                                                            | _Ninguno (del token)_                                                                                                                                        | `ArbitroDisponibilidadDTO`         | Consulta la disponibilidad actual para sábado y domingo.                                            |
| `PUT`    | `/arbitros/me/disponibilidad`           | Autenticado                                                            | **Body:** `ArbitroDisponibilidadDTO`                                                                                                                         | `GetArbitroDTO`                    | Actualiza la disponibilidad personal para dirigir el fin de semana.                                 |
| `GET`    | `/arbitros/me/suspenciones`             | Autenticado                                                            | **Query:** `page` (int, default: 0), `size` (int, default: 10)                                                                                               | `Page<GetSuspencionDTO>`           | Consulta las suspensiones y llamados de atención personales.                                        |
| `GET`    | `/arbitros/me/estado-cuenta`            | Autenticado                                                            | _Ninguno (del token)_                                                                                                                                        | `EstadoCuentaArbitroDTO`           | Estado de cuenta: total deuda préstamos, cantidad activos, lista de cuotas y total gastos recupero. |
| `GET`    | `/arbitros/me/estadisticas`             | Autenticado                                                            | **Query:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional), `orden` (String, default: DESC), `page` (int, default: 0), `size` (int, default: 10) | `GetEstadisticasArbitroDetalleDTO` | Estadísticas completas de desempeño, partidos dirigidos, montos y canchas del árbitro logueado.     |
| `PUT`    | `/arbitros/{idArbitro}/disponibilidad`  | `SUPERUSER`, `DESIGNADOR` o Árbitro propio                             | **Path:** `idArbitro`<br>**Body:** `ArbitroDisponibilidadDTO`                                                                                                | `GetArbitroDTO`                    | Actualiza disponibilidad individual de un árbitro.                                                  |
| `PUT`    | `/arbitros/{idArbitro}/toggle`          | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`                                | **Path:** `idArbitro`                                                                                                                                        | `String`                           | Activa o desactiva a un árbitro del sistema.                                                        |
| `GET`    | `/arbitros/{idArbitro}/suspenciones`    | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`, `DESIGNADOR` o Árbitro propio | **Path:** `idArbitro`<br>**Query:** `page`, `size`                                                                                                           | `Page<GetSuspencionDTO>`           | Consulta sanciones de un árbitro específico.                                                        |
| `POST`   | `/arbitros/{idArbitro}/suspenciones`    | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`                                | **Path:** `idArbitro`<br>**Body:** `SuspencionDTO`                                                                                                           | `GetSuspencionDTO`                 | Registra sanción o llamado de atención.                                                             |
| `GET`    | `/arbitros/suspenciones`                | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`, `DESIGNADOR`                  | **Query:** `page`, `size`                                                                                                                                    | `Page<GetSuspencionDTO>`           | Listado global de todas las suspensiones.                                                           |
| `DELETE` | `/arbitros/suspenciones/{idSuspencion}` | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`                                | **Path:** `idSuspencion`                                                                                                                                     | `String`                           | Levanta o borra una sanción por su ID.                                                              |
| `GET`    | `/arbitros/designaciones`               | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`, `DESIGNADOR` o Árbitro propio | **Query:** `idArbitro`, `page`, `size`                                                                                                                       | `Page<GetDesignacionDTO>`          | Historial de partidos designados a un árbitro específico.                                           |

---

## 3. Canchas (`/canchas`)

Administración de estadios, predios y estado de habilitación.

| Método | Endpoint                         | Roles Permitidos                                                 | Parámetros / Body                             | Respuesta                 | Descripción                                      |
| :----- | :------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------- | :------------------------ | :----------------------------------------------- |
| `GET`  | `/canchas`                       | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`, `DESIGNADOR`, `ARBITRO` | **Query:** `page`, `size`                     | `Page<GetCanchaDTO>`      | Lista paginada de todas las canchas registradas. |
| `GET`  | `/canchas/activas`               | `SUPERUSER`, `PRESIDENTE`, `SECRETARIO`, `DESIGNADOR`, `ARBITRO` | **Query:** `page`, `size`                     | `Page<GetCanchaDTO>`      | Lista canchas habilitadas para juego.            |
---
