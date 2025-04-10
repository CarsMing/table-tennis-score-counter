import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Player {
  name: string;
  editing: boolean;
  editName: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Observable score sources
  private teamAScoreSource = new BehaviorSubject<number>(0);
  private teamBScoreSource = new BehaviorSubject<number>(0);
  
  // Player data using arrays with default values
  private teamAPlayersSource = new BehaviorSubject<Player[]>([
    { name: 'Sven Langehaneberg', editing: false, editName: 'Sven Langehaneberg' },
    { name: 'Carsten Minga', editing: false, editName: 'Carsten Minga' }
  ]);
  
  private teamBPlayersSource = new BehaviorSubject<Player[]>([
    { name: 'Niklas Rudde', editing: false, editName: 'Niklas Rudde' },
    { name: 'Markus Doedt', editing: false, editName: 'Markus Doedt' }
  ]);
  
  // Game state variables for table tennis rules
  private isGameOverSource = new BehaviorSubject<boolean>(false);
  private gameWinnerSource = new BehaviorSubject<string>('');
  private isDeuceModeSource = new BehaviorSubject<boolean>(false);
  private gameStatusSource = new BehaviorSubject<string>('Game in progress. Player 1 from Team A is serving.');
  
  // Serving mechanics
  private currentServingTeamSource = new BehaviorSubject<string>('A');
  private currentServingPlayerSource = new BehaviorSubject<number>(1);
  private serveCountSource = new BehaviorSubject<number>(0);
  
  // Keep track of which player served last for each team
  private teamALastServerSource = new BehaviorSubject<number>(1);
  private teamBLastServerSource = new BehaviorSubject<number>(1);
  
  // Player positions for the illustration
  private teamAPositionsSource = new BehaviorSubject<string[]>(['top', 'bottom']);
  private teamBPositionsSource = new BehaviorSubject<string[]>(['top', 'bottom']);

  // Observable streams
  teamAScore$ = this.teamAScoreSource.asObservable();
  teamBScore$ = this.teamBScoreSource.asObservable();
  teamAPlayers$ = this.teamAPlayersSource.asObservable();
  teamBPlayers$ = this.teamBPlayersSource.asObservable();
  isGameOver$ = this.isGameOverSource.asObservable();
  gameWinner$ = this.gameWinnerSource.asObservable();
  isDeuceMode$ = this.isDeuceModeSource.asObservable();
  gameStatus$ = this.gameStatusSource.asObservable();
  currentServingTeam$ = this.currentServingTeamSource.asObservable();
  currentServingPlayer$ = this.currentServingPlayerSource.asObservable();
  serveCount$ = this.serveCountSource.asObservable();
  teamAPositions$ = this.teamAPositionsSource.asObservable();
  teamBPositions$ = this.teamBPositionsSource.asObservable();

  constructor() { }

  // Getter methods for current values
  get teamAScore(): number {
    return this.teamAScoreSource.value;
  }

  get teamBScore(): number {
    return this.teamBScoreSource.value;
  }

  get teamAPlayers(): Player[] {
    return this.teamAPlayersSource.value;
  }

  get teamBPlayers(): Player[] {
    return this.teamBPlayersSource.value;
  }

  get isGameOver(): boolean {
    return this.isGameOverSource.value;
  }

  get gameWinner(): string {
    return this.gameWinnerSource.value;
  }

  get isDeuceMode(): boolean {
    return this.isDeuceModeSource.value;
  }

  get gameStatus(): string {
    return this.gameStatusSource.value;
  }

  get currentServingTeam(): string {
    return this.currentServingTeamSource.value;
  }

  get currentServingPlayer(): number {
    return this.currentServingPlayerSource.value;
  }

  get serveCount(): number {
    return this.serveCountSource.value;
  }

  get teamAPositions(): string[] {
    return this.teamAPositionsSource.value;
  }

  get teamBPositions(): string[] {
    return this.teamBPositionsSource.value;
  }

  get teamALastServer(): number {
    return this.teamALastServerSource.value;
  }

  get teamBLastServer(): number {
    return this.teamBLastServerSource.value;
  }

  // Action methods
  incrementTeamAScore() {
    if (this.isGameOver) return;
    
    this.teamAScoreSource.next(this.teamAScore + 1);
    this.updateGameState('A');
  }

  incrementTeamBScore() {
    if (this.isGameOver) return;
    
    this.teamBScoreSource.next(this.teamBScore + 1);
    this.updateGameState('B');
  }
  
  updateGameState(teamScored: string) {
    // Check if we're in deuce mode
    if (this.teamAScore >= 10 && this.teamBScore >= 10) {
      this.isDeuceModeSource.next(true);
    }
    
    // Store the previous serving team to check if it changed
    const previousServingTeam = this.currentServingTeam;
    
    // Update the server based on rules
    this.updateServer();
    
    // If the serving team changed, switch positions for the team that is now receiving
    if (previousServingTeam !== this.currentServingTeam) {
      // The team that now receives the serve should switch positions
      const receivingTeam = this.currentServingTeam === 'A' ? 'B' : 'A';
      this.switchPositionsForTeam(receivingTeam);
    }
    
    // Check for game win conditions
    this.checkGameEnd();
    
    // Update game status message
    this.updateGameStatus();
  }
  
  updateServer() {
    // In deuce mode, serve changes after each point
    if (this.isDeuceMode) {
      this.switchServer();
      return;
    }
    
    // Regular mode: serve changes after 2 points
    this.serveCountSource.next(this.serveCount + 1);
    if (this.serveCount >= 2) {
      this.switchServer();
      this.serveCountSource.next(0);
    }
  }
  
  switchServer() {
    // Save the current server before switching
    if (this.currentServingTeam === 'A') {
      this.teamALastServerSource.next(this.currentServingPlayer);
      
      // Switch to team B
      this.currentServingTeamSource.next('B');
      
      // Get next server for team B
      const nextServerB = this.teamBLastServer === 1 ? 2 : 1;
      this.currentServingPlayerSource.next(nextServerB);
      this.teamBLastServerSource.next(nextServerB);
    } else {
      this.teamBLastServerSource.next(this.currentServingPlayer);
      
      // Switch to team A
      this.currentServingTeamSource.next('A');
      
      // Get next server for team A
      const nextServerA = this.teamALastServer === 1 ? 2 : 1;
      this.currentServingPlayerSource.next(nextServerA);
      this.teamALastServerSource.next(nextServerA);
    }
  }
  
  // Switch positions of players within a team
  switchPositionsForTeam(team: string) {
    if (team === 'A') {
      // Swap positions for Team A players
      const newPositions = [...this.teamAPositions];
      [newPositions[0], newPositions[1]] = [newPositions[1], newPositions[0]];
      this.teamAPositionsSource.next(newPositions);
    } else {
      // Swap positions for Team B players
      const newPositions = [...this.teamBPositions];
      [newPositions[0], newPositions[1]] = [newPositions[1], newPositions[0]];
      this.teamBPositionsSource.next(newPositions);
    }
  }
  
  // Get the position class for a player
  getPlayerPositionClass(team: string, playerIndex: number): string {
    const index = playerIndex - 1; // Convert to 0-based index
    return team === 'A' ? this.teamAPositions[index] : this.teamBPositions[index];
  }
  
  checkGameEnd() {
    // Win condition 1: First to 11 (if not in deuce)
    if (!this.isDeuceMode) {
      if (this.teamAScore >= 11) {
        this.endGame('A');
        return;
      }
      if (this.teamBScore >= 11) {
        this.endGame('B');
        return;
      }
    }
    
    // Win condition 2: 2-point lead in deuce
    if (this.isDeuceMode) {
      if (this.teamAScore >= 11 && (this.teamAScore - this.teamBScore) >= 2) {
        this.endGame('A');
        return;
      }
      if (this.teamBScore >= 11 && (this.teamBScore - this.teamAScore) >= 2) {
        this.endGame('B');
        return;
      }
    }
  }
  
  endGame(winner: string) {
    this.isGameOverSource.next(true);
    const winnerName = winner === 'A' ? 'Team A' : 'Team B';
    this.gameWinnerSource.next(winnerName);
    this.gameStatusSource.next(`Game over! ${winnerName} won the game!`);
  }
  
  updateGameStatus() {
    if (this.isGameOver) return;
    
    const serverName = this.getServerName();
    const teamName = this.currentServingTeam === 'A' ? 'Team A' : 'Team B';
    
    if (this.isDeuceMode) {
      this.gameStatusSource.next(`Deuce mode! ${serverName} (${teamName}) is serving. Service changes every point.`);
    } else {
      this.gameStatusSource.next(`${serverName} (${teamName}) is serving. ${2 - this.serveCount} serve(s) left before switch.`);
    }
  }
  
  getServerName(): string {
    const team = this.currentServingTeam === 'A' ? this.teamAPlayers : this.teamBPlayers;
    const playerIndex = this.currentServingPlayer - 1; // Convert to 0-based index
    return team[playerIndex].name;
  }
  
  isPlayerServing(team: string, playerNumber: number): boolean {
    return team === this.currentServingTeam && playerNumber === this.currentServingPlayer;
  }
  
  resetAllScores() {
    this.teamAScoreSource.next(0);
    this.teamBScoreSource.next(0);
    this.isGameOverSource.next(false);
    this.gameWinnerSource.next('');
    this.isDeuceModeSource.next(false);
    this.currentServingTeamSource.next('A');
    this.currentServingPlayerSource.next(1);
    this.serveCountSource.next(0);
    
    // Reset last servers
    this.teamALastServerSource.next(1);
    this.teamBLastServerSource.next(1);
   
    this.teamAPositionsSource.next(['top', 'bottom']);
    this.teamBPositionsSource.next(['top', 'bottom']);
    this.updateGameStatus();
  }

  editPlayerName(player: Player) {
    player.editing = true;
    player.editName = player.name;
    this.refreshPlayerArrays();
  }

  savePlayerName(player: Player) {
    if (player.editName.trim()) {
      player.name = player.editName.trim();
    }
    player.editing = false;
    this.refreshPlayerArrays();
    this.updateGameStatus();
  }

  // Helper method to refresh the player arrays to trigger change detection
  private refreshPlayerArrays() {
    this.teamAPlayersSource.next([...this.teamAPlayers]);
    this.teamBPlayersSource.next([...this.teamBPlayers]);
  }

  // Extract initials from a player name
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }
}
