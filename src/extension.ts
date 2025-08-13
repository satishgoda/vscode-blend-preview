import * as vscode from 'vscode';
import { BlendCustomEditor } from './providers/blendCustomEditor';

export function activate(context: vscode.ExtensionContext) {
    const blendEditorProvider = new BlendCustomEditor(context);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider('blendPreview.blendEditor', blendEditorProvider)
    );

    // Register commands and event listeners here
    context.subscriptions.push(
        vscode.commands.registerCommand('blendPreview.open', () => {
            // Command to open a .blend file
            vscode.window.showInformationMessage('Blend Preview: Open command executed');
        })
    );
}

export function deactivate() {
    // Clean up resources if necessary
}