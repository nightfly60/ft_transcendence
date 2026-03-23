import { send } from 'process';
import { Server, Socket } from 'socket.io';
import { createGameConversation } from '../services/conversation.service';
import pool from '../db.js';
import { RowDataPacket } from "mysql2";
import { saveMessage } from '../services/message.service';

 interface ChatMessage {
 	id:			number;
	text:		string;
 	senderId:	number;
 	timestamp:	Date;
 }

export function registerChatEvents(io: Server, socket: Socket) {
	socket.on('chat:get_user', async () => {
		socket.emit('chat:found_user', socket.data.userId);
	});
	
	socket.on('dm:join_room', async (conv_id : number) => {
		console.log('BACKEND JOIN');
		const dmRoom  =  'dm:' + String(conv_id);
		console.log ("DM ROOM NAME = ", dmRoom);
		socket.join(dmRoom);
	});
	
	socket.on('chat:find', async () => {
		const chatId = socket.data.id_game;
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT id_conversation FROM Game WHERE id = ?`,
			[Number(chatId)]
  		);
		socket.data.conversationId = rows[0].id_conversation;
		socket.join(chatId); //what if no gameId yet?
		//socket.join(`game_${gameId}`); better room name proposition
		socket.emit('chat:ready', chatId, socket.data.userId, socket.data.conversationId);
	});

	socket.on('chat:send', async (data: { chatId: string, message: string, conv_id: number}) => //need rework for dms
	{
		const userId: number = socket.data.userId;
		const messageId = await saveMessage(data.conv_id, userId, data.message);
		const enriched: ChatMessage = {
			id: messageId,
			text: data.message,
			senderId: userId,
			timestamp: new Date()
		};
		console.log("ROOM CHAT =", data.chatId);
		//chat content moderation happens here
		io.to(data.chatId).emit('chat:receive', enriched, data.conv_id);
	});

	socket.on('dm:send', async (data: {dmId: string, message: string}) =>
	{
		const userId: number = socket.data.userId;
		const messageId = await saveMessage(socket.data.conversationId, userId, data.message);
		const enriched: ChatMessage = {
			id: messageId,
			text: data.message,
			senderId: userId,
			timestamp: new Date()
		};
		io.to(data.dmId).emit('dm:receive');
	});
}