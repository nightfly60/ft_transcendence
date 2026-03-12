import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SocketService } from '../services/socket.service';

class Message {
 constructor( public message: string,
              public timestamp: Date,
              public sender: string) {}
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
  username = ''; //not sure
  message = '';
  messages = signal<Message[]>([]);

    constructor(private socket: SocketService) {}

    ngOnInit(): void {
      this.socket.findChat(); //get chat id from db or from game
      this.socket.onChatReady(( chatId ) => {  //is chat id really string or is it number
          this.chatID = chatId;
          console.log('Chat ready');
      });

      this.socket.onReceiveMessage(({text, sender, timestamp}) => {
          this.messages.update((prev : Message[]) => [...prev, new Message(text, new Date(timestamp), sender)]);
          console.log('message received');
        });
      //need to check if sender = socket.data.user to render incoming or outgoing -> in html?
    }

  
  ngAfterViewChecked() {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }

  sendMessage() : void {
    if (this.message.trim())
    {
      this.message = this.message.trim();
      this.socket.sendMessage(this.chatID, this.message);
      console.log('message sent');
      this.message = '';
    }
  }
}
