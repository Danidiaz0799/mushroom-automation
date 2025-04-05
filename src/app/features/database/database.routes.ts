import { Routes } from '@angular/router';
import { DatabaseComponent } from './database.component';
import { BackupsComponent } from './components/backups/backups.component';

export const DATABASE_ROUTES: Routes = [
  {
    path: '',
    component: DatabaseComponent,
    children: [
      {
        path: '',
        redirectTo: 'backups',
        pathMatch: 'full'
      },
      {
        path: 'backups',
        component: BackupsComponent,
        title: 'Gestión de Backups'
      }
    ]
  }
]; 