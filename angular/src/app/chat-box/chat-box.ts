import { Component, OnInit, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';

class Message {
 constructor( public message: string,          //contenu du message
              public timestamp: Date,          //date d'envoi
              public senderId: number,         //id de l'utilisateur qui a envoye le message
              public id?: number) {}           //id du message dans la db
}

@Component({
  selector: 'app-chat-box',
  imports: [FormsModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss',
})

export class ChatBox implements OnInit{
   @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  chatID = '';                                        //nom de la "room" de la partie en cours = a gameId
  conversationId = 0;                                 //id du de la conversation dans la database
  userId = 0;                                         //id de l'utilisateur
  message = '';
  messages = signal<Message[]>([]);                   //liste des messages
  panelOpen   = signal(false);                        //signal pour ouvrir et fermer le widget
  newMessages = signal(0);                            //compteur de notifications

  //descend automatiquement vers les messages les plus recents
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  constructor(private socket: SocketService, private http:HttpClient) {
    effect(() => {
      this.messages();
      this.panelOpen();
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngOnInit(): void {
    this.socket.findChat();                                         //recupere gameId/chatId dans la socket
    this.socket.onChatReady(( chatId, userId, conversationId ) => {
        this.chatID = chatId;
        this.userId = userId;
        this.conversationId = conversationId;
        this.http.get<any[]>(`/api/conversation/${this.conversationId}/Message`).subscribe(history => {  //recupere l'historique du chat si la partie est toujours en cours
          this.messages.set(history.map(m => new Message(m.content, new Date(m.sent_at), m.id_sender, m.id)));
        });
    });   

    this.socket.onReceiveMessage(({id, text, senderId, timestamp}) => { //message recu
      const alreadyExists = this.messages().some(m => m.id === id);
      if (!alreadyExists)
        this.messages.update((prev) => [...prev, new Message(text, new Date(timestamp), senderId, id)]);
      if (senderId != this.userId && !this.panelOpen())
        this.newMessages.update((prev) => prev + 1);
    });
  }

  //envoi message
  sendMessage() : void {
    if (this.message.trim())
    {
      this.message = this.message.trim();
      this.socket.sendMessage(this.chatID, this.message, this.conversationId);
      this.message = '';
    }
  }

  //ouvre et ferme le widget
  togglePanel(): void {
    this.panelOpen.update(v => !v);
    this.newMessages.set(0);
  }
}
