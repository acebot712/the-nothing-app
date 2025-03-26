module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  rules: {
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "prefer-const": "warn",
    "no-var": "error",
    eqeqeq: ["error", "always"],
    "no-return-await": "warn",
    "require-await": "warn",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/", "*.config.js"],
};
