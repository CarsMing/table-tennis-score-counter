import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-table-tennis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-tennis.component.html',
  styleUrl: './table-tennis.component.scss'
})
export class TableTennisComponent {
  constructor(public gameService: GameService) {}
}
