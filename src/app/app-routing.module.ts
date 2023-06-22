import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WishlistComponent } from './wishlist/wishlist.component';
import { MyCartComponent } from './my-cart/my-cart.component';
import { GameComponent } from './game/game.component';
import { GameDetailsComponent } from './game/game-details/game-details.component';
import { SellItemComponent } from './sell-item/sell-item.component';
import { SellListComponent } from './sell-item/sell-list/sell-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full'
  },
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
  },
  {
    path: 'my-cart',
    component: MyCartComponent
  },
  // TODO: Will convert this into parent child component
  {
    path: 'sell',
    component:SellItemComponent,
    children: [
      {
        path: 'list',
        pathMatch: 'full',
        redirectTo: 'list'
      },
      {
        path: 'list',
        component: SellListComponent
      }
    ]
  },
  // {
  //   path: 'sell/list',
  //   component: SellListComponent
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
