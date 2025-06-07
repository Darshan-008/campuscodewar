import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.mocha, // for describe, it, before, after
      },
    },
    settings: {
      react: {
        version: "detect", // Fixes the react version warning
      },
    },
  },
  pluginReact.configs.flat.recommended,
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      "no-const-assign": "error",
      "no-undef": "error",
      "no-unused-vars": "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
