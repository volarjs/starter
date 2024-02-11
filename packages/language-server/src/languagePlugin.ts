import { forEachEmbeddedCode, type LanguagePlugin, type VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import * as html from 'vscode-html-languageservice';

export const html1LanguagePlugin: LanguagePlugin = {
	createVirtualCode(_id, languageId, snapshot) {
		if (languageId === 'html1') {
			return createHtml1Code(snapshot);
		}
	},
	updateVirtualCode(_id, _oldVirtualCode, newSnapshot) {
		return createHtml1Code(newSnapshot);
	},
	typescript: {
		extraFileExtensions: [{ extension: 'html1', isMixedContent: true, scriptKind: 7 }],
		getScript(rootVirtualCode) {
			for (const code of forEachEmbeddedCode(rootVirtualCode)) {
				if (code.id.startsWith('script_')) {
					return {
						code,
						extension: '.js',
						scriptKind: 1,
					};
				}
			}
		},
	},
};

const htmlLs = html.getLanguageService();

export interface Html1Code extends VirtualCode {
	// Reuse for custom service plugin
	htmlDocument: html.HTMLDocument;
}

function createHtml1Code(snapshot: ts.IScriptSnapshot): Html1Code {
	const document = html.TextDocument.create('', 'html', 0, snapshot.getText(0, snapshot.getLength()));
	const htmlDocument = htmlLs.parseHTMLDocument(document);

	return {
		id: 'root',
		languageId: 'html',
		snapshot,
		mappings: [{
			sourceOffsets: [0],
			generatedOffsets: [0],
			lengths: [snapshot.getLength()],
			data: {
				completion: true,
				format: true,
				navigation: true,
				semantic: true,
				structure: true,
				verification: true,
			},
		}],
		embeddedCodes: [...createEmbeddedCodes()],
		htmlDocument,
	};

	function* createEmbeddedCodes(): Generator<VirtualCode> {

		let styles = 0;
		let scripts = 0;

		for (const root of htmlDocument.roots) {
			if (root.tag === 'style' && root.startTagEnd !== undefined && root.endTagStart !== undefined) {
				const styleText = snapshot.getText(root.startTagEnd, root.endTagStart);
				yield {
					id: 'style_' + styles++,
					languageId: 'css',
					snapshot: {
						getText: (start, end) => styleText.substring(start, end),
						getLength: () => styleText.length,
						getChangeRange: () => undefined,
					},
					mappings: [{
						sourceOffsets: [root.startTagEnd],
						generatedOffsets: [0],
						lengths: [styleText.length],
						data: {
							completion: true,
							format: true,
							navigation: true,
							semantic: true,
							structure: true,
							verification: true,
						},
					}],
					embeddedCodes: [],
				};
			}
			if (root.tag === 'script' && root.startTagEnd !== undefined && root.endTagStart !== undefined) {
				const text = snapshot.getText(root.startTagEnd, root.endTagStart);
				yield {
					id: 'script_' + scripts++,
					languageId: 'typescript',
					snapshot: {
						getText: (start, end) => text.substring(start, end),
						getLength: () => text.length,
						getChangeRange: () => undefined,
					},
					mappings: [{
						sourceOffsets: [root.startTagEnd],
						generatedOffsets: [0],
						lengths: [text.length],
						data: {
							completion: true,
							format: true,
							navigation: true,
							semantic: true,
							structure: true,
							verification: true,
						},
					}],
					embeddedCodes: [],
				};
			}
		}
	};
}
