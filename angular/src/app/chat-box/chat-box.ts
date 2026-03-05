import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ChatBox implements AfterViewChecked {
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
  
    // sendMessage(): void {
    //   const text = this.inputText.trim();
    //   if (!text) return;
  
    //   this.messages.push({
    //     text,
    //     type: 'outgoing',
    //     timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    //   });
  
    //   this.inputText = '';
    // }
  
    private scrollToBottom(): void {
      try {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      } catch (e) {}
    }
}
