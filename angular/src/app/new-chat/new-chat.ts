import { Component, OnInit, ViewChild, ElementRef, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

class Message {
 constructor( public id: number,
              public message: string,
              public timestamp: Date,
              public senderId: number) {}
}

class DmConversation {
  constructor(public id: number,
    public username : string, //name of other username
    public path_img: string,
    public creation : Date) {}
}

type Tab = 'dms' | 'game';

@Component({
  selector: 'app-new-chat',
  imports: [FormsModule],
  templateUrl: './new-chat.html',
  styleUrl: './new-chat.scss',
})
export class NewChat implements OnInit{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  //shared
    userId = 0;                 //user id of current socket
    panelOpen   = signal(false);
    newMessages = signal(0);
    message = ''
    activeTab   = signal<Tab>('dms');
    auth        = inject(AuthService);
    isGameChatActive = signal(false);

  //dm chat
    dmConversations = signal<DmConversation[]>([]); //list of user dm conversations
    activeDmId = signal<number | null>(null);       //track current open conversation + room name
    dmMessages = signal<Message[]>([]);             //track current conversation messages
  
  //game chat
  gameRoom = signal<string | null>(null); //replace chatId
  chatID = '';
  conversationId = 0;
  messages = signal<Message[]>([]);

  constructor(private socket: SocketService, private http:HttpClient){
    effect(() => {
      this.messages(); // track signal
      this.panelOpen(); // track signal
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngOnInit(): void {
    this.socket.getUser();
    this.socket.onUserFound((userId) => {
      this.userId = userId;
      console.log("USER ID = ", this.userId);
      this.loadDmConversations();
    });
  }

  togglePanel(): void {
    this.panelOpen.update(v => !v);
    this.newMessages.update(() => 0);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  backToList(): void {
    this.activeDmId.set(null);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  loadDmConversations() { //check, what is inside a DM conversation?
  this.http.get<DmConversation[]>(`/api/conversation/user/${this.userId}/conversations`)
    .subscribe(convs => this.dmConversations.set(convs));
  }

  openDm(conversationId: number) {
    this.activeDmId.set(conversationId);
    this.http.get<any[]>(`/api/conversation/${conversationId}/Message`)
      .subscribe(history => {
        this.dmMessages.set(history.map(m => new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)));
      });
  }

  sendMessage() {}
}
