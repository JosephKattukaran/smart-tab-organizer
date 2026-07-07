export default [
    {
      files: ["**/*.js"],
      languageOptions: {
        globals: {
          chrome: "readonly",
          console: "readonly"
        }
      },
      rules: {
        semi: ["error", "always"],
        "no-unused-vars": "warn"
      }
    }
  ];