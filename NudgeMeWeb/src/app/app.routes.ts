import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'view-nudge', pathMatch: 'full' },
    { path: 'add-nudge', loadComponent: () => import('./component/add-nudge/add-nudge.component').then(m => m.AddNudgeComponent) },
    { path: 'view-nudge', loadComponent: () => import('./component/view-nudge/view-nudge.component').then(m => m.ViewNudgeComponent) },
    { path: 'nudge/:id', loadComponent: () => import('./component/nudge-detail/nudge-detail.component').then(m => m.NudgeDetailComponent) }
];
