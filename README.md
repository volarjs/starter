# language-tools-starter

This is a template for building Embedded Language Tools based on Volar Framework.

If you're working on something like this, you probably started with VSCode's "Embedded Programming Languages" chapter. If not, I strongly suggest you read it carefully first.

The article mentions two methods to implement Embedded Language support. This template belongs to the extension of the "Language Server for Embedded Language with Language Services" method, but we abstract all the places you don't need to care about, such as virtual code mapping, formatting edits merge etc.

Same with the article, this template uses .html1 as an example to implement embedded HTML and CSS support.

## Usage

### Tools

- pnpm: monorepo support
- esbuild: bundle extension

Make sure to execute `pnpm i` after clone template;

### Debug

Open VSCode debug sidebar and run `Launch HTML1`, a new VSCode window will be open at `sample/` folder, and than you can open `sample/test.html1` to check language server features.

To adding break point for language server code (`packages/language-server`, `packages/language-core`), you should also run `Attach to Server` on debug panel.

### Build .vsix

Run `pnpm run pack`, `vscode-html1-0.0.1.vsix` will create to `packages/vscode-html1/`, and than you can manual install it to VSCode.
