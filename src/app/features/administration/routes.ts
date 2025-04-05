import { Routes } from '@angular/router';
import { ActuatorControlComponent } from './components/actuator-control/actuator-control.component';
import { ClientManagementComponent } from './components/client-management/client-management.component';

export const administrationRoutes: Routes = [
    { path: 'client-management', component: ClientManagementComponent },
    { path: 'actuator-control', component: ActuatorControlComponent },
    { path: '', redirectTo: 'client-management', pathMatch: 'full' },
];
