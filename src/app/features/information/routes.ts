import { Routes } from '@angular/router';
import { StatisticsDashboardComponent } from './components/statistics-dashboard/statistics-dashboard.component';
import { MsadDashboardComponent } from './components/msad-dashboard/msad-dashboard.component';

export const informationRoutes: Routes = [
    {
        path: 'statistics',
        component: StatisticsDashboardComponent,
        title: 'Estadísticas del Cultivo'
    },
    {
        path: 'backups',
        component: MsadDashboardComponent,
        title: 'Sistema de Respaldos'
    },
    { path: '', redirectTo: 'statistics', pathMatch: 'full' },
];
