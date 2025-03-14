import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-data-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './data-collection.component.html'
})
export class DataCollectionComponent {
  form: FormGroup;
  data: any[] = [];
  page: number = 1;
  pageSize: number = 100;

  constructor(private fb: FormBuilder, private dashboardService: DashboardService) {
    this.form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      sensorType: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  fetchData() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { startDate, endDate, sensorType } = this.form.value;
    this.dashboardService.getSensorDataByDateRange(startDate, endDate, this.page, this.pageSize).subscribe(data => {
      if (sensorType === 'sht3x') {
        this.data = data.sht3x_data;
      } else if (sensorType === 'gy302') {
        this.data = data.gy302_data;
      }
    });
  }

  downloadExcel() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'sensor_data.xlsx');
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    return startDate && endDate && startDate > endDate ? { dateRangeInvalid: true } : null;
  }
}
