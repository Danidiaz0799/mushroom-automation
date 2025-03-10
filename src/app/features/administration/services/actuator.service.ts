import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActuatorService {
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;
  private IdealParamsUrl = `${environment.apiUrl}/IdealParams`;

  constructor(private http: HttpClient) { }

  lightControl(state: boolean): Observable<any> {
    return this.http.post<any>(`${this.actuatorsUrl}/toggle_light`, { state });
  }

  fanControl(state: boolean): Observable<any> {
    return this.http.post<any>(`${this.actuatorsUrl}/toggle_fan`, { state });
  }

  humidifierControl(state: boolean): Observable<any> {
    return this.http.post<any>(`${this.actuatorsUrl}/toggle_humidifier`, { state });
  }

  motorControl(state: boolean): Observable<any> {
    return this.http.post<any>(`${this.actuatorsUrl}/toggle_motor`, { state });
  }

  //Endpoint /IdealParams
  getIdealParams(param_type: string): Observable<any> {
    return this.http.get<any>(`${this.IdealParamsUrl}/${param_type}`);
  }

  putIdealParams(param_type: string, obj: any): Observable<any> {
    return this.http.put<any>(`${this.IdealParamsUrl}/${param_type}`, obj);
  }
}
