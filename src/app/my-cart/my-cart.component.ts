import { MyCartService } from './my-cart.service';
import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Games } from '../shared/game-info.model';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['../wishlist/wishlist.component.scss']
})
export class MyCartComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  cartList: Games[];

  constructor(private myCartService: MyCartService) {}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit(): void {
    this.cartList = this.myCartService.getCartList();
    this.subscription = this.myCartService.listedCart.subscribe((cart) => {
      this.cartList = cart;
    });
  }
}
