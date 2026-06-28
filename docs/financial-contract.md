# Contrato financiero base — Finance Ready

## Propósito

Este documento define las reglas transversales para representar dinero, monedas, fechas,
ownership, eliminación y colecciones en los dominios financieros de Finance Ready.

Los contratos específicos de `transactions`, `cards`, `loans` y `subscriptions` deben
respetar estas reglas y documentar explícitamente cualquier extensión.

## Dinero

### Contrato JSON

Los importes se transportan como strings decimales y siempre incluyen moneda:

```json
{
  "amount": "125000",
  "currency": "CLP"
}
```

Reglas:

- `amount` nunca se transporta como número JSON.
- Python usa `Decimal`; nunca `float`.
- PostgreSQL usa `NUMERIC(19,4)`.
- El importe debe ser mayor que cero para movimientos y obligaciones con valor.
- El importe es siempre positivo; el sentido financiero se expresa mediante un campo de
  dominio como `type`.
- No se aceptan símbolos, separadores de miles ni formatos localizados en la API.

Ejemplo de movimiento:

```json
{
  "type": "expense",
  "amount": "15000",
  "currency": "CLP"
}
```

El saldo neto de movimientos se calcula explícitamente:

```text
net = sum(income) - sum(expense)
```

No se usan importes negativos para representar gastos. Reembolsos, reversos y ajustes deben
tener tipos o relaciones explícitas cuando se incorporen.

## Monedas y escala

El modelo admite estructuralmente códigos ISO 4217. La primera lista habilitada será:

| Moneda | Escala máxima | Ejemplo válido |
|---|---:|---:|
| `CLP` | 0 | `"125000"` |
| `USD` | 2 | `"1250.50"` |
| `EUR` | 2 | `"1250.50"` |

Reglas:

- La moneda es obligatoria en todo importe.
- CLP no acepta fracciones: `"125000.50"` es inválido.
- La validación de escala se aplica en schemas, servicios y constraints de persistencia
  cuando sea posible.
- `NUMERIC(19,4)` permite precisión interna y evolución futura, pero no autoriza a cada
  moneda a utilizar cuatro decimales.
- La lista de monedas habilitadas es configuración de producto, no texto libre.
- No se agregan monedas distintas sin una conversión explícita.
- Los totales sin conversión se agrupan y devuelven por moneda.

## Conversión monetaria

La conversión no forma parte del MVP inicial. Cuando se implemente, deberá conservar como
mínimo:

```text
source_currency
target_currency
source_amount
converted_amount
exchange_rate
rate_source
rate_observed_at
converted_at
```

La hora de un movimiento no determina por sí sola el tipo de cambio. La fuente y el instante
de observación de la tasa deben ser explícitos. Los importes originales nunca se reemplazan
silenciosamente por importes convertidos.

## Cálculos y redondeo

- Los cálculos intermedios usan `Decimal` con precisión suficiente.
- No se redondea en cada operación intermedia.
- El redondeo ocurre al materializar un importe exigible o pagable en una moneda concreta.
- La regla predeterminada propuesta para importes de producto es `ROUND_HALF_UP`, salvo que
  una regla contractual o normativa requiera otra.
- Toda regla diferente debe pertenecer al dominio que realiza el cálculo.

Cuando una distribución en CLP genera residuos, las partes deben reconciliar exactamente
contra el total. Ejemplo:

```text
Total:     $10.000
Parte A:    $3.334
Parte B:    $3.333
Parte C:    $3.333
```

La asignación del residuo debe ser determinista y documentada. En calendarios de cuotas, el
ajuste puede aplicarse a la última cuota si la regla del producto así lo define.

## Presentación

El backend devuelve valores canónicos sin formato visual. El frontend aplica locale,
separadores y símbolo mediante `Intl.NumberFormat` o una abstracción compartida.

```ts
new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
}).format(125000);
```

Ocultar decimales en la interfaz no corrige un importe inválido. La validación debe ocurrir
antes de persistirlo.

## Fechas y horas

Los hechos financieros manuales mantienen una fecha efectiva obligatoria y una hora exacta
opcional:

```json
{
  "occurred_on": "2026-06-27",
  "occurred_at": null
}
```

Reglas:

- `occurred_on` es `date`, obligatorio y visible en el flujo minimalista.
- `occurred_at` es un datetime opcional con timezone para fuentes que conocen el instante
  exacto, como importaciones o integraciones.
- `created_at` y `updated_at` son timestamps técnicos en UTC.
- `deleted_at` es un timestamp técnico opcional en UTC.
- `due_date`, `paid_at`, `billing_cycle_start` y `billing_cycle_end` representan conceptos
  diferentes y no se infieren de `occurred_on`.
- Si una fuente entrega fecha y hora, la API debe preservar el timezone u offset original
  cuando corresponda y normalizar el instante almacenado a UTC.

## Ownership y autorización

- Todo dato financiero persistido pertenece a un usuario.
- `user_id` se obtiene de la identidad autenticada; nunca se acepta desde el body.
- Toda lectura, actualización y eliminación filtra por ownership en backend.
- Referencias a categorías, cuentas, tarjetas u otros recursos deben pertenecer al mismo
  usuario.
- Un recurso inexistente o perteneciente a otro usuario responde `404` para no revelar su
  existencia.

## Identificadores

- El MVP mantiene IDs enteros, consistente con el modelo actual de `User`.
- Las relaciones usan IDs explícitos y foreign keys cuando existe persistencia local.
- Los IDs no contienen significado financiero ni se usan para ordenar por fecha.

## Eliminación lógica

Los registros financieros incorporan desde el inicio:

```text
deleted_at: datetime | null
```

Reglas:

- Las consultas normales excluyen registros eliminados.
- Eliminar asigna `deleted_at`; no ejecuta borrado físico.
- Un registro eliminado no participa en agregaciones activas.
- La restauración, si se habilita, es una operación explícita y autorizada.
- La política de retención y purga física se definirá separadamente.
- Las relaciones críticas no usan cascadas que oculten la eliminación de historia
  financiera.

## Estados y temporalidad de movimientos

El MVP inicial de `transactions` registra hechos confirmados:

- `income`;
- `expense`.

No incorpora todavía movimientos planificados, vencimientos ni un campo `status`. Los
compromisos futuros pertenecen a sus dominios fuente, como `loans` o `subscriptions`, hasta
que exista un contrato de planificación que defina confirmación, cancelación, vencimiento e
idempotencia.

## Errores de API

Formato de error de dominio:

```json
{
  "detail": {
    "code": "invalid_currency_scale",
    "message": "CLP amounts must not contain fractional digits",
    "field": "amount"
  }
}
```

Semántica:

| Estado | Uso |
|---:|---|
| `400` | Regla de negocio inválida |
| `401` | Identidad no autenticada |
| `403` | Identidad autenticada sin autorización para la operación |
| `404` | Recurso inexistente o ajeno |
| `409` | Conflicto con el estado actual |
| `422` | Estructura, tipo o formato de entrada inválido |

Los códigos estables como `invalid_currency_scale` permiten al frontend mapear mensajes sin
depender del texto humano.

## Paginación y orden

Las colecciones financieras usan cursor opaco:

```text
GET /api/v1/transactions?limit=50&cursor=<opaque>
```

Respuesta:

```json
{
  "items": [],
  "next_cursor": null,
  "has_more": false
}
```

Reglas:

- `limit` predeterminado: `50`.
- `limit` máximo: `100`.
- El cursor no expone detalles que el cliente deba interpretar.
- Orden predeterminado para movimientos: `occurred_on DESC, id DESC`.
- Los filtros forman parte del contexto del cursor y no deben cambiarse entre páginas.
- El total exacto no se incluye por defecto; si una pantalla lo necesita, se define como una
  agregación separada y explícita.

## Brecha frontend conocida

El contrato actual:

```ts
type Money = {
  amount: number;
  currency: CurrencyCode;
};
```

debe cambiar antes de integrar datos financieros reales:

```ts
type Money = {
  amount: string;
  currency: CurrencyCode;
};
```

Los fixtures visuales pueden mantener strings ya formateados en tipos de demostración
separados, pero los contratos de API no deben transportar dinero como `number`.

