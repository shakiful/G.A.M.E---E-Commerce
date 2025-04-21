import { Component, OnDestroy, OnInit } from '@angular/core';
import { MyCartService } from '../my-cart/my-cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  isAuthenticated: boolean = false;
  private cartCountSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(private myCartService: MyCartService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.cartCountSubscription = this.myCartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.authSubscription = this.authService.authState$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }
  logout(){
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  ngOnDestroy(): void {
    this.cartCountSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

}
