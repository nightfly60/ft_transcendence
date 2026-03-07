import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../services/socket.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

interface Message {
  text: string;
  type: 'incoming' | 'outgoing';
  timestamp: string;
}

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss',
})

export class ChatBox implements AfterViewChecked { //pretty sure this does nothing...
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
    inputText = '';
    isFocused = false;
  
    messages: Message[] = [
      { text: "Hey! How's it going?", type: 'incoming', timestamp: '10:42 AM' },
      { text: 'Pretty good! Just working on a project.', type: 'outgoing', timestamp: '10:43 AM' },
      { text: 'Nice, what kind of project?', type: 'incoming', timestamp: '10:44 AM' },
    ];
  
    ngAfterViewChecked(): void {
      this.scrollToBottom();
    }
  
    sendMessage(): void {
      const text = this.inputText.trim();
      if (!text) return;
  
      this.messages.push({
        text,
        type: 'outgoing',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
  
      this.inputText = '';
    }
  
    private scrollToBottom(): void {
      try {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      } catch (e) {}
    }
}

// export class NewChatBox implements OnInit {
//   gameId = 'partie-1'; //placeholder
//   user$!: Observable<User>;
  
//   constructor(private socket: SocketService, private http: HttpClient) {} // ?
//   ngOnInit() {
    
//   }
// }
