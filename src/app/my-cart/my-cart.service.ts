import { Injectable } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subject } from 'rxjs';
import { ToastService } from '../shared/toast.service';
import { SupabaseService } from '../shared/supabase.service';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MyCartService {
  private gameCart: Games[] = [];
  listedCart = new Subject<Games[]>();
  cartItemCount = new Subject<number>();

  constructor(private toastService: ToastService, private supabaseService: SupabaseService, private authService: AuthService) {
     this.authService.authState$.subscribe(user => {
        this.loadCartForUser();
      });
  }

  async loadCartForUser() {
    const supabase = this.supabaseService.getClient();
    const user = await supabase.auth.getUser();

    if (user.data.user) {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select('game_id, quantity')
          .eq('user_id', user.data.user.id);

        if (error) {
          console.error('Error loading cart:', error);
          this.clearCart();
          return;
        }

        // Fetch game details for the items in the cart
        const gameIds = data.map(item => item.game_id);
        if (gameIds.length > 0) {
           const { data: gamesData, error: gamesError } = await supabase
            .from('games') // Assuming your games are in a table named 'games' with an 'id' and other game properties
            .select('*')
            .in('id', gameIds);

            if(gamesError){
              console.error('Error fetching game details for cart:', gamesError);
              this.clearCart();
              return;
            }

            // Map fetched games data to Games model
             this.gameCart = gamesData ? gamesData.map(gameData => new Games(gameData.name, gameData.price, gameData.genre, gameData.image_url, gameData.description, gameData.rating, gameData.id)) : [];


        } else {
            this.gameCart = [];
        }

      } catch (e) {
        console.error('Unexpected error loading cart:', e);
        this.gameCart = [];
      }
    } else {
      // User is logged out, clear local cart
      this.gameCart = [];
    }
     this.listedCart.next(this.gameCart.slice());
     this.cartItemCount.next(this.gameCart.length);
  }

  async addToCart(game: Games) {
    const supabase = this.supabaseService.getClient();
    const user = await supabase.auth.getUser();

    const existsInLocalCart = this.gameCart.some(g => g.id === game.id);

    if (existsInLocalCart) {
        this.toastService.show('Game already in cart', 'info');
        return;
    }

    // Add to local cart immediately for responsiveness
    this.gameCart.push(game);
    this.listedCart.next(this.gameCart.slice());
    this.cartItemCount.next(this.gameCart.length);
    this.toastService.show('Game Added to Cart', 'success');

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
          // Consider reverting local change or showing an error message
          this.toastService.show('Error saving item to cloud cart', 'error');
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
    // Remove from local cart immediately for responsiveness
    this.gameCart = this.gameCart.filter(game => game.id !== gameToRemove.id);
    if (this.gameCart.length < initialLength) {
        this.listedCart.next(this.gameCart.slice());
        this.cartItemCount.next(this.gameCart.length);
        this.toastService.show('Game removed from cart', 'success');
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
          // Consider re-adding to local cart or showing an error message
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

  clearCart(){
    this.gameCart = [];
    this.listedCart.next(this.gameCart.slice());
    this.cartItemCount.next(this.gameCart.length);
  }
}
