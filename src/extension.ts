
import * as vscode from 'vscode';
import { transformText, objToString } from './utils';
import { SidebarProvider } from './webview/siderBar';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri, context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("i18n-convert.view", sidebarProvider, {
		webviewOptions: {
			retainContextWhenHidden: true,
		},
	}));

	let disposable = vscode.commands.registerCommand('i18n-convert.convert', () => {
		// 获取用户选中的内容
		const editor = vscode.window.activeTextEditor;
		let selectedText = '';
		if (editor) {
			const selection = editor.selection; // 获取用户选择的文本区域
			selectedText = editor.document.getText(selection); // 获取选择区域的文本内容
			transformText(selectedText, context,sidebarProvider)?.then(res => {
				const data = JSON.parse(res);
				editor.edit((editBuilder) => {
					editBuilder.replace(selection, data.text);
				});
				// const panel = vscode.window.createWebviewPanel(
				// 	'i18n-config',
				// 	'config',
				// 	vscode.ViewColumn.One,
				// 	{
				// 		enableScripts: true
				// 	}
				// );
				// let url = vscode.Uri.joinPath(context.extensionUri, "html", "index.html");
				// let htmlData = fs.readFileSync(url.fsPath, "utf-8");
				// panel.webview.html = htmlData;
				// let configStr =
				// 	`{<br/>`
				// 	+ objToString(data.config) +
				// 	`}`;
				// panel.webview.postMessage(configStr);
			});
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
