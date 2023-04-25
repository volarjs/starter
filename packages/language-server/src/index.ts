import { languageModule, Html1File } from './virtualFile';
import createEmmetPlugin from '@volar-plugins/emmet';
import createHtmlPlugin from '@volar-plugins/html';
import createCssPlugin from '@volar-plugins/css';
import { createConnection, startLanguageServer, LanguageServerPlugin, Diagnostic, LanguageServicePluginInstance } from '@volar/language-server/node';

const plugin: LanguageServerPlugin = (): ReturnType<LanguageServerPlugin> => ({
	extraFileExtensions: [{ extension: 'html1', isMixedContent: true, scriptKind: 7 }],
	resolveConfig(config) {

		// parsers
		config.languages ??= {};
		config.languages.html1 ??= languageModule;

		// plugins
		config.plugins ??= {};
		config.plugins.html ??= createHtmlPlugin();
		config.plugins.css ??= createCssPlugin();
		config.plugins.emmet ??= createEmmetPlugin();
		config.plugins.html1 ??= (context): LanguageServicePluginInstance => ({
			provideSyntacticDiagnostics(document) {

				const [file] = context!.documents.getVirtualFileByUri(document.uri);
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
		});

		return config;
	},
});

startLanguageServer(createConnection(), plugin);
