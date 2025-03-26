module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-native/all",
    "@react-native-community",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "react-hooks",
    "react-native",
    "@typescript-eslint",
    "prettier",
    "import",
  ],
  rules: {
    // React
    "react/prop-types": "off", // We use TypeScript for prop validation
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "react-native/no-raw-text": "warn",
    "react-native/no-unused-styles": "warn",

    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",

    // Imports and file organization
    "import/order": [
      "warn",
      {
        groups: [
          ["builtin", "external"],
          "internal",
          ["parent", "sibling", "index"],
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],

    // General code quality
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "prettier/prettier": "warn",
    "prefer-const": "warn",
    "no-var": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
    curly: ["warn", "all"],

    // Production-grade rules
    "no-alert": "warn",
    "no-debugger": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      typescript: {},
    },
  },
  env: {
    "react-native/react-native": true,
    es2021: true,
    node: true,
  },
  ignorePatterns: [
    "node_modules/",
    "android/",
    "ios/",
    "*.config.js",
    "babel.config.js",
    "metro.config.js",
  ],
};
