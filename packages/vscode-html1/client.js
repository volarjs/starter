let modulePath = './dist/node/client.js';
try { modulePath = require.resolve('./out/client.js'); } catch { }
module.exports = require(modulePath);
