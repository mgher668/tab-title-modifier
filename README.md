# Tab Title Modifier Chrome Extension

A Chrome extension that allows you to customize and save tab titles.

## Features

- Modify the tab title and cache it locally
- Automatically restore custom titles when revisiting pages
- Flexible URL matching options:
  - Domain: Match only the domain/IP and port
  - Path: Match domain/IP + path (ignoring query parameters and hash routes)
  - Exact: Match the full URL
- Search saved titles using fuzzy search
- Reset titles to their original values
- Edit or delete saved custom titles

## Tech Stack

- Bun
- ReactJS
- TypeScript
- TailwindCSS
- shadcn/ui

## Development

1. Clone this repository
2. Install dependencies:
```
bun install
```
3. Start the development server:
```
bun run dev
```
4. To build the extension:
```
bun run chrome-build
```

## Loading the Extension in Chrome

1. Run `bun run chrome-build` to build the extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `dist` folder from this project
5. The extension should now be installed and ready to use

## Usage

1. Click on the extension icon to open the popup
2. Enter a custom title for the current tab
3. Select a matching pattern (Domain, Path, or Exact)
4. Click "Save" to apply the custom title
5. Use the search bar to find saved titles
6. Edit or delete saved titles using the menu for each entry

## License

MIT 