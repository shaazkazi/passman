class CardManager {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('cards')) || [
            {
                type: 'Visa',
                number: '**** **** **** 4242',
                holder: 'John Doe',
                expiry: '12/24',
                cvv: '***'
            }
        ];
        this.init();
    }

    init() {
        this.cardsGrid = document.querySelector('.cards-grid');
        this.addBtn = document.getElementById('add-card-btn');
        this.searchInput = document.querySelector('#cards-view .search input');
        this.cardForm = document.getElementById('cardForm');
        this.cardNumberInput = document.getElementById('cardNumber');
        this.expiryDateInput = document.getElementById('expiryDate');
        this.cvvInput = document.getElementById('cvv');
        this.cardTypeSelect = document.getElementById('cardType');

        this.setupFormValidation();
        this.addBtn.addEventListener('click', () => showModal('cardModal'));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.cardForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.renderCards();
    }

    setupFormValidation() {
        // Card number formatting and validation
        this.cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            
            // Add spaces every 4 digits
            const parts = [];
            for (let i = 0; i < value.length; i += 4) {
                parts.push(value.slice(i, i + 4));
            }
            e.target.value = parts.join(' ');

            // Update card type based on number
            this.detectCardType(value);
        });

        // Expiry date formatting (MM/YY)
        this.expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                const month = parseInt(value.slice(0, 2));
                if (month > 12) value = '12' + value.slice(2);
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            
            e.target.value = value.slice(0, 5);
        });

        // CVV validation
        this.cvvInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            const maxLength = this.cardTypeSelect.value === 'Amex' ? 4 : 3;
            e.target.value = value.slice(0, maxLength);
        });

        // Card type change handler
        this.cardTypeSelect.addEventListener('change', () => {
            this.cvvInput.value = '';
            this.cvvInput.maxLength = this.cardTypeSelect.value === 'Amex' ? 4 : 3;
        });
    }

    detectCardType(number) {
        const patterns = {
            Visa: /^4/,
            Mastercard: /^5[1-5]/,
            Amex: /^3[47]/,
            Discover: /^6/
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(number)) {
                this.cardTypeSelect.value = type;
                return;
            }
        }
    }

    validateCard(cardData) {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        // Validate expiry date
        const [month, year] = cardData.expiry.split('/').map(num => parseInt(num));
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            alert('Card has expired');
            return false;
        }

        // Clean the card number
        const numbers = cardData.number.replace(/\D/g, '');
        
        // Length validation based on card type
        const validLengths = {
            Visa: [16],
            Mastercard: [16],
            Amex: [15],
            Discover: [16]
        };

        if (!validLengths[cardData.type].includes(numbers.length)) {
            alert(`Invalid length for ${cardData.type} card`);
            return false;
        }

        return true;
    }

    handleSubmit(e) {
        e.preventDefault();
        const newCard = {
            id: Date.now(),
            type: this.cardTypeSelect.value,
            number: this.cardNumberInput.value,
            holder: document.getElementById('cardHolder').value.toUpperCase(),
            expiry: this.expiryDateInput.value,
            cvv: this.cvvInput.value
        };

        if (!this.validateCard(newCard)) return;

        this.cards.unshift(newCard);
        this.saveCards();
        this.renderCards();
        hideModal('cardModal');
    }

    saveCards() {
        localStorage.setItem('cards', JSON.stringify(this.cards));
    }

    renderCards(items = this.cards) {
        this.cardsGrid.innerHTML = items.map(card => `
            <div class="card-item" data-type="${card.type}">
                <div class="card-header">
                    <div class="card-type">
                        <i class="fab fa-cc-${card.type.toLowerCase()}"></i>
                        <span>${card.type}</span>
                    </div>
                    <div class="card-actions">
                        <i class="fas fa-trash" onclick="cardManager.deleteCard(${card.id})"></i>
                    </div>
                </div>
                <div class="card-number">${card.number}</div>
                <div class="card-details">
                    <div class="card-detail-item">
                        <span>Card Holder</span>
                        ${card.holder}
                    </div>
                    <div class="card-detail-item">
                        <span>Expires</span>
                        ${card.expiry}
                    </div>
                </div>
            </div>
        `).join('');
    }
    deleteCard(id) {
        this.cards = this.cards.filter(card => card.id !== id);
        this.saveCards();
        this.renderCards();
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredCards = this.cards.filter(card => 
            card.holder.toLowerCase().includes(searchTerm) ||
            card.type.toLowerCase().includes(searchTerm) ||
            card.number.includes(searchTerm)
        );
        this.renderCards(filteredCards);
    }
}

// Initialize Cards and make it globally available
const cardManager = new CardManager();
window.cardManager = cardManager;
