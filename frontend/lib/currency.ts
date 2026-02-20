export function formatRupiah(value: number | string | undefined | null) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
}
