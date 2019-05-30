/* functions for general use*/

function getURLParameters(whichParam)
{
	var pageURL = window.location.search.substring(1);
	var pageURLVariables = pageURL.split('&');
	for (var i=0; i <pageURLVariables.length; i++){
	     var parameterName = pageURLVariables[i].split('=');
	if(parameterName[0] == whichParam){
	   return parameterName[1];
	   }
	}
}

var username = getURLParameters('username');
if('undefined'== typeof username || !username){
	username = 'Anonymous_' +Math.random();
}

var chat_room = getURLParameters('game_id');
if('undefined'== typeof chat_room || !chat_room){
	chat_room ='lobby';
}

/* Connect to the socket server */


var socket = io.connect();

socket.on('log', function(array){
	console.log.apply(console,array);
});



socket.on('join_room_response',function(payload){
	if(payload.result == 'fail'){
		alert(payload.message);
		return;
	}

      if(payload.socket_id == socket.id){
      	return;
      }

      var dom_elements = $('.socket_'+payload.socket_id);
      if(dom_elements.length == 0){
      	var nodeA = $('<div></div>');
      	nodeA.addClass('socket'+payload.socket_id);
      	var nodeB = $('<div></div>');
      	nodeB.addClass('socket'+payload.socket_id);
      	var nodeC = $('<div></div>');
      	nodeC.addClass('socket'+payload.socket_id);

      	nodeA.addClass('w-100');

      	nodeB.addClass('col-9 text-right');
      	nodeB.append('<p>'+payload.username+'</p>');

      	nodeC.addClass('col-3 text-left');
      		var buttonC = makeInviteButton(payload.socket_id);
      		nodeC.append(buttonC);

      		nodeA.hide();
      		nodeB.hide();
      		nodeC.hide();
      		$('#players').append(nodeA,nodeB,nodeC);
      		nodeA.slideDown(1000);
      		nodeB.slideDown(1000);
      		nodeC.slideDown(1000);

      }
      else{
      	  var buttonC = makeInviteButton(payload.socket_id);
      	  $('.socket_'+payload.socket_id+'button').replaceWith(buttonC);
      	  dom_elements.slideDown(1000);
      }
   

       var newHTML ='<P>' + payload.username+' just entered the lobby</p>';
       var newNode = $(newHTML);
       newNode.hide();
       $('#messages').append(newNode);
       newNode.slideDown(1000);
   });


socket.on('player_disconnected',function(payload){
	if(payload.result == 'fail'){
		alert(payload.message);
		return;
	}

      if(payload.socket_id == socket.id){
      	return;
      }

      var dom_elements = $('.socket_'+payload.socket_id);
      if(dom_elements.length != 0){
         dom_elements.slideUP(1000);

      }
   

       var newHTML ='<P>' + payload.username+' has left the lobby</p>';
       var newNode = $(newHTML);
       newNode.hide();
       $('#messages').append(newNode);
       newNode.slideDown(1000);
   });

function invite(who){
      var payload = {};
      payload.requested_user = who;

      console.log('*** Client Log Message:\'invite\' payload: '+JSON.stringify(payload));
      socket.emit('invite', payload);

      }

socket.on('invite_response',function(payload){
      if(payload.result == 'fail'){
            alert(payload.message);
            return;
      }
      var newNode = makeInvitedButton();
      $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});


socket.on('invited',function(payload){
      if(payload.result == 'fail'){
            alert(payload.message);
            return;
      }
      var newNode = makePlayButton();
      $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});



socket.on('send_message_response',function(payload){
	if(payload.result == 'fail'){
		alert(payload.message);
		return;
	}
	$('#messages').append('<p><b>' +payload.username+' says:</b> '+payload.message+'</p>');
});



function send_message(){
	var payload = {};
	payload.room = chat_room;
	payload.username = username;
	payload.message = $('#send_message_holder').val();
	console.log('*** Client Log Message: \'send_message\' payload: '+JSON.stringify(payload));
	socket.emit('send_message',payload);
}

function makeInviteButton(socket_id){

	var newHTML = '<button type=\'button\' class =\'btn btn-outline-primary\'>Invite</button>';
	var newNode = $(newHTML);
      newNode.click(function(){
            invite (socket_id);
      });
	return(newNode);
}

function makeInvitedButton(){

      var newHTML = '<button type=\'button\' class =\'btn btn-primary\'>invited</button>';
      var newNode = $(newHTML);
      return(newNode);
}

function makePlayButton(){

      var newHTML = '<button type=\'button\' class =\'btn btn-success\'>Play</button>';
      var newNode = $(newHTML);
      return(newNode);
}


function makeEngageButton(){

      var newHTML = '<button type=\'button\' class =\'btn btn-danger\'>Engaged</button>';
      var newNode = $(newHTML);
      return(newNode);
}




$(function(){
	var payload = {};
	payload.room = chat_room;
	payload.username = username;


	console.log('*** Client Log Message: \'join_room\' payload:'+JSON.stringify(payload));
	socket.emit('join_room',payload);
});