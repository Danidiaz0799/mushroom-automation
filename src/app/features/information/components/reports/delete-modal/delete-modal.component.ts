import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Report } from '../../../models/report.model';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal.component.html',
})
export class DeleteModalComponent {
  @Input() showModal: boolean = false;
  @Input() reportToDelete: Report | null = null;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onConfirmDelete(): void {
    this.confirmDelete.emit();
  }
} 