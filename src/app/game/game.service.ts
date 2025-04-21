import { Injectable } from '@angular/core';
import { Games } from '../shared/game-info.model';
import { Subject } from 'rxjs';
import { WishListService } from '../wishlist/wishlist.service';

@Injectable()
export class GameService {
  // constructor(private wishlistService: WishListService) {}

  games: Games[] = [
    {
      name: 'The Legend of Zelda: Breath of the Wild',
      price: 39.99,
      genre: 'Action-adventure',
      image_url:
        'https://assets.nintendo.com/image/upload/v1681238674/Microsites/zelda-tears-of-the-kingdom/videos/posters/totk_microsite_officialtrailer3_1304xj47am',
      rating: 5,
      description:
        'The series centers on the various incarnations of Link, a courageous young man of the elf-like Hylian race, and Princess Zelda, a magical princess who is the mortal reincarnation of the goddess Hylia, as they fight to save the magical land of Hyrule from Ganon, an evil warlord turned demon king, who is the principal ...',
    },
    {
      name: 'Red Dead Redemption 2',
      price: 49.99,
      genre: 'Action-adventure',
      image_url:
        'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg?t=1671485009',
      rating: 4.5,
      description:
        'The story is set in a fictionalized representation of the United States in 1899 and follows the exploits of outlaw Arthur Morgan, a member of the Van der Linde gang, who must deal with the decline of the Wild West whilst attempting to survive against government forces, rival gangs, and other adversaries.',
    }, {
      name: 'The Witcher 3: Wild Hunt',
      price: 39.99,
      genre: 'Action RPG',
      image_url:
        'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Witcher_3_cover_art.jpg/220px-Witcher_3_cover_art.jpg',
      rating: 4.7,
      description:
        'A story-driven, open world adventure set in a dark fantasy universe.',
    },
    {
      name: 'Spider-Man 2',
      price: 59.99,
      genre: 'Action-adventure',
      image_url:
        'https://i0.wp.com/thefutureoftheforce.com/wp-content/uploads/2021/09/Insomniac-Games-Spider-Man-2-Announced.jpg?fit=1934%2C1094&ssl=1',
      rating: 5,
      description:
        "Marvel's Spider-Man 2 is an upcoming action-adventure game developed by Insomniac Games and published by Sony Interactive Entertainment. Based on the Marvel Comics character Spider-Man, it features a narrative inspired by the long-running comic book mythology while also deriving from various adaptations in other media.",
    },
    {
      name: 'Uncharted 4',
      price: 59.99,
      genre: 'Action-adventure',
      image_url:
        'https://cdn.ndtv.com/tech/gadgets/uc_4_thiefs_end.jpg',
      rating: 0,
      description:
        "UNCHARTED 4: A Thief's End takes players on a journey around the globe, through jungle isles, far-flung cities and snow-capped peaks on the search for Avery’s fortune.",
    },
  ];

  getGames() {
    return this.games;
  }

  getGame(index: number) {
    return this.games[index];
  }

}
