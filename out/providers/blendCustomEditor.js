"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlendCustomEditor = void 0;
const vscode = __importStar(require("vscode"));
const blendParser_1 = require("../parsers/blendParser");
class BlendCustomEditor {
    constructor(context) {
        this.context = context;
    }
    // Create a minimal custom document for binary files
    openCustomDocument(uri, _openContext, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            return { uri, dispose: () => { } };
        });
    }
    resolveCustomEditor(document, webviewPanel, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            webviewPanel.webview.options = {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview'),
                    vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview')
                ]
            };
            webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
            // Initial render
            yield this.updatePreview(document, webviewPanel.webview);
            // Re-render on file changes on disk
            const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(document.uri, '*'));
            const refresh = () => this.updatePreview(document, webviewPanel.webview);
            watcher.onDidChange(refresh);
            watcher.onDidCreate(refresh);
            watcher.onDidDelete(() => { });
            webviewPanel.onDidDispose(() => watcher.dispose());
        });
    }
    updatePreview(document, webview) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // You can pass bytes if your parser needs them:
                // const bytes = await vscode.workspace.fs.readFile(document.uri);
                const parsed = yield (0, blendParser_1.parseBlendFile)(document.uri.fsPath);
                const content = `<pre>${this.escapeHtml(JSON.stringify(parsed, null, 2))}</pre>`;
                webview.postMessage({ type: 'update', content });
            }
            catch (err) {
                vscode.window.showErrorMessage(`Blend Preview: failed to parse file - ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : String(err)}`);
            }
        });
    }
    getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'styles.css'));
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy"
                      content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Blend Preview</title>
            </head>
            <body>
                <div id="content">
                    <h1>Blend File Preview</h1>
                    <p>Blend file content will be displayed here.</p>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}
exports.BlendCustomEditor = BlendCustomEditor;
