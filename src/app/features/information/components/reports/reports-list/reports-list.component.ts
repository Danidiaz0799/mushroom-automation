import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Report } from '../../../models/report.model';
// import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-list.component.html',
})
export class ReportsListComponent {
  @Input() reports: Report[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() viewReport = new EventEmitter<Report>();
  @Output() downloadReport = new EventEmitter<Report>();
  @Output() deleteReport = new EventEmitter<Report>();

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onViewReport(report: Report): void {
    this.viewReport.emit(report);
  }

  onDownloadReport(report: Report): void {
    this.downloadReport.emit(report);
  }

  onDeleteReport(report: Report): void {
    this.deleteReport.emit(report);
  }
} 