import { WishListService } from 'src/app/wishlist/wishlist.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishList: Games[];
  private subscription: Subscription;

  constructor(
    private wishListService: WishListService
  ) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit(): void {
    this.wishList = this.wishListService.getWishlist();
    this.subscription = this.wishListService.wishlistChanged.subscribe(
      (wishlist: Games[]) => {
        this.wishList = wishlist;
      }
    );
  }
}
