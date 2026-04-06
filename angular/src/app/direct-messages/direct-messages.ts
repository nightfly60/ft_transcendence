import { Component, OnInit, signal, effect, inject, ElementRef, ViewChild } from "@angular/core";
import { SocketService } from '../services/socket.service';
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Route, Router } from "@angular/router";

class Message {
 constructor( public id: number,                  //id du message dans la database
              public message: string,             //contenu du message
              public timestamp: Date,             //heure d'envoi
              public senderId: number) {}         //id de l'utilisateur qui a envoye le message
}

class DmConversation {
  constructor(public conversationId: number,    //id de la conversation dans la db
    public otherUserId : number,                //id de l'utilisateur destinataire de la conversation
    public username : string,                   //nom de l'utilisateur destinataire
    public path_img: string,                    //photo de profil du destinataire
    public creation : Date) {}                  //date de creation de la conversation
}

@Component({
  selector: "app-direct-messages",
  imports: [FormsModule],
  templateUrl: "./direct-messages.html",
  styleUrl: "./direct-messages.scss",
})
export class DirectMessages implements OnInit{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  userId = 0;                                         //id de l'utilisateur
  input ='';
  dmConversations = signal<DmConversation[]>([]);     //liste des conversations du joueur
  activeDmId = signal<number | null>(null);           //id de la conversation en cours
  messages = signal<Message[]>([]);                   //liste des messages de la conversation en cours
  auth = inject(AuthService);

  cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));
  
  constructor(  private socket: SocketService, private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 0);
    })
  }

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.loadDmConversations().then(() => {                                   //recupere les conversations de l'utilisateur
      const targetUserId = this.route.snapshot.queryParamMap.get('userId');   //verifie si creation de conversation est en cours a partir du bouton sm sur le profil
      if (targetUserId) {
        this.openDm(Number(targetUserId));
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });

    this.socket.onDmConversationCreated((conv: DmConversation) => {           //l'utilisateur a cree une conversation
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

    this.socket.onNewDmConversation((conv: DmConversation) => {               //l'utilisateur a ete ajoute a une conversation
      const newConv = new DmConversation(
        conv.conversationId,
        conv.otherUserId,
        conv.username,
        conv.path_img,
        new Date(conv.creation)
      );
      this.dmConversations.update(prev => [...prev, newConv]);
    });

    this.socket.onReceiveMessage(({id, text, senderId, timestamp, conversationId}) => {   //message recu
      if (conversationId == this.activeDmId())
        this.messages.update((prev) => [...prev, new Message(id, text, new Date(timestamp), senderId)]);
    });
  }

  //cherche les conversations de l'utilisateur dans la db et rajoute l'utilisateur aux "rooms" de chacune
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

  //cree ou ouvre une conversation
  openDm(otherUserId: number) { 
    if (!this.userId || this.userId === otherUserId) {
    //   console.error('invalid dm target - same user or userId not set yet');
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

  //ouvre la conversation selectionee
  openConv(conversationId: number) {
    this.activeDmId.set(conversationId);
    this.http.get<any[]>(`/api/conversation/${conversationId}/Message`)
      .subscribe(history => {
        this.messages.set(history.map(m => 
          new Message(m.id, m.content, new Date(m.sent_at), m.id_sender)
        ));
    });
  }

  //envoi message
  sendMessage() : void {
    if (this.input.trim())
    {
      this.input = this.input.trim();
      const room = 'dm:' + String(this.activeDmId());
      const id = Number(this.activeDmId());
      this.socket.sendMessage(room, this.input, id);
      this.input = '';
    }
  }

  //descend automatiquement vers le message le plus recent
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }
}