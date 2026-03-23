import { Component, OnInit, ViewChild, ElementRef, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ChatUiService } from '../services/chat-ui.service';

class Message {
 constructor( public id: number,
              public message: string,
              public timestamp: Date,
              public senderId: number) {}
}

class DmConversation {
  constructor(public conv_id: number,
    public otherUserId : number,
    public username : string,
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

  constructor(private socket: SocketService, private http:HttpClient, private chatUi: ChatUiService){
    effect(() => {
      this.messages(); // track signal
      this.panelOpen(); // track signal
      setTimeout(() => this.scrollToBottom(), 0);
      const targetUserId = this.chatUi.openDmWithUser();
      if (targetUserId !== null) {
        this.panelOpen.set(true);
        this.activeTab.set('dms');
        this.openDm(targetUserId); // find/create conversation with that user, not good
        this.chatUi.openDmWithUser.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.socket.getUser();
    this.socket.onUserFound((userId) => {
      this.userId = userId;
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

  loadDmConversations() {
  this.http.get<any[]>(`/api/conversation/user/${this.userId}/conversations`)
    .subscribe(convs => {
      this.dmConversations.set(convs.map(c => new DmConversation(
        c.id,
        c.otherUserId,
        c.username,
        c.path_img,
        new Date(c.created_at)
      )));
    });
}

  openDm(otherUserId: number) {
    const existing = this.dmConversations().find(c =>
      Number(c.otherUserId) === Number(otherUserId));
    console.log('existing:', existing); // is this undefined on second click?
    console.log('dmConversations:', this.dmConversations());
    if (existing) {
    // conversation exists, just open it
    this.activeDmId.set(existing.conv_id);
    this.http.get<any[]>(`/api/conversation/${existing.conv_id}/Message`)
      .subscribe(history => {
        this.dmMessages.set(history.map(m => 
          new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
        ));
      });
  } else {
    // no existing conversation, create a new one
    this.http.post<DmConversation>(`/api/conversation/dm`, {
    userId1: this.userId,
    userId2: otherUserId
    })  .subscribe(response => {
      const newConv = new DmConversation (
        response.conv_id,
        response.otherUserId,
        response.username,
        response.path_img,
        new Date(response.creation)
      )
    this.dmConversations.update(prev => [...prev, newConv]);
    this.activeDmId.set(newConv.conv_id);
    this.dmMessages.set([]);
      });
    }
  }

  sendMessage() {}
}
