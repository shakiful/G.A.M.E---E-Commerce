import { MyCartService } from './../../../my-cart/my-cart.service';
import { Component, Input, OnInit } from '@angular/core'; // Removed Injectable, Router, ActivatedRoute if not needed
import { Games } from 'src/app/shared/game-info.model';
// Removed AuthService, SupabaseService if ONLY used for ownership check
import { ModalService } from 'src/app/shared/modal.service';

@Component({
  selector: 'app-game-item',
  templateUrl: './game-item.component.html',
  styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent implements OnInit { // Removed async from ngOnInit
  @Input() game: Games;
  @Input() index: number;
  @Input() isOwned: boolean = false; // <-- Add new Input, default to false

  // isLoadingOwnership is REMOVED

  constructor(
    private myCartService: MyCartService,
    // private router: Router,           // Remove if only for old details navigation
    // private route: ActivatedRoute,    // Remove if only for old details navigation
    // private authService: AuthService, // Remove if only for ownership check
    // private supabaseService: SupabaseService, // Remove if only for ownership check
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // The ownership check logic is REMOVED from here.
    // ngOnInit can be empty or used for other synchronous setup.
  }

  onCart(event: Event) {
    event.stopPropagation();
    this.myCartService.addToCart(this.game);
  }

  showDetailsModal(event: Event) {
    event.stopPropagation();
    this.modalService.openModal(this.game);
  }
}
