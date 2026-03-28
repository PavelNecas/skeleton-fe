module.exports = {
  ...require('@skeleton-fe/config/eslint/library'),
  rules: {
    ...require('@skeleton-fe/config/eslint/library').rules,
    // React components use default exports
    'import/no-default-export': 'off',
  },
}
