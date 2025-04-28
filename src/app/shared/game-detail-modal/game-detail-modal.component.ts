import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Games } from '../game-info.model'; // Adjust path if needed
import { ModalService } from '../modal.service'; // Adjust path if needed
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-detail-modal',
  templateUrl: './game-detail-modal.component.html',
  styleUrls: ['./game-detail-modal.component.scss']
})
export class GameDetailModalComponent implements OnInit {
  // Observables to get data from the service
  isModalOpen$: Observable<boolean>;
  selectedGame$: Observable<Games | null>;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.isModalOpen$ = this.modalService.isModalOpen$;
    this.selectedGame$ = this.modalService.selectedGame$;
  }

  // Method to close the modal via the service
  close(): void {
    this.modalService.closeModal();
  }

  // Prevent clicks inside the modal content from closing it
  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
