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
    { name: 'Sven Lange', editing: false, editName: 'Sven Lange' },
    { name: 'Carsten Minga', editing: false, editName: 'Carsten Minga' }
  ]);
  
  private teamBPlayersSource = new BehaviorSubject<Player[]>([
    { name: 'Niklas Rudde', editing: false, editName: 'Niklas Rudde' },
    { name: 'Timo Kruse', editing: false, editName: 'Timo Kruse' }
  ]);
  
  // Game state variables for table tennis rules
  private isGameOverSource = new BehaviorSubject<boolean>(false);
  private gameWinnerSource = new BehaviorSubject<string>('');
  private isDeuceModeSource = new BehaviorSubject<boolean>(false);
  private gameStatusSource = new BehaviorSubject<string>('Game in progress.');

  // Observable streams
  teamAScore$ = this.teamAScoreSource.asObservable();
  teamBScore$ = this.teamBScoreSource.asObservable();
  teamAPlayers$ = this.teamAPlayersSource.asObservable();
  teamBPlayers$ = this.teamBPlayersSource.asObservable();
  isGameOver$ = this.isGameOverSource.asObservable();
  gameWinner$ = this.gameWinnerSource.asObservable();
  isDeuceMode$ = this.isDeuceModeSource.asObservable();
  gameStatus$ = this.gameStatusSource.asObservable();

  constructor() {
    // Update game status initially
    this.updateGameStatus();
    
    // Subscribe to score changes to update game status
    this.teamAScore$.subscribe(() => this.updateGameStatus());
    this.teamBScore$.subscribe(() => this.updateGameStatus());

    this.teamAScoreSource.next(10);
    this.teamBScoreSource.next(10);
  }

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

  // Calculate current serving team based on total score
  get currentServingTeam(): string {
    const totalScore = this.teamAScore + this.teamBScore;
    
    // In deuce mode (both scores >= 10), service alternates every point
    if (this.isDeuceMode) {
      return totalScore % 2 === 0 ? 'A' : 'B';
    }
    
    // Normal play: service alternates every 2 points
    return Math.floor(totalScore / 2) % 2 === 0 ? 'A' : 'B';
  }

  // Calculate current serving player based on total score
  get currentServingPlayer(): number {
    const totalScore = this.teamAScore + this.teamBScore;
    
    if (this.isDeuceMode) {
      // In deuce mode, service alternates between players within each team each point
        return Math.floor(totalScore / 2) % 2 === 0 ? 2 : 1;
      
    } else {
      // In regular play, players alternate every 2 points
        return Math.floor(totalScore / 4) % 2 === 0 ? 1 : 2;
    }
  }

  // Get positions of team A players based on total score
  get teamAPositions(): string[] {
    const totalScore = this.teamAScore + this.teamBScore;
    const basePositions = ['bottom', 'top'];
    
    // Calculate if positions are swapped
    if (this.isDeuceMode) {
      // In deuce, positions switch with every team change, which is every point
      return (Math.floor(totalScore + 1) % 4) >= 2 ? basePositions : [basePositions[1], basePositions[0]];
    } else {
      // In regular play, positions switch with each service change (every 2 points)
      return (Math.floor((totalScore+2) / 4) % 2) === 0 ? basePositions : [basePositions[1], basePositions[0]];
    }
  }

  // Get positions of team B players based on total score
  get teamBPositions(): string[] {
    const totalScore = this.teamAScore + this.teamBScore;
    // Positions switch after each service change, which happens every 2 points in regular play
    // and every point in deuce mode
    
    // Starting positions
    const basePositions = ['top', 'bottom'];
    
    // Calculate if positions are swapped
    if (this.isDeuceMode) {
      // In deuce, positions switch with every team change, which is every point
      console.log('deuce mode - team B');
      console.log(totalScore);
      console.log(Math.floor(totalScore) % 4);
      return (Math.floor(totalScore) % 4) < 2 ? [basePositions[1], basePositions[0]] : basePositions;
    } else {
      // In regular play, positions switch with each service change (every 2 points)
      return (Math.floor(totalScore / 4) % 2) === 0 ? basePositions : [basePositions[1], basePositions[0]];
    }
  }

  // Calculate serving count before switch (0 or 1 for regular play)
  get serveCount(): number {
    const totalScore = this.teamAScore + this.teamBScore;
    return this.isDeuceMode ? 0 : totalScore % 2;
  }

  // Action methods
  incrementTeamAScore() {
    if (this.isGameOver) return;
    
    this.teamAScoreSource.next(this.teamAScore + 1);
    this.checkDeuce();
    this.checkGameEnd();
  }

  incrementTeamBScore() {
    if (this.isGameOver) return;
    
    this.teamBScoreSource.next(this.teamBScore + 1);
    this.checkDeuce();
    this.checkGameEnd();
  }
  
  decrementTeamAScore() {
    if (this.isGameOver) return;
    
    // Don't allow negative scores
    if (this.teamAScore <= 0) return;
    
    this.teamAScoreSource.next(this.teamAScore - 1);
    this.checkDeuce();
    this.checkGameEnd();
  }

  decrementTeamBScore() {
    if (this.isGameOver) return;
    
    // Don't allow negative scores
    if (this.teamBScore <= 0) return;
    
    this.teamBScoreSource.next(this.teamBScore - 1);
    this.checkDeuce();
    this.checkGameEnd();
  }
  
  checkDeuce() {
    // Check if we're in deuce mode
    const isDeuceMode = this.teamAScore >= 10 && this.teamBScore >= 10;
    this.isDeuceModeSource.next(isDeuceMode);
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

  // Get positioning information
  get positioningInfo(): string {
    const totalScore = this.teamAScore + this.teamBScore;
    const teamAPos = this.teamAPositions;
    const teamBPos = this.teamBPositions;
    
    return `Positions: Team A (${teamAPos[0]}/${teamAPos[1]}) - Team B (${teamBPos[0]}/${teamBPos[1]})`;
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
