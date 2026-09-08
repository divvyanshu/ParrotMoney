import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended'],
  {
    rules: {
      '@firebase/security-rules/no-open-writes': 'off',
      '@firebase/security-rules/no-open-reads': 'off'
    }
  }
];
