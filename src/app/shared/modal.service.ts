import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Games } from './game-info.model'; // Adjust path if needed

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  // Use BehaviorSubject to hold the current game and visibility state
  // null means no game selected / modal closed
  private selectedGameSource = new BehaviorSubject<Games | null>(null);
  selectedGame$ = this.selectedGameSource.asObservable();

  private isModalOpenSource = new BehaviorSubject<boolean>(false);
  isModalOpen$ = this.isModalOpenSource.asObservable();

  constructor() {}

  openModal(game: Games): void {
    this.selectedGameSource.next(game); // Set the game data
    this.isModalOpenSource.next(true); // Set visibility to true
  }

  closeModal(): void {
    this.isModalOpenSource.next(false); // Set visibility to false
    // Optionally delay clearing the game data until after fade-out animation
    // setTimeout(() => this.selectedGameSource.next(null), 300); // Example delay
    this.selectedGameSource.next(null); // Clear the game data
  }
}
