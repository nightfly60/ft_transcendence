import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-move-history',
  standalone: true,
  templateUrl: './move-history.component.html',
  styleUrl: './move-history.component.scss',
})
export class MoveHistoryComponent {
  pairs   = input<{ n: number; w: string; b: string }[]>([]);
  isEmpty = input<boolean>(true);
  reset   = output<void>();
}
