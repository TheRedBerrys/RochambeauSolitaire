// Rochambeau Solitaire Game Implementation with UI

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString() {
        return `${this.rank} ${this.suit}`;
    }
}

class ActionCard extends Card {
    constructor(type) {
        super('Action', type);
    }

    toString() {
        return this.rank;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
        this.shuffle();
    }

    initializeDeck() {
        const suits = ['🪨', '📄', '✂️️'];
        for (let suit of suits) {
            for (let rank = 1; rank <= 11; rank++) {
                this.cards.push(new Card(suit, rank));
            }
        }
        for (let rank = 1; rank <= 7; rank++) {
            this.cards.push(new Card('💣', rank));
        }

        const actionCards = [
            '# 1st', '# 1st', '# 1st',
            '🪨>📄>️✂️>💣', '🪨>📄>️✂️>💣', '🪨>📄>️✂️>💣',
            '1 > 9', '1 > 9'
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
        if (this.endStack.length === 0) {
            return !(card instanceof ActionCard);
        }
        if (card instanceof ActionCard) {
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

        let rankBeforeSuit = actionCards.some(card => card.rank === '# 1st');
        let suitsReversed = actionCards.some(card => card.rank === '🪨>📄>️✂️>💣');
        let ranksReversed = actionCards.some(card => card.rank === '1 > 9');
        
        if (rankBeforeSuit) {
            if (card1.rank !== card2.rank) {
                return ranksReversed ? card1.rank < card2.rank : card1.rank > card2.rank;
            }
        }
        
        const defeatsMap = suitsReversed 
            ? { '✂️️': '🪨', '🪨': '📄', '📄': '✂️️' }
            : { '🪨': '✂️️', '📄': '🪨', '✂️️': '📄' };

        if (card1.suit !== card2.suit) {
            if (suitsReversed) {
                if (card2.suit === '💣') return true;
                if (card1.suit === '💣') return false;
            } else {
                if (card1.suit === '💣') return true;
                if (card2.suit === '💣') return false;
            }
            return defeatsMap[card1.suit] === card2.suit;
        }
        return ranksReversed ? card1.rank < card2.rank : card1.rank > card2.rank;
    }

    moveToFreeSpace(stackIndex) {
        if (this.freeSpace === null && this.stacks[stackIndex].length > 0) {
            this.freeSpace = this.stacks[stackIndex].pop();
            this.render();
            return true;
        }
        return false;
    }

    moveFromFreeSpace() {
        if (this.freeSpace && this.canPlaceCard(this.freeSpace)) {
            if (!(this.freeSpace instanceof ActionCard)) {
                this.endStack = [];
            }
            this.endStack.push(this.freeSpace);
            this.freeSpace = null;
            this.render();
            return true;
        }
        return false;
    }

    checkWin() {
        return this.stacks.every(stack => stack.length === 0) && this.freeSpace === null;
    }

    checkLose() {
        if (this.freeSpace === null) return false;
        return !this.canPlaceCard(this.freeSpace) && !this.stacks.some(stack => stack.length > 0 && this.canPlaceCard(stack[0]));
    }

    playCard(stackIndex) {
        if (this.stacks[stackIndex].length === 0) return;
        let card = this.stacks[stackIndex].pop();
        if (this.canPlaceCard(card)) {
            if (!(card instanceof ActionCard)) {
                this.endStack = [];
            }
            this.endStack.push(card);
        } else {
            this.stacks[stackIndex].push(card); // Return card if move is not possible
            return;
        }
        this.render();
    }

    createCardElement(card) {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.textContent = card.toString();
        cardDiv.setAttribute("card-string", card.toString());
        return cardDiv;
    }

    render() {
        let gameContainer = document.getElementById('game');
        gameContainer.innerHTML = '';
        let mainStacks = document.createElement('main-stacks');
        mainStacks.classList.add("main-stacks");

        this.stacks.forEach((stack, index) => {
            let stackDiv = document.createElement('div');
            stackDiv.classList.add('stack');
            stackDiv.innerHTML = '<h3>Stack</h3>';

            let playButton = document.createElement('button');
            playButton.textContent = 'Play Top Card';
            playButton.onclick = () => this.playCard(index);
            stackDiv.appendChild(playButton);

            let moveToFreeSpaceButton = document.createElement('button');
            moveToFreeSpaceButton.textContent = 'Move to Free Space';
            moveToFreeSpaceButton.onclick = () => this.moveToFreeSpace(index);
            stackDiv.appendChild(moveToFreeSpaceButton);

            stack.forEach((card, index2) => {
                let cardDiv = this.createCardElement(card);
                stackDiv.appendChild(cardDiv);
                cardDiv.style.top = `${index2 * 25 + 225}px`;
            });

            mainStacks.appendChild(stackDiv);
        });

        gameContainer.appendChild(mainStacks);

        let sideArea = document.createElement('div');
        sideArea.classList.add("side-area");

        let endStackDiv = document.createElement('div');
        endStackDiv.classList.add('end-stack');
        endStackDiv.innerHTML = '<h3>End Stack</h3>';
        this.endStack.forEach((card, index) => {
            let cardDiv = this.createCardElement(card);
            endStackDiv.appendChild(cardDiv);
            cardDiv.style.top = `${index * 25 + 100}px`;
        });
        sideArea.appendChild(endStackDiv);

        let freeSpaceDiv = document.createElement('div');
        freeSpaceDiv.classList.add('free-space');
        freeSpaceDiv.innerHTML = '<h3>Free Space</h3>';
        if (this.freeSpace) {
            let cardDiv = this.createCardElement(this.freeSpace);
            let moveFromFreeSpaceButton = document.createElement('button');
            moveFromFreeSpaceButton.textContent = 'Play this card';
            moveFromFreeSpaceButton.onclick = () => this.moveFromFreeSpace();
            freeSpaceDiv.appendChild(moveFromFreeSpaceButton);
            freeSpaceDiv.appendChild(cardDiv);
        }
        sideArea.appendChild(freeSpaceDiv);

        gameContainer.appendChild(sideArea);
    }
}

// Initialize UI
window.onload = () => {
    document.body.innerHTML = '<div id="game"></div>';
    new Game();
};


