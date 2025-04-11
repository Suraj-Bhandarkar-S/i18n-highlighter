import * as vscode from "vscode";
import { findHardcodedStrings } from "./utils/analyzer";
import { IgnoreStringCodeActionProvider } from "./utils/IgnoreStringCodeActionProvider ";

export function activate(context: vscode.ExtensionContext) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255,0,0,0.2)",
    borderRadius: "2px",
  });

  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("i18n");
  context.subscriptions.push(diagnosticCollection);

  const highlightHardcodedStrings = (editor: vscode.TextEditor | undefined) => {
    if (!editor) {
      return;
    }

    const text = editor.document.getText();
    const hardcodedMatches = findHardcodedStrings(text);

    const decorations: vscode.DecorationOptions[] = [];
    const diagnostics: vscode.Diagnostic[] = [];

    for (const { text: matchText, start, end } of hardcodedMatches) {
      const startPos = editor.document.positionAt(start);
      const endPos = editor.document.positionAt(end);
      const lineText = editor.document.lineAt(startPos.line).text;
      const range = new vscode.Range(startPos, endPos);

      if (lineText.includes("i18n-ignore")) {
        continue;
      }

      // Decoration for visual highlighting
      decorations.push({
        range,
        hoverMessage: "Possible hardcoded string (missing i18n)",
      });

      const diagnostic = new vscode.Diagnostic(
        range,
        `Hardcoded string detected: "${matchText}". Consider using i18n.`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostic.source = "i18n-highlighter"; // 👈 Required for Quick Fix

      diagnostics.push(diagnostic);
    }

    editor.setDecorations(decorationType, decorations);
    diagnosticCollection.set(editor.document.uri, diagnostics);
  };

  const scanWorkspaceForI18nIssues = async () => {
    const files = await vscode.workspace.findFiles(
      "**/*.{html,tsx,jsx}",
      "**/node_modules/**"
    );

    for (const file of files) {
      try {
        const doc = await vscode.workspace.openTextDocument(file);
        const content = doc.getText();
        const matches = findHardcodedStrings(content);

        const diagnostics: vscode.Diagnostic[] = [];

        for (const { text: matchText, start, end } of matches) {
          const startPos = doc.positionAt(start);
          const endPos = doc.positionAt(end);
          const range = new vscode.Range(startPos, endPos);
          const lineText = doc.lineAt(startPos.line).text;

          if (lineText.includes("i18n-ignore")) {
            continue;
          }

          const diagnostic = new vscode.Diagnostic(
            range,
            `Hardcoded string detected: "${matchText}". Consider using i18n.`,
            vscode.DiagnosticSeverity.Warning
          );
          diagnostic.source = "i18n-highlighter"; // 👈 Required for Quick Fix

          diagnostics.push(diagnostic);
        }

        diagnosticCollection.set(doc.uri, diagnostics);
      } catch (err) {
        console.error(`Error scanning file ${file.fsPath}`, err);
      }
    }

    vscode.window.showInformationMessage(
      "Workspace scan complete. Check Problems tab for results."
    );
  };

  const activeEditor = vscode.window.activeTextEditor;
  highlightHardcodedStrings(activeEditor);

  const config = vscode.workspace.getConfiguration("i18n-highlighter");
  const scanOnStartup = config.get<boolean>("scanOnStartup");

  if (scanOnStartup) {
    scanWorkspaceForI18nIssues();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      highlightHardcodedStrings(editor);
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (vscode.window.activeTextEditor?.document === event.document) {
        highlightHardcodedStrings(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "i18n-highlighter.scanWorkspace",
      scanWorkspaceForI18nIssues
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "i18n-highlighter.ignoreString",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const pos = editor.selection.active;
        const line = editor.document.lineAt(pos.line);
        const text = line.text;

        if (text.includes("i18n-ignore")) {
          vscode.window.showInformationMessage(
            "Line already marked as ignored."
          );
          return;
        }

        const edit = new vscode.WorkspaceEdit();
        const newText = `${text} <!-- i18n-ignore -->`;
        edit.replace(editor.document.uri, line.range, newText);
        await vscode.workspace.applyEdit(edit);
        await editor.document.save();

        vscode.window.showInformationMessage(
          "i18n-highlighter: Line marked as ignored."
        );
      }
    ));

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
		  [
			{ scheme: "file", language: "html" },
			{ scheme: "file", language: "javascriptreact" },
			{ scheme: "file", language: "typescriptreact" }
		  ],
		  new IgnoreStringCodeActionProvider(),
		  { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
		)
	  );
}

export function deactivate() {}
