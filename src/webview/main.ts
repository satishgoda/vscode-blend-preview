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
    initializeAppShell();
});

function initializeAppShell() {
    const root = document.getElementById('content');
    if (!root) return;

    root.innerHTML = `
        <header class="toolbar">
            <div class="title">Blend Preview</div>
            <div class="actions">
                <button class="btn btn-secondary" id="refreshBtn" title="Refresh">⟳</button>
            </div>
        </header>
        <main class="layout">
            <section class="panel panel-primary" id="overview"></section>
            <section class="panel" id="gallery"></section>
            <section class="panel" id="details"></section>
        </main>
    `;

    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        vscode.postMessage({ type: 'refresh' });
    });
}

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
        case 'update':
            updatePreview(message.content);
            break;
        case 'settings':
            applySettings(message.payload);
            break;
    }
});

function updatePreview(content: string) {
    const overview = document.getElementById('overview');
    if (!overview) return;

    // Inject server-provided HTML into the overview; keep gallery clicks wired globally
    overview.innerHTML = content;
    enableFileOpenLinks();
}

function enableFileOpenLinks() {
    const handler = (e: Event) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const anchor = target.closest('a[data-file]') as HTMLAnchorElement | null;
        if (!anchor) return;
        e.preventDefault();
        const uri = anchor.getAttribute('data-file');
        if (uri) {
            vscode.postMessage({ type: 'openFile', uri });
        }
    };

    document.removeEventListener('click', handler);
    document.addEventListener('click', handler);
}

function applySettings(payload: { thumbnailHeight?: number; columns?: number }) {
    const root = document.documentElement;
    if (typeof payload?.thumbnailHeight === 'number') {
        root.style.setProperty('--thumb-h', `${Math.max(60, Math.min(512, payload.thumbnailHeight))}px`);
    }
    if (typeof payload?.columns === 'number') {
        const cols = Math.max(0, Math.min(8, payload.columns));
        root.style.setProperty('--gallery-cols', cols > 0 ? String(cols) : 'auto');
    }
}