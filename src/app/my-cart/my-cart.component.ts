import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Games } from '../shared/game-info.model';
import { MyCartService } from './my-cart.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  // No styleUrls needed as Tailwind handles styling
})
export class MyCartComponent implements OnInit, OnDestroy {
  cartList: Games[] = []; // Initialize with an empty array
  private cartSubscription: Subscription | undefined;
  showConfirmationModal = false;
  gameToRemove: Games | null = null;

  constructor(private myCartService: MyCartService) {}

  ngOnInit(): void {
    // Get initial list
    this.cartList = this.myCartService.getCartList();

    // Subscribe to changes in the cart
    this.cartSubscription = this.myCartService.listedCart.subscribe(
      (updatedCart: Games[]) => {
        this.cartList = updatedCart;
      }
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.cartSubscription?.unsubscribe();
  }

  removeFromCart(gameToRemove: Games): void {
    this.gameToRemove = gameToRemove;
    this.showConfirmationModal = true;
  }

  onConfirmRemove(confirmed: boolean): void {
    this.showConfirmationModal = false;
    if (confirmed && this.gameToRemove) {
      this.myCartService.removeFromCart(this.gameToRemove);
      this.gameToRemove = null;
    }
  }
}
