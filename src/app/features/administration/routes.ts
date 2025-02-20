import { Routes } from '@angular/router';
import { ActuatorControlComponent } from './components/actuator-control/actuator-control.component';

export const administrationRoutes: Routes = [
    { path: 'actuator-control', component: ActuatorControlComponent },
    { path: '', redirectTo: 'actuator-control', pathMatch: 'full' },
];
