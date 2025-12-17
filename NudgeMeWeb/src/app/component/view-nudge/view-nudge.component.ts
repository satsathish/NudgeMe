import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReminderService } from '../../service/remainder.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Reminder } from '../../model/reminder.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-view-nudge',
    standalone: true,
    imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule
        //    , DatePipe
    ],
    templateUrl: './view-nudge.component.html',
    styleUrls: ['./view-nudge.component.scss']
})
export class ViewNudgeComponent {
    private service = inject(ReminderService);
    private router = inject(Router);
    loading = signal(true);
    error = signal<string | null>(null);
    reminders = signal<Reminder[]>([]);

    ngOnInit() {
        this.load();
    }

    load() {
        this.loading.set(true);
        this.error.set(null);
        this.service.getAll().subscribe({
            next: (data: Reminder[]) => { this.reminders.set(data); },
            error: (err: any) => { this.error.set(err.message || 'Failed to load'); },
            complete: () => this.loading.set(false)
        });
    }

    toggleSnooze(reminder: Reminder) {
        this.service.updateSnooze(reminder.id, !reminder.snooze).subscribe({
            next: () => {
                const updated = this.reminders().map(r =>
                    r.id === reminder.id ? { ...r, snooze: !r.snooze } : r
                );
                this.reminders.set(updated);
            },
            error: (err) => console.error('Failed to toggle snooze:', err)
        });
    }

    delete(id: number) {
        if (!confirm('Delete this reminder?')) return;
        this.service.delete(id).subscribe({
            next: () => {
                this.reminders.set(this.reminders().filter(r => r.id !== id));
            },
            error: (err) => console.error('Failed to delete:', err)
        });
    }

    edit(id: number) {
        this.router.navigate(['/nudge', id]);
    }
}
