console.wanr(`
  Welcome to ng-kit project!

  You have attempt to \`require\` this module directly, but it does not works!

  * For Angular/TypeScript builds use direct imports of certain module, e.g.:
    import { FormModule } from '@pe/ng-kit/modules/form';
  
  * For CLI tools like \`pe-i18n-cli\` use npm run-script, e.g.:
    npm run pe-i18n-cli pull
`);
