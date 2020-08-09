/* eslint-disable @typescript-eslint/no-var-requires */
const _ = require("lodash");

module.exports = _.merge(require("@beaunus123/style-config").eslint, {
  env: { browser: true },
});
