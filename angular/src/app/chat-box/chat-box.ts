import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
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
  imports: [FormsModule, DatePipe],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss',
})

export class ChatBox implements OnInit, AfterViewChecked{
   @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  chatID = '';
  conversationId = 0;
  userId = 0; //replace with user object?
  message = '';
  messages = signal<Message[]>([]);

    constructor(private socket: SocketService, private http:HttpClient) {}

    ngOnInit(): void {
      this.socket.findChat(); //get chat id from db or from game
      this.socket.onChatReady(( chatId, userId, conversationId ) => {
          this.chatID = chatId;
          this.userId = userId;
          this.conversationId = conversationId;
      });

      this.http.get<any[]>(`/api/Conversation/${this.conversationId}/Message`).subscribe(history => {
      this.messages.set(history.map(m => new Message(m.content, new Date(m.sent_at), m.id_sender, m.id)));
      });

      this.socket.onReceiveMessage(({id, text, senderId, timestamp}) => {
        const alreadyExists = this.messages().some(m => m.id === id);
        if (!alreadyExists) {
          this.messages.update((prev) => [...prev, new Message(text, new Date(timestamp), senderId, id)]);
        }
      });
    }

  
  ngAfterViewChecked() {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }

  sendMessage() : void {
    if (this.message.trim()) //add length check
    {
      this.message = this.message.trim();
      this.socket.sendMessage(this.chatID, this.message);
      this.message = '';
    }
  }
}
