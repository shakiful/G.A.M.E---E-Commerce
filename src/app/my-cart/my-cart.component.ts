import { Component, OnInit, OnDestroy } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { MyCartService } from './my-cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { SupabaseService } from '../shared/supabase.service';
import { ToastService } from '../shared/toast.service';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js'; // Import Stripe types
import { environment } from 'src/environments/environment'; // Assume environment has stripePublishableKey
import { User, Session } from '@supabase/supabase-js'; // Import Supabase types

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

  // Stripe properties
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  loading = false;
  stripePaymentError: string | null = null;

  // Placeholder for your backend endpoint URL
  // **REPLACE WITH YOUR ACTUAL SUPABASE EDGE FUNCTION URL**
  private paymentIntentUrl = 'https://nwwlberkzgpyuchkxcfd.supabase.co/functions/v1/create-payment-intent';

  constructor(
    private myCartService: MyCartService,
    private authService: AuthService,
    private router: Router,
    private supabaseService: SupabaseService,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    // Subscribe to the listedCart Subject in MyCartService
    this.cartSubscription = this.myCartService.listedCart.subscribe(games => {
      this.cartList = games;
      console.log('MyCartComponent received cart update:', this.cartList);
    });

    // Load Stripe
    // Ensure environment.stripePublishableKey is set correctly
    if (!environment.stripePublishableKey) {
        console.error('Stripe publishable key is not set in the environment.');
        // Optionally show an error message to the user
    } else {
        this.stripe = await loadStripe(environment.stripePublishableKey);
    }
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    // Clean up Stripe Elements when component is destroyed
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null; // Set to null after destroying
    }
  }

  getTotalPrice(): number {
    return this.cartList.reduce((total, game) => total + game.price, 0);
  }

  onRemoveFromCart(game: Games) {
    this.gameToRemove = game;
    this.showConfirmationModal = true;
  }

  onConfirmRemove(confirmed: boolean) {
    if (confirmed && this.gameToRemove) {
      this.myCartService.removeFromCart(this.gameToRemove);
    }
    this.showConfirmationModal = false;
    this.gameToRemove = null;
  }

  async checkout() {
    const user = await this.authService.isAuthenticatedUser();
    if (user) {
      // User is logged in, show payment options
      this.showPaymentModal = true;
      // Reset payment method selection and forms on showing modal
      this.selectedPaymentMethod = null;
      this.showCreditCardForm = false;
      this.showPayPalForm = false;
      this.stripePaymentError = null;
      if (this.cardElement) {
          this.cardElement.destroy();
          this.cardElement = null;
      }
    } else {
      // User is not logged in, redirect to login page with returnUrl
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  selectPaymentMethod(method: string) {
    if (this.selectedPaymentMethod === method) {
        // Deselect if the same method is clicked again
        this.selectedPaymentMethod = null;
        this.showCreditCardForm = false;
        this.showPayPalForm = false;
        // Destroy card element if it was credit card
        if (method === 'credit_card' && this.cardElement) {
            this.cardElement.destroy();
            this.cardElement = null;
            this.stripePaymentError = null;
        }
        return;
    }

    this.selectedPaymentMethod = method;
    this.showCreditCardForm = method === 'credit_card';
    this.showPayPalForm = method === 'paypal';
    this.stripePaymentError = null; // Clear errors when changing method

    // If credit card is selected and stripe is loaded, create and mount card element
    if (this.showCreditCardForm && this.stripe && !this.cardElement) {
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card');
      // Use a timeout to ensure the element container is in the DOM
      setTimeout(() => {
        try {
          // Check if the element still exists before mounting
          const cardElementContainer = document.getElementById('card-element');
          if (cardElementContainer && this.cardElement) {
             this.cardElement.mount(cardElementContainer);
             this.cardElement.on('change', (event) => {
               this.stripePaymentError = event.error ? event.error.message : null;
             });
          } else {
             console.error('Stripe card element container not found or cardElement is null.');
             this.stripePaymentError = 'Could not load payment form.';
          }
        } catch (error) {
          console.error('Error mounting Stripe card element:', error);
          this.stripePaymentError = 'Could not load payment form.';
        }
      }, 0);

    } else if (!this.showCreditCardForm && this.cardElement) {
       // If credit card is deselected, clean up the card element
       this.cardElement.destroy();
       this.cardElement = null;
       this.stripePaymentError = null;
    }
  }

  async processPayment() {
    if (this.selectedPaymentMethod === 'credit_card') {
      this.processCreditCardPayment();
    } else if (this.selectedPaymentMethod === 'paypal') {
      this.processPayPalPayment();
    }
  }

  async processCreditCardPayment() {
    if (!this.stripe || !this.cardElement) {
      this.stripePaymentError = 'Stripe has not loaded correctly or card information is missing.';
      return;
    }

    this.loading = true;
    this.stripePaymentError = null; // Clear previous errors

    try {
      // Get the user's session to include the auth header
      const { data: { session } } = await this.supabaseService.getClient().auth.getSession();

      if (!session || !session.access_token) {
          this.stripePaymentError = 'User session not found.';
          this.loading = false;
          return;
      }

      // 1. Create PaymentMethod
      const { paymentMethod, error: createPaymentMethodError } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
      });

      if (createPaymentMethodError) {
        this.stripePaymentError = createPaymentMethodError.message || 'An error occurred creating payment method.';
        this.loading = false;
        return;
      }

      // 2. Call backend to create PaymentIntent
      // Include the Authorization header with the user's access token
      const response = await fetch(this.paymentIntentUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` // Add the auth header using access_token
        },
        // In a real app, send cart item details or a cart ID to the backend
        // The backend calculates the total securely.
        body: JSON.stringify({ amount: Math.round(this.getTotalPrice() * 100) }) // Sending total for simplicity, validate on backend!
      });

      if (!response.ok) {
         // Attempt to parse error response from backend
         let errorDetail = 'Failed to create PaymentIntent on backend.';
         try {
            const errorBody = await response.json();
            errorDetail = errorBody.error || errorDetail;
         } catch (jsonError) {
            console.error('Failed to parse backend error response:', jsonError);
         }
         throw new Error(`Backend error: ${response.status} - ${errorDetail}`);
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
           throw new Error('Backend did not return clientSecret.');
      }

      // 3. Confirm the payment on the client side
      const { error: confirmError, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
        // Use a return_url in production to handle 3D Secure and other payment flows
        // return_url: 'YOUR_FRONTEND_URL/payment-success',
      });

      if (confirmError) {
        this.stripePaymentError = confirmError.message || 'Payment confirmation failed.';
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded! Handle success (e.g., show success message, clear cart, save to history)
        console.log('Payment successful:', paymentIntent);
        this.toastService.show('Payment successful!', 'success');
        this.saveOrderHistory(); // Save order history and clear cart
        this.showPaymentModal = false;
        this.resetPaymentState(); // Reset payment state after successful payment
      } else if (paymentIntent) {
         // Handle other potential statuses like 'requires_action' if not using automatic_payment_methods
         this.stripePaymentError = `PaymentIntent status: ${paymentIntent.status}. Further action may be required.`;
         console.log('PaymentIntent requires action or is not succeeded:', paymentIntent);
      } else {
         this.stripePaymentError = 'Payment process failed or was not successful.';
      }

    } catch (error: any) {
      console.error('An unexpected error occurred during Stripe payment:', error);
      this.stripePaymentError = error.message || 'An unexpected error occurred.';
    }

    this.loading = false;
  }

  // Keep existing PayPal simulation logic
  async processPayPalPayment() {
     if (!this.validatePayPal()) {
        // validation shows toast message
       return;
     }

    const user = await this.authService.isAuthenticatedUser();

    if (user) {
      try {
        this.loading = true;
        this.toastService.show('Processing PayPal payment...', 'info');
        // Simulate a delay for processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate success
        console.log('PayPal payment simulated successfully.');
        this.toastService.show('PayPal payment successful!', 'success');
        this.saveOrderHistory(); // Save order history and clear cart
        this.showPaymentModal = false;
        this.resetPaymentState(); // Reset payment state after successful payment

      } catch (error: any) {
        console.error('An unexpected error occurred during PayPal simulation:', error);
        this.toastService.show('An error occurred during PayPal processing.', 'error');
      } finally {
          this.loading = false;
      }
    }
  }

  validateCreditCard(): boolean {
    // Stripe Elements handles most validation, but you could add checks here
    // For now, just rely on Stripe's validation built into the card element
    return !!this.cardElement && !this.stripePaymentError; // Also check for errors reported by Stripe Element
  }

  validatePayPal(): boolean {
    // Basic validation for PayPal email format
    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!this.paypalEmail || !emailRegex.test(this.paypalEmail)) {
      this.toastService.show('Please enter a valid PayPal email address.', 'error');
      return false;
    }
    return true;
  }

  async saveOrderHistory() {
      const user = await this.authService.isAuthenticatedUser();
      if (!user) return;

      const supabase = this.supabaseService.getClient();

       // Loop through cart items and save each to payment history and user library
       for (const game of this.cartList) {
         // Save to payment history
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_history')
          .insert([{
            user_id: user.id,
            game_id: game.id, // Use the actual game ID
            payment_date: new Date().toISOString(), // Save as ISO string
            amount: game.price // Use the price of the individual game
          }]);

        if (paymentError) {
          console.error('Error saving payment history for game:', game.name, paymentError);
          // Decide if you want to stop the process or continue and log the error
          this.toastService.show(`Error saving payment history for ${game.name}`, 'error');
          // return; // Uncomment to stop on first error
        }

        // Save to user library (assuming a user_games table)
        const { data: libraryData, error: libraryError } = await supabase
           .from('user_library') // Replace with your actual user library table name
           .insert([{ user_id: user.id, game_id: game.id }]);

        if (libraryError) {
           console.error('Error saving game to user library:', game.name, libraryError);
           this.toastService.show(`Error saving ${game.name} to your library`, 'error');
           // return; // Uncomment to stop on first error
        }
      }
       // Clear the cart after saving history and library
       this.myCartService.clearCart();
       this.toastService.show('Order history updated and cart cleared!', 'success');
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.resetPaymentState();
  }

  private resetPaymentState() {
       this.selectedPaymentMethod = null;
       this.showCreditCardForm = false;
       this.showPayPalForm = false;
       this.stripePaymentError = null;
       this.paypalEmail = ''; // Clear PayPal email
       if (this.cardElement) {
           this.cardElement.destroy();
           this.cardElement = null;
       }
       this.loading = false; // Ensure loading is false
  }
}
