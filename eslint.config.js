// @ts-check
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    ignores: ["projects/**/*"],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/component-class-suffix": [
        "error",
        { suffixes: ["Page", "Component"] },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {
      // `X != 0` se mantiene a propósito: el servidor puede enviar "" o "0"
      // y con `!==` el color de la pantalla cambiaría. Sólo advertencia.
      "@angular-eslint/template/eqeqeq": "warn",
    },
  }
);
