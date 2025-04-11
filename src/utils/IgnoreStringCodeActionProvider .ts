
import * as vscode from "vscode";

export class IgnoreStringCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext): vscode.CodeAction[] {
		const i18nDiagnostics = context.diagnostics.filter(
            diag => diag.source === 'i18n-highlighter'
          );

		if (i18nDiagnostics.length === 0) return [];

		const actions: vscode.CodeAction[] = [];

		for (const diag of i18nDiagnostics) {
			const line = document.lineAt(diag.range.start.line);

			// Avoid duplicate ignore comments
			if (line.text.includes('i18n-ignore')) continue;

			const action = new vscode.CodeAction(
				'Ignore this string (i18n-highlighter)',
				vscode.CodeActionKind.QuickFix
			);

			action.diagnostics = [diag];
			action.isPreferred = true;

			action.edit = new vscode.WorkspaceEdit();
			const newText = `${line.text} <!-- i18n-ignore -->`;
			action.edit.replace(document.uri, line.range, newText);

			actions.push(action);
		}

		return actions;
	}
}
