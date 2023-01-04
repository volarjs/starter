let modulePath = './dist/node/server';
try { modulePath = require.resolve('@volar-examples/html1-language-server/bin/html1-language-server'); } catch { }
module.exports = require(modulePath);
