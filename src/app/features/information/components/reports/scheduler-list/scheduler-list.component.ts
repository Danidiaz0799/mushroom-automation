import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulerStatus } from '../../../models/scheduler.model';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-scheduler-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduler-list.component.html',
})
export class SchedulerListComponent {
  @Input() schedulerStatuses: Map<string, SchedulerStatus> = new Map();
  @Input() clients: Client[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() stopScheduler = new EventEmitter<string>();

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  formatNextRun(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const nextRun = new Date(dateString);
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    
    if (diff < 0) return 'En progreso';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `En ${hours}h ${minutes}m`;
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c.client_id === clientId);
    return client ? client.name : clientId;
  }

  onStopScheduler(clientId: string): void {
    this.stopScheduler.emit(clientId);
  }
} 