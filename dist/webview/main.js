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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlendWebview = void 0;
const vscode = __importStar(require("vscode"));
class BlendWebview {
    createWebview(context) {
        this.panel = vscode.window.createWebviewPanel('blendPreview', 'Blend File Preview', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')]
        });
        this.panel.webview.onDidReceiveMessage(this.handleMessage.bind(this));
        this.updateWebview();
    }
    updateWebview() {
        if (!this.panel) {
            return;
        }
        const htmlContent = this.getHtmlForWebview(this.panel.webview);
        this.panel.webview.html = htmlContent;
    }
    getHtmlForWebview(webview) {
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), 'styles.css'));
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>Blend File Preview</title>
        </head>
        <body>
            <h1>Blend File Preview</h1>
            <div id="content">Loading...</div>
            <script>
                const vscode = acquireVsCodeApi();
                // Additional JavaScript for handling user interactions can be added here
            </script>
        </body>
        </html>`;
    }
    handleMessage(message) {
        switch (message.command) {
            // Handle messages from the webview here
        }
    }
}
exports.BlendWebview = BlendWebview;
