import { Subject } from 'rxjs';
import { Injectable, OnInit } from '@angular/core';
import { Games } from '../shared/game-info.model';
@Injectable({
  providedIn: 'root',
})
export class MyCartService implements OnInit {
  listedCart = new Subject<Games[]>();
  gameCart: Games[] = [];

  ngOnInit(): void {}

  addToCart(game: Games) {
    const exists = this.gameCart.includes(game);
    if (!exists) {
      alert('Game Added to Cart');
      this.gameCart.push(game);
      this.listedCart.next(this.gameCart.slice());
    } else {
      alert('Game already in cart');
    }
  }

  getCartList() {
    return this.gameCart.slice();
  }
}
