const chessMapping = {
    "rock": "fa-chess-rook",
    "knight": "fa-chess-knight",
    "bishop": "fa-chess-bishop",
    "queen": "fa-chess-queen",
    "king": "fa-chess-king",
    "pawn": "fa-chess-pawn"
}

$(function(){
  var socket = io();
  var params = getParams();
  var difficulty = params['difficulty'];
  socket.emit("join_game_page", difficulty);
  var room = null;
  var msg = null;
  var is_p1 = null;
  var clicked_cnt = 0;
  var clicked_pos = null;
  var clientId;
  var color;
  var p1_username = null;
  var p2_username = null;
  var typing;
  var human_move;
  var success = null;

  function get_pos_id(row, col){
    return row + "," + col;
  }
  function display_last_move(){
    var prev_moves = room.chess.prev_moves;
    if(prev_moves.length == 0)
      return;
    var from = prev_moves[prev_moves.length-1].from;
    var to = prev_moves[prev_moves.length-1].to;

    var from_id = get_pos_id(from.row, from.col);
    var to_id = get_pos_id(to.row, to.col);
    var color = (is_your_turn() == true)? "red": "green";

    document.getElementById(from_id).style.border = "4px solid " + color;
    document.getElementById(to_id).style.border = "4px solid " + color;
    document.getElementById(to_id).style.border = "4px solid " + color;

  }

  render_board = function(server_board) {
    var table = document.getElementById("chessBoard");
    table.innerHTML = "";
    var size = server_board.length;
    for (var i=0; i<size; i++) {
      var row = table.appendChild(document.createElement("tr"));
      for (var j=0; j<size; j++) {
        var piece = document.createElement("td");
        var server_piece = server_board[i][j];

        var id = i + "," + j;
        var icon = document.createElement("i");

        if(server_piece != null){
          var is_black = !server_piece.is_player1;
          icon.classList.add("fa");
          icon.classList.add(chessMapping[server_piece.type]);
          piece.appendChild(icon);
          icon.style.color = (is_black == true)? "black" : "rgb(242, 242, 242)";

        }
        piece.id = id;
        piece.onclick = on_click;
        row.appendChild(piece);


      }

    }
    display_last_move();
  }
  on_click = function() {
    var pos = this.id.split(",");

    if(clicked_cnt == 0){
      if (difficulty != undefined) {
        console.log("Human's Turn");
      }
      clicked_cnt++;
      clicked_pos = pos;

      this.style.border = "4px solid orange";
      var r = parseInt(pos[0]);
      var c = parseInt(pos[1]);
      var avail_moves = room.chess.board[r][c].available_moves;
      for (var i = 0; i < avail_moves.length; i++) {
        var id = avail_moves[i].row + "," + avail_moves[i].col;
        document.getElementById(id).style.border = "4px solid yellow";
      }
    }
    else{
      var pos_source = clicked_pos;
      var pos_des = pos;
      var move_string = pos_source[0] + ',' + pos_source[1] + ',' + pos_des[0] + ',' + pos_des[1];
      human_move = move_string;
      socket.emit('move', move_string, difficulty);
      clicked_pos = null;
      clicked_cnt = 0;
    }
  }
  function is_your_turn(){
    var is_p1_turn = room.chess.p1_turn;
    if(is_p1_turn == is_p1)
      return true;
    return false;
  }
  function update_userinfo(){
    if(is_your_turn()){
      $("#turn").html("Your turn");
    }
    else {
      if (room.chess.game_status != room.chess.ONGOING) //ONGOING
        $("#turn").html("Game Over");
      else
        $("#turn").html("The other player turn");
    }

    var p1_side = "You : ";
    var p2_side = "Your Opponent : ";
    var p1_color = 'green';
    var p2_color = 'red';
    p1_username = room.p1_username;
    p2_username = room.p2_username;
    if(!is_p1){ //swap for the side and color
      var tmp = p1_side;
      p1_side = p2_side;
      p2_side = tmp;
      tmp = p1_color;
      p1_color = p2_color;
      p2_color = tmp;
    }
    $("#p1_info").html(p1_side + p1_username);

    if (p2_username != null) {
        $("#p2_info").html(p2_side + p2_username);
    } else {
        $("#p2_info").html("Wait for your opponent");
    }
    $("#p1_info").css('color',  p1_color);
    $("#p2_info").css('color',  p2_color);

    socket.emit('update chat name', {
        name1: p1_username,
        name2: p2_username,
        id: socket.id
    });
  }
  function update_status(text){
    $("#message").html(text);
  }
  function update_game_status(){
    var game_status = room.chess.game_status;
    console.log(game_status)
    if(game_status == room.chess.DRAW){
      update_status("Draw Game!");
      return;
    }
    if(game_status == room.chess.P1_WIN || game_status == room.chess.P2_WIN){
      p1_win = (game_status == room.chess.P1_WIN)? true: false;
      if(is_p1 && p1_win){
        update_status("You win!!");
      }
      else{
        update_status("Checkmate! You lose :(");
      }
      return;
    }

    if(room.chess.is_check == true){
      if(is_p1 == room.chess.p1_turn)
        update_status("You are in check");
      else
        update_status("Your opponent are in check!");
    }
    else{
      update_status(msg);
    }
  }
  function update_room_info(){
    $("#room").html("Room Number: " + room.room_number);

    //do some checking on difficulty level to assign names for player2

    update_userinfo();
    update_game_status();

  }

  $("#quit").on("click", function(){
    console.log('Quit game');
    socket.emit('quit', room);
  });

  $("#myForm").submit(function(e){
    e.preventDefault();
    var texts = $("#messenger").val();
    var player1 = document.getElementById('p1_info')
    clientId = socket.id;
    if (texts != '') {
      socket.emit('chat message', {
          message: texts,
          clientsId: clientId
      });
    }
  });

  socket.on("notifyTyping", data => {
      document.getElementById('typing').innerText = data.user + data.message;
  });
  socket.on('quit', function(response){
    if(response.success){
      window.location.replace('/');
    }
    else{
      update_status(response.data.msg)
    }

  });
  socket.on('msg', function(response){
    update_status(response.error);
  });
  socket.on('render', function(response){ //human's turn switches to AI's turn
    room = response.data.details;
    msg = response.data.msg;
    is_p1 = response.data.is_p1;
    render_board(room.chess.board);
    update_room_info();

    //may apply AI moves in here to respond to users' moves.
    //do something in here, which may jump back and forth forever

    if (difficulty != undefined) {
      if (!is_p1) { //if it's AI turn to move
          console.log("AI's Turn");
          is_p1 = !is_p1;
          socket.emit('AI moves', room, difficulty, human_move, is_p1);

      }
    }
  });

  socket.on('join', function(response){
    if(response.success){
    }
    else{
      update_status(response.error)
    }
  });
  socket.on('chat message', function(data){
      var audience;
      var seperator = document.createElement('br');
      if (clientId === data.clientsId) { //sender
        color = 'blueText';
      } else { //receiver
        color = 'greenText';
      }
      document.getElementById('typing').innerText = "";
      $('#messages').append($('<span class="' + color + '">').text(data.message));
      $('#messages').append(seperator);
      window.scrollTo(0, document.body.scrollHeight);
      $("#messenger").val('');
      openForm();
  });
  socket.on('update chat name', function(data) {
      var chat_name = null;
      var sender_name = null;

      if (socket.id != data.id) {
        chat_name = data.name2;
        sender_name = data.name1;
      } else {
        chat_name = data.name1;
        sender_name = data.name2;
      }

      //human-to-human game
      if (difficulty == undefined && chat_name != null) {
        document.getElementById('chatBox').style.display = 'block';
        $('#chatBox').text(chat_name);
        $("#name").text(chat_name);

        document.getElementById("messenger").addEventListener("keypress", () => {
            socket.emit("typing", {user: sender_name, message: " is typing..."});
        });
    }
  });
});

function getParams() {

var params = {},
    pairs = window.location.href.split('?')
           .pop()
           .split('&');

for (var i = 0, p; i < pairs.length; i++) {
       p = pairs[i].split('=');
       params[ p[0] ] =  p[1];
}

return params;
}

function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}
