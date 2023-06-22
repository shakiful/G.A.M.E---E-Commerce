import { MyCartService } from './../../../my-cart/my-cart.service';
import { Component, Input, OnInit, Injectable } from '@angular/core';
import { Games } from 'src/app/shared/game-info.model';
import { GameService } from '../../game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WishListService } from 'src/app/wishlist/wishlist.service';

@Injectable()
@Component({
  selector: 'app-game-item',
  templateUrl: './game-item.component.html',
  styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent implements OnInit {
  @Input() game: Games;
  @Input() index: number;
  @Input() wishListedGame: Games[];
  ngOnInit(): void {}

  constructor(
    private wishlistService: WishListService,
    private myCartService: MyCartService,
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onWishlist() {
    this.wishlistService.addToWishlist(this.game);
    // this.router.navigate(['/wishlist']);
  }

  onCart() {
    this.myCartService.addToCart(this.game)
    // this.router.navigate(['/my-cart']);
  }
}
