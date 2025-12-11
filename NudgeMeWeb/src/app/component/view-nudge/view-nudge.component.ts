import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReminderService } from '../../service/remainder.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Reminder } from '../../model/reminder.model';

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
}
