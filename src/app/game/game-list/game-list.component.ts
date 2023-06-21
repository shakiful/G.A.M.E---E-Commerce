import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Games } from 'src/app/shared/game-info.model';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss'],
})
export class GameListComponent implements OnInit {
  games: Games[];

  constructor(private gameService: GameService) {

  }
  ngOnInit(): void {
    this.games = this.gameService.getGames();
  }

}
