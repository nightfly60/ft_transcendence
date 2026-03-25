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
    public creation : Date,
    public room? : string) {}
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
  gameRoom = signal<string | null>(null); //replace chatId??
  chatId = 0; //same as gameId, used for room name
  conv_id = 0; //conversation id in DB
  messages = signal<Message[]>([]);

  constructor(private socket: SocketService, private http:HttpClient, private chatUi: ChatUiService){
    effect(() => {
      this.messages(); // track signal
      this.panelOpen(); // track signal
      this.dmMessages();
      setTimeout(() => this.scrollToBottom(), 0);
      const targetUserId = this.chatUi.openDmWithUser();
      if (targetUserId !== null) {
        this.panelOpen.set(true);
        this.activeTab.set('dms');
        this.openDm(targetUserId); // find/create conversation with that user
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

    this.socket.onDmConversationCreated((conv: any) => {
      const newConv = new DmConversation(
        conv.conv_id,
        conv.otherUserId,
        conv.username,
        conv.path_img,
        new Date(conv.creation)
      );
      this.dmConversations.update(prev => [...prev, newConv]);
      this.activeDmId.set(conv.conv_id);
      this.dmMessages.set([]);
      });

    this.socket.onNewDmConversation((conv: any) => {
      const newConv = new DmConversation(
          conv.conv_id,
          conv.otherUserId,
          conv.username,
          conv.path_img,
          new Date(conv.creation)
       );
      // add to conversation list
      this.dmConversations.update(prev => [...prev, newConv]);
      // no need to joinDmRoom here since backend already did it server-side
    });

    this.socket.onChatReady(( gameId, conversationId ) => {
      this.chatId = gameId;
      this.conv_id = conversationId;
      //check chat history
      this.http.get<any[]>(`/api/conversation/${this.conv_id}/Message`).subscribe(history => {
        this.messages.set(history.map(m => new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)));
      });
      this.isGameChatActive.set(true);
      this.activeTab.set('game');
      console.log("GAME CHAT READY id = ", this.chatId, "CONV ID =", this.conv_id );
    });

    this.socket.onChatEnd(() => {
      this.conv_id = 0;
      this.chatId = 0;
      this.isGameChatActive.set(false);
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
      
      convs.forEach(conv => {
        this.socket.joinDmRoom(conv.id);});
      
        this.socket.onReceiveMessage(({id, text, senderId, timestamp, conv_id}) => {
        if (conv_id == this.conv_id)
          this.messages.update((prev) => [...prev, new Message(id, text, new Date(timestamp), senderId)]);
        else
          this.dmMessages.update((prev) => [...prev, new Message(id, text, new Date(timestamp), senderId)]);
        if (senderId != this.userId && !this.panelOpen())
          this.newMessages.update((prev) => prev + 1);
      });
    });
}

  openConv(conv_id: number) {
    this.activeDmId.set(conv_id);
    this.http.get<any[]>(`/api/conversation/${conv_id}/Message`)
      .subscribe(history => {
        this.dmMessages.set(history.map(m => 
          new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
        ));
    });
  }

  openDm(otherUserId: number) {
    if (!this.userId || this.userId === otherUserId) {
      console.error('invalid dm target - same user or userId not set yet');
      return;
    }
    const existing = this.dmConversations().find(c =>Number(c.otherUserId) === Number(otherUserId));
    if (existing) {
    this.activeDmId.set(existing.conv_id);
    this.http.get<any[]>(`/api/conversation/${existing.conv_id}/Message`)
      .subscribe(history => {
        this.dmMessages.set(history.map(m => 
          new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
        ));
      });
  } else {
    this.socket.createDMConversation(otherUserId);

    // this.http.post<DmConversation>(`/api/conversation/dm`, {
    // userId1: this.userId,
    // userId2: otherUserId
    // })  .subscribe(response => {
    //   const newConv = new DmConversation (
    //     response.conv_id,
    //     response.otherUserId,
    //     response.username,
    //     response.path_img,
    //     new Date(response.creation),
    //   )
    // this.socket.joinDmRoom(newConv.conv_id);
    // this.socket.notifyUser(newConv.conv_id, newConv.otherUserId);
    // this.dmConversations.update(prev => [...prev, newConv]);
    // this.activeDmId.set(newConv.conv_id);
    // this.dmMessages.set([]);
    //   });
    }
  }

  sendMessage() : void { //sanitize/check special characters against href ?
    if (this.message.trim()) //add length check, max limit = ?
    {
      this.message = this.message.trim();
      let room: string;
      let id: number;
      if (this.activeDmId()) {
        room = 'dm:' + String(this.activeDmId());
        id = Number(this.activeDmId());
      }
      else {
        room  = String(this.chatId);
        id = this.conv_id;
      }
      this.socket.sendMessage(room, this.message, id);
      this.message = '';
    }
  }
}
