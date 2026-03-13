import { Component, OnInit, OnDestroy, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface OnlineUser {
  id: number;
  username: string;
  path_img: string | null;
}

interface ChatMessage {
  text: string;
  fromMe: boolean;
  timestamp: number;
}

type Tab = 'online' | 'amis' | 'messages';

@Component({
  selector: 'app-chat-widget',
  imports: [],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('msgList') private msgList?: ElementRef<HTMLDivElement>;

  auth       = inject(AuthService);
  private http = inject(HttpClient);

  panelOpen   = signal(false);
  activeTab   = signal<Tab>('online');
  onlineUsers = signal<OnlineUser[]>([]);
  chatWith    = signal<OnlineUser | null>(null);

  conversations = new Map<number, ChatMessage[]>();
  inputText = '';
  private shouldScroll = false;

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) return;
    this.fetchOnlineUsers();
    this.pollInterval = setInterval(() => this.fetchOnlineUsers(), 15_000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  togglePanel(): void {
    this.panelOpen.update(v => !v);
    if (this.panelOpen()) this.fetchOnlineUsers();
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

  private fetchOnlineUsers(): void {
    this.http.get<{ users: OnlineUser[] }>('/api/users/online').subscribe({
      next: res => this.onlineUsers.set(res.users),
      error: () => {},
    });
  }

  private scrollToBottom(): void {
    const el = this.msgList?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
