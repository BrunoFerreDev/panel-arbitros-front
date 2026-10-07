# Guía de Objetos y Payloads para Frontend

Referencia exhaustiva de todos los payloads JSON y parámetros que el cliente web/móvil debe enviar al backend de Designaciones.

---

## Índice

1. [Autenticación](#1-autenticación)
2. [Árbitros y Roles](#2-árbitros-y-roles)
3. [Canchas y Aranceles](#3-canchas-y-aranceles)
4. [Designaciones y Jornadas](#4-designaciones-y-jornadas)
5. [Finanzas (Conceptos, Gastos y Préstamos)](#5-finanzas)
6. [Reuniones Arbitrales](#6-reuniones-arbitrales)
7. [Glosario de Enums](#7-glosario-de-enums)

---

## 1. Autenticación

### `POST /auth/login`
Inicia sesión de cualquier árbitro activo en el sistema.

```json
{
  "whatsapp": "3815123456",
  "contrasenia": "password123"
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `whatsapp` | String | Sí | Número de teléfono registrado (único). |
| `contrasenia` | String | Sí | Contraseña en texto plano. |

---

## 2. Árbitros y Roles

### `PUT /arbitros/me/contrasenia`
Cambio de contraseña propio del árbitro autenticado (Bearer Token en header).

```json
{
  "contraseniaActual": "claveVieja123",
  "nuevaContrasenia": "claveNueva456"
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `contraseniaActual` | String | Sí | Contraseña vigente para validar identidad. |
| `nuevaContrasenia` | String | Sí | Mínimo 6 caracteres. |

---

### `PUT /arbitros/me/disponibilidad` y `PUT /arbitros/{idArbitro}/disponibilidad`
Configura si el árbitro puede dirigir sábado y/o domingo.

```json
{
  "estado": true,
  "disponibleSabado": true,
  "disponibleDomingo": false
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `estado` | Boolean | Opcional | Habilitación general en el sistema (`estadoSistema`). |
| `disponibleSabado` | Boolean | Sí | `true` si puede dirigir el sábado. |
| `disponibleDomingo` | Boolean | Sí | `true` si puede dirigir el domingo. |

---

### `GET /arbitros/me/estadisticas`
Obtiene estadísticas detalladas de actividad y rendimiento del árbitro autenticado.

- **Método:** `GET`
- **Autenticación:** Requerida (Bearer JWT).
- **Parámetros de consulta (Query Params):**

| Parámetro | Tipo | Requerido | Default | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `inicio` | String (`YYYY-MM-DD`) | Opcional | Primer día del mes | Fecha inicial del rango a consultar. |
| `fin` | String (`YYYY-MM-DD`) | Opcional | Último día del mes | Fecha final del rango a consultar. |
| `orden` | String | Opcional | `"DESC"` | Ordenamiento por fecha: `"ASC"` o `"DESC"`. |
| `page` | Integer | Opcional | `0` | Número de página para desglose de canchas. |
| `size` | Integer | Opcional | `10` | Cantidad de canchas por página. |

- **Respuesta (`GetEstadisticasArbitroDetalleDTO`):**
```json
{
  "idArbitro": 14,
  "nombreCompleto": "Pérez Juan",
  "totalDesignaciones": 8,
  "totalPartidosDirigidos": 16,
  "totalMontoPercibido": 180000.00,
  "designacionesPorEstado": {
    "Pendiente": 0,
    "Aceptada": 1,
    "Finalizada": 7,
    "Cancelada": 0,
    "Suspendida": 0
  },
  "estadisticasCanchas": {
    "content": [
      {
        "idCancha": 3,
        "nombreCancha": "Predio Las Cañas",
        "totalDesignaciones": 4,
        "totalPartidos": 8,
        "totalDesignacionesFinalizadas": 4
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  },
  "designacionesPorCategoria": {
    "PRINCIPAL_1": 6,
    "ASISTENTE": 2
  }
}
```

---

### `POST /arbitros` y `PUT /arbitros/{idArbitro}`
Creación y edición de un árbitro en el padrón (`SUPERUSER`, `PRESIDENTE`, `SECRETARIO`).

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "whatsapp": "3815987654",
  "estadoSistema": true,
  "disponibleSabado": true,
  "disponibleDomingo": true,
  "talleCamiseta": "L",
  "talleShort": "M",
  "categoria": "PRINCIPAL_1",
  "tieneAuto": true,
  "roles": [
    "ARBITRO",
    "DESIGNADOR"
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `nombre` | String | Sí | Nombre de pila. |
| `apellido` | String | Sí | Apellido. |
| `whatsapp` | String | Sí | Teléfono / WhatsApp único. |
| `estadoSistema` | Boolean | Opcional | Activo (`true`) o Inactivo (`false`). Default: `true`. |
| `disponibleSabado` | Boolean | Opcional | Default: `false`. |
| `disponibleDomingo`| Boolean | Opcional | Default: `false`. |
| `talleCamiseta` | String | Opcional | Ej: `"S"`, `"M"`, `"L"`, `"XL"`. |
| `talleShort` | String | Opcional | Ej: `"S"`, `"M"`, `"L"`. |
| `categoria` | String | Opcional | Ver enum `CategoriaArbitro`. |
| `tieneAuto` | Boolean | Opcional | Disponibilidad de movilidad/vehículo. |
| `roles` | Set\<String\> | Opcional | Roles iniciales. Si se omite, se asigna `["ARBITRO"]`. |

---

### `PUT /arbitros/{idArbitro}/roles`
Sobrescribe los roles de un árbitro (`SUPERUSER` únicamente).

```json
{
  "roles": [
    "ARBITRO",
    "SECRETARIO"
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `roles` | Array\<RolUsuario\> | Sí | Lista de roles asignados. Ej: `["ARBITRO", "SECRETARIO"]`. |

---

### `PUT /arbitros/roles/bulk`
Asignación masiva de roles a múltiples árbitros en una sola petición (`SUPERUSER` únicamente).

```json
[
  {
    "idArbitro": 12,
    "roles": ["ARBITRO", "DESIGNADOR"]
  },
  {
    "idArbitro": 18,
    "roles": ["ARBITRO", "SECRETARIO"]
  },
  {
    "idArbitro": 25,
    "roles": ["ARBITRO", "PRESIDENTE"]
  }
]
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `idArbitro` | Long | Sí | Identificador del árbitro. |
| `roles` | Set\<RolUsuario\> | Sí | Conjunto de roles a asignar (no puede estar vacío). |

---

### `POST /arbitros/{idArbitro}/suspenciones`
Registra una sanción disciplinaria o llamado de atención (`SUPERUSER`, `PRESIDENTE`, `SECRETARIO`).

```json
{
  "fechaIncidente": "2026-09-20T16:30:00",
  "cantidadDias": 14,
  "motivo": "Llegada tarde reiterada sin aviso previo",
  "tipoSuspencion": 2,
  "arbitro": 15,
  "cancha": 3
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `fechaIncidente` | String (ISO-8601) | Sí | Fecha y hora en que ocurrió el hecho. |
| `cantidadDias` | Integer | Sí | Días de vigencia de la sanción. |
| `motivo` | String | Sí | Descripción o causa del incidente. |
| `tipoSuspencion` | Integer | Sí | `1`: Llamado de atención, `2`: Suspensión. |
| `arbitro` | Long | Sí | ID del árbitro sancionado. |
| `cancha` | Long | Opcional | ID de la cancha donde ocurrió (si aplica). |

---

## 3. Canchas y Aranceles

### `POST /canchas` y `PUT /canchas/actualizar/{idCancha}`
Creación y actualización de canchas (`SUPERUSER`, `PRESIDENTE`, `SECRETARIO`).

```json
{
  "nombreCancha": "Predio Las Cañas - Cancha 1",
  "categoria": "FUTBOL_11",
  "fueraDeJuego": true,
  "estado": true,
  "necesitaViaje": false
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `nombreCancha` | String | Sí | Nombre o denominación del predio. |
| `categoria` | Categoria | Sí | `"FUTBOL_11"`, `"FUTBOL_10"`, `"FUTBOL_9"`. |
| `fueraDeJuego` | Boolean | Sí | Indica si se sanciona offside (demanda líneas). |
| `estado` | Boolean | Sí | `true`: Habilitada, `false`: Inhabilitada. |
| `necesitaViaje` | Boolean | Sí | Si requiere traslado fuera de la zona urbana. |

---

### `POST /aranceles` y `PUT /aranceles/actualizar?idArancel={idArancel}`
Configuración de tarifas arbitrales (`SUPERUSER`, `PRESIDENTE`).

```json
{
  "idCancha": 2,
  "descripcion": "Tarifa estándar fin de semana - 4 partidos",
  "monto": 45000.00,
  "fechaVigencia": "2026-09-01",
  "cantidadPartidos": 4
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `idCancha` | Long | Sí | Cancha asociada. |
| `descripcion` | String | Sí | Detalle o etiqueta de la tarifa. |
| `monto` | BigDecimal / Number | Sí | Monto global o arancel pactado. |
| `fechaVigencia` | String (`YYYY-MM-DD`) | Sí | Inicio de vigencia de la escala. |
| `cantidadPartidos` | Integer | Sí | Cantidad de partidos que cubre la jornada. |

---

## 4. Designaciones y Jornadas

### `POST /designaciones` y `PUT /designaciones/{idDesignacion}`
Creación y edición de jornadas (`SUPERUSER`, `PRESIDENTE`, `DESIGNADOR`).

```json
{
  "idCancha": 5,
  "fecha": "2026-09-27T08:30:00",
  "cantidadPartidos": 5,
  "etapaCampeonato": "FECHA_NORMAL",
  "detalle": "Jornada regular torneo clausura",
  "editable": true,
  "estadoDesignacion": 0
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `idCancha` | Long | Sí | Cancha asignada a la jornada. |
| `fecha` | String (ISO-8601) | Sí | Fecha y hora de inicio de la jornada. |
| `cantidadPartidos` | Integer | Sí | Cantidad de partidos consecutivos a disputar. |
| `etapaCampeonato` | EtapaCampeonato | Sí | `"FECHA_NORMAL"`, `"FECHA_PICANTE"`, `"CLASIFICACION"`, `"CRUCES"`, `"SEMIFINAL"`, `"FINAL"`. |
| `detalle` | String | Opcional | Observaciones o indicaciones adicionales. |
| `editable` | Boolean | Opcional | `true` por defecto. |
| `estadoDesignacion` | Integer | Opcional | `0`: Pendiente, `1`: Aceptada, `2`: Finalizada, `3`: Cancelada. |

---

### `POST /designaciones/{idDesignacion}/arbitros/bulk`
Asignación masiva de una lista de IDs de árbitros a la jornada (`SUPERUSER`, `PRESIDENTE`, `DESIGNADOR`).

```json
[3, 8, 14, 22]
```

- **Body:** `List<Long>` con los identificadores de los árbitros a designar.

---

## 5. Finanzas

### `POST /finanzas/conceptos`
Categoría de egreso (`SUPERUSER`, `PRESIDENTE`).

```json
{
  "nombre": "Equipamiento y Silbatos",
  "descripcion": "Compra de indumentaria y tarjetas para el plantel"
}
```

---

### `POST /finanzas/gastos` y `PUT /finanzas/gastos/{idGasto}`
Registro o modificación de un gasto de caja (`SUPERUSER`, `PRESIDENTE`).

```json
{
  "tipo": "EGRESO",
  "monto": 35000.00,
  "fecha": "2026-09-22T12:00:00",
  "descripcion": "Pago de viáticos transporte zona sur",
  "requiereRecupero": true,
  "concepto": 2
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `tipo` | String | Sí | `"EGRESO"` o `"INGRESO"`. |
| `monto` | BigDecimal / Number | Sí | Importe de la transacción. |
| `fecha` | String (ISO-8601) | Sí | Fecha y hora de la erogación. |
| `descripcion` | String | Sí | Detalle o motivo del gasto. |
| `requiereRecupero` | Boolean | Sí | `true` si debe cobrarse luego a los árbitros. |
| `concepto` | Long | Sí | ID del `ConceptoGasto` asociado. |

---

### `POST /finanzas/prestamos`
Otorgamiento de préstamo a un árbitro (`SUPERUSER`, `PRESIDENTE`).

```json
{
  "arbitro": 14,
  "montoSolicitado": 50000.00,
  "fechaSolicitud": "2026-09-22"
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `arbitro` | Long | Sí | ID del árbitro beneficiario. |
| `montoSolicitado` | BigDecimal / Number | Sí | Monto entregado en préstamo. |
| `fechaSolicitud` | String (`YYYY-MM-DD`) | Sí | Fecha de concesión del crédito. |

---

## 6. Reuniones Arbitrales

### `POST /reuniones` y `PUT /reuniones/{idReunion}`
Alta o edición de acta de reunión (`SUPERUSER`, `PRESIDENTE`, `SECRETARIO`).

```json
{
  "fecha": "2026-09-24T20:00:00",
  "lugar": "Sede Central - Sala de Conferencias",
  "titulo": "Reunión Técnica Previa a Cuartos de Final",
  "observaciones": "Se analizarán jugadas de área y criterios de faltas tácticas",
  "inicializarAsistencia": true,
  "temas": [
    {
      "titulo": "Criterios mano sancionable",
      "descripcion": "Revisión de videos formativos de Conmebol",
      "orden": 1,
      "urlMaterial": "https://drive.google.com/reunion/video1"
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `fecha` | String (ISO-8601) | Sí | Fecha y hora pactada. |
| `lugar` | String | Sí | Ubicación o link virtual. |
| `titulo` | String | Sí | Nombre o asunto central de la reunión. |
| `observaciones` | String | Opcional | Anotaciones generales o notas al pie. |
| `inicializarAsistencia`| Boolean | Opcional | Si es `true`, carga a todos los árbitros activos en estado `AUSENTE`. |
| `temas` | Array\<TemaReunionDTO\> | Opcional | Temario inicial de la reunión. |

---

### `PUT /reuniones/{idReunion}/temas`
Sobrescribe o actualiza la lista de temas del orden del día (`SUPERUSER`, `PRESIDENTE`, `SECRETARIO`).

```json
[
  {
    "idTema": null,
    "titulo": "Balance financiero mensual",
    "descripcion": "Informe de tesorería sobre compras de indumentaria",
    "orden": 1,
    "urlMaterial": "https://drive.google.com/informe.pdf"
  },
  {
    "idTema": null,
    "titulo": "Uso del silbato y posicionamiento",
    "descripcion": "Demostración práctica en campo",
    "orden": 2,
    "urlMaterial": null
  }
]
```

---

### `POST /reuniones/{idReunion}/asistencia`
Carga masiva de asistencias y disponibilidad fin de semana (`SUPERUSER`, `PRESIDENTE`, `SECRETARIO`).

```json
{
  "sincronizarDisponibilidad": true,
  "asistencias": [
    {
      "idArbitro": 12,
      "estadoAsistencia": "PRESENTE",
      "observacion": "Llegó puntual",
      "disponibleSabado": true,
      "disponibleDomingo": true
    },
    {
      "idArbitro": 15,
      "estadoAsistencia": "JUSTIFICADO",
      "observacion": "Certificado laboral presentado",
      "disponibleSabado": false,
      "disponibleDomingo": true
    },
    {
      "idArbitro": 23,
      "estadoAsistencia": "AUSENTE",
      "observacion": "Sin aviso",
      "disponibleSabado": false,
      "disponibleDomingo": false
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `sincronizarDisponibilidad` | Boolean | Opcional | Si es `true`, actualiza los campos `disponibleSabado` y `disponibleDomingo` en la ficha de cada árbitro. |
| `asistencias` | Array | Sí | Lista de registros de asistencia. |
| `asistencias[].idArbitro` | Long | Sí | ID del árbitro. |
| `asistencias[].estadoAsistencia` | EstadoAsistencia | Sí | `"PRESENTE"`, `"AUSENTE"`, `"JUSTIFICADO"`. |
| `asistencias[].observacion` | String | Opcional | Motivo o justificación. |
| `asistencias[].disponibleSabado` | Boolean | Opcional | Disponibilidad para sábado. |
| `asistencias[].disponibleDomingo`| Boolean | Opcional | Disponibilidad para domingo. |

---

## 7. Glosario de Enums

### `RolUsuario`
- `SUPERUSER`
- `PRESIDENTE`
- `SECRETARIO`
- `DESIGNADOR`
- `ARBITRO`

### `CategoriaArbitro`
- `AVANZADO`
- `INTERMEDIO`
- `PRINCIPAL_1`
- `PRINCIPAL_2`
- `PRINCIPAL_3`
- `PRINCIPAL_4`
- `ASISTENTE`
- `INICIAL`

### `Categoria` (Cancha)
- `FUTBOL_11`
- `FUTBOL_10`
- `FUTBOL_9`

### `EtapaCampeonato`
- `FECHA_NORMAL`
- `FECHA_PICANTE`
- `CLASIFICACION`
- `CRUCES`
- `SEMIFINAL`
- `FINAL`

### `EstadoAsistencia`
- `PRESENTE`
- `AUSENTE`
- `JUSTIFICADO`
