import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, Player } from '../../services/game.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent implements AfterViewInit {
  @ViewChildren('playerNameInput') playerNameInputs!: QueryList<ElementRef>;

  constructor(public gameService: GameService) {}

  ngAfterViewInit() {
    // Focus on input when editing starts
    this.playerNameInputs.changes.subscribe((inputs: QueryList<ElementRef>) => {
      if (inputs.length > 0) {
        setTimeout(() => inputs.first.nativeElement.focus(), 0);
      }
    });
  }

  // Delegate methods to service
  incrementTeamAScore() {
    this.gameService.incrementTeamAScore();
  }

  incrementTeamBScore() {
    this.gameService.incrementTeamBScore();
  }

  resetAllScores() {
    this.gameService.resetAllScores();
  }

  editPlayerName(player: Player) {
    this.gameService.editPlayerName(player);
  }

  savePlayerName(player: Player) {
    this.gameService.savePlayerName(player);
  }
}
