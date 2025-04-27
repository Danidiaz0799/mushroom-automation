import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backup-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backup-filters.component.html',
  styles: []
})
export class BackupFiltersComponent {
  @Output() filterSelected = new EventEmitter<string>();
  @Output() filtersCleared = new EventEmitter<void>();

  filterByType(type: string): void {
    this.filterSelected.emit(type);
  }

  clearFilters(): void {
    this.filtersCleared.emit();
  }
} 