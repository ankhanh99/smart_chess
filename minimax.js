var {Chess} = require('./chess.js');
var INFINITY = 10000;

class Minimax {
    constructor(board) {
        this.board = board;
    }

    utility(board) {
      var status = board.game_status;
      if (status != board.ONGOING)
        return status;
      return board.ONGOING;
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
      var terminated = this.utility(board);
      if (depth == 0 || terminated != 0)
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
        var terminated = this.utility(board);
        if (depth == 0 || terminated != 0)
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
