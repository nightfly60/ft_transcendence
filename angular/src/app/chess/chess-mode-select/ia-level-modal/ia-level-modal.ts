import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IaLevel = 'novice' | 'intermediare' | 'fort' | 'expert';

@Component({
	selector: 'app-ia-level-modal',
	imports: [],
	templateUrl: './ia-level-modal.html',
	styleUrl: './ia-level-modal.scss',
})

export class IaLevelModal {
	levelSelected = output<IaLevel>();
	cancel = output<void>();

	selectedLevel: IaLevel | null = null;

	levels: { key: IaLevel; label: string; icon: string; desc: string }[] = [
		{ key: 'novice',       label: 'Joueur occasionnel', icon: '🐣', desc: 'Idéal pour apprendre' },
		{ key: 'intermediare', label: 'Amateur',            icon: '🌱', desc: 'Attention, peut te surprendre' },
		{ key: 'fort',         label: 'Joueur club',        icon: '🎓', desc: 'Prépare-toi à un vrai défi' },
		{ key: 'expert',       label: 'Maître',             icon: '🎯', desc: 'Que pour les experts' },
	];

	confirm() {
		if (this.selectedLevel) this.levelSelected.emit(this.selectedLevel);
	}

	onOverlayClick(event: MouseEvent) {
		if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
		this.cancel.emit();
		}
	}
}
