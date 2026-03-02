// Notepad Application - Vanilla JavaScript
class Note {
  constructor(id, content, creationDate, modificationDate) {
    this.id = id;
    this.content = content;
    this.creationDate = creationDate;
    this.modificationDate = modificationDate;
  }
}

class Notepad {
  constructor() {
    this.notes = this.loadNotes();
    this.currentEditId = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderNotes();
  }

  bindEvents() {
    // Note creation/editing
    const noteInput = document.getElementById('note-input');
    noteInput.addEventListener('input', this.debounce(this.handleInput.bind(this), 300));
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 200));
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', this.handleSort.bind(this));
    
    // Clear search
    const clearSearchBtn = document.getElementById('clear-search');
    clearSearchBtn.addEventListener('click', this.handleClearSearch.bind(this));
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

  handleInput(event) {
    const content = event.target.value.trim();
    
    if (this.currentEditId) {
      // Edit existing note
      this.updateNote(this.currentEditId, content);
    } else if (content) {
      // Create new note
      this.createNote(content);
      this.currentEditId = this.notes[this.notes.length - 1].id;
    }
    
    this.updateCharacterCounter(content);
  }

  updateCharacterCounter(content) {
    const counter = document.getElementById('char-counter');
    counter.textContent = `${content.length}/5000`;
    
    if (content.length >= 4900) {
      counter.classList.add('warning');
    } else {
      counter.classList.remove('warning');
    }
  }

  createNote(content) {
    const id = Date.now();
    const now = new Date();
    const note = new Note(
      id,
      content,
      now,
      now
    );
    
    this.notes.unshift(note);
    this.saveNotes();
    this.renderNotes();
  }

  updateNote(id, content) {
    const note = this.notes.find(note => note.id === id);
    if (note) {
      note.content = content;
      note.modificationDate = new Date();
      this.saveNotes();
      this.renderNotes();
    }
  }

  deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notes = this.notes.filter(note => note.id !== id);
      this.saveNotes();
      this.renderNotes();
      
      // Clear input if deleting the currently edited note
      if (this.currentEditId === id) {
        this.clearInput();
      }
    }
  }

  searchNotes(query) {
    return this.notes.filter(note => {
      const contentMatch = note.content.toLowerCase().includes(query.toLowerCase());
      return contentMatch;
    });
  }

  sortNotes(criteria) {
    switch(criteria) {
      case 'date-newest':
        this.notes.sort((a, b) => b.modificationDate - a.modificationDate);
        break;
      case 'date-oldest':
        this.notes.sort((a, b) => a.modificationDate - b.modificationDate);
        break;
      case 'alphabetical':
        this.notes.sort((a, b) => a.content.localeCompare(b.content));
        break;
      default:
        break;
    }
    this.renderNotes();
  }

  renderNotes(notesToRender = null) {
    const notesList = document.getElementById('notes-list');
    const notes = notesToRender || this.notes;
    
    if (notes.length === 0) {
      notesList.innerHTML = '<li class="no-notes">No notes yet. Start typing to create one!</li>';
      return;
    }

    notesList.innerHTML = notes.map(note => `
      <li class="note-item" data-id="${note.id}">
        <div class="note-header">
          <span class="note-date">${this.formatDate(note.modificationDate)}</span>
          <button class="btn-delete" onclick="notepad.deleteNote(${note.id})">Delete</button>
        </div>
        <div class="note-content">${this.formatContent(note.content)}</div>
      </li>
    `).join('');
  }

  formatContent(content) {
    const maxLength = 200;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleSearch(event) {
    const query = event.target.value;
    if (query) {
      const filteredNotes = this.searchNotes(query);
      this.renderNotes(filteredNotes);
      document.getElementById('clear-search').style.display = 'inline-block';
    } else {
      this.renderNotes();
      this.handleClearSearch();
    }
  }

  handleSort(event) {
    this.sortNotes(event.target.value);
  }

  handleClearSearch() {
    document.getElementById('search-input').value = '';
    document.getElementById('clear-search').style.display = 'none';
    this.renderNotes();
  }

  clearInput() {
    document.getElementById('note-input').value = '';
    this.updateCharacterCounter('');
    this.currentEditId = null;
  }

  saveNotes() {
    try {
      localStorage.setItem('notepad-notes', JSON.stringify(this.notes));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please delete some notes.');
      } else {
        console.error('Error saving notes:', error);
      }
    }
  }

  loadNotes() {
    const stored = localStorage.getItem('notepad-notes');
    if (stored) {
      try {
        return JSON.parse(stored).map(note => new Note(
          note.id,
          note.content,
          new Date(note.creationDate),
          new Date(note.modificationDate)
        ));
      } catch (error) {
        console.error('Error parsing notes:', error);
        return [];
      }
    }
    return [];
  }
}

// Initialize the notepad when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.notepad = new Notepad();
});

// Export functionality
function exportNotes() {
  if (window.notepad.notes.length === 0) {
    alert('No notes to export');
    return;
  }

  const data = window.notepad.notes.map(note => `
${new Date(note.modificationDate).toLocaleString()}
${note.content}

---
`).join('');

  const blob = new Blob([data], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-${Date.now()}.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Download button event listener
document.getElementById('download-btn').addEventListener('click', exportNotes);