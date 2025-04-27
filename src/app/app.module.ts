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
import { DropdownDirectiveDirective } from './shared/dropdown-directive.directive';
import { GameService } from './game/game.service';
import { ToastComponent } from './shared/toast.component';
import { ConfirmationModalComponent } from './shared/confirmation-modal.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { LibraryComponent } from './library/library.component';
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GameComponent,
    GameListComponent,
    GameDetailsComponent,
    MyCartComponent,
    GameItemComponent,
    DropdownDirectiveDirective,
    ToastComponent,
    ConfirmationModalComponent,
    LoginComponent,
    RegisterComponent,
    PaymentHistoryComponent,
    LibraryComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
