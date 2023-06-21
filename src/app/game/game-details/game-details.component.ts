import { Component, Input, OnInit } from '@angular/core';
import { Games } from 'src/app/shared/game-info.model';
import { GameService } from '../game.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss'],
})
export class GameDetailsComponent implements OnInit {
  gameSelected: Games;
  index: number;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.index = +params['id'];
      this.gameSelected = this.gameService.getGame(this.index);
    });
  }
}
