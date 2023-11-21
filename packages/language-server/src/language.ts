import { Language, VirtualFile, FileKind, FileCapabilities, CodeInformation } from '@volar/language-core';
import * as html from 'vscode-html-languageservice';
import type * as ts from 'typescript/lib/tsserverlibrary';

export const language: Language<Html1File> = {
	createVirtualFile(fileName, langaugeId, snapshot) {
		if (langaugeId.endsWith('.html1')) {
			return new Html1File(fileName, snapshot);
		}
	},
	updateVirtualFile(html1File, snapshot) {
		html1File.update(snapshot);
	},
};

const htmlLs = html.getLanguageService();

export class Html1File implements VirtualFile {

	kind = FileKind.TextFile;
	capabilities = FileCapabilities.full;
	codegenStacks = [];

	id!: string;
	languageId = 'html';
	mappings!: VirtualFile['mappings'];
	embeddedFiles!: VirtualFile['embeddedFiles'];
	document!: html.TextDocument;
	htmlDocument!: html.HTMLDocument;

	constructor(
		public sourceFileName: string,
		public snapshot: ts.IScriptSnapshot,
	) {
		this.id = sourceFileName + '.html';
		this.onSnapshotUpdated();
	}

	public update(newSnapshot: ts.IScriptSnapshot) {
		this.snapshot = newSnapshot;
		this.onSnapshotUpdated();
	}

	onSnapshotUpdated() {
		this.mappings = [{
			sourceRange: [0, this.snapshot.getLength()],
			generatedRange: [0, this.snapshot.getLength()],
			data: CodeInformation.full,
		}];
		this.document = html.TextDocument.create(this.id, 'html', 0, this.snapshot.getText(0, this.snapshot.getLength()));
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
					id: this.id + `.${i++}.css`,
					languageId: 'css',
					kind: FileKind.TextFile,
					snapshot: {
						getText: (start, end) => styleText.substring(start, end),
						getLength: () => styleText.length,
						getChangeRange: () => undefined,
					},
					mappings: [{
						sourceRange: [root.startTagEnd, root.endTagStart],
						generatedRange: [0, styleText.length],
						data: CodeInformation.full,
					}],
					codegenStacks: [],
					capabilities: FileCapabilities.full,
					embeddedFiles: [],
				});
			}
		});
	}
}
