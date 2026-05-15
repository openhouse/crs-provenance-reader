export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['plugin', 'theme', 'source', 'utility', 'variant'],
      },
    ],
    'declaration-empty-line-before': null,
    'import-notation': null,
    'property-no-vendor-prefix': null,
  },
};
