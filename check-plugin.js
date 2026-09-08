import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
console.log('Plugin keys:', Object.keys(firebaseRulesPlugin));
if (firebaseRulesPlugin.configs) {
  console.log('Configs keys:', Object.keys(firebaseRulesPlugin.configs));
  console.log('flat/recommended:', firebaseRulesPlugin.configs['flat/recommended']);
}
