import { Injectable } from '@angular/core';
import { SellingGames } from './../shared/selling-game.model';
@Injectable({
  providedIn: 'root',
})
export class SellService {
  private sellItem: SellingGames[] = [];

  addSellingGame(value: SellingGames) {
    this.sellItem.push(value);
  }
}
