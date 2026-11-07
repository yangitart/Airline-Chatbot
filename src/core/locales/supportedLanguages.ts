export const supportedLanguages = [
  {
    code: "en",
    flag: "us",
    label: "English (United States)",
    direction: "ltr",
  },
  { code: "es", flag: "es", label: "Español", direction: "ltr" },
  { code: "hi", flag: "in", label: "हिन्दी", direction: "ltr" },
  { code: "fr", flag: "fr", label: "Français", direction: "ltr" },
  { code: "pt-BR", flag: "br", label: "Português (Brasil)", direction: "ltr" },
  { code: "zh-CN", flag: "cn", label: "简体中文", direction: "ltr" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    supportedLanguages.some((language) => language.code === value)
  );
}
