import * as fs from 'fs';
import * as vscode from 'vscode';

export class SidebarProvider {
    private _extensionUri: vscode.Uri;
    private context: vscode.ExtensionContext;
    public webview: vscode.Webview | undefined;
    constructor(_extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        this._extensionUri = _extensionUri;
        this.context = context;
    }
    resolveWebviewView(webviewView: vscode.WebviewView) {
        // let url = vscode.Uri.joinPath(this._extensionUri, "html", "index.html");
        // let htmlData = fs.readFileSync(url.fsPath, "utf-8");
        this.webview = webviewView.webview;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.onDidChangeVisibility((v) => {
            webviewView.webview.html = getWebviewContent();
        });

        webviewView.webview.html = getWebviewContent();

        webviewView.webview.onDidReceiveMessage((data) => {
            this.context.globalState.update('info', data);
        });
    }
    // _getHtmlForWebview(webview, res) {
    //     const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "index.js"));
    //     const elementCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "index.css"));
    //     const nonce = (0, utils_1.getNonce)();
    //     let data = res
    //         .replace("<!-- css -->", `
    //      <link rel="stylesheet" href="${elementCssUri}" />
    //   `)
    //         .replace("<!-- js -->", ` 
    //   <script type = "module" crossorigin nonce = "${nonce}" src = "${scriptUri}" > </script>
    // `);
    //     return data;
    // }
}

function getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>国际化翻译</title>
  </head>
  <body>
      <div id="app">
      <div>id: <input id="appid" type="text"></div>
      <div>密钥: <input id="secretKey" type="text"></div>
      <div>模块: <input id="module" type="text"></div>
      <button id="button-sure">确定</button>
      <div>
          <span>配置对象</span>
          <div id="config-content">

          </div>
      </div>
  </div>
      <script>
      (function () {
        const vscode = acquireVsCodeApi();
        window.addEventListener('message', event => {
            const message = event.data; // The JSON data our extension sent
            document.querySelector('#config-content').innerHTML = message
        });
        document.getElementById('button-sure').onclick = function () {
            let info = {
                appid: document.querySelector('#appid').value,
                secretKey: document.querySelector('#secretKey').value,
                moduleName: document.querySelector('#module').value
            }
            vscode.postMessage(JSON.stringify(info))
        }
    }())
      </script>
  </body>
  </html>`;
}