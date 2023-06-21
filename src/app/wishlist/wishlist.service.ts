import { Injectable, OnInit } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subject } from 'rxjs';
import { GameService } from '../game/game.service';
import { Router } from '@angular/router';

@Injectable()
export class WishListService {
  private wishlist: Games[] = [];
  wishlistChanged = new Subject<Games[]>();
  constructor(private gameService: GameService, private router: Router) {}

  addToWishlist(game: Games) {
    const exists = this.wishlist.includes(game);
    if (exists) {
      alert('Item already exists in Wishlist');
    } else {
      alert('Game Added to Wishlist');
      this.wishlist.push(game);
      this.wishlistChanged.next(this.wishlist.slice());
    }
  }

  getWishlist() {
    return this.wishlist.slice();
  }
}
