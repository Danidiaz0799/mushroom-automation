import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/DhtSensor`;
  private eventsUrl = `${environment.apiUrl}/Event`;
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;

  constructor(private http: HttpClient) { }

  getSensorData(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getEvents(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.eventsUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getActuators(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.actuatorsUrl}?page=${page}&pageSize=${pageSize}`);
  }
}
