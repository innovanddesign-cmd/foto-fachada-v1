const fs = require('node:fs');
const path = require('node:path');

// Netlify may flatten the adapter's ESM modules when uploading from Windows.
// Resolve the packaged configuration in either the original or flattened layout.
module.exports = {
  onBuild({ constants }) {
    const file = path.join(constants.INTERNAL_FUNCTIONS_SRC,
      '___netlify-server-handler', '.netlify', 'dist', 'run', 'constants.js');
    const source = fs.readFileSync(file, 'utf8');
    const original = 'var PLUGIN_DIR = resolve(`${MODULE_DIR}../../..`);';
    if (!source.includes(original)) {
      throw new Error('Netlify adapter layout changed; review runtime compatibility before deploying.');
    }
    fs.writeFileSync(file, source.replace(original,
      'import { existsSync } from "node:fs";\n' +
      'var PLUGIN_DIR = existsSync(resolve(MODULE_DIR, "run-config.json")) ? MODULE_DIR : resolve(`${MODULE_DIR}../../..`);'));
  },
};
