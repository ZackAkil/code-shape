import * as vscode from 'vscode';

export async function configureIgnorePatterns(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('codeShape');
    const currentPatterns = config.get<string[]>('ignorePatterns', []);
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.title = 'Configure Ignore Patterns';
    quickPick.placeholder = 'Enter pattern to ignore (e.g., *.test.js, **/tests/**)';
    quickPick.canSelectMany = true;
    
    // Convert patterns to quick pick items
    quickPick.items = [
        ...currentPatterns.map(pattern => ({
            label: pattern,
            picked: true,
            description: 'Currently ignored'
        })),
        // Add common suggestions
        { label: '**/*.test.js', picked: false, description: 'Test files' },
        { label: '**/*.spec.ts', picked: false, description: 'Spec files' },
        { label: '**/tests/**', picked: false, description: 'Test directories' },
        { label: '**/*.min.js', picked: false, description: 'Minified files' },
        { label: '**/vendor/**', picked: false, description: 'Vendor directories' },
        { label: '**/*.generated.*', picked: false, description: 'Generated files' }
    ];
    
    // Allow custom input
    quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems.map(item => item.label);
        
        // Check if user typed a custom pattern
        const customPattern = quickPick.value;
        if (customPattern && !selected.includes(customPattern)) {
            selected.push(customPattern);
        }
        
        // Update configuration
        config.update('ignorePatterns', selected, vscode.ConfigurationTarget.Workspace);
        quickPick.hide();
        
        vscode.window.showInformationMessage(`Updated ignore patterns: ${selected.length} patterns`);
    });
    
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
}

export async function configureThreshold(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('codeShape');
    const currentThreshold = config.get<number>('threshold', 100);
    
    const input = await vscode.window.showInputBox({
        title: 'Configure File Size Threshold',
        prompt: 'Enter the ideal maximum lines of code per file',
        value: currentThreshold.toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num <= 0) {
                return 'Please enter a positive number';
            }
            return null;
        }
    });
    
    if (input) {
        const threshold = parseInt(input);
        await config.update('threshold', threshold, vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(`Threshold updated to ${threshold} lines`);
    }
}