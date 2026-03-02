class Note {
    constructor(id, content, creationDate, modificationDate) {
        this.id = id;
        this.content = content;
        this.creationDate = creationDate;
        this.modificationDate = modificationDate;
    }
}

class NoteStorage {
    constructor() {
        this.storageKey = 'notepad-notes';
    }

    getAllNotes() {
        const notes = localStorage.getItem(this.storageKey);
        return notes ? JSON.parse(notes) : [];
    }

    saveNotes(notes) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(notes));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('Storage limit exceeded. Please delete some notes.');
            } else {
                console.error('Error saving notes:', error);
            }
        }
    }

    addNote(content) {
        const notes = this.getAllNotes();
        const newNote = new Note(
            Date.now(),
            content,
            new Date(),
            new Date()
        );
        notes.push(newNote);
        this.saveNotes(notes);
        return newNote;
    }

    updateNote(id, content) {
        const notes = this.getAllNotes();
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            notes[noteIndex].content = content;
            notes[noteIndex].modificationDate = new Date();
            this.saveNotes(notes);
            return notes[noteIndex];
        }
        return null;
    }

    deleteNote(id) {
        const notes = this.getAllNotes();
        const filteredNotes = notes.filter(note => note.id !== id);
        this.saveNotes(filteredNotes);
        return notes.length !== filteredNotes.length;
    }

    searchNotes(query) {
        const notes = this.getAllNotes();
        if (!query) return notes;
        
        return notes.filter(note => {
            const content = note.content.toLowerCase();
            const searchTerm = query.toLowerCase();
            return content.includes(searchTerm);
        });
    }
}

class NoteListView {
    constructor(container) {
        this.container = container;
        this.noteStorage = new NoteStorage();
    }

    render(notes) {
        this.container.innerHTML = '';
        
        if (notes.length === 0) {
            this.container.innerHTML = '<p>No notes found. Create your first note above!</p>';
            return;
        }

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.dataset.id = note.id;
            
            const date = new Date(note.modificationDate || note.creationDate);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="note-date">${formattedDate}</span>
                    <button class="btn-delete" aria-label="Delete note">Delete</button>
                </div>
                <div class="note-content">${this.formatContent(note.content)}</div>
            `;
            
            this.container.appendChild(noteElement);
        });
    }

    formatContent(content) {
        const maxLength = 200;
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + '...';
    }
}

class NoteEditorView {
    constructor(input, characterCounter, saveButton) {
        this.input = input;
        this.characterCounter = characterCounter;
        this.saveButton = saveButton;
        this.noteStorage = new NoteStorage();
        this.debouncedSave = this.debounce(this.saveNote, 300);
        this.currentNoteId = null;
        
        this.input.addEventListener('input', () => {
            this.updateCharacterCounter();
            this.debouncedSave();
        });
        
        this.saveButton.addEventListener('click', () => {
            this.saveNote();
        });
    }

    updateCharacterCounter() {
        const length = this.input.value.length;
        this.characterCounter.textContent = `${length} characters`;
    }

    saveNote() {
        const content = this.input.value.trim();
        if (!content) return;
        
        if (this.currentNoteId) {
            this.noteStorage.updateNote(this.currentNoteId, content);
        } else {
            this.noteStorage.addNote(content);
            this.input.value = '';
            this.updateCharacterCounter();
        }
        
        this.renderNotes();
    }

    editNote(id) {
        const notes = this.noteStorage.getAllNotes();
        const note = notes.find(n => n.id === id);
        if (note) {
            this.currentNoteId = id;
            this.input.value = note.content;
            this.updateCharacterCounter();
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    renderNotes() {
        const noteListView = new NoteListView(document.querySelector('.notes-container'));
        const notes = this.noteStorage.getAllNotes();
        noteListView.render(notes);
    }
}

class SearchView {
    constructor(input, noteEditor) {
        this.input = input;
        this.noteEditor = noteEditor;
        this.debouncedSearch = this.debounce(this.performSearch, 200);
        
        this.input.addEventListener('input', () => {
            this.debouncedSearch();
        });
    }

    performSearch() {
        const query = this.input.value;
        const noteListView = new NoteListView(document.querySelector('.notes-container'));
        const notes = this.noteStorage.searchNotes(query);
        noteListView.render(notes);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

class NotepadApp {
    constructor() {
        this.noteStorage = new NoteStorage();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderNotes();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                this.handleDelete(e);
            } else if (e.target.classList.contains('note-content') || 
                      e.target.closest('.note-header')) {
                this.handleEdit(e);
            }
        });
    }

    handleDelete(e) {
        const noteItem = e.target.closest('.note-item');
        const noteId = parseInt(noteItem.dataset.id);
        
        if (confirm('Are you sure you want to delete this note?')) {
            this.noteStorage.deleteNote(noteId);
            this.renderNotes();
        }
    }

    handleEdit(e) {
        const noteItem = e.target.closest('.note-item');
        const noteId = parseInt(noteItem.dataset.id);
        
        const noteEditor = new NoteEditorView(
            document.getElementById('note-input'),
            document.getElementById('character-counter'),
            document.getElementById('save-btn')
        );
        noteEditor.editNote(noteId);
    }

    renderNotes() {
        const noteListView = new NoteListView(document.querySelector('.notes-container'));
        const notes = this.noteStorage.getAllNotes();
        noteListView.render(notes);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const noteEditor = new NoteEditorView(
        document.getElementById('note-input'),
        document.getElementById('character-counter'),
        document.getElementById('save-btn')
    );
    
    const searchView = new SearchView(
        document.getElementById('search-input'),
        noteEditor
    );
    
    new NotepadApp();
});