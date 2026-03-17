import { Component, OnInit, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';

class Message {
 constructor( public message: string,
              public timestamp: Date,
              public senderId: number,
              public id?: number) {}
}

@Component({
  selector: 'app-chat-box',
  imports: [FormsModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss',
})

export class ChatBox implements OnInit{
   @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  chatID = '';
  conversationId = 0;
  userId = 0; //replace with user object?
  message = '';
  messages = signal<Message[]>([]);
  panelOpen   = signal(false);
  newMessages = signal(0);
  
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  constructor(private socket: SocketService, private http:HttpClient) {
    effect(() => {
      this.messages(); // track signal
      this.panelOpen(); // track signal
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngOnInit(): void {
    this.socket.findChat(); //get chat id from game
    this.socket.onChatReady(( chatId, userId, conversationId ) => {
        this.chatID = chatId;
        this.userId = userId;
        this.conversationId = conversationId;
        //check chat history
        this.http.get<any[]>(`/api/conversation/${this.conversationId}/Message`).subscribe(history => {
          this.messages.set(history.map(m => new Message(m.content, new Date(m.sent_at), m.id_sender, m.id)));
        });
    });
      

    this.socket.onReceiveMessage(({id, text, senderId, timestamp}) => {
      const alreadyExists = this.messages().some(m => m.id === id);
      if (!alreadyExists) {
        this.messages.update((prev) => [...prev, new Message(text, new Date(timestamp), senderId, id)]);
      }
      if (senderId != this.userId && !this.panelOpen())
          this.newMessages.update((prev) => prev + 1);
    });
  }

  sendMessage() : void {
    if (this.message.trim()) //add length check, max limit = ?
    {
      this.message = this.message.trim();
      this.socket.sendMessage(this.chatID, this.message);
      this.message = '';
    }
  }

  togglePanel(): void {
    this.panelOpen.update(v => !v);
    this.newMessages.update(() => 0);
  }

  
}
