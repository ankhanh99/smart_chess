var {Chess} = require('./chess.js');
var INFINITY = 10000;

class Minimax {
    constructor(board) {
        this.board = board;
        this.pawnEvalWhite =
            [
                [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
                [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
                [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
                [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
                [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
                [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
                [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
                [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
            ];

        this.pawnEvalBlack = this.reverseArray(this.pawnEvalWhite);

        this.knightEval =
            [
                [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
                [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
                [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
                [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
                [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
                [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
                [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
                [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
            ];

        this.bishopEvalWhite = [
            [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
            [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
            [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
            [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
            [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
            [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
            [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
            [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
        ];

        this.bishopEvalBlack = this.reverseArray(this.bishopEvalWhite);

        this.rookEvalWhite = [
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
            [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
            [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
            [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
            [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
            [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
            [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
        ];

        this.rookEvalBlack = this.reverseArray(this.rookEvalWhite);

        this.evalQueen = [
            [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
            [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
            [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
            [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
            [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
            [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
            [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
            [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
        ];

        this.kingEvalWhite = [

            [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
            [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
            [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
            [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
        ];

        this.kingEvalBlack = this.reverseArray(this.kingEvalWhite);
    }

    reverseArray(array) {
        return array.slice().reverse();
    }

    getAbsoluteValue(piece, isWhite, x ,y) {
      if (piece.type === 'pawn') {
          return 10 + ( isWhite ? this.pawnEvalWhite[y][x] : this.pawnEvalBlack[y][x] );
      } else if (piece.type === 'rock') {
          return 50 + ( isWhite ? this.rookEvalWhite[y][x] : this.rookEvalBlack[y][x] );
      } else if (piece.type === 'knight') {
          return 30 + this.knightEval[y][x];
      } else if (piece.type === 'bishop') {
          return 30 + ( isWhite ? this.bishopEvalWhite[y][x] : this.bishopEvalBlack[y][x] );
      } else if (piece.type === 'queen') {
          return 90 + this.evalQueen[y][x];
      } else if (piece.type === 'king') {
          return 900 + ( isWhite ? this.kingEvalWhite[y][x] : this.kingEvalBlack[y][x] );
      }
      throw "Unknown piece type: " + piece.type;
    }

    getPieceValue(player_turn, piece, x, y) {
        if (piece === null) {
            return 0;
        }

        var absoluteValue = this.getAbsoluteValue(piece, piece.is_player1 === !player_turn, x ,y);
        return piece.is_player1 === !player_turn ? absoluteValue : -absoluteValue;
    }

    utility(board) {
      var totalEvaluation = 0;
      for (var i = 0; i<board.size; i++) {
          for (var j = 0; j<board.size; j++) {
              totalEvaluation = totalEvaluation + this.getPieceValue(board.p1_turn, board.board[i][j], i ,j);
          }
      }
      return totalEvaluation;
    }

    minimaxDecision() {
      var curBoard = this.board;
      var curValue = -INFINITY;
      var depth = 2;
      var possible_boards = curBoard.generate_possible_boards(true); //possible boards made by AI
      for (var i=0; i<possible_boards.length; i++) {
          var updateValue = this.min_value(depth-1, possible_boards[i]);
          if (updateValue > curValue) {
              curValue = updateValue;
              curBoard = possible_boards[i];
          }
      }
      return [curValue, curBoard];
    }

    min_value(depth, board) { //human
      var minVal = INFINITY;
      var terminated = -this.utility(board);
      if (depth == 0)
        return terminated;

      var possible_boards = board.generate_possible_boards();
      for (var index=0; index<possible_boards.length; index++) {
          var updateValue = this.max_value(depth-1, possible_boards[index]);
          minVal = Math.min(minVal, updateValue);
      }
      return minVal;
    }

    max_value(depth, board) { //AI
        var maxVal = -INFINITY;
        var terminated = -this.utility(board);
        if (depth == 0)
          return terminated;

        var possible_boards = board.generate_possible_boards(true);
        for (var index=0; index<possible_boards.length; index++) {
            var updateValue = this.min_value(depth-1, possible_boards[index]);
            maxVal = Math.max(maxVal, updateValue);
        }
        return maxVal;
    }
}

module.exports = Minimax;
