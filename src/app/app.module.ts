import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { GameComponent } from './game/game.component';
import { GameListComponent } from './game/game-list/game-list.component';
import { GameDetailsComponent } from './game/game-details/game-details.component';
import { MyCartComponent } from './my-cart/my-cart.component';
import { GameItemComponent } from './game/game-list/game-item/game-item.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { DropdownDirectiveDirective } from './shared/dropdown-directive.directive';
import { GameService } from './game/game.service';
import { WishListService } from './wishlist/wishlist.service';
import { SellItemComponent } from './sell-item/sell-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SellListComponent } from './sell-item/sell-list/sell-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GameComponent,
    GameListComponent,
    GameDetailsComponent,
    MyCartComponent,
    GameItemComponent,
    WishlistComponent,
    DropdownDirectiveDirective,
    SellItemComponent,
    SellListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [GameService, WishListService],
  bootstrap: [AppComponent]
})
export class AppModule { }
