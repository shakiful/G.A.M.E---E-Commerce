import { Injectable } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subject } from 'rxjs';
import { ToastService } from '../shared/toast.service';
import { SupabaseService } from '../shared/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MyCartService {
  private gameCart: Games[] = [];
  listedCart = new Subject<Games[]>();
  cartItemCount = new Subject<number>();

  constructor(private toastService: ToastService, private supabaseService: SupabaseService) {}

  async addToCart(game: Games) {
    const supabase = this.supabaseService.getClient();
    const user = this.supabaseService.getClient().auth.getUser();
    console.log(user);
    
    if (!user) {
      this.toastService.show('Please Login to add to cart', 'error');
      return;
    }

    const exists = this.gameCart.some(g => g.name === game.name);
    if (!exists) {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{
            // user_id: user.id,
            game_id: game.id, // Assuming your Games object now has an 'id' property
            quantity: 1
          }]);

        if (error) {
          console.error('Error adding to cart:', error);
          this.toastService.show('Error adding to cart', 'error');
          return;
        }

        this.toastService.show('Game Added to Cart', 'success');
        this.gameCart.push(game);
        this.listedCart.next(this.gameCart.slice());
        this.cartItemCount.next(this.gameCart.length);
      } catch (e) {
        console.error(e);
      }
    } else {
      this.toastService.show('Game already in cart', 'info');
    }
  }

  async removeFromCart(gameToRemove: Games) {
    const supabase = this.supabaseService.getClient();
    const user = this.supabaseService.getClient().auth.getUser();

    if (!user) {
      this.toastService.show('Please Login to remove from cart', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .match({ 
          // user_id: user.id, 
          game_id: gameToRemove.id }); // Assuming your Games object now has an 'id' property

      if (error) {
        console.error('Error removing from cart:', error);
        this.toastService.show('Error removing from cart', 'error');
        return;
      }

      const initialLength = this.gameCart.length;
      this.gameCart = this.gameCart.filter(game => game.name !== gameToRemove.name); // Filter by unique property
      if (this.gameCart.length < initialLength) {
        this.listedCart.next(this.gameCart.slice());
        this.cartItemCount.next(this.gameCart.length);
        this.toastService.show('Game removed from cart', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }

  getCartList() {
    return this.gameCart.slice();
  }

  getCartCount(): number {
    return this.gameCart.length;
  }
}
