import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://localhost:7126/api/DhtSensor';
  private eventsUrl = 'https://localhost:7126/api/Event';

  constructor(private http: HttpClient) { }

  getSensorData(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getEvents(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.eventsUrl}?page=${page}&pageSize=${pageSize}`);
  }
}
