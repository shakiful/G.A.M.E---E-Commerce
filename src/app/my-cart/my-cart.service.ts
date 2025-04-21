import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Games } from '../shared/game-info.model';

@Injectable({
  providedIn: 'root',
})
export class MyCartService {
  listedCart = new Subject<Games[]>();
  private gameCart: Games[] = [];
  private cartItemCount = new BehaviorSubject<number>(0);

  // Observable for components to subscribe to the count
  cartItemCount$ = this.cartItemCount.asObservable();

  addToCart(game: Games) {
    const exists = this.gameCart.some(g => g.name === game.name); // Check by a unique property like name or id
    if (!exists) {
      alert('Game Added to Cart');
      this.gameCart.push(game);
      this.listedCart.next(this.gameCart.slice());
      this.cartItemCount.next(this.gameCart.length); // Update count
    } else {
      alert('Game already in cart');
    }
  }

  getCartList() {
    return this.gameCart.slice();
  }

  // Method to get the current count (optional, observable is preferred)
  getCartCount(): number {
    return this.gameCart.length;
  }

  // Add a method to remove items from the cart and update the count
  removeFromCart(gameToRemove: Games) {
    const initialLength = this.gameCart.length;
    this.gameCart = this.gameCart.filter(game => game.name !== gameToRemove.name); // Filter by unique property
    if (this.gameCart.length < initialLength) {
      this.listedCart.next(this.gameCart.slice());
      this.cartItemCount.next(this.gameCart.length); // Update count
      alert('Game removed from cart');
    }
  }
}
