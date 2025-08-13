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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const blendCustomEditor_1 = require("./providers/blendCustomEditor");
function activate(context) {
    const blendEditorProvider = new blendCustomEditor_1.BlendCustomEditor(context);
    context.subscriptions.push(vscode.window.registerCustomEditorProvider('blendPreview.blendEditor', blendEditorProvider));
    // Register commands and event listeners here
    context.subscriptions.push(vscode.commands.registerCommand('blendPreview.open', () => {
        // Command to open a .blend file
        vscode.window.showInformationMessage('Blend Preview: Open command executed');
    }));
}
exports.activate = activate;
function deactivate() {
    // Clean up resources if necessary
}
exports.deactivate = deactivate;
