import type { CodeMapping, LanguagePlugin, VirtualFile } from '@volar/language-core';
import type * as ts from 'typescript';
import * as html from 'vscode-html-languageservice';

export const html1LanguagePlugin: LanguagePlugin<Html1File> = {
	createVirtualFile(fileName, langaugeId, snapshot) {
		if (langaugeId === 'html1') {
			return new Html1File(fileName, snapshot);
		}
	},
	updateVirtualFile(html1File, snapshot) {
		html1File.update(snapshot);
	},
};

const htmlLs = html.getLanguageService();

export class Html1File implements VirtualFile {

	fileName: string;
	languageId = 'html1';
	mappings!: CodeMapping[];
	embeddedFiles!: VirtualFile[];
	document!: html.TextDocument;
	htmlDocument!: html.HTMLDocument;

	constructor(
		public sourceFileName: string,
		public snapshot: ts.IScriptSnapshot,
	) {
		this.fileName = sourceFileName + '.html';
		this.onSnapshotUpdated();
	}

	public update(newSnapshot: ts.IScriptSnapshot) {
		this.snapshot = newSnapshot;
		this.onSnapshotUpdated();
	}

	onSnapshotUpdated() {
		this.mappings = [{
			sourceOffsets: [0],
			generatedOffsets: [0],
			lengths: [this.snapshot.getLength()],
			data: {
				completion: true,
				format: true,
				navigation: true,
				semantic: true,
				structure: true,
				verification: true,
			},
		}];
		this.document = html.TextDocument.create('', 'html', 0, this.snapshot.getText(0, this.snapshot.getLength()));
		this.htmlDocument = htmlLs.parseHTMLDocument(this.document);
		this.embeddedFiles = [];
		this.addStyleTag();
	}

	addStyleTag() {
		let i = 0;
		this.htmlDocument.roots.forEach(root => {
			if (root.tag === 'style' && root.startTagEnd !== undefined && root.endTagStart !== undefined) {
				const styleText = this.snapshot.getText(root.startTagEnd, root.endTagStart);
				this.embeddedFiles.push({
					fileName: this.fileName + `.${i++}.css`,
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
					embeddedFiles: [],
				});
			}
		});
	}
}
