import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Games } from '../shared/game-info.model';
import { ToastService } from '../shared/toast.service';
import { SupabaseService } from '../shared/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class WishListService {
  private wishList: Games[] = [];
  listedWish = new Subject<Games[]>();
  private wishlistChanged = new Subject<Games[]>();
  wishlistChanged$ = this.wishlistChanged.asObservable();

  constructor(private toastService: ToastService, private supabaseService: SupabaseService) {}

  async addToWishList(game: Games) {
    const supabase = this.supabaseService.getClient();
    const user = this.supabaseService.getClient();

    if (!user) {
      this.toastService.show('Please Login to add to wishlist', 'error');
      return;
    }

    const exists = this.wishList.some(g => g.name === game.name);
    if (!exists) {
      try {
        const { data, error } = await supabase
          .from('wishlist_items')
          .insert([{
            // user_id: user.id,
            game_id: game.id,
          }]);

        if (error) {
          console.error('Error adding to wishlist:', error);
          this.toastService.show('Error adding to wishlist', 'error');
          return;
        }

        this.toastService.show('Game Added to Wishlist', 'success');
        this.wishList.push(game);
        this.listedWish.next(this.wishList.slice());
        this.wishlistChanged.next(this.wishList.slice());
      } catch (e) {
        console.error(e);
      }
    } else {
      this.toastService.show('Game already in wishlist', 'info');
    }
  }

  async removeWishList(gameToRemove: Games) {
    const supabase = this.supabaseService.getClient();
    const user = this.supabaseService.getClient().auth.getUser();

    if (!user) {
      this.toastService.show('Please Login to remove from wishlist', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ 
          // user_id: user.id,
           game_id: gameToRemove.id });

      if (error) {
        console.error('Error removing from wishlist:', error);
        this.toastService.show('Error removing from wishlist', 'error');
        return;
      }

      const initialLength = this.wishList.length;
      this.wishList = this.wishList.filter(game => game.name !== gameToRemove.name);
      if (this.wishList.length < initialLength) {
        this.listedWish.next(this.wishList.slice());
        this.wishlistChanged.next(this.wishList.slice());
        this.toastService.show('Game removed from wishlist', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }

  getWishList() {
    return this.wishList.slice();
  }
}
