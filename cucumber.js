module.exports = {
  default: {
    paths: ['tests/bdd/features/**/*.feature'],
    require: ['tests/bdd/step-definitions/**/*.ts', 'tests/bdd/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/cucumber.html'],
    publishQuiet: true,
  },
};
