import { Routes } from '@angular/router';
import { DataCollectionComponent } from './components/data-collection/data-collection.component';

export const informationRoutes: Routes = [
    { path: 'data-collection', component: DataCollectionComponent },
    { path: '', redirectTo: 'data-collection', pathMatch: 'full' },
];
