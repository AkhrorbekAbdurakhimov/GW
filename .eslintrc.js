module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['prettier', 'airbnb-base', 'plugin:import/recommended'],
  plugins: ['prettier', 'eslint-plugin-no-cyrillic-string'],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
  },
};
