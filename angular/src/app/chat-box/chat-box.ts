import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

class Message {
 constructor( public message: string,
              public timestamp: Date,
              public username: string) {}
}

@Component({
  selector: 'app-chat-box',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss',
})

export class ChatBox implements AfterViewChecked{
   @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  //socket: any;
  username = '';
  message = '';
  messages: Message[] = [];

  ngAfterViewChecked() {
    this.messagesContainer.nativeElement.scrollTop = 
      this.messagesContainer.nativeElement.scrollHeight;
  }

  sendMessage() : void {
    if (this.message.trim())
    {
      this.message = this.message.trim();
      this.messages.push(new Message(this.message, new Date(), this.username));
      //emit event to actually send message
      this.message = '';
      //this.username = '';
    }
  }
}
