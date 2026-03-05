import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  type: 'incoming' | 'outgoing';
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-window">

      <!-- Header -->
      <div class="chat-header">
        <div class="avatar"></div>
        <div class="header-info">
          <div class="name">Alex</div>
          <div class="status">
            <span class="status-dot"></span> Online
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="chat-messages" #messagesContainer>
        <div
          *ngFor="let message of messages"
          class="message"
          [class.incoming]="message.type === 'incoming'"
          [class.outgoing]="message.type === 'outgoing'"
        >
          <div class="bubble">{{ message.text }}</div>
          <div class="timestamp">{{ message.timestamp }}</div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <div class="input-wrap" [class.focused]="isFocused">
          <input
            type="text"
            class="chat-input"
            placeholder="Type a message…"
            [(ngModel)]="inputText"
            (keydown.enter)="sendMessage()"
            (focus)="isFocused = true"
            (blur)="isFocused = false"
          />
        </div>
        <button class="send-btn" (click)="sendMessage()" title="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0f0f0f;
      font-family: 'DM Sans', sans-serif;
    }

    .chat-window {
      width: 420px;
      height: 600px;
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 32px 64px rgba(0,0,0,0.5);
    }

    /* Header */
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid #222;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6ee7b7, #3b82f6);
      flex-shrink: 0;
    }

    .header-info .name {
      font-size: 14px;
      font-weight: 500;
      color: #e8e8e8;
    }

    .header-info .status {
      font-size: 12px;
      color: #555;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
    }

    /* Messages */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: #2a2a2a transparent;
    }

    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
    .chat-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

    .message {
      max-width: 75%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: fadeUp 0.2s ease;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .message.incoming { align-self: flex-start; }
    .message.outgoing { align-self: flex-end; }

    .bubble {
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
    }

    .incoming .bubble {
      background: #222;
      color: #d4d4d4;
      border-bottom-left-radius: 4px;
    }

    .outgoing .bubble {
      background: #3b82f6;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .timestamp {
      font-size: 11px;
      color: #444;
      font-family: 'DM Mono', monospace;
    }

    .incoming .timestamp { padding-left: 4px; }
    .outgoing .timestamp { text-align: right; padding-right: 4px; }

    /* Input */
    .chat-input-area {
      padding: 14px 16px;
      border-top: 1px solid #222;
      display: flex;
      gap: 10px;
      align-items: center;
      flex-shrink: 0;
    }

    .input-wrap {
      flex: 1;
      background: #1e1e1e;
      border: 1px solid #2e2e2e;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 14px;
      transition: border-color 0.15s;
    }

    .input-wrap.focused {
      border-color: #3b82f6;
    }

    .chat-input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: #e0e0e0;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      padding: 12px 0;
    }

    .chat-input::placeholder { color: #444; }

    .send-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #3b82f6;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: white;
      transition: background 0.15s, transform 0.1s;
    }

    .send-btn:hover { background: #2563eb; }
    .send-btn:active { transform: scale(0.94); }

    .send-btn svg {
      width: 18px;
      height: 18px;
    }
  `]
})
export class ChatComponent implements AfterViewChecked {
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
