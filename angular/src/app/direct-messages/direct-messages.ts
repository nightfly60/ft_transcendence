import { Component, OnInit, signal, effect, inject, ElementRef, ViewChild } from "@angular/core";
import { SocketService } from '../services/socket.service';
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../services/auth.service'; //need to require auth to access
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Route, Router } from "@angular/router";

class Message {
 constructor( public id: number,
              public message: string,
              public timestamp: Date,
              public senderId: number) {}
}

class DmConversation {
  constructor(public conversationId: number,
    public otherUserId : number,
    public username : string,
    public path_img: string,
    public creation : Date,
    public room? : string) {}
}

@Component({
  selector: "app-direct-messages",
  imports: [FormsModule],
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

  cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));
  
  constructor(  private socket: SocketService,
                private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router) {
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 0);
    })
                }

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.loadDmConversations().then(() => {
      const targetUserId = this.route.snapshot.queryParamMap.get('userId');
      if (targetUserId) {
        this.openDm(Number(targetUserId));
        // clean up the url
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });

    this.socket.onDmConversationCreated((conv: DmConversation) => { //user started new dm conversation
      const newConv = new DmConversation(
        conv.conversationId,
        conv.otherUserId,
        conv.username,
        conv.path_img,
        new Date(conv.creation)
      );
      this.dmConversations.update(prev => [...prev, newConv]);
      this.activeDmId.set(conv.conversationId);
      this.messages.set([]);
    });

    this.socket.onNewDmConversation((conv: DmConversation) => { //user was added to new dm conversation
      const newConv = new DmConversation(
        conv.conversationId,
        conv.otherUserId,
        conv.username,
        conv.path_img,
        new Date(conv.creation)
      );
      this.dmConversations.update(prev => [...prev, newConv]);
    });

    this.socket.onReceiveMessage(({id, text, senderId, timestamp, conversationId}) => {
      if (conversationId == this.activeDmId())
        this.messages.update((prev) => [...prev, new Message(id, text, new Date(timestamp), senderId)]);
      // else show notification
    });
  }

  //find user's dm conversations, load and add them to a room for each conversation
  loadDmConversations(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any[]>(`/api/conversation/user/${this.userId}/conversations`)
        .subscribe(convs => {
          this.dmConversations.set(convs.map(c => new DmConversation(
            c.id,
            c.otherUserId,
            c.username,
            c.path_img,
            new Date(c.created_at)
          )));
          convs.forEach(conv => this.socket.joinDmRoom(conv.id));
          resolve(); // signal that loading is done
        });
    });
  }

  openDm(otherUserId: number) { //create new dm conversation
    if (!this.userId || this.userId === otherUserId) {
      console.error('invalid dm target - same user or userId not set yet');
      return;
    }
    const existing = this.dmConversations().find(c =>Number(c.otherUserId) === Number(otherUserId));
    if (existing) {
      this.activeDmId.set(existing.conversationId);
      this.http.get<any[]>(`/api/conversation/${existing.conversationId}/Message`)
        .subscribe(history => {
          this.messages.set(history.map(m => 
            new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
          ));
        });
    } else {
      this.socket.createDMConversation(otherUserId);
    }
}

  openConv(conversationId: number) { //open conv after clicking in the list
    this.activeDmId.set(conversationId);
    this.http.get<any[]>(`/api/conversation/${conversationId}/Message`)
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
      const id = Number(this.activeDmId());
      this.socket.sendMessage(room, this.input, id);
      this.input = '';
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }
}