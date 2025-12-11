import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'view-nudge', pathMatch: 'full' },
    { path: 'reminder', loadComponent: () => import('./component/remainder').then(m => m.ReminderComponent) },
    { path: 'add-nudge', loadComponent: () => import('./component/add-nudge/add-nudge.component').then(m => m.AddNudgeComponent) },
    { path: 'view-nudge', loadComponent: () => import('./component/view-nudge/view-nudge.component').then(m => m.ViewNudgeComponent) },
];
