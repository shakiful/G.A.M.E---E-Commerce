import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit,
  Input,
} from '@angular/core';
import { Games } from './shared/game-info.model';
import { GameItemComponent } from './game/game-list/game-item/game-item.component';
import { GameService } from './game/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  title = 'Game-Shop';

  constructor(private gameService: GameService) {}
  

  ngOnInit(): void {}
}
