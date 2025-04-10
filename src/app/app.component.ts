import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { TableTennisComponent } from './components/table-tennis/table-tennis.component';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    ScoreboardComponent,
    TableTennisComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private gameService: GameService) {}
}
