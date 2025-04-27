import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyCartComponent } from './my-cart/my-cart.component';
import { GameComponent } from './game/game.component';
import { GameDetailsComponent } from './game/game-details/game-details.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { LibraryComponent } from './library/library.component';

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
  { path: 'my-cart', component: MyCartComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'payment-history', component: PaymentHistoryComponent },
  {path: 'library', component: LibraryComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
