# Finance Ready — Design System v1

## Filosofía Visual

Finance Ready no es un banco ni una aplicación de inversiones.

La interfaz debe transmitir:

- Control financiero
- Claridad
- Confianza
- Proyección futura
- Profesionalismo

Evitar:

- Estética crypto
- Gradientes agresivos
- Colores saturados
- Dashboards tipo marketing
- Elementos visuales innecesarios

La UI debe sentirse cercana a herramientas como:

- Linear
- Notion
- Stripe Dashboard
- GitHub

---

# Teoría del Color

## Distribución

- 60% Neutros
- 30% Superficies
- 10% Acentos

---

# Paleta Principal

## Primary

Color principal de marca.

Uso:

- Botones primarios
- Links
- Focus states
- Navegación activa
- Checkboxes
- Switches

```css
--fr-primary: #0D9488;
--fr-primary-hover: #0F766E;
--fr-primary-soft: #CCFBF1;
```

### Tailwind

```text
teal-600
teal-700
teal-100
```

---

# Neutrales

## Fondo Principal

```css
--fr-bg: #F8FAFC;
```

### Tailwind

```text
slate-50
```

---

## Fondo Secundario

```css
--fr-surface: #FFFFFF;
```

---

## Fondo Terciario

```css
--fr-surface-muted: #F1F5F9;
```

### Tailwind

```text
slate-100
```

---

# Texto

## Principal

```css
--fr-text: #0F172A;
```

### Tailwind

```text
slate-900
```

---

## Secundario

```css
--fr-text-muted: #64748B;
```

### Tailwind

```text
slate-500
```

---

## Deshabilitado

```css
--fr-text-disabled: #94A3B8;
```

### Tailwind

```text
slate-400
```

---

# Bordes

```css
--fr-border: #E2E8F0;
```

### Tailwind

```text
slate-200
```

---

# Estados Semánticos

## Success

Representa:

- Pago completado
- Deuda pagada
- Operación exitosa

```css
--fr-success: #059669;
--fr-success-soft: #D1FAE5;
```

### Tailwind

```text
emerald-600
emerald-100
```

---

## Warning

Representa:

- Próximo vencimiento
- Acción pendiente
- Riesgo moderado

```css
--fr-warning: #F59E0B;
--fr-warning-soft: #FEF3C7;
```

### Tailwind

```text
amber-500
amber-100
```

---

## Danger

Representa:

- Atrasos
- Cuotas vencidas
- Errores

```css
--fr-danger: #E11D48;
--fr-danger-soft: #FFE4E6;
```

### Tailwind

```text
rose-600
rose-100
```

---

## Info

Representa:

- Información
- Notificaciones
- Datos auxiliares

```css
--fr-info: #0284C7;
--fr-info-soft: #E0F2FE;
```

### Tailwind

```text
sky-600
sky-100
```

---

# Colores Financieros

## Ingresos

```css
--fr-income: #059669;
```

---

## Gastos

```css
--fr-expense: #64748B;
```

---

## Deudas

```css
--fr-debt: #F59E0B;
```

---

## Atrasos

```css
--fr-overdue: #E11D48;
```

---

## Ahorros

```css
--fr-savings: #0D9488;
```

---

## Proyecciones

```css
--fr-forecast: #4F46E5;
```

### Tailwind

```text
indigo-600
```

---

# Modo Oscuro

## Fondo Principal

```css
--fr-bg: #020617;
```

### Tailwind

```text
slate-950
```

---

## Surface

```css
--fr-surface: #0F172A;
```

### Tailwind

```text
slate-900
```

---

## Surface Elevada

```css
--fr-surface-elevated: #1E293B;
```

### Tailwind

```text
slate-800
```

---

## Texto Principal

```css
--fr-text: #F8FAFC;
```

### Tailwind

```text
slate-50
```

---

## Texto Secundario

```css
--fr-text-muted: #94A3B8;
```

### Tailwind

```text
slate-400
```

---

# Reglas de Componentes

## Border Radius

```css
0.5rem
```

### Tailwind

```text
rounded-lg
```

---

## Sombras

Usar sombras mínimas.

```text
shadow-sm
```

Evitar:

```text
shadow-xl
shadow-2xl
```

---

## Cards

- Fondo blanco
- Borde slate-200
- Sin gradientes
- Padding consistente

---

## Inputs

- Altura uniforme
- Focus teal
- Error rose
- Disabled slate

---

## Botones

### Primary

```text
bg-teal-600
hover:bg-teal-700
text-white
```

### Secondary

```text
bg-slate-100
text-slate-900
hover:bg-slate-200
```

### Ghost

```text
bg-transparent
hover:bg-slate-100
```

---

# Mapeo de Estados Financieros

| Estado | Color |
|----------|----------|
| Pagado | Success |
| Pendiente | Warning |
| Próximo vencimiento | Warning |
| Atrasado | Danger |
| Ingreso | Income |
| Gasto | Expense |
| Ahorro | Savings |
| Proyección | Forecast |

---

# Reglas Importantes

## NO usar

- Rojo para todo lo negativo
- Verde para representar dinero
- Gradientes decorativos
- Glassmorphism
- Colores neón
- Sombras pesadas
- Bordes excesivamente redondeados

## SI usar

- Jerarquía mediante contraste
- Semántica consistente
- Estados visuales claros
- Mucho espacio negativo
- Componentes simples y escaneables
- Densidad visual tipo SaaS financiero

---

# Stack Visual

- React 19
- Tailwind CSS 4
- UI Kit compartido
- Soporte Light / Dark
- Diseño Mobile First
- Componentes compactos
- Estética SaaS financiera profesional
