import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Games } from '../shared/game-info.model';
import { MyCartService } from './my-cart.service';
import { AuthService } from '../shared/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../shared/toast.service';
import { SupabaseService } from '../shared/supabase.service';

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

  constructor(private myCartService: MyCartService, private authService: AuthService, private router: Router, private route: ActivatedRoute, private toastService: ToastService, private supabaseService: SupabaseService) {}

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

  async processCreditCardPayment() {
    // Simulate credit card processing
    if (!this.validateCreditCard()) {
      return;
    }

    const user = await this.authService.isAuthenticatedUser();

    if (user) {
      try {
        const supabase = this.supabaseService.getClient();
        // Loop through cart items and save each to payment history and user library
        for (const game of this.cartList) {
          // Save to payment history
          const { data: paymentData, error: paymentError } = await supabase
            .from('payment_history')
            .insert([{
              user_id: user.id,
              game_id: game.id,  // Use the actual game ID
              payment_date: new Date(),
              amount: game.price // Use the price of the individual game
            }]);

          if (paymentError) {
            console.error('Error saving payment history for game:', game.name, paymentError);
            this.toastService.show(`Error saving payment history for ${game.name}`, 'error');
            return;
          }

          // Check if game is already in user library
          const { data: existingLibraryData, error: existingLibraryError } = await supabase
            .from('user_library')
            .select('*')
            .eq('user_id', user.id)
            .eq('game_id', game.id);

          if (existingLibraryError) {
            console.error('Error checking user library:', existingLibraryError);
            this.toastService.show('Error checking user library', 'error');
            return;
          }

          if (existingLibraryData && existingLibraryData.length === 0) {
            // Add game to user library only if it's not already there
            const { data: libraryData, error: libraryError } = await supabase
              .from('user_library')
              .insert([{
                user_id: user.id,
                game_id: game.id
              }]);

            if (libraryError) {
              console.error('Error adding game to user library:', game.name, libraryError);
              this.toastService.show(`Error adding game to user library for ${game.name}`, 'error');
              return;
            }
          }
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
      } catch (e) {
         console.error('Unexpected error processing payment:', e);
      }
    }else{
      this.toastService.show('Error saving payment history', 'error');
    }
  }

  async processPayPalPayment() {
    // Simulate PayPal authorization
    if (!this.validatePayPal()) {
      return;
    }
    const user = await this.authService.isAuthenticatedUser();

    if (user) {
      try {
        const supabase = this.supabaseService.getClient();

         // Loop through cart items and save each to payment history and user library
         for (const game of this.cartList) {
           // Save to payment history
          const { data: paymentData, error: paymentError } = await supabase
            .from('payment_history')
            .insert([{
              user_id: user.id,
              game_id: game.id,
              payment_date: new Date(),
              amount: game.price
            }]);

          if (paymentError) {
            console.error('Error saving payment history for game:', game.name, paymentError);
            this.toastService.show(`Error saving payment history for ${game.name}`, 'error');
            return;
          }

           // Check if game is already in user library
           const { data: existingLibraryData, error: existingLibraryError } = await supabase
            .from('user_library')
            .select('*')
            .eq('user_id', user.id)
            .eq('game_id', game.id);

          if (existingLibraryError) {
            console.error('Error checking user library:', existingLibraryError);
            this.toastService.show('Error checking user library', 'error');
            return;
          }

          if (existingLibraryData && existingLibraryData.length === 0) {
            // Add game to user library only if it's not already there
            const { data: libraryData, error: libraryError } = await supabase
              .from('user_library')
              .insert([{
                user_id: user.id,
                game_id: game.id
              }]);

            if (libraryError) {
              console.error('Error adding game to user library:', game.name, libraryError);
              this.toastService.show(`Error adding game to user library for ${game.name}`, 'error');
              return;
            }
          }
        }

    console.log('Simulating PayPal authorization...');
    this.showPaymentModal = false;
    this.showCreditCardForm = false; // Ensure credit card form is closed
    this.showPayPalForm = false;
    this.myCartService.clearCart();
    this.toastService.show('Payment Successful (via PayPal)!', 'success');

      } catch (e) {
         console.error('Unexpected error processing payment:', e);
      }
    }else{
      this.toastService.show('Error saving payment history', 'error');
    }
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
