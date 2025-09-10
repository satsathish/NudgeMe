import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'reminder', pathMatch: 'full' },
    { path: 'reminder', loadComponent: () => import('./component/remainder').then(m => m.ReminderComponent) },
];
