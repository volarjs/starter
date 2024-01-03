import { html1LanguagePlugin, Html1File } from './languagePlugin';
import { create as createEmmetService } from 'volar-service-emmet';
import { create as createHtmlService } from 'volar-service-html';
import { create as createCssService } from 'volar-service-css';
import { createNodeServer, createConnection, createSimpleProjectProvider, Diagnostic } from '@volar/language-server/node';

const connection = createConnection();
const server = createNodeServer(connection);

connection.listen();

connection.onInitialize(params => {
	return server.initialize(params, createSimpleProjectProvider, {
		getLanguagePlugins() {
			return [html1LanguagePlugin];
		},
		getServicePlugins() {
			return [
				createHtmlService(),
				createCssService(),
				createEmmetService(),
				{
					create(context) {
						return {
							provideDiagnostics(document) {

								const fileName = context.env.uriToFileName(document.uri);
								const [file] = context.language.files.getVirtualFile(fileName);
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
						}
					},
				},
			];
		},
	});
});

connection.onInitialized(() => {
	server.initialized();
});

connection.onShutdown(() => {
	server.shutdown();
});
