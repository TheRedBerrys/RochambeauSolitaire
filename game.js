// Rochambeau Solitaire Game Implementation with UI

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString() {
        return `${this.rank} of ${this.suit}`;
    }
}

class ActionCard extends Card {
    constructor(type) {
        super('Action', type);
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
        this.shuffle();
    }

    initializeDeck() {
        const suits = ['Rock', 'Paper', 'Scissors'];
        for (let suit of suits) {
            for (let rank = 1; rank <= 11; rank++) {
                this.cards.push(new Card(suit, rank));
            }
        }
        for (let rank = 1; rank <= 7; rank++) {
            this.cards.push(new Card('Bomb', rank));
        }

        const actionCards = [
            'Rank Before Suit', 'Rank Before Suit', 'Rank Before Suit',
            'Suits Reversed', 'Suits Reversed', 'Suits Reversed',
            'Ranks Reversed', 'Ranks Reversed'
        ];
        
        for (let action of actionCards) {
            this.cards.push(new ActionCard(action));
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    dealStacks() {
        return [
            this.cards.splice(0, 16),
            this.cards.splice(0, 16),
            this.cards.splice(0, 16)
        ];
    }
}

class Game {
    constructor() {
        this.deck = new Deck();
        this.stacks = this.deck.dealStacks();
        this.endStack = [];
        this.freeSpace = null;
        this.render();
    }

    canPlaceCard(card) {
        if (this.endStack.length === 0 || card instanceof ActionCard) {
            return true;
        }
        let topCard = this.getTopRegularCard();
        if (!topCard) {
            return true;
        }
        return this.defeats(card, topCard);
    }

    getTopRegularCard() {
        let actionCards = [];
        for (let i = this.endStack.length - 1; i >= 0; i--) {
            if (this.endStack[i] instanceof ActionCard) {
                actionCards.push(this.endStack[i]);
            } else {
                return { regularCard: this.endStack[i], actionCards };
            }
        }
        return { regularCard: null, actionCards };
    }

    defeats(card1, card2Info) {
        let { regularCard: card2, actionCards } = card2Info;
        if (!card2) return true;

        let rankBeforeSuit = actionCards.some(card => card.rank === 'Rank Before Suit');
        let suitsReversed = actionCards.some(card => card.rank === 'Suits Reversed');
        let ranksReversed = actionCards.some(card => card.rank === 'Ranks Reversed');
        
        if (rankBeforeSuit) {
            if (card1.rank !== card2.rank) {
                return ranksReversed ? card1.rank < card2.rank : card1.rank > card2.rank;
            }
        }
        
        const defeatsMap = suitsReversed 
            ? { 'Scissors': 'Rock', 'Rock': 'Paper', 'Paper': 'Scissors' }
            : { 'Rock': 'Scissors', 'Paper': 'Rock', 'Scissors': 'Paper' };

        if (card1.suit === 'Bomb') return true;
        if (card2.suit === 'Bomb') return false;
        if (card1.suit !== card2.suit) {
            return defeatsMap[card1.suit] === card2.suit;
        }
        return ranksReversed ? card1.rank < card2.rank : card1.rank > card2.rank;
    }

    render() {
        let gameContainer = document.getElementById('game');
        gameContainer.innerHTML = '';
        
        this.stacks.forEach((stack, index) => {
            let stackDiv = document.createElement('div');
            stackDiv.classList.add('stack');
            stackDiv.innerHTML = `<h3>Stack ${index + 1}</h3>`;
            stack.forEach(card => {
                let cardDiv = document.createElement('div');
                cardDiv.classList.add('card');
                cardDiv.textContent = card.toString();
                stackDiv.appendChild(cardDiv);
            });
            let playButton = document.createElement('button');
            playButton.textContent = 'Play Top Card';
            playButton.onclick = () => this.playCard(index);
            stackDiv.appendChild(playButton);
            gameContainer.appendChild(stackDiv);
        });
        
        let endStackDiv = document.createElement('div');
        endStackDiv.classList.add('end-stack');
        endStackDiv.innerHTML = '<h3>End Stack</h3>';
        this.endStack.forEach(card => {
            let cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.textContent = card.toString();
            endStackDiv.appendChild(cardDiv);
        });
        gameContainer.appendChild(endStackDiv);
    }
}

// Initialize UI
window.onload = () => {
    document.body.innerHTML = '<div id="game"></div>';
    new Game();
};

