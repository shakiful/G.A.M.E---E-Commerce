import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Games } from '../shared/game-info.model';
import { MyCartService } from './my-cart.service';
import { AuthService } from '../shared/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  // No styleUrls needed as Tailwind handles styling
})
export class MyCartComponent implements OnInit, OnDestroy {
  cartList: Games[] = []; // Initialize with an empty array
  private cartSubscription: Subscription | undefined;
  showConfirmationModal = false;
  showPaymentModal = false;
  gameToRemove: Games | null = null;

  constructor(private myCartService: MyCartService, private authService: AuthService, private router: Router, private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit(): void {
    // Get initial list
    this.cartList = this.myCartService.getCartList();

    // Subscribe to changes in the cart
    this.cartSubscription = this.myCartService.listedCart.subscribe(
      (updatedCart: Games[]) => {
        this.cartList = updatedCart;
      }
    );

    // Load cart for user on component initialization
    this.myCartService.loadCartForUser();
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.cartSubscription?.unsubscribe();
  }

  removeFromCart(gameToRemove: Games): void {
    this.gameToRemove = gameToRemove;
    this.showConfirmationModal = true;
  }

  onConfirmRemove(confirmed: boolean): void {
    this.showConfirmationModal = false;
    if (confirmed && this.gameToRemove) {
      this.myCartService.removeFromCart(this.gameToRemove);
      this.gameToRemove = null;
    }
  }

  async checkout(){
    const user = await this.authService.isAuthenticatedUser();
    if(user){
      // User is logged in, show dummy payment options
      this.showPaymentModal = true;
    } else {
      // User is not logged in, redirect to login page with returnUrl
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  processDummyPayment(method: string){
    console.log(`Processing dummy payment with: ${method}`);
    // Here you would integrate with a payment gateway.
    // For this dummy implementation, we'll just log and close the modal.
    this.showPaymentModal = false;
    this.myCartService.clearCart(); // Clear cart after dummy checkout
    this.toastService.show('Payment Successful!', 'success'); // Assuming success for dummy
  }

  closePaymentModal(){
    this.showPaymentModal = false;
  }
}
