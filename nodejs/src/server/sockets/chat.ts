import { send } from 'process';
import { Server, Socket } from 'socket.io';

 interface ChatMessage {
 	text:		string;
 	sender:	string;
 	sentAt:	Date;
 }

// interface ClientToServerEvents {
//   "get_message": (text: string) => void;
// }

// interface ServerToClientEvents {
//   "send_message": (data: ChatMessage) => void;
// }

// export function registerChatEvents(
// 	io: Server<ClientToServerEvents, ServerToClientEvents>,		//server listens to ClientToServer events and emits ServerToClient events
// 	socket: Socket<ClientToServerEvents, ServerToClientEvents>
// ) : void {
	
// 	socket.on("get_message", (message: string) => {
// 		const user = getUserFromSocket(socket);					//get username (from db?)
// 			//content moderation?
// 			//save message to db?
// 		const enriched: ChatMessage = {							//enrich message with username and timestamp
// 			text:		message,
// 			username:	user.username,
// 			sentAt:		new Date()
// 		};
// 	io.to(socket.data.gameId).emit("send_message", enriched);	//emit enriched message to both clients
// 	});
// }

export function registerChatEvents(io: Server, socket: Socket) {
	//intercept game ready event to get gameID?
	socket.on('chat:find', () => {
		//get game id from db? or from chess event?
		socket.emit('chat:ready', chatId);
	});

	socket.on('chat:send', (data: { chatId: string, message: string}) =>
	{
		//enrich message with username + timestamp -> can store username in socket.data
		const user: string = socket.data.user;
		const enriched: ChatMessage = {
			text: data.message,
			sender: user,
			sentAt: new Date()
		};
		//chat content moderation happens here
		io.to(data.chatId).emit('chat:receive', enriched);
	});

	socket.on('disconnect', () => {
		console.log(`User disconnected: ${socket.id}`);
	});
}