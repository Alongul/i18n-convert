import * as vscode from "vscode";

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
      this.context.globalState.update("info", data);
    });
  }
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
      <div>id:<br/> <input id="appid" type="text"></div>
      <div>密钥:<br/> <input id="secretKey" type="text"></div>
      <div>模块:<br/><input id="module" type="text"></div>
      <br/>
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
