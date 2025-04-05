import { Routes } from '@angular/router';

export const informationRoutes: Routes = [
    {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Reportes'
    },
    {
        path: 'reports/:clientId/:reportId',
        loadComponent: () => import('./components/report-details/report-details.component').then(m => m.ReportDetailsComponent),
        title: 'Detalles del Reporte'
    },
    { path: '', redirectTo: 'reports', pathMatch: 'full' },
];
