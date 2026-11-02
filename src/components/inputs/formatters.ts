/** Display helpers used by the legacy Formik input adapters. */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const normalized = String(value).trim().replace(/,/g, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/^(\d{1,4})(\d{3})(\d{4})$/, "$1 $2 $3");
}

export function formatBankAccount(value: string | null | undefined): string {
  if (!value || value.length !== 16) return value ?? "";
  return value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
}
