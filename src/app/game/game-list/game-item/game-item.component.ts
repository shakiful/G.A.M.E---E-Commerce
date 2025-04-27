import { MyCartService } from './../../../my-cart/my-cart.service';
import { Component, Input, OnInit, Injectable } from '@angular/core';
import { Games } from 'src/app/shared/game-info.model';
import { GameService } from '../../game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { SupabaseService } from 'src/app/shared/supabase.service';

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

  constructor(
    private myCartService: MyCartService,
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.isAuthenticatedUser();
    if (user) {
      try {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
          .from('user_library')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_id', this.game.id);

        if (error) {
          console.error('Error fetching user library:', error);
          return;
        }

        this.isOwned = data && data.length > 0;
      } catch (error) {
        console.error('Error fetching user library:', error);
      }
    }
  }
  onCart(event: Event) {
    event.stopPropagation(); // Prevent the parent div's click event from firing
    this.myCartService.addToCart(this.game);
  }
  goToDetailsPage(){
    this.router.navigate([this.index], {relativeTo: this.route});
  }
}
