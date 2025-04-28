import { Injectable } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subject, BehaviorSubject } from 'rxjs'; // Import BehaviorSubject
import { ToastService } from '../shared/toast.service';
import { SupabaseService } from '../shared/supabase.service';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MyCartService {
  private gameCart: Games[] = [];
  // Use BehaviorSubject to emit the latest value to new subscribers
  listedCart = new BehaviorSubject<Games[]>([]); // Initialize with empty array
  cartItemCount = new BehaviorSubject<number>(0); // Use BehaviorSubject for count as well
  private localStorageKey = 'gameCart';

  constructor(private toastService: ToastService, private supabaseService: SupabaseService, private authService: AuthService) {
    // Load cart from localStorage on service initialization
    this.loadCartFromLocalStorage();

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.loadCartForUser();
      } else {
         // If user logs out, clear the in-memory cart and update subjects
         this.gameCart = [];
         this.listedCart.next([]);
         this.cartItemCount.next(0);
         // Optionally clear local storage or keep it based on desired behavior for logged out users
         // this.saveCartToLocalStorage(); // Uncomment if you want to clear local storage on logout
      }
    });
  }

  private loadCartFromLocalStorage() {
    try {
      const storedCart = localStorage.getItem(this.localStorageKey);
      this.gameCart = storedCart ? JSON.parse(storedCart) : [];
      // Emit the loaded cart immediately using BehaviorSubject
      this.listedCart.next(this.gameCart.slice());
      this.cartItemCount.next(this.gameCart.length);
      // console.log('Cart loaded from localStorage and emitted:', this.gameCart); // Removed logging
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.gameCart = [];
      this.listedCart.next([]);
      this.cartItemCount.next(0);
    }
  }

  private saveCartToLocalStorage() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.gameCart));
      // console.log('Cart saved to localStorage:', this.gameCart); // Removed logging
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  async loadCartForUser() {
    const supabase = this.supabaseService.getClient();
    const user = await supabase.auth.getUser();

    if (user.data.user) {
      try {
        // console.log('Loading cart for user from database...', user.data.user.id); // Removed logging
        const { data, error } = await supabase
          .from('cart_items')
          .select('game_id, quantity')
          .eq('user_id', user.data.user.id);

        if (error) {
          console.error('Error loading cart from database:', error);
          return;
        }

        // Fetch game details for the items in the cart
        const gameIds = data.map(item => item.game_id);
        // console.log('Fetched cart item IDs from DB:', gameIds); // Removed logging

        if (gameIds.length > 0) {
          const { data: gamesData, error: gamesError } = await supabase
            .from('games') // Assuming your games are in a table named 'games' with an 'id' and other game properties
            .select('*')
            .in('id', gameIds);

          if (gamesError) {
            console.error('Error fetching game details for cart:', gamesError);
            return;
          }

          const dbCartItems = gamesData ? gamesData.map(gameData => new Games(gameData.name, gameData.price, gameData.genre, gameData.image_url, gameData.description, gameData.rating, gameData.id)) : [];
          // console.log('Fetched game details from DB:', dbCartItems); // Removed logging

          // Merge local cart with database cart (db cart has priority)
          const localCart = this.gameCart.slice();
          const mergedCart: Games[] = [...dbCartItems];

          localCart.forEach(localItem => {
            const existsInDb = mergedCart.some(dbItem => dbItem.id === localItem.id);
            if (!existsInDb) {
              mergedCart.push(localItem);
            }
          });

          this.gameCart = mergedCart;
          this.saveCartToLocalStorage(); // Save the merged cart
          this.listedCart.next(this.gameCart.slice());
          this.cartItemCount.next(this.gameCart.length);
          // console.log('Merged cart loaded for user and emitted:', this.gameCart); // Removed logging
        } else {
           // If database cart is empty, just use the local cart and emit
           // console.log('Database cart is empty, using local cart:', this.gameCart); // Removed logging
           this.listedCart.next(this.gameCart.slice());
           this.cartItemCount.next(this.gameCart.length);
        }
      } catch (e) {
        console.error('Unexpected error loading cart for user:', e);
      }
    } else {
       // console.log('User not logged in, using only local cart:', this.gameCart); // Removed logging
       this.listedCart.next(this.gameCart.slice());
       this.cartItemCount.next(this.gameCart.length);
    }
  }

  async addToCart(game: Games) {
    const supabase = this.supabaseService.getClient();
    const user = await supabase.auth.getUser();

    const existsInLocalCart = this.gameCart.some(g => g.id === game.id);

    if (!existsInLocalCart) {
      this.gameCart.push(game);
      this.saveCartToLocalStorage();
      this.listedCart.next(this.gameCart.slice());
      this.cartItemCount.next(this.gameCart.length);
      this.toastService.show('Game Added to Cart', 'success');
      // console.log('Game added to cart and emitted:', this.gameCart); // Removed logging
    } else {
      this.toastService.show('Game already in cart', 'info');
      // console.log('Game already in cart:', game.name); // Removed logging
      return;
    }

    if (user.data.user) {
      // User is logged in, save to database
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.data.user.id,
            game_id: game.id,
            quantity: 1 // Assuming quantity is always 1 for simplicity
          }]);

        if (error) {
          console.error('Error saving cart item to database:', error);
          this.toastService.show('Error saving item to cloud cart', 'error');
        } else {
          // console.log('Game saved to database cart:', data); // Removed logging
        }
      } catch (e) {
        console.error('Unexpected error saving cart item:', e);
        this.toastService.show('Error saving item to cloud cart', 'error');
      }
    }
  }

  async removeFromCart(gameToRemove: Games) {
    const supabase = this.supabaseService.getClient();
    const user = await supabase.auth.getUser();

    const initialLength = this.gameCart.length;

    this.gameCart = this.gameCart.filter(game => game.id !== gameToRemove.id);
    this.saveCartToLocalStorage();
    if (this.gameCart.length < initialLength) {
      this.listedCart.next(this.gameCart.slice());
      this.cartItemCount.next(this.gameCart.length);
      this.toastService.show('Game removed from cart', 'success');
      // console.log('Game removed from cart and emitted:', this.gameCart); // Removed logging
    }

    if (user.data.user) {
      // User is logged in, remove from database
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .delete()
          .match({
            user_id: user.data.user.id,
            game_id: gameToRemove.id
          });

        if (error) {
          console.error('Error removing cart item from database:', error);
          this.toastService.show('Error removing item from cloud cart', 'error');
        } else {
          // console.log('Game removed from database cart:', data); // Removed logging
        }
      } catch (e) {
        console.error('Unexpected error removing cart item:', e);
        this.toastService.show('Error removing item from cloud cart', 'error');
      }
    }
  }

  getCartList() {
    return this.gameCart.slice();
  }

  getCartCount(): number {
    return this.gameCart.length;
  }

  async clearCart() {
    const supabase = this.supabaseService.getClient();
    const user = await supabase.auth.getUser();

    this.gameCart = [];
    this.saveCartToLocalStorage();
    this.listedCart.next(this.gameCart.slice());
    this.cartItemCount.next(this.gameCart.length);
    // console.log('Cart cleared and emitted:', this.gameCart); // Removed logging

    if (user.data.user) {
      // User is logged in, clear database cart
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.data.user.id);

        if (error) {
          console.error('Error clearing cart in database:', error);
          this.toastService.show('Error clearing cloud cart', 'error');
        } else {
            // console.log('Database cart cleared.'); // Removed logging
        }
      } catch (e) {
        console.error('Unexpected error clearing cart:', e);
        this.toastService.show('Error clearing cloud cart', 'error');
      }
    }
  }
}
