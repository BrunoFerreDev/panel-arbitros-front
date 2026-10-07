# Módulo Frontend: Proyecto del Árbitro

Documentación técnica y especificación de peticiones API HTTP para el portal/app del **Árbitro**.

---

## 🔒 Autenticación y Autorización
- **Header requerido**: `Authorization: Bearer <TOKEN_JWT>`
- **Rol autorizado**: `ARBITRO`

---

## 📋 Tabla de Endpoints Disponibles (`/arbitros/me/**`)

| Método | Endpoint | Descripción | DTO Entrada / Parámetros | Respuesta DTO |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Iniciar sesión y obtener token JWT | `LoginDTO` | `AuthResponseDTO` |
| `GET` | `/arbitros/me` | Ver mi información de perfil personal | Ninguno | `GetArbitroDTO` |
| `PUT` | `/arbitros/me/contrasenia` | Cambiar contraseña personal | `CambiarContraseniaDTO` | `String` (Mensaje OK) |
| `GET` | `/arbitros/me/designaciones` | Ver mis designaciones asignadas (Paginado) | `page`, `size` | `Page<GetDesignacionDTO>` |
| `GET` | `/arbitros/me/disponibilidad` | Consultar mi disponibilidad actual | Ninguno | `ArbitroDisponibilidadDTO` |
| `PUT` | `/arbitros/me/disponibilidad` | Actualizar mi disponibilidad de días | `ArbitroDisponibilidadDTO` | `GetArbitroDTO` |
| `GET` | `/arbitros/me/suspenciones` | Ver mis suspensiones o sanciones | `page`, `size` | `Page<GetSuspencionDTO>` |
| `GET` | `/arbitros/me/estado-cuenta` | Consultar estado de cuenta personal | Ninguno | `EstadoCuentaArbitroDTO` |
| `GET` | `/arbitros/me/estadisticas` | Ver estadísticas arbitrales propias | `inicio`, `fin`, `orden`, `page`, `size` | `GetEstadisticasArbitroDetalleDTO` |

---

## 🚀 Detalle de Peticiones y Payloads JSON

### 1. Iniciar Sesión (`Login`)
- **Endpoint**: `POST /login`
- **Body (`LoginDTO`)**:
```json
{
  "dniOrEmail": "35123456",
  "password": "miPasswordSegura123"
}
```

- **Respuesta Exitosa (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzNTEyMzQ1NiIsInJvbGVzIjpbIlJPTEVfQVJCSVRSTyJdfQ...",
  "type": "Bearer",
  "id": 8,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "roles": ["ARBITRO"]
}
```

---

### 2. Cambiar Contraseña (`/me/contrasenia`)
- **Endpoint**: `PUT /arbitros/me/contrasenia`
- **Body (`CambiarContraseniaDTO`)**:
```json
{
  "contraseniaActual": "miPasswordActual123",
  "nuevaContrasenia": "nuevaPasswordSegura2026"
}
```
- **Respuesta (200 OK)**:
```json
"Contraseña actualizada exitosamente"
```

---

### 3. Mis Designaciones (`/me/designaciones`)
- **Endpoint**: `GET /arbitros/me/designaciones?page=0&size=10`
- **Respuesta (200 OK)**:
```json
{
  "content": [
    {
      "idDesignacion": 15,
      "fecha": "2026-10-15T14:30:00",
      "cancha": {
        "idCancha": 2,
        "nombreCancha": "Cancha Central",
        "necesitaViaje": false
      },
      "etapaCampeonato": "FECHA_NORMAL",
      "cantidadPartidos": 4,
      "estadoDesignacion": 1,
      "detalleExtra": "Designación aceptada",
      "editable": true
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

---

### 4. Actualizar Disponibilidad Personal (`/me/disponibilidad`)
- **Endpoint**: `PUT /arbitros/me/disponibilidad`
- **Body (`ArbitroDisponibilidadDTO`)**:
```json
{
  "disponibilidadSabado": true,
  "disponibilidadDomingo": false
}
```

---

### 5. Estado de Cuenta Personal (`/me/estado-cuenta`)
- **Endpoint**: `GET /arbitros/me/estado-cuenta`
- **Respuesta (200 OK)**:
```json
{
  "idArbitro": 8,
  "nombreCompleto": "Juan Pérez",
  "saldoTotalPercibido": 250000.00,
  "prestamosPendientes": [
    {
      "idPrestamo": 3,
      "montoSolicitado": 50000.00,
      "montoDevuelto": 20000.00,
      "saldoPendiente": 30000.00,
      "fechaSolicitud": "2026-08-01",
      "estado": "PENDIENTE"
    }
  ],
  "deudasGastos": [
    {
      "idDeuda": 1,
      "concepto": "Indumentaria Oficial",
      "montoTotal": 15000.00,
      "montoPagado": 5000.00,
      "saldoRestante": 10000.00,
      "estado": "PENDIENTE"
    }
  ]
}
```

---

### 6. Mis Estadísticas Arbitrales (`/me/estadisticas`)
- **Endpoint**: `GET /arbitros/me/estadisticas?inicio=2026-01-01&fin=2026-12-31&orden=DESC&page=0&size=10`
- **Respuesta (200 OK)**:
```json
{
  "idArbitro": 8,
  "nombreCompleto": "Juan Pérez",
  "totalDesignaciones": 15,
  "totalPartidosDirigidos": 45,
  "totalMontoPercibido": 225000.00,
  "designacionesPorEstado": {
    "Pendiente": 0,
    "Aceptada": 2,
    "Finalizada": 12,
    "Cancelada": 1,
    "Suspendida": 0
  },
  "designacionesPorCategoria": {
    "INICIAL": 0,
    "EN_FORMACION": 0,
    "INTERMEDIO": 5,
    "AVANZADO": 10,
    "PRINCIPAL_1": 0
  }
}
```
