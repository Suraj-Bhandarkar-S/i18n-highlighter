import * as vscode from 'vscode';
import { findHardcodedStrings } from './utils/analyzer';

export function activate(context: vscode.ExtensionContext) {
	
	const decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(255,0,0,0.2)',
		borderRadius: '2px',
	});

	const diagnosticCollection = vscode.languages.createDiagnosticCollection('i18n');
	context.subscriptions.push(diagnosticCollection);

	const highlightHardcodedStrings = (editor: vscode.TextEditor | undefined) => {
		if (!editor) {return;};

		const regex = />\s*([^<>{}]*[a-zA-Z][^<>{}]*)\s*</g;
		const text = editor.document.getText();
		const hardcodedMatches = findHardcodedStrings(text);
		
		const decorations: vscode.DecorationOptions[] = [];
		const diagnostics: vscode.Diagnostic[] = [];

		for (const { text: matchText, start, end } of hardcodedMatches) {

			const startPos = editor.document.positionAt(start);
			const endPos = editor.document.positionAt(end);
			const range = new vscode.Range(startPos, endPos);

			// Decoration for visual highlighting
			decorations.push({
				range,
				hoverMessage: 'Possible hardcoded string (missing i18n)',
			});

			// Diagnostic for Problems tab
			diagnostics.push(
				new vscode.Diagnostic(
					range,
					`Hardcoded string detected: "${matchText}". Consider using i18n.`,
					vscode.DiagnosticSeverity.Warning
				)
			);
		}

		editor.setDecorations(decorationType, decorations);
		diagnosticCollection.set(editor.document.uri, diagnostics);
	};

	const activeEditor = vscode.window.activeTextEditor;
	highlightHardcodedStrings(activeEditor);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		highlightHardcodedStrings(editor);
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (vscode.window.activeTextEditor?.document === event.document) {
			highlightHardcodedStrings(vscode.window.activeTextEditor);
		}
	}, null, context.subscriptions);
}

export function deactivate() {}
