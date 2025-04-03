import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { ClientService } from 'src/app/shared/services/client.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit, OnDestroy {
  @Input() events: any[] = [];
  intervalId: any;
  selectedTopic: string = '';

  private dashboardService = inject(DashboardService);
  private clientService = inject(ClientService);

  ngOnInit(): void {
    this.fetchEvents();
    this.intervalId = setInterval(() => {
      this.fetchEvents(false);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchEvents(showSpinner: boolean = true) {
    const clientId = this.clientService.getCurrentClientId();
    if (this.selectedTopic) {
      this.dashboardService.getEventsByTopic(clientId, this.selectedTopic, 1, 5, showSpinner).subscribe(data => {
        this.events = data.map((event: any) => ({
          ...event,
          formattedTimestamp: this.formatTimestamp(event.timestamp),
          message: this.formatMessage(event.message)
        }));
      });
    } else {
      this.dashboardService.getEvents(clientId, 1, 5, showSpinner).subscribe(data => {
        this.events = data.map((event: any) => ({
          ...event,
          formattedTimestamp: this.formatTimestamp(event.timestamp),
          message: this.formatMessage(event.message)
        }));
      });
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour12: true
    };
    return date.toLocaleString('es-ES', options);
  }

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

  getIconForTopic(topic: string): string {
    switch (topic) {
      case 'humedad':
        return '💧';
      case 'temperatura':
        return '🌡️';
      default:
        return '🔔';
    }
  }

  deleteEvent(id: number): void {
    const clientId = this.clientService.getCurrentClientId();
    this.dashboardService.deleteEvent(clientId, id).subscribe(() => {
      this.events = this.events.filter(event => event.id !== id);
      console.log('Evento eliminado correctamente');
    }, error => {
      console.error('Error al eliminar el evento:', error);
    });
  }
}
