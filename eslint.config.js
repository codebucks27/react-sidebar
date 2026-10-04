import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["build/**", "node_modules/**"] },
  js.configs.recommended,
  {
    ...react.configs.flat.recommended,
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: globals.browser,
    },
    settings: { react: { version: "detect" } },
  },
  {
    ...react.configs.flat["jsx-runtime"],
    files: ["src/**/*.{js,jsx}"],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: ["src/**/*.{js,jsx}"],
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: globals.node },
  },
];
