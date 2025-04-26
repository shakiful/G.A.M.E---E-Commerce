import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Games } from '../../shared/game-info.model';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss'],
})
export class GameListComponent implements OnInit {
  games: Games[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameService.fetchGames();
    this.games = this.gameService.getGames();
    this.gameService.gamesChanged.subscribe((games: Games[]) => {
      this.games = games;
    });
  }
}
