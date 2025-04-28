import { MyCartService } from './../../../my-cart/my-cart.service';
import { Component, Input, OnInit, Injectable } from '@angular/core';
import { Games } from 'src/app/shared/game-info.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { SupabaseService } from 'src/app/shared/supabase.service';
import { ModalService } from 'src/app/shared/modal.service';

@Injectable()
@Component({
  selector: 'app-game-item',
  templateUrl: './game-item.component.html',
  styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent implements OnInit {
  @Input() game: Games;
  @Input() index: number;
  isOwned = false;
  isLoadingOwnership = false;

  constructor(
    private myCartService: MyCartService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private modalService: ModalService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.isAuthenticatedUser();
    if (user && this.game?.id) {
      // Also check if game.id exists
      this.isLoadingOwnership = true; // <-- Start loading
      try {
        const supabase = this.supabaseService.getClient();
        // Check if a record exists for this user and game
        const { data, error, count } = await supabase
          .from('user_library')
          .select('*', { count: 'exact', head: true }) // More efficient: only check existence
          .eq('user_id', user.id)
          .eq('game_id', this.game.id);

        if (error) {
          console.error(
            `Error checking ownership for game ${this.game.id}:`,
            error.message
          );
          this.isOwned = false; // Assume not owned on error
        } else {
          // If count > 0, the user owns the game
          this.isOwned = (count ?? 0) > 0;
        }
      } catch (error) {
        console.error(
          `Exception checking ownership for game ${this.game.id}:`,
          error
        );
        this.isOwned = false; // Assume not owned on exception
      } finally {
        this.isLoadingOwnership = false; // <-- Stop loading regardless of outcome
      }
    } else {
      // No user logged in or game data is missing, assume not owned and not loading
      this.isOwned = false;
      this.isLoadingOwnership = false;
    }
  }

  onCart(event: Event) {
    event.stopPropagation(); // Prevent potential parent clicks
    this.myCartService.addToCart(this.game);
  }
  // --- Method to open the details modal ---
  showDetailsModal(event: Event) {
    event.stopPropagation(); // Prevent card click if necessary
    this.modalService.openModal(this.game); // Use the service to open
  }
}
