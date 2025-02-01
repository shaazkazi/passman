class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.colorOptions = document.querySelectorAll('.color-option');
        this.exportBtn = document.querySelector('[data-action="export"]');
        this.importBtn = document.querySelector('[data-action="import"]');
        this.pinSetupBtn = document.querySelector('[data-action="setup-pin"]');
        this.autoLockSelect = document.getElementById('autoLockTime');
        
        this.loadSavedPreferences();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.colorOptions.forEach(option => {
            option.style.backgroundColor = option.dataset.color;
            option.addEventListener('click', () => this.handleAccentColor(option.dataset.color));
        });

        this.exportBtn?.addEventListener('click', () => this.exportData());
        this.importBtn?.addEventListener('click', () => this.showImportGuide());
        this.pinSetupBtn?.addEventListener('click', () => this.setupPIN());
        
        if (this.autoLockSelect) {
            this.autoLockSelect.addEventListener('change', (e) => {
                localStorage.setItem('autoLockTime', e.target.value);
            });
        }
    }

    loadSavedPreferences() {
        const savedColor = localStorage.getItem('accentColor');
        if (savedColor) {
            document.documentElement.style.setProperty('--primary-color', savedColor);
        }

        const savedLockTime = localStorage.getItem('autoLockTime');
        if (savedLockTime && this.autoLockSelect) {
            this.autoLockSelect.value = savedLockTime;
        }
    }

    handleAccentColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        localStorage.setItem('accentColor', color);
    }

    setupPIN() {
        const pin = prompt('Enter a 4-digit PIN:');
        if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
            const hashedPin = this.hashPin(pin);
            localStorage.setItem('securityPin', hashedPin);
            alert('PIN set successfully');
        } else {
            alert('Please enter a valid 4-digit PIN');
        }
    }

    hashPin(pin) {
        return btoa(pin);
    }

    showImportGuide() {
        const modal = document.createElement('div');
        modal.className = 'modal import-guide-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Import Guide</h2>
                    <i class="fas fa-times"></i>
                </div>
                <div class="import-guide">
                    <p>Your import file should be a JSON file with the following structure:</p>
                    <pre>
{
    "passwords": [...],
    "cards": [...],
    "notes": [...],
    "settings": {
        "accentColor": "#color"
    }
}
                    </pre>
                    <div class="import-actions">
                        <button class="settings-button" id="downloadTemplate">
                            <i class="fas fa-download"></i> Download Template
                        </button>
                        <button class="settings-button" id="proceedImport">
                            <i class="fas fa-file-import"></i> Proceed to Import
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        modal.querySelector('#downloadTemplate').addEventListener('click', () => {
            this.exportEmptyTemplate();
            modal.remove();
        });
        
        modal.querySelector('#proceedImport').addEventListener('click', () => {
            modal.remove();
            this.importData();
        });

        modal.querySelector('.fa-times').addEventListener('click', () => modal.remove());
    }

    exportEmptyTemplate() {
        const template = {
            _readme: {
                format_version: "1.0",
                app: "PassMan",
                instructions: "Replace the sample data below with your actual data"
            },
            passwords: [{
                id: "example-id",
                website: "example.com",
                username: "user@example.com",
                password: "password123"
            }],
            cards: [{
                id: "example-id",
                type: "Visa",
                number: "**** **** **** 1234",
                holder: "John Doe",
                expiry: "12/25"
            }],
            notes: [{
                id: "example-id",
                title: "Sample Note",
                content: "Your note content here",
                date: "2024-01-01"
            }],
            settings: {
                accentColor: "#007AFF"
            }
        };

        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passman_import_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportData() {
        const exportData = {
            _readme: {
                format_version: "1.0",
                app: "PassMan",
                date: new Date().toISOString(),
                instructions: "This file contains your PassMan data. To import, use the Import button in Settings."
            },
            passwords: JSON.parse(localStorage.getItem('passwords') || '[]'),
            cards: JSON.parse(localStorage.getItem('cards') || '[]'),
            notes: JSON.parse(localStorage.getItem('notes') || '[]'),
            settings: {
                accentColor: localStorage.getItem('accentColor')
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passman_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    if (this.validateImportData(importedData)) {
                        this.applyImportedData(importedData);
                        alert('Data imported successfully');
                        location.reload();
                    } else {
                        alert('Invalid backup file format');
                    }
                } catch (error) {
                    alert('Error importing data');
                    console.error('Import error:', error);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    validateImportData(data) {
        return data.passwords && data.cards && data.notes && data.settings;
    }

    applyImportedData(data) {
        localStorage.setItem('passwords', JSON.stringify(data.passwords));
        localStorage.setItem('cards', JSON.stringify(data.cards));
        localStorage.setItem('notes', JSON.stringify(data.notes));
        localStorage.setItem('accentColor', data.settings.accentColor);
    }
}

const settingsManager = new SettingsManager();
window.settingsManager = settingsManager;
