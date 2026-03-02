# Simple Notepad

A vanilla JavaScript notepad application with localStorage integration and search functionality.

## Features

- **Note Creation**: Create and save notes with auto-save functionality
- **LocalStorage Integration**: Notes are saved locally in the browser
- **Search Functionality**: Real-time search with exact match, partial match, and case-sensitive options
- **Note Management**: Edit and delete existing notes
- **Character Counter**: Track character count while typing
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. **Create a Note**: Type your note in the text area above and it will auto-save every 300ms
2. **View Notes**: All saved notes appear in the list below
3. **Search Notes**: Use the search bar to find specific notes
4. **Edit a Note**: Click on any note in the list to edit it
5. **Delete a Note**: Click the "Delete" button next to any note to remove it

## Technical Details

- **Technology Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: LocalStorage API
- **Architecture**: Model-View-Controller (MVC) pattern
- **Features**: Auto-save (debounced), real-time search (debounced), responsive design

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## File Structure

```
/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # Main JavaScript functionality
└── README.md           # This file
```

## Development

The application uses no build tools or frameworks - it's pure vanilla JavaScript. All functionality is contained within `script.js` using modern ES6+ features.

## License

MIT License - see LICENSE file for details.