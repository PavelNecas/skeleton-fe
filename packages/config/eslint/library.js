/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  env: {
    node: true,
  },
  rules: {
    'import/no-default-export': 'error',
  },
}
