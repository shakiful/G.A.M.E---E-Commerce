import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { Games } from '../../shared/game-info.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit, OnDestroy {
  games: Games[] = [];
  loading = false;
  private gamesSubscription: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.loading = true;
    this.gameService.fetchGames();
    this.games = this.gameService.getGames();
    this.gamesSubscription = this.gameService.gamesChanged.subscribe((games: Games[]) => {
      this.games = games;
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.gamesSubscription) {
      this.gamesSubscription.unsubscribe();
    }
  }
}
