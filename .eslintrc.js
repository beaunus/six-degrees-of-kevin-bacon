const eslintConfig = require("@beaunus123/style-config").eslint;

module.exports = {
  ...eslintConfig,
  parserOptions: { ...eslintConfig.parserOptions, project: "./tsconfig.json" },
};
