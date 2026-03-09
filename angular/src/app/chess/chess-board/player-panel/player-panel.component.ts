import { Component, input } from '@angular/core';

@Component({
  selector: 'app-player-panel',
  standalone: true,
  templateUrl: './player-panel.component.html',
  styleUrl: './player-panel.component.scss',
})
export class PlayerPanelComponent {
  icon     = input.required<string>();
  name     = input.required<string>();
  active   = input.required<boolean>();
  captured = input<string>('');
}
