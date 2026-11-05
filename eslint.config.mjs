import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: [".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts", "src/components/inputs/**", "src/components/modals/**", "src/features/shared/**", "src/core/api/BaseState.ts", "src/core/api/services/graphQl.service.ts", "src/core/state/ConfigSelectors.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
