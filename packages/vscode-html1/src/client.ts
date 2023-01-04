import { DiagnosticModel, LanguageServerInitializationOptions } from '@volar/language-server';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';
import { registerAutoInsertion } from '@volar/vscode-language-client';

let client: lsp.BaseLanguageClient;

export async function activate(context: vscode.ExtensionContext) {

	const serverModule = vscode.Uri.joinPath(context.extensionUri, 'server.js');
	const runOptions = { execArgv: <string[]>[] };
	const debugOptions = { execArgv: ['--nolazy', '--inspect=' + 6009] };
	const serverOptions: lsp.ServerOptions = {
		run: {
			module: serverModule.fsPath,
			transport: lsp.TransportKind.ipc,
			options: runOptions
		},
		debug: {
			module: serverModule.fsPath,
			transport: lsp.TransportKind.ipc,
			options: debugOptions
		},
	};
	const initializationOptions: LanguageServerInitializationOptions = {
		// no need tsdk because language server do not have typescript features
		// typescript: { tsdk: require('path').join(vscode.env.appRoot, 'extensions/node_modules/typescript/lib') },
		diagnosticModel: DiagnosticModel.Pull,
	};
	const clientOptions: lsp.LanguageClientOptions = {
		documentSelector: [{ language: 'html1' }],
		initializationOptions,
	};
	client = new lsp.LanguageClient(
		'html1-language-server',
		'HTML1 Language Server',
		serverOptions,
		clientOptions,
	);
	await client.start();

	// support for auto close tag
	registerAutoInsertion(context, [client], document => document.languageId === 'html1');
}

export function deactivate(): Thenable<any> | undefined {
	return client?.stop();
}
