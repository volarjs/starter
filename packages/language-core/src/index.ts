import { LanguageModule, VirtualFile, FileKind, FileCapabilities, FileRangeCapabilities } from "@volar/language-core";
import * as html from 'vscode-html-languageservice';

export const languageModule: LanguageModule<Html1File> = {
	createFile(fileName, snapshot) {
		if (fileName.endsWith('.html1')) {
			return new Html1File(fileName, snapshot);
		}
	},
	updateFile(html1File, snapshot) {
		html1File.update(snapshot);
	},
};

const htmlLs = html.getLanguageService();

export class Html1File implements VirtualFile {

	kind = FileKind.TextFile;
	capabilities = FileCapabilities.full;

	fileName!: string;
	mappings!: VirtualFile['mappings'];
	embeddedFiles!: VirtualFile['embeddedFiles'];
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
			sourceRange: [0, this.snapshot.getLength()],
			generatedRange: [0, this.snapshot.getLength()],
			data: FileRangeCapabilities.full,
		}];
		this.document = html.TextDocument.create(this.fileName, 'html', 0, this.snapshot.getText(0, this.snapshot.getLength()));
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
					kind: FileKind.TextFile,
					snapshot: {
						getText: (start, end) => styleText.substring(start, end),
						getLength: () => styleText.length,
						getChangeRange: () => undefined,
					},
					mappings: [{
						sourceRange: [root.startTagEnd, root.endTagStart],
						generatedRange: [0, styleText.length],
						data: FileRangeCapabilities.full,
					}],
					capabilities: FileCapabilities.full,
					embeddedFiles: [],
				});
			}
		});
	}
}
