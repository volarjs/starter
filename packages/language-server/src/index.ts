import { languageModule, Html1File } from '@html1-language-tools/language-core';
import createEmmetPlugin from '@volar-plugins/emmet';
import createHtmlPlugin from '@volar-plugins/html';
import createCssPlugin from '@volar-plugins/css';
import { createConnection, startLanguageServer, LanguageServerPlugin, Diagnostic } from '@volar/language-server/node';

const plugin: LanguageServerPlugin = () => ({
	extraFileExtensions: [{ extension: 'html1', isMixedContent: true, scriptKind: 7 }],
	getLanguageModules() {
		return [languageModule];
	},
	getLanguageServicePlugins() {
		return [
			createHtmlPlugin(),
			createCssPlugin(),
			createEmmetPlugin(),
			// custom html1 plugin
			(context) => ({
				validation: {
					onSyntactic(document) {

						const file = context.documents.getVirtualFileByUri(document.uri);
						if (!(file instanceof Html1File)) return;

						const styleNodes = file.htmlDocument.roots.filter(root => root.tag === 'style');
						if (styleNodes.length <= 1) return;

						const errors: Diagnostic[] = [];
						for (let i = 1; i < styleNodes.length; i++) {
							errors.push({
								severity: 2,
								range: {
									start: file.document.positionAt(styleNodes[i].start),
									end: file.document.positionAt(styleNodes[i].end),
								},
								source: 'html1',
								message: 'Only one style tag is allowed.',
							});
						}
						return errors;
					},
				},
			}),
		];
	},
});

startLanguageServer(createConnection(), plugin);
