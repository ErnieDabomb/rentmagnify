export function formatCurrency(value, fallback = '$0') {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return `$${Math.round(numeric).toLocaleString('en-US')}`
}
