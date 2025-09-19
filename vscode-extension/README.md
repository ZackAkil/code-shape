# Code Shape Analyzer - VS Code Extension

Visualize and analyze the shape of your codebase to identify large files and improve code organization.

## Features

- **Visual Analysis**: See your codebase structure as an interactive chart
- **Code Shape Score**: Get a quality score based on file size distribution
- **TreeView Explorer**: Browse analysis results in the sidebar
- **Status Bar Integration**: Quick access to your code shape score
- **History Tracking**: Keep track of analysis over time
- **Customizable**: Configure ignore patterns and thresholds

## Installation

### From Source
1. Clone this repository
2. Navigate to the `vscode-extension` folder
3. Run `npm install`
4. Run `npm run compile`
5. Press `F5` in VS Code to test the extension

### Building VSIX
```bash
npm install -g vsce
vsce package
```

## Usage

1. Open a project in VS Code
2. Run command: `Code Shape: Analyze Workspace` (Cmd/Ctrl+Shift+P)
3. View results in:
   - Visualization webview
   - Code Shape sidebar panel
   - Status bar indicator

## Commands

- `Code Shape: Analyze Workspace` - Analyze the current workspace
- `Code Shape: Analyze Folder...` - Analyze a specific folder
- `Code Shape: Show Visualization` - Display the interactive chart
- `Code Shape: Show Analysis History` - View past analyses
- `Code Shape: Configure Ignore Patterns` - Set files to ignore

## Configuration

```json
{
  "codeShape.threshold": 100,
  "codeShape.maxFiles": 100,
  "codeShape.ignorePatterns": ["**/*.test.js"],
  "codeShape.showStatusBar": true
}
```

## Development

### Project Structure
```
vscode-extension/
├── src/
│   ├── extension.ts         # Main entry point
│   ├── analyzer/            # Core analysis logic
│   ├── commands/            # Command implementations
│   ├── providers/           # TreeView and StatusBar
│   └── webview/            # Visualization components
├── package.json            # Extension manifest
└── tsconfig.json          # TypeScript config
```

### Testing
```bash
npm run test
```

### Debugging
1. Open the extension folder in VS Code
2. Press `F5` to launch a new Extension Development Host
3. Set breakpoints in the source code

## License

MIT