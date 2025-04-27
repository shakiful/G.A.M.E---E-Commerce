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
  showCreditCardForm = false;
  showPayPalForm = false;
  gameToRemove: Games | null = null;
  selectedPaymentMethod: string | null = null;
  creditCard = {
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };
  paypalEmail = '';
  paypalPassword = '';

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
      // User is logged in, show payment options
      this.showPaymentModal = true;
    } else {
      // User is not logged in, redirect to login page with returnUrl
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  processCreditCardPayment() {
    // Simulate credit card processing
    if (!this.validateCreditCard()) {
      return;
    }

    console.log(`Processing credit card payment with card number: ${this.creditCard.cardNumber}`);
    this.showPaymentModal = false;
    this.showCreditCardForm = false;
    this.myCartService.clearCart();
    this.toastService.show('Payment Successful!', 'success');
    // Reset credit card info
    this.creditCard = {
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    };
  }

  processPayPalPayment() {
    // Simulate PayPal authorization
    if (!this.validatePayPal()) {
      return;
    }
    console.log('Simulating PayPal authorization...');
    this.showPaymentModal = false;
    this.showCreditCardForm = false; // Ensure credit card form is closed
    this.showPayPalForm = false;
    this.myCartService.clearCart();
    this.toastService.show('Payment Successful (via PayPal)!', 'success');
  }

  validateCreditCard(): boolean {
    // Add more robust validation logic here if desired
    if (!/^[0-9]{16}$/.test(this.creditCard.cardNumber)) {
      this.toastService.show('Invalid card number.', 'error');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(this.creditCard.expiryDate)) {
      this.toastService.show('Invalid expiry date.', 'error');
      return false;
    }
    if (!/^[0-9]{3,4}$/.test(this.creditCard.cvv)) {
      this.toastService.show('Invalid CVV.', 'error');
      return false;
    }
    return true;
  }

  validatePayPal(): boolean {
    if (!this.paypalEmail) {
      this.toastService.show('PayPal email is required.', 'error');
      return false;
    }
    if (!this.paypalPassword) {
      this.toastService.show('PayPal password is required.', 'error');
      return false;
    }
    return true;
  }

  //Keeps the selected payment, either credit card or paypal
  processDummyPayment(method: string) {
  }
}
