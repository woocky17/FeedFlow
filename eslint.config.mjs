import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import storybook from "eslint-plugin-storybook";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "generated/**",
      "storybook-static/**",
      "coverage/**",
    ],
  },
  ...nextCoreWebVitals,
  ...storybook.configs["flat/recommended"],
];

export default eslintConfig;
