import { Injectable } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subject } from 'rxjs';
import { SupabaseService } from '../shared/supabase.service';

@Injectable()
export class GameService {
  games: Games[] = [];
  gamesChanged = new Subject<Games[]>();

  constructor(private supabaseService: SupabaseService) {}

  async fetchGames() {
    const supabase = this.supabaseService.getClient();

    let { data: games, error } = await supabase
      .from('games')
      .select('*');

    if (error) {
      console.error('Error fetching games:', error);
      return;
    }

    this.games = games.map(game => new Games(
      game.name,
      game.price,
      game.genre,
      game.image_url,
      game.description,
      game.rating,
      game.id // ADD THE ID HERE
    ));
    this.gamesChanged.next(this.games.slice());
  }

  getGames() {
    return this.games.slice();
  }

  getGame(index: number) {
    return this.games[index];
  }

}
