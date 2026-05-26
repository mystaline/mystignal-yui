# Styling System — mystignal-yui

## Single System Rule

**All components must use: Tailwind CSS + CSS Variables for semantic colors.**

### What This Means

- **Tailwind utilities** are the primary way to style — `flex`, `px-3`, `rounded-lg`, `text-sm`, `gap-2`, etc.
- **CSS variables** (from `src/index.css`) are used for colors — `color: var(--up)`, `background: var(--bg)`, `border: var(--line)`
- **Inline `style={}`** only for:
  - Dynamic values computed at runtime (e.g., `width: ${percentage}%`)
  - Transient state not worth CSS variables (hover effects via Framer Motion)
  - Never for static color/spacing/typography

### Prohibited

- ❌ Custom CSS classes for layout/spacing (use Tailwind instead)
- ❌ Hardcoded hex colors in components (`#6b7280`, `#ff6a7d`)
- ❌ Magic pixel values (`calc(100vh - 113px)` — document or compute dynamically)
- ❌ Three styling systems in one component
- ❌ Inline styles for static properties

### Example: Correct

```tsx
// ✅ Good
<div className="flex gap-3 px-4 py-2 rounded-lg" style={{ color: 'var(--up)' }}>
  {children}
</div>

// ✅ Also good (semantic variable)
<div className="flex gap-3 px-4 py-2 rounded-lg" style={{ borderColor: 'var(--line)' }}>
  {children}
</div>
```

### Example: Incorrect

```tsx
// ❌ Bad — hardcoded color
<div style={{ color: '#6b7280', padding: '12px', gap: '12px' }}>
  {children}
</div>

// ❌ Bad — custom CSS class for layout
<div className="my-custom-box">
  {children}
</div>
```

---

## Color Tokens (in `src/index.css`)

All colors available as CSS variables:

- `--up` — green (bullish/profit)
- `--down` — red (bearish/loss)
- `--accent` — cyan/highlight
- `--amber` — warning/timeout
- `--bg` — background
- `--ink`, `--ink-2`, `--ink-3` — text/foreground at different opacities
- `--line` — borders/dividers
- `--secondary-*` — Tailwind-defined neutral scale (50–900)

Use these instead of hardcoding colors.

---

## Tailwind Configuration

See `tailwind.config.js` for:
- Extend colors with CSS variables (semantic binding)
- Custom animations (e.g., `animate-spin` from Framer Motion)
- Responsive breakpoints

---

## Migration Guide

When refactoring a component:

1. **Remove inline `style={}`** for static properties → convert to Tailwind
2. **Replace hardcoded colors** → use CSS variables
3. **Replace custom CSS classes** → use Tailwind utilities
4. **Group related Tailwind classes** for readability (layout, sizing, color, animation)

### Example Refactor

```tsx
// Before
<div style={{ 
  display: 'flex', 
  gap: '12px', 
  padding: '16px', 
  color: '#6b7280', 
  borderRadius: '8px',
  border: '1px solid #e5e7eb'
}}>
  {children}
</div>

// After
<div className="flex gap-3 px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--ink-2)', borderColor: 'var(--line)' }}>
  {children}
</div>

// Or with semantic CSS class (if reused):
<div className="card">
  {children}
</div>
```

---

## Enforcement

- **Code review**: Flag inline styles for static properties, hardcoded colors, custom layout classes
- **TypeScript**: No type-level enforcement; rely on review
- **ESLint**: Could add rule for `style={}` with values outside dynamic set (future)

---

## Questions?

Refer to `src/index.css` for color tokens and `tailwind.config.js` for theme configuration.
