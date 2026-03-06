import { Server, Socket } from 'socket.io';

interface ChatMessage {
	text:		string;
	username:	string;
	sentAt:	Date;
}

interface ClientToServerEvents {
  "get_message": (text: string) => void;
}

interface ServerToClientEvents {
  "send_message": (data: ChatMessage) => void;
}

export function registerChatEvents(
	io: Server<ClientToServerEvents, ServerToClientEvents>,		//server listens to ClientToServer events and emits ServerToClient events
	socket: Socket<ClientToServerEvents, ServerToClientEvents>
) : void {
	
	socket.on("get_message", (message: string) => {
		const user = getUserFromSocket(socket);					//get username (from db?)
			//content moderation?
			//save message to db?
		const enriched: ChatMessage = {							//enrich message with username and timestamp
			text:		message,
			username:	user.username,
			sentAt:		new Date()
		};
	io.to(socket.data.gameId).emit("send_message", enriched);	//emit enriched message to both clients
	});
}