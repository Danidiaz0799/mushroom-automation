import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () => import('../features/auth/routes').then(m => m.authRoutes),
    },
    {
        path: '',
        loadComponent: () => import('../shared/components/layout/layout.component').then(m => m.LayoutComponent),
        children: [
        { path: 'home', loadComponent: () => import('../features/dashboard/components/home/home.component').then(m => m.HomeComponent) },
        ],
    },
    { path: '**', redirectTo: 'auth' },
];
