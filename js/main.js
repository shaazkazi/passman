class MasterLock {
    constructor() {
        this.init();
    }

    init() {
        const hasPin = localStorage.getItem('securityPin');
        if (!hasPin) {
            this.setupInitialPin();
        } else {
            this.showLockScreen();
        }
    }

    setupInitialPin() {
        const pin = prompt('Set up your 4-digit master PIN:');
        if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
            localStorage.setItem('securityPin', btoa(pin));
            this.hideLockScreen();
        } else {
            showNotification('Please enter a valid 4-digit PIN');
            this.setupInitialPin();
        }
    }

    showLockScreen() {
        const lockScreen = document.getElementById('masterLock');
        const pinInput = document.getElementById('pinInput');
        const unlockBtn = document.getElementById('unlockBtn');

        unlockBtn.addEventListener('click', () => this.validatePin(pinInput.value));
        pinInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.validatePin(pinInput.value);
        });
    }

    validatePin(inputPin) {
        const storedPin = atob(localStorage.getItem('securityPin'));
        const pinInput = document.getElementById('pinInput');
        const pinContainer = document.querySelector('.pin-input');
        
        if (inputPin === storedPin) {
            this.hideLockScreen();
        } else {
            pinInput.classList.add('error');
            pinContainer.classList.add('shake');
            showNotification('Incorrect PIN');
            
            setTimeout(() => {
                pinInput.classList.remove('error');
                pinContainer.classList.remove('shake');
            }, 500);
            
            pinInput.value = '';
        }
    }

    hideLockScreen() {
        document.getElementById('masterLock').style.display = 'none';
    }
}

function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize MasterLock first
    const masterLock = new MasterLock();

    class PasswordManager {
        constructor() {
            this.passwords = JSON.parse(localStorage.getItem('passwords')) || [];
            this.init();
        }

        init() {
            this.passwordsGrid = document.querySelector('.passwords-grid');
            this.addBtn = document.getElementById('add-password-btn');
            this.searchInput = document.querySelector('#passwords-view .search input');
            this.passwordForm = document.getElementById('passwordForm');

            this.addBtn.addEventListener('click', () => showModal('passwordModal'));
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
            this.passwordForm.addEventListener('submit', (e) => this.handleSubmit(e));

            this.renderPasswords();
        }

        handleSubmit(e) {
            e.preventDefault();
            const newPassword = {
                id: Date.now(),
                website: document.getElementById('website').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            this.passwords.unshift(newPassword);
            this.savePasswords();
            this.renderPasswords();
            hideModal('passwordModal');
        }

        savePasswords() {
            localStorage.setItem('passwords', JSON.stringify(this.passwords));
        }

        renderPasswords(items = this.passwords) {
            this.passwordsGrid.innerHTML = items.map(item => `
                <div class="password-card" data-id="${item.id}">
                    <h3>${item.website}</h3>
                    <p>${item.username}</p>
                    <div class="password-field">
                        <input type="password" value="${item.password}" readonly>
                        <div class="actions">
                            <i class="fas fa-eye"></i>
                            <i class="fas fa-copy"></i>
                            <i class="fas fa-trash" onclick="passwordManager.deletePassword(${item.id})"></i>
                        </div>
                    </div>
                </div>
            `).join('');
            this.setupPasswordActions();
        }

        deletePassword(id) {
            this.passwords = this.passwords.filter(item => item.id !== id);
            this.savePasswords();
            this.renderPasswords();
        }

        handleSearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredPasswords = this.passwords.filter(item => 
                item.website.toLowerCase().includes(searchTerm) ||
                item.username.toLowerCase().includes(searchTerm)
            );
            this.renderPasswords(filteredPasswords);
        }

        setupPasswordActions() {
            document.querySelectorAll('.password-field .fa-eye').forEach(eye => {
                eye.addEventListener('click', () => {
                    const input = eye.closest('.password-field').querySelector('input');
                    input.type = input.type === 'password' ? 'text' : 'password';
                    eye.classList.toggle('fa-eye');
                    eye.classList.toggle('fa-eye-slash');
                });
            });

            document.querySelectorAll('.password-field .fa-copy').forEach(copy => {
                copy.addEventListener('click', () => {
                    const input = copy.closest('.password-field').querySelector('input');
                    navigator.clipboard.writeText(input.value);
                    copy.classList.replace('fa-copy', 'fa-check');
                    setTimeout(() => copy.classList.replace('fa-check', 'fa-copy'), 1000);
                });
            });
        }
    }

    // Initialize PasswordManager
    const passwordManager = new PasswordManager();
    window.passwordManager = passwordManager;

    // Navigation handling
    const navItems = document.querySelectorAll('nav li');
    const views = document.querySelectorAll('.view');

    function switchView(viewId) {
        views.forEach(view => view.style.display = 'none');
        document.getElementById(viewId).style.display = 'block';
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const viewId = item.textContent.trim().toLowerCase() + '-view';
            switchView(viewId);
        });
    });

    // Modal handling
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) form.reset();
    }

    window.showModal = showModal;
    window.hideModal = hideModal;

    // Event Listeners for Modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal(modal.id);
        });
    });

    document.querySelectorAll('.modal .fa-times').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            hideModal(closeBtn.closest('.modal').id);
        });
    });

    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.closest('.modal').id);
        });
    });

    // Password visibility toggle in forms
    document.querySelectorAll('.password-input i').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

    // Mobile navigation
    const mobileBreakpoint = 768;
    const sidebar = document.querySelector('.sidebar');
    
    function handleMobileNav() {
        if (window.innerWidth <= mobileBreakpoint) {
            sidebar.classList.add('mobile-nav');
        } else {
            sidebar.classList.remove('mobile-nav');
        }
    }

    window.addEventListener('resize', handleMobileNav);
    handleMobileNav();
});
