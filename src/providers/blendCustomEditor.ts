import * as vscode from 'vscode';
import { parseBlendFile } from '../parsers/blendParser';
import * as path from 'path';

export class BlendCustomEditor implements vscode.CustomReadonlyEditorProvider {

    constructor(private readonly context: vscode.ExtensionContext) {}

    // Create a minimal custom document for binary files
    public async openCustomDocument(
        uri: vscode.Uri,
        _openContext: { backupId?: string },
        _token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return { uri, dispose: () => {} };
    }

    public async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview'),
                vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview')
            ]
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        // Initial render
        await this.updatePreview(document, webviewPanel.webview);

        // Re-render on file changes in the same directory for files with the same base name
        const filePath = document.uri.fsPath;
        const dirUri = vscode.Uri.file(path.dirname(filePath));
        const baseName = path.basename(filePath, path.extname(filePath));
        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(dirUri, `${baseName}*`)
        );
        const refresh = () => this.updatePreview(document, webviewPanel.webview);
        watcher.onDidChange(refresh);
        watcher.onDidCreate(refresh);
        watcher.onDidDelete(refresh);
        webviewPanel.onDidDispose(() => watcher.dispose());
    }

    private async updatePreview(document: vscode.CustomDocument, webview: vscode.Webview) {
        try {
            // Parse the blend file (placeholder parsing)
            const parsed = await parseBlendFile(document.uri.fsPath);

            // Find related files sharing the same base name
            const filePath = document.uri.fsPath;
            const dir = path.dirname(filePath);
            const dirUri = vscode.Uri.file(dir);
            const baseName = path.basename(filePath, path.extname(filePath));

            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']);

            const related = entries
                .filter(([name, type]) => type === vscode.FileType.File && name.startsWith(baseName))
                .map(([name]) => name)
                .filter(name => name !== path.basename(filePath))
                .sort((a, b) => a.localeCompare(b));

            const images = related.filter(name => imageExts.has(path.extname(name).toLowerCase()));
            const imageTags = images.map(name => {
                const fileUri = vscode.Uri.file(path.join(dir, name));
                const webUri = webview.asWebviewUri(fileUri);
                return `<figure><img src="${webUri}" alt="${this.escapeHtml(name)}"><figcaption>${this.escapeHtml(name)}</figcaption></figure>`;
            }).join('');

            const listItems = related.length
                ? related.map(n => `<li>${this.escapeHtml(n)}</li>`).join('')
                : '<li><em>No related files found</em></li>';

            const content = `
                <h1>${this.escapeHtml(path.basename(filePath))}</h1>

                <h2>Related files</h2>
                <ul class="related">${listItems}</ul>

                ${images.length ? `<h2>Images</h2><div class="gallery">${imageTags}</div>` : ''}

                <h2>Parsed data</h2>
                <pre>${this.escapeHtml(JSON.stringify(parsed, null, 2))}</pre>
            `;

            webview.postMessage({ type: 'update', content });
        } catch (err: any) {
            vscode.window.showErrorMessage(`Blend Preview: failed to parse file - ${err?.message ?? String(err)}`);
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview', 'main.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'styles.css')
        );
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

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private escapeHtml(value: string) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}