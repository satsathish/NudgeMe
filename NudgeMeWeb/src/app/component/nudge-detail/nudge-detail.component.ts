import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReminderService } from '../../service/remainder.service';
import { Reminder } from '../../model/reminder.model';
import { AddNudgeForm } from '../add-nudge/add-nudge.component';

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

    editData: AddNudgeForm = {
        info: '',
        date: null,
        time: null
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
        this.reminderService.getNudgeId(id).subscribe({
            next: (reminder: Reminder) => {
                this.reminder = reminder
                if (!this.reminder) {
                    this.error = 'Reminder not found';
                    return;
                }
                this.editData.date = this.reminder.nextReminder;
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
        this.reminderService.update(this.reminder.id, {
            info: this.reminder.info,
            nextReminder: this.editData.date!,
        }).subscribe({
            next: () => {
                this.close();
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
                //  this.editData.date = date.toISOString().slice(0, 16);
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
            (window as any).electronAPI.closeWindow();
        } else {
            window.close();
        }
    }
}
