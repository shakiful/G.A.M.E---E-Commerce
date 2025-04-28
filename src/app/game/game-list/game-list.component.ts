import { Component, OnInit } from '@angular/core';
 // Adjust the path as necessary
import { forkJoin, of } from 'rxjs'; // Import forkJoin and of from RxJS if converting Promises
import { catchError, map } from 'rxjs/operators'; // Import operators if using RxJS conversion
import { AuthService } from 'src/app/shared/auth.service';
import { Games } from 'src/app/shared/game-info.model';
import { SupabaseService } from 'src/app/shared/supabase.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  selector: 'app-game-list', // Assuming a generic game list component selector
  templateUrl: './game-list.component.html', // Use the template with *ngFor
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  allGames: Games[] = [];
  ownedGameIds = new Set<string | number>();
  loading = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.ownedGameIds.clear();

    try {
      const user = await this.authService.isAuthenticatedUser();
      const supabase = this.supabaseService.getClient();

      // --- Fetch All Games (Adapt this to your actual fetching logic) ---
      const fetchGamesPromise = supabase
        .from('games')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching all games:', error);
            this.toastService.show('Error fetching game list', 'error');
            return [];
          }
          return data || [];
        });

      // --- Fetch Owned Game IDs (Only if user is logged in) ---
      // Define the type for the promise variable
      let fetchOwnedIdsPromise: Promise<{ game_id: string | number }[]>;

      if (user) {
        // Explicitly wrap the Supabase call chain in Promise.resolve()
        fetchOwnedIdsPromise = Promise.resolve( // <-- Wrap here
          supabase
            .from('user_library')
            .select('game_id')
            .eq('user_id', user.id)
            .then(({ data, error }) => { // Handle the result inside
              if (error) {
                console.error('Error fetching user library IDs:', error);
                this.toastService.show('Error fetching ownership status', 'error');
                return []; // Return empty array on error
              }
              // Ensure data is an array, otherwise return empty array
              return data || [];
            })
        );
      } else {
        // If no user, resolve immediately with an EMPTY ARRAY
        fetchOwnedIdsPromise = Promise.resolve([]);
      }

      // --- Wait for both fetches to complete ---
      const [gamesData, ownedIdsData] = await Promise.all([
        fetchGamesPromise,
        fetchOwnedIdsPromise // Should now correctly be Promise<Array>
      ]);

      // Process results
      this.allGames = gamesData;

      ownedIdsData.forEach(item => this.ownedGameIds.add(item.game_id));

    } catch (error) {
      console.error('Error loading game data:', error);
      this.toastService.show('Unexpected error loading game data', 'error');
      this.allGames = [];
      this.ownedGameIds.clear();
    } finally {
      this.loading = false;
    }
  }
}
