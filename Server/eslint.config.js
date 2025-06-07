import js from "@eslint/js";
import globals from "globals";

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
  },
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
  {
    files: ["**/*.js"],
    rules: {
      // Add your custom rules here
    },
  },
];
