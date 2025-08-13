// This file contains the client-side JavaScript for the webview
// It runs in the webview context, not the extension context

declare const acquireVsCodeApi: () => {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

// Handle the webview's lifecycle
window.addEventListener('load', () => {
    console.log('Blend preview webview loaded');
    initializePreview();
});

function initializePreview() {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
        contentDiv.innerHTML = '<p>Blend file preview will be displayed here.</p>';
    }
}

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
        case 'update':
            updatePreview(message.content);
            break;
    }
});

function updatePreview(content: string) {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
        contentDiv.innerHTML = content;
    }
}