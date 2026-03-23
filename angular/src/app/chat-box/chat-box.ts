import { Component, OnInit, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';

class Message {
 constructor( public message: string,
              public timestamp: Date,
              public senderId: number,
              public id?: number) {}
}

class DmConversation {
  constructor(public user2 : string,
    public creation : Date,
    public id?: number) {}
}

type Tab = 'dms' | 'game';

@Component({
  selector: 'app-chat-box',
  imports: [FormsModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss',
})

export class ChatBox implements OnInit{
   @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  //shared
  userId = 0;
  panelOpen   = signal(false);
  newMessages = signal(0);
  message = ''
  activeTab   = signal<Tab>('dms');
  
  //game chat
  gameRoom = signal<string | null>(null); //replace chatId
  chatID = '';
  conversationId = 0;
  messages = signal<Message[]>([]);

  //dm chat
  dmConversations = signal<DmConversation[]>([]); //list of user dm conversations
  activeDmId = signal<number | null>(null);       //track current open conversation + room name
  dmMessages = signal<Message[]>([]);             //track current conversation messages
  
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  constructor(private socket: SocketService, private http:HttpClient) {
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
      this.loadDmConversations();
    });
    //only look for chat if game_ready event 
    this.socket.findChat(); //get chat id from game
    this.socket.onChatReady(( chatId, userId, conversationId ) => {
        this.chatID = chatId;
        this.userId = userId;
        this.conversationId = conversationId;
        //check chat history
        this.http.get<any[]>(`/api/conversation/${this.conversationId}/Message`).subscribe(history => {
          this.messages.set(history.map(m => new Message(m.content, new Date(m.sent_at), m.id_sender, m.id)));
        });
    });
      

    this.socket.onReceiveMessage(({id, text, senderId, timestamp}) => { //share
      const alreadyExists = this.messages().some(m => m.id === id);
      if (!alreadyExists) {
        this.messages.update((prev) => [...prev, new Message(text, new Date(timestamp), senderId, id)]);
      }
      if (senderId != this.userId && !this.panelOpen())
          this.newMessages.update((prev) => prev + 1);
    });
  }

  sendMessage() : void { //sanitize/check special characters against href ?
    if (this.message.trim()) //add length check, max limit = ?
    {
      this.message = this.message.trim();
      this.socket.sendMessage(this.chatID, this.message, 3);
      this.message = '';
    }
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

  loadDmConversations() {
  this.http.get<any[]>(`/conversation/${this.userId}/conversations`)
    .subscribe(convs => this.dmConversations.set(convs));
  }

  openDm(conversationId: number) {
    this.activeDmId.set(conversationId);
    this.http.get<any[]>(`/conversation/${conversationId}/Message`)
      .subscribe(history => {
        this.dmMessages.set(history.map(m => new Message(m.content, new Date(m.sent_at), m.id_sender, m.id)));
      });
  }
}
