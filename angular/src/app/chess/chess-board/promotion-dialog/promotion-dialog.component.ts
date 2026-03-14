import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-promotion-dialog',
  standalone: true,
  templateUrl: './promotion-dialog.component.html',
  styleUrl: './promotion-dialog.component.scss',
})
export class PromotionDialogComponent {
  pieces = input.required<{ type: string; symbol: string }[]>();
  select = output<string>();
}
