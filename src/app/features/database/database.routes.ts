import { Routes } from '@angular/router';
import { BackupsComponent } from './components/backups/backups.component';

export const databaseRoutes: Routes = [
  {
    path: 'backups',
    component: BackupsComponent,
    title: 'Gestión de Backups'
  },
  {
    path: '',
    redirectTo: 'backups',
    pathMatch: 'full'
  }
]; 