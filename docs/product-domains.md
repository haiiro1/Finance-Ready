# Definición de producto y dominios — Finance Ready

## Propósito

Finance Ready es una plataforma de finanzas personales orientada a responder cuatro
preguntas:

1. ¿Qué dinero entró y salió realmente?
2. ¿Qué obligaciones existen, cuánto falta por pagar y cuándo vencen?
3. ¿Qué productos financieros originan saldos, cupos, ciclos y costos?
4. ¿Cómo afectan los movimientos y compromisos futuros a la capacidad de pago?

El producto no es solamente un registro de gastos. Debe mantener separados los hechos
financieros observados, las obligaciones pendientes y las proyecciones. Una estimación no
puede presentarse como saldo disponible y una obligación no puede considerarse pagada sin
un evento de pago trazable.

## Estado arquitectónico actual

Finance Ready se implementa actualmente como:

- un frontend React desplegable en `frontend/apps/shell`;
- un backend FastAPI desplegable en `Backend/`;
- una base de datos PostgreSQL compartida;
- módulos de dominio dentro del backend;
- páginas de dominio compuestas dentro del shell.

Por tanto, hoy no existen microservicios ni microfrontends independientes. Las carpetas
`frontend/apps/<dominio>` son scaffolds sin aplicación Vite funcional y los módulos de
`Backend/app/modules/` forman un monolito modular.

En este documento, **módulo de dominio** significa una frontera funcional dentro del
despliegue actual. Un módulo solo debería extraerse como microservicio si necesita ciclo de
despliegue, escalado, disponibilidad o propiedad de datos independientes. La separación no
se justifica únicamente por existir una opción en la navegación.

## Principios financieros transversales

El contrato canónico de dinero, moneda, fechas, ownership y paginación está definido en
[`docs/financial-contract.md`](financial-contract.md).

- Los importes persistidos y calculados usan `Decimal` y columnas `NUMERIC(19,4)`. La escala
  permitida se valida por moneda. Nunca `float`.
- Los contratos JSON representan importes decimales como strings y mantienen la moneda en
  un campo separado.
- No se agregan monedas diferentes sin una conversión y una fuente de tipo de cambio
  explícitas.
- `occurred_at`, `due_date`, `billing_cycle_start`, `billing_cycle_end` y `paid_at` expresan
  hechos distintos y no son intercambiables.
- Los estados pagado, pendiente, vencido, cancelado y fallido son mutuamente coherentes.
- Toda información financiera pertenece a un usuario y el backend valida ownership en cada
  lectura y mutación.
- Los cambios de estado sensibles deben ser trazables e idempotentes.
- Los datos demo del frontend no definen contratos ni reglas de negocio.

## Mapa de experiencias frontend

| Ruta | Responsabilidad de experiencia | Fuentes de datos previstas |
|---|---|---|
| `/dashboard` | Resumen accionable de la situación actual y próximos compromisos | Lecturas agregadas de transactions, cards, loans y subscriptions |
| `/finanzas` | Ingresos, gastos, transferencias e historial de movimientos | transactions y categorías financieras |
| `/bancos-tarjetas` | Cuentas, productos bancarios, tarjetas, cupos, ciclos y vencimientos | banks y cards |
| `/prestamos-deudas` | Obligaciones propias, dinero prestado, cuotas y pagos | loans; referencias a transactions cuando se confirma un pago |
| `/suscripciones` | Recurrencias, renovaciones, participantes y reembolsos compartidos | subscriptions; referencias a transactions cuando existe un cobro o pago real |
| `/reportes` | Análisis histórico y proyecciones con supuestos visibles | reports como capa de lectura sobre los dominios financieros |
| `/configuracion` | Perfil, preferencias, categorías, seguridad y umbrales | auth y futuros módulos settings/categories |

Las rutas frontend son experiencias de usuario, no una relación uno a uno obligatoria con
servicios backend.

## Responsabilidad de cada módulo backend

### `health`

**Propósito:** informar disponibilidad técnica del backend y sus dependencias críticas.

**Es dueño de:** healthchecks y readiness checks.

**No es dueño de:** métricas financieras, estado de usuario ni reglas de negocio.

### `auth`

**Propósito:** establecer identidad y sesión para proteger los datos financieros.

**Es dueño de:** usuarios, credenciales, login, tokens, verificación de email, recuperación
de contraseña y dependencias de autenticación.

**No es dueño de:** preferencias financieras, cuentas, movimientos u obligaciones.

### `banks`

**Propósito:** representar las instituciones y cuentas donde el usuario mantiene dinero.

**Es dueño de:** bancos del usuario, cuentas bancarias, tipo de cuenta, moneda y estado del
producto. El saldo importado o conciliado debe conservar fecha y procedencia.

**No es dueño de:** tarjetas, movimientos, deudas ni agregaciones del dashboard.

### `cards`

**Propósito:** representar tarjetas y sus condiciones financieras.

**Es dueño de:** tarjeta, emisor o cuenta asociada, límite por moneda, ciclo de facturación,
fecha de cierre, fecha de pago y estado del producto.

**No es dueño de:** la compra como movimiento, la deuda general del usuario ni la
confirmación de un pago. Una compra pertenece a `transactions`; una obligación facturada
puede exponerse a `loans` mediante un contrato explícito posterior.

### `transactions`

**Propósito:** mantener el libro de movimientos monetarios observados del usuario.

**Es dueño de:** ingresos, gastos y, cuando se incorpore, transferencias entre cuentas;
importe, moneda, fecha efectiva, descripción, categoría, origen y referencias al producto
financiero involucrado.

**MVP inicial:** ingresos y gastos confirmados, categorías, consulta histórica y filtros.
Cada movimiento debe tener moneda explícita y puede asociarse a una cuenta o tarjeta sin
transferir la propiedad de esos productos al módulo.

**No es dueño de:** vencimientos, cuotas futuras, facturas de tarjeta, renovaciones de
suscripciones ni proyecciones. Esos dominios crean obligaciones; `transactions` registra el
movimiento real cuando ocurre el pago o cobro.

### `loans`

**Propósito:** administrar obligaciones financieras y préstamos entre el usuario,
instituciones y otras personas.

**Es dueño de:** acreedor, deudor, principal, moneda, calendario de cuotas, intereses y
costos explícitos, saldo pendiente, vencimientos, pagos parciales y estado de la obligación.

**No es dueño de:** cuentas bancarias ni movimientos generales. Confirmar un pago modifica
la obligación y debe crear o enlazar un movimiento en `transactions` mediante una operación
idempotente.

### `subscriptions`

**Propósito:** administrar compromisos recurrentes y responsabilidades compartidas.

**Es dueño de:** servicio, frecuencia, próxima renovación, pagador, participantes, reglas de
distribución, estado de la suscripción y reembolsos entre participantes.

**No es dueño de:** el pago al proveedor como hecho monetario ni el sistema genérico de
notificaciones. Renovación, pago al proveedor y reembolso de un participante son eventos
distintos.

### `reports`

**Propósito:** ofrecer lecturas agregadas, comparaciones y proyecciones explicables.

**Es dueño de:** definiciones de reporte, parámetros, read models y supuestos de proyección.

**No es dueño de:** movimientos, obligaciones o estados financieros fuente. Es un consumidor
de los demás dominios y no debe corregir ni duplicar sus datos.

Los reportes deben separar datos observados de estimaciones, indicar período y moneda y
evitar totales multi-moneda sin conversión definida.

### `notifications`

**Propósito:** entregar avisos originados por eventos de otros dominios.

**Es dueño de:** preferencias de canal, consentimientos, plantillas, intentos de entrega y
estado de envío.

**No es dueño de:** determinar por sí solo si una obligación está vencida ni cambiar estados
financieros. El dominio fuente decide qué ocurrió; notifications decide cómo comunicarlo.

## Capacidades backend aún no delimitadas

### Categorías financieras

La UI actual las presenta dentro de Configuración, pero funcionalmente clasifican
movimientos. Para el MVP pueden ser un submódulo de `transactions`. Deben separarse en un
módulo `categories` solo si otros dominios necesitan taxonomías con reglas propias.

### Preferencias de usuario

Moneda base, locale, inicio del mes financiero, umbrales y preferencias de alertas no
pertenecen a `auth`. Antes de persistirlas se debe definir un módulo `settings` o un contrato
equivalente. Cambiar moneda base no convierte datos históricos automáticamente.

### Dashboard

Dashboard es una experiencia de lectura, no una fuente de verdad. Puede comenzar como un
endpoint de composición o read model, pero no debe persistir saldos que puedan derivarse de
los dominios fuente.

## Reglas de interacción entre dominios

1. Los módulos se referencian por identificadores estables y contratos explícitos.
2. Un módulo no modifica directamente el estado financiero propiedad de otro módulo.
3. Registrar un pago y crear su movimiento asociado debe ser atómico o recuperable e
   idempotente.
4. `reports` y dashboard consumen datos; no crean movimientos ni obligaciones.
5. `notifications` consume eventos; no decide estados financieros.
6. Eliminar un producto financiero con movimientos u obligaciones asociados requiere una
   política explícita; no se permite borrado en cascada silencioso.

## Prioridad funcional revisada

1. Completar identidad y ownership de datos.
2. Definir categorías y el libro de ingresos/gastos en `transactions`.
3. Implementar bancos, cuentas y tarjetas como productos referenciables.
4. Conectar dashboard a lecturas reales sin inventar saldos.
5. Implementar préstamos, deudas, cuotas y pagos.
6. Implementar suscripciones, recurrencias y responsabilidades compartidas.
7. Implementar reportes y proyecciones sobre fuentes reales.
8. Incorporar notificaciones, importación y automatización.

## Brechas conocidas antes de integrar el frontend

- Las páginas financieras actuales usan fixtures de demostración y no son fuentes de verdad.
- `frontend/packages/shared-types` define actualmente `Money.amount` como `number`; el
  contrato debe cambiar a decimal string antes de transportar dinero real desde la API.
- Las carpetas de dominio frontend no tienen scaffold ni composición independiente.
- Los módulos backend financieros, salvo auth, son routers placeholder sin persistencia.
- No existe todavía contrato de moneda base, categorías, cuentas financieras ni estados de
  movimiento.
