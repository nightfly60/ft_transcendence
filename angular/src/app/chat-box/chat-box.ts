import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
  username = ''; //?
  message = '';
  messages: Message[] = [];

    constructor(private socket: SocketService) {}

    ngOnInit(): void {
      this.socket.findChat(); //get chat id from db or from game

      this.socket.onChatReady(( chatId ) => {  //is chat id really string or is it number
          this.chatID = chatId;
      });

      this.socket.onReceiveMessage(({text, sender, timestamp}) => {
        this.messages.push(new Message (text, timestamp, sender));
      });
      //need to check if sender = socket.data.user to render incoming or outgoing
    }
  
  ngAfterViewChecked() {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }

  // sendMessage() : void {
  //   if (this.message.trim())
  //   {
  //     this.message = this.message.trim();
  //     this.messages.push(new Message(this.message, new Date(), this.username));
  //     //emit event to actually send message
  //     this.message = '';
  //     //this.username = '';
  //   }
  // }

  sendMessage() : void {
    if (this.message.trim())
    {
      this.message = this.message.trim();
      this.socket.sendMessage(this.chatID, this.message);
      this.message = '';
    }
  }
}
