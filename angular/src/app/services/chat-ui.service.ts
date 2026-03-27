import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatUiService {
  openDmWithUser = signal<number | null>(null);

  requestDm(targetUserId: number) {
    this.openDmWithUser.set(targetUserId);
  }
}