import { Component, OnInit, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SocketService, OnlineUser } from '../../services/socket.service';

interface ChatMessage {
  text: string;
  fromMe: boolean;
  timestamp: number;
}

type Tab = 'online' | 'messages';

@Component({
  selector: 'app-chat-widget',
  imports: [],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
})
export class ChatWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgList') private msgList?: ElementRef<HTMLDivElement>;

  auth          = inject(AuthService);
  socketService = inject(SocketService);

  panelOpen   = signal(false);
  activeTab   = signal<Tab>('online');
  chatWith    = signal<OnlineUser | null>(null);

  conversations = new Map<number, ChatMessage[]>();
  inputText = '';
  private shouldScroll = false;

  get onlineUsers() { return this.socketService.onlineUsers; }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  togglePanel(): void {
    this.panelOpen.update(v => !v);
  }

  openChat(user: OnlineUser): void {
    this.chatWith.set(user);
    if (!this.conversations.has(user.id)) {
      this.conversations.set(user.id, []);
    }
    this.shouldScroll = true;
  }

  backToList(): void {
    this.chatWith.set(null);
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    const user = this.chatWith();
    if (!text || !user) return;

    const msgs = this.conversations.get(user.id) ?? [];
    msgs.push({ text, fromMe: true, timestamp: Date.now() });
    this.conversations.set(user.id, msgs);
    this.inputText = '';
    this.shouldScroll = true;
  }

  getMessages(userId: number): ChatMessage[] {
    return this.conversations.get(userId) ?? [];
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  private scrollToBottom(): void {
    const el = this.msgList?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
