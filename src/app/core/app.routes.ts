import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
        path: 'home',
        loadComponent: () => import('../features/dashboard/components/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'auth',
        loadChildren: () => import('../features/auth/routes').then(m => m.authRoutes)
    },
    { path: '**', redirectTo: 'home' }
];
