const arrayToBoard = (arr, winPattern = []) => {
    let str = "";
    for (let i = 0; i < arr.length; i++) {
        if (i > 0 && i % 3 === 0) str += "\n";
        if (winPattern.includes(i)) {
            str += "✅ "; // Highlight winning line
        } else if (arr[i] === null) {
            str += "🔲 ";
        } else if (arr[i] === 'X') {
            str += "❌ ";
        } else if (arr[i] === 'O') {
            str += "⭕ ";
        }
    }
    return str;
};

class TicTacToe {
    constructor(paID, pbID) {
        this.paID = paID;
        this.pbID = pbID;
        this.board = Array(9).fill(null);
        this.currentPlayer = paID;
        this.winner = null;
        this.winPattern = [];
    }

    isDraw() {
        return this.board.every(cell => cell !== null) && !this.isWin();
    }

    isWin() {
        const winPatterns = [
            [0,
                1,
                2],
            [3,
                4,
                5],
            [6,
                7,
                8],
            [0,
                3,
                6],
            [1,
                4,
                7],
            [2,
                5,
                8],
            [0,
                4,
                8],
            [2,
                4,
                6]
        ];

        for (let pattern of winPatterns) {
            if (pattern.every(index => this.board[index] === (this.currentPlayer === this.paID ? 'X': 'O'))) {
                this.winPattern = pattern;
                return true;
            }
        }

        return false;
    }

    makeMove(position) {
        if (this.board[position] === null && !this.winner) {
            this.board[position] = this.currentPlayer === this.paID ? 'X': 'O';

            if (this.isWin()) {
                this.winner = this.currentPlayer;
                return `${this.currentPlayer === this.paID ? 'Player 1': 'Player 2'} wins!`;
            } else if (this.isDraw()) {
                return "It's a draw!";
            }

            this.currentPlayer = this.currentPlayer === this.paID ? this.pbID: this.paID;
            return "Move accepted!";
        } else {
            return this.winner ? "Game over!": "Invalid move!";
        }
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = this.paID;
        this.winner = null;
        this.winPattern = [];
    }
}

class TicTacToeManager {
    constructor() {
        this.games = {};
    }

    createGame(paID, pbID) {
        const gameID = `game_${Object.keys(this.games).length + 1}`;
        this.games[gameID] = new TicTacToe(paID, pbID);
        return gameID;
    }

    getGame(gameID) {
        return this.games[gameID];
    }

    makeMove(gameID, playerID, position) {
        const game = this.getGame(gameID);
        if (game) {
            if (playerID !== game.paID && playerID !== game.pbID) {
                return "You are not part of this game!";
            }
            return game.makeMove(position);
        } else {
            return "Game not found!";
        }
    }

    getBoard(gameID) {
        const game = this.getGame(gameID);
        if (game) {
            return game.board;
        } else {
            return "Game not found!";
        }
    }

    getWinPattern(gameID) {
        const game = this.getGame(gameID);
        if (game) {
            return game.winPattern;
        } else {
            return [];
        }
    }
}

module.exports = {
    config: {
        name: "tictacto",
        aliases: ["ttt",
            "xo"],
        version: "1.5",
        author: "Allou Mohamed",
        countDown: 5,
        role: 0,
        description: "Play Tic-Tac-Toe",
        category: "Games",
        guide: {
            ar: "{pn} رد على شخص",
            en: "{pn} reply to someone"
        }
    },
    onStart: async function({
        message, event, commandName
    }) {
        const engine = new TicTacToeManager();
        const paID = event.senderID;

        if (!event?.messageReply?.senderID) {
            return message.reply("Please reply to someone to start the game.");
        }

        const pbID = event.messageReply.senderID;
        const gmID = engine.createGame(paID, pbID);
        const board = engine.getBoard(gmID);
        const str = arrayToBoard(board);

        message.reply(str, (info) => {
            global.YukiBot.onReply.set(info.messageID, {
                commandName,
                gameID: gmID, paID, pbID, engine
            });
        });
    },
    onReply: async function({
        message, args, event, Reply, commandName
    }) {
        const {
            gameID,
            paID,
            pbID,
            engine
        } = Reply;
        const playerID = event.senderID;

        if (playerID !== paID && playerID !== pbID) {
            return message.reply("You are not part of this game!");
        }

        const position = parseInt(args[0]) - 1;
        if (isNaN(position) || position < 0 || position > 8) {
            return message.reply("Please provide a valid position (1-9).");
        }

        const result = engine.makeMove(gameID, playerID, position);
        const board = engine.getBoard(gameID);
        const winPattern = engine.getWinPattern(gameID);
        const str = arrayToBoard(board, winPattern);

        message.reply(`${str}\n${result}`, (info) => {
            if (!result.includes("wins") && !result.includes("draw")) {
                global.YukiBot.onReply.set(info.messageID, {
                    commandName,
                    gameID: gameID, paID, pbID, engine
                });
            }
        });
    }
};