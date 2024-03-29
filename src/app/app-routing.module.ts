import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WishlistComponent } from './wishlist/wishlist.component';
import { MyCartComponent } from './my-cart/my-cart.component';
import { GameComponent } from './game/game.component';
import { GameDetailsComponent } from './game/game-details/game-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  {
    path: 'shop',
    component: GameComponent,
    children: [
      {
        path: ':id',
        component: GameDetailsComponent,
      },
    ],
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    children: [
      {
        path: ':id',
        component: WishlistComponent,
      },
    ],
  },
  { path: 'my-cart', component: MyCartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
