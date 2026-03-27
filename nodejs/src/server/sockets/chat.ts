import { Server, Socket } from 'socket.io';
import pool from '../db.js';
import { RowDataPacket } from "mysql2";
import { saveMessage } from '../services/message.service';
import { createDMConversation } from '../services/conversation.service.js';

 interface ChatMessage {
 	id:			number;
	text:		string;
 	senderId:	number;
 	timestamp:	Date;
	//add conv db id
 }

 interface DmConversation {
	conv_id: 		number,
	otherUserId : 	number,
	username : 		string,
	path_img: 		string,
	creation : 		Date
}

export function registerChatEvents(io: Server, socket: Socket) {
	socket.on('chat:find', async () => {
		const chatId = socket.data.id_game;
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT id_conversation FROM Game WHERE id = ?`,
			[Number(chatId)]
  		);
		socket.data.conversationId = rows[0].id_conversation;
		socket.join(chatId); //technically useless ?
		socket.emit('chat:ready', chatId, socket.data.userId, socket.data.conversationId);
	});

	socket.on('chat:send', async (data: { chatId: string, message: string}) =>
	{
		const userId: number = socket.data.userId;
		const messageId = await saveMessage(socket.data.conversationId, userId, data.message);
		const enriched: ChatMessage = {
			id: messageId,
			text: data.message,
			senderId: userId,
			timestamp: new Date(),
			convId:
		};
		io.to(data.chatId).emit('chat:receive', enriched);
	});

	socket.on('dm:join_room', async (conv_id : number) => {
		const dmRoom  =  'dm:' + String(conv_id);
		socket.join(dmRoom);
	});

	socket.on('dm:create', async(otherUserId: number) => {
		const userId = socket.data.userId;
    	const conversationId = await createDMConversation(userId, otherUserId);
		socket.join(`dm:${conversationId}`);
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT u.username, p.path_img 
			FROM User u
			JOIN Profile p ON p.id_user = u.id
			WHERE u.id = ?`,
			[otherUserId]
		);
		const newConv: DmConversation = {
			conv_id: conversationId,
			otherUserId: otherUserId,
			username: rows[0].username,
			path_img: rows[0].path_img,
			creation: new Date()
		};
		socket.emit('dm:created', newConv );
		const targetSockets = await io.in(`user:${otherUserId}`).fetchSockets();
		targetSockets.forEach(s => s.join(`dm:${conversationId}`));

		const [userARows] = await pool.execute<RowDataPacket[]>(
			`SELECT u.username, p.path_img 
			FROM User u
			JOIN Profile p ON p.id_user = u.id
			WHERE u.id = ?`,
			[userId] // User A's info, since that's the "other user" from B's perspective
		);
		io.to(`user:${otherUserId}`).emit('dm:new', {
			conv_id: conversationId,
			otherUserId: userId,        // from B's perspective, A is the other user
			username: userARows[0].username,
			path_img: userARows[0].path_img,
			creation: new Date()
		});
	});
}