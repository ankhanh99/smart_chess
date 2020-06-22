var {Chess} = require('./chess.js');
var Minimax = require('./minimax.js');
var INFINITY = 10000;
var chess = new Chess();

class MinimaxAlphaBeta extends Minimax {
    constructor(board) {
        super(board);
        this.alpha = INFINITY;
        this.beta = -INFINITY;
    }

    utility(board) {
        return super.utility(board);
    }

    minimax_AlphaBeta_decision() {
        var curBoard = this.board;
        var curValue = -INFINITY;
        var depth = 2;
        var possible_boards = curBoard.generate_possible_boards(true);
        for (var i=0; i<possible_boards.length; i++) {
            var updateValue = this.min_value(depth-1, possible_boards[i], this.alpha, this.beta);
            if (updateValue > curValue) {
                curValue = updateValue;
                curBoard = possible_boards[i];
            }
        }
        return [curValue, curBoard];
    }

    min_value(depth, board, alpha, beta) {
        var minVal = INFINITY;
        var terminated = this.utility(board);
        if (depth == 0 || terminated != 0) {
          return terminated;
        }

        var possible_boards = board.generate_possible_boards();
        for (var i=0; i<possible_boards.length; i++) {
            minVal = this.max_value(depth-1, possible_boards[i], alpha, beta);
            if (minVal < alpha) {
                return minVal;
            }
            beta = Math.min(beta, minVal);
        }
        return minVal;
    }

    max_value(depth, board, alpha, beta) {
        var maxVal = -INFINITY;
        var terminated = this.utility(board);
        if (depth == 0 || terminated != 0) {
          return terminated;
        }

        var possible_boards = board.generate_possible_boards(true);
        for (var i=0; i<possible_boards.length; i++) {
            maxVal = this.min_value(depth-1, possible_boards[i], alpha, beta);
            if (maxVal >= beta) {
                return maxVal;
            }
            alpha = Math.max(alpha, maxVal);
        }
        return maxVal;
    }
}

module.exports = MinimaxAlphaBeta;
