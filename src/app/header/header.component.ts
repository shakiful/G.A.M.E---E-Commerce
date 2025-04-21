import { Component, OnDestroy, OnInit } from '@angular/core';
import { MyCartService } from '../my-cart/my-cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  private cartCountSubscription: Subscription | undefined;

  constructor(private myCartService: MyCartService) {}

  ngOnInit(): void {
    this.cartCountSubscription = this.myCartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  ngOnDestroy(): void {
    this.cartCountSubscription?.unsubscribe();
  }
}
