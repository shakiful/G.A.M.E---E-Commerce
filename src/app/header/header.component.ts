import { Component, OnDestroy, OnInit } from '@angular/core';
import { MyCartService } from '../my-cart/my-cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  isAuthenticated: boolean = false;
  username: string | null = null;
  private cartCountSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(private myCartService: MyCartService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.cartCountSubscription = this.myCartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.authSubscription = this.authService.authState$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.username = this.authService.getUsername();
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
