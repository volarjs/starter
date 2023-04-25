let modulePath = './dist/node/server.js';
try { modulePath = require.resolve('@html1-language-tools/language-server/bin/html1-language-server.js'); } catch { }
module.exports = require(modulePath);
