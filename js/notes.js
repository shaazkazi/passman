class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [{
            id: Date.now(),
            title: 'Welcome Note',
            content: 'Welcome to your secure notes. Click + to add a new note.',
            date: new Date().toLocaleDateString(),
            color: 'linear-gradient(135deg, #1A1F71, #2557D6)',
            pinned: true
        }];
        this.init();
    }

    init() {
        this.notesGrid = document.querySelector('.notes-grid');
        this.addBtn = document.getElementById('add-note-btn');
        this.searchInput = document.querySelector('#notes-view .search input');
        this.noteForm = document.getElementById('noteForm');

        this.addBtn.addEventListener('click', () => showModal('noteModal'));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.noteForm.addEventListener('submit', (e) => this.handleSubmit(e));

        this.renderNotes();
    }

    handleSubmit(e) {
        e.preventDefault();
        const newNote = {
            id: Date.now(),
            title: document.getElementById('noteTitle').value,
            content: document.getElementById('noteContent').value,
            date: new Date().toLocaleDateString(),
            color: 'linear-gradient(135deg, #1A1F71, #2557D6)',
            pinned: document.getElementById('notePin').checked
        };
        this.notes.unshift(newNote);
        this.saveNotes();
        this.renderNotes();
        hideModal('noteModal');
        e.target.reset();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    renderNotes(items = this.notes) {
        const pinnedNotes = items.filter(note => note.pinned);
        const unpinnedNotes = items.filter(note => !note.pinned);
        
        this.notesGrid.innerHTML = `
            ${pinnedNotes.length ? '<div class="notes-section"><h3>📌 Pinned</h3></div>' : ''}
            ${this.renderNoteCards(pinnedNotes)}
            ${unpinnedNotes.length ? '<div class="notes-section"><h3>Other Notes</h3></div>' : ''}
            ${this.renderNoteCards(unpinnedNotes)}
        `;
    }

    renderNoteCards(notes) {
        return notes.map(note => `
            <div class="note-card" data-id="${note.id}" style="background: ${note.color}">
                <div class="note-header">
                    <div class="note-title">${note.title}</div>
                    <div class="note-actions">
                        <i class="fas fa-thumbtack ${note.pinned ? 'pinned' : ''}" onclick="notesManager.togglePin(${note.id})"></i>
                        <i class="fas fa-edit" onclick="notesManager.editNote(${note.id})"></i>
                        <i class="fas fa-trash" onclick="notesManager.deleteNote(${note.id})"></i>
                    </div>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-footer">
                    <div class="color-picker">
                        <div class="color-option" onclick="notesManager.changeNoteColor(${note.id}, 'linear-gradient(135deg, #1A1F71, #2557D6)')" style="background: linear-gradient(135deg, #1A1F71, #2557D6)"></div>
                        <div class="color-option" onclick="notesManager.changeNoteColor(${note.id}, 'linear-gradient(135deg, #8B0000, #DC143C)')" style="background: linear-gradient(135deg, #8B0000, #DC143C)"></div>
                        <div class="color-option" onclick="notesManager.changeNoteColor(${note.id}, 'linear-gradient(135deg, #006400, #228B22)')" style="background: linear-gradient(135deg, #006400, #228B22)"></div>
                        <div class="color-option" onclick="notesManager.changeNoteColor(${note.id}, 'linear-gradient(135deg, #4B0082, #8A2BE2)')" style="background: linear-gradient(135deg, #4B0082, #8A2BE2)"></div>
                    </div>
                    <span>${note.date}</span>
                </div>
            </div>
        `).join('');
    }

    editNote(id) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
            document.getElementById('notePin').checked = note.pinned;
            this.notes = this.notes.filter(n => n.id !== id);
            showModal('noteModal');
        }
    }

    changeNoteColor(id, color) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            note.color = color;
            this.saveNotes();
            this.renderNotes();
        }
    }

    togglePin(id) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            note.pinned = !note.pinned;
            this.saveNotes();
            this.renderNotes();
        }
    }

    deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveNotes();
            this.renderNotes();
        }
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
        this.renderNotes(filteredNotes);
    }
}

const notesManager = new NotesManager();
window.notesManager = notesManager;
