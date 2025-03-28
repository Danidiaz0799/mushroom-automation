import { Routes } from '@angular/router';
import { StatisticsDashboardComponent } from './components/statistics-dashboard/statistics-dashboard.component';

export const informationRoutes: Routes = [
    { path: 'statistics', component: StatisticsDashboardComponent },
    { path: '', redirectTo: 'statistics', pathMatch: 'full' },
];
