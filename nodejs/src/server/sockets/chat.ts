import { send } from 'process';
import { Server, Socket } from 'socket.io';

 interface ChatMessage {
 	text:		string;
 	sender:	string;
 	timestamp:	Date;
 }

export function registerChatEvents(io: Server, socket: Socket) {
	socket.on('chat:find', () => {
		//if game-chat: get gameId from socket.data
		const chatId = socket.data.id_game;
		socket.join(chatId);
		socket.emit('chat:ready', chatId);
	});

	socket.on('chat:send', (data: { chatId: string, message: string}) =>
	{
		//enrich message with username + timestamp -> can store username in socket.data
		const user: string = socket.data.user;
		//for dms need more user info like id, friends, online status
		const enriched: ChatMessage = {
			text: data.message,
			sender: user,
			timestamp: new Date()
		};
		//chat content moderation happens here
		io.to(data.chatId).emit('chat:receive', enriched);
	});

	socket.on('disconnect', () => {
		console.log(`User disconnected: ${socket.id}`);
	});
}