import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { SupabaseService } from '../shared/supabase.service';
import { ToastService } from '../shared/toast.service';
import { Games } from '../shared/game-info.model';

interface UserLibraryItem {
  games: Games[];
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  ownedGames: Games[] = [];

  constructor(private authService: AuthService, private supabaseService: SupabaseService, private toastService: ToastService) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.isAuthenticatedUser();
    if (user) {
      try {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
          .from('user_library')
          .select('games(*)')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching user library:', error);
          this.toastService.show('Error fetching user library', 'error');
          return;
        }

        if (data) {
          this.ownedGames = data.map((item: UserLibraryItem) => item.games[0]).filter(game => game !== undefined);
        }

      } catch (error) {
        console.error('Error fetching user library:', error);
        this.toastService.show('Unexpected error fetching user library', 'error');
      }
    }
  }
}