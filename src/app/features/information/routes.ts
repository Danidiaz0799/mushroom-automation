import { Routes } from '@angular/router';

export const informationRoutes: Routes = [
    {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Reportes'
    },
    { path: '', redirectTo: 'reports', pathMatch: 'full' },
];
