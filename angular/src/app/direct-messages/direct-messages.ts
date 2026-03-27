import { Component, OnInit, signal, effect, inject, ElementRef, ViewChild } from "@angular/core";
import { SocketService } from '../services/socket.service';
import { ChatUiService } from "../services/chat-ui.service";
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../services/auth.service'; //need to require auth to access

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

@Component({
  selector: "app-direct-messages",
  imports: [],
  templateUrl: "./direct-messages.html",
  styleUrl: "./direct-messages.scss",
})
export class DirectMessages implements OnInit{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  userId = 0;
  input ='';
  dmConversations = signal<DmConversation[]>([]);   //list of user's dm conversations
  activeDmId = signal<number | null>(null);        // id of current open conversation
  messages = signal<Message[]>([]);
  auth = inject(AuthService);
  
  constructor(private socket: SocketService, private http: HttpClient, private chatUi: ChatUiService) {
    effect(() => {
      this.messages();
      const targetUserId = this.chatUi.openDmWithUser();
      if (targetUserId != null) {
        this.openDm(targetUserId);
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

    this.socket.onDmConversationCreated((conv: any) => { //user stared new dm conversation
      const newConv = new DmConversation(
        conv.conv_id,
        conv.otherUserId,
        conv.username,
        conv.path_img,
        new Date(conv.creation)
      );
      this.dmConversations.update(prev => [...prev, newConv]);
      this.activeDmId.set(conv.conv_id);
      this.messages.set([]);
    });

    this.socket.onNewDmConversation((conv: any) => { //user was added to new dm conversation
      const newConv = new DmConversation(
        conv.conv_id,
        conv.otherUserId,
        conv.username,
        conv.path_img,
        new Date(conv.creation)
      );
      this.dmConversations.update(prev => [...prev, newConv]);
    });

    this.socket.onReceiveMessage(({id, text, senderId, timestamp, convId}) => {
      if (convId == this.activeDmId())
        this.messages.update((prev) => [...prev, new Message(id, text, new Date(timestamp), senderId)]);
      // else show notification
    });
  }

  //find user's dm conversations, load and add them to a room for each conversation
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
      });
  }

  openDm(otherUserId: number) { //create new dm conversation
    if (!this.userId || this.userId === otherUserId) {
      console.error('invalid dm target - same user or userId not set yet');
      return;
    }
    const existing = this.dmConversations().find(c =>Number(c.otherUserId) === Number(otherUserId));
    if (existing) {
      this.activeDmId.set(existing.conv_id);
      this.http.get<any[]>(`/api/conversation/${existing.conv_id}/Message`)
        .subscribe(history => {
          this.messages.set(history.map(m => 
            new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
          ));
        });
    } else {
      this.socket.createDMConversation(otherUserId);
    }
}

  openConv(conv_id: number) { //open conv after clicking in the list
    this.activeDmId.set(conv_id);
    this.http.get<any[]>(`/api/conversation/${conv_id}/Message`)
      .subscribe(history => {
        this.messages.set(history.map(m => 
          new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
        ));
    });
  }

  sendMessage() : void { //add conversation Id
    if (this.input.trim()) //add length check, max limit = ?
    {
      this.input = this.input.trim();
      const room = 'dm:' + String(this.activeDmId());
      this.socket.sendMessage(room, this.input);
      this.input = '';
    }
  }
}