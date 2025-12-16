import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReminderService } from '../../service/remainder.service';
import { Reminder } from '../../model/reminder.model';

@Component({
    selector: 'app-nudge-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './nudge-detail.component.html',
    styleUrl: './nudge-detail.component.scss'
})
export class NudgeDetailComponent implements OnInit {
    reminder: Reminder | null = null;
    loading = true;
    error: string | null = null;
    isEditMode = signal(false);

    editData = {
        nextReminder: ''
    };

    constructor(
        private route: ActivatedRoute,
        private reminderService: ReminderService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadReminder(parseInt(id));
        } else {
            this.error = 'No reminder ID provided';
            this.loading = false;
        }
    }

    loadReminder(id: number): void {
        this.reminderService.getAll().subscribe({
            next: (reminders) => {
                this.reminder = reminders.find(r => r.id === id) || null;
                if (!this.reminder) {
                    this.error = 'Reminder not found';
                } else {
                    // Convert nextReminder to datetime-local format
                    if (this.reminder.nextReminder) {
                        const date = new Date(this.reminder.nextReminder);
                        this.editData.nextReminder = date.toISOString().slice(0, 16);
                    }
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load reminder';
                this.loading = false;
                console.error('Error loading reminder:', err);
            }
        });
    }

    saveChanges(): void {
        if (!this.reminder) return;

        const nextReminderDate = new Date(this.editData.nextReminder);
        
        this.reminderService.update(this.reminder.id, {
            info: this.reminder.info,
            nextReminder: nextReminderDate.toISOString(),
            lastReminded: this.reminder.lastReminded ? this.reminder.lastReminded.toISOString() : null
        }).subscribe({
            next: () => {
                this.loadReminder(this.reminder!.id);
                this.isEditMode.set(false);
            },
            error: (err) => {
                console.error('Error updating reminder:', err);
                alert('Failed to update reminder');
            }
        });
    }

    cancelEdit(): void {
        this.isEditMode.set(false);
    }

    snooze(): void {
        this.isEditMode.set(!this.isEditMode());
        if (this.isEditMode() && this.reminder) {
            if (this.reminder.nextReminder) {
                const date = new Date(this.reminder.nextReminder);
                this.editData.nextReminder = date.toISOString().slice(0, 16);
            }
        }
    }

    deleteReminder(): void {
        if (!this.reminder) return;

        this.reminderService.delete(this.reminder.id).subscribe({
            next: () => {
                console.log('Reminder deleted');
                this.close();
            },
            error: (err) => {
                console.error('Error deleting reminder:', err);
            }
        });
    }

    close(): void {
        if ((window as any).electronAPI) {
            (window as any).electronAPI.closeNotification();
        }
    }
}
