import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit, OnDestroy {
  @Input() events: any[] = [];
  intervalId: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.intervalId = setInterval(() => {
      this.fetchEvents();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchEvents() {
    this.dashboardService.getEvents(1, 5).subscribe(data => {
      this.events = data.map((event: any) => ({
        ...event,
        formattedTimestamp: this.formatTimestamp(event.timestamp)
      }));
    });
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
}
