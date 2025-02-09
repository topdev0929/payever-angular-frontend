interface PeVariablesInterface {
  [propName: string]: string | number;
  toNumber: any;
}

let peVariables: PeVariablesInterface = require('!!sass-variables-loader!@pe/ui-kit/scss/pe_variables.scss');
peVariables.toNumber = function(variable: string) {
  return +this[variable].toString().replace(/\D/g,'');
};

export { peVariables, PeVariablesInterface };
