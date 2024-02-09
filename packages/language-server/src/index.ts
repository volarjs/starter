import { html1LanguagePlugin, Html1Code } from './languagePlugin';
import { create as createEmmetService } from 'volar-service-emmet';
import { create as createHtmlService } from 'volar-service-html';
import { create as createCssService } from 'volar-service-css';
import { create as createTypeScriptService } from 'volar-service-typescript';
import { createServer, createConnection, createTypeScriptProjectProvider, Diagnostic, VirtualCode } from '@volar/language-server/node';

const connection = createConnection();
const server = createServer(connection);

connection.listen();

connection.onInitialize(params => {
	return server.initialize(params, createTypeScriptProjectProvider, {
		getLanguagePlugins() {
			return [html1LanguagePlugin];
		},
		getServicePlugins() {
			return [
				createHtmlService(),
				createCssService(),
				createEmmetService(),
				createTypeScriptService(server.modules.typescript!),
				{
					create(context) {
						return {
							provideDiagnostics(document) {
								const virtualCode = context.documents.getVirtualCodeByUri(document.uri)[0] as VirtualCode | Html1Code | undefined;
								if (!virtualCode || !('htmlDocument' in virtualCode)) {
									return;
								}
								const styleNodes = virtualCode.htmlDocument.roots.filter(root => root.tag === 'style');
								if (styleNodes.length <= 1) {
									return;
								}
								const errors: Diagnostic[] = [];
								for (let i = 1; i < styleNodes.length; i++) {
									errors.push({
										severity: 2,
										range: {
											start: document.positionAt(styleNodes[i].start),
											end: document.positionAt(styleNodes[i].end),
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

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);
