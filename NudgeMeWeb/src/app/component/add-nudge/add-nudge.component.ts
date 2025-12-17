import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReminderService } from '../../service/remainder.service';
import { Reminder } from '../../model/reminder.model';
import { MatIcon } from '@angular/material/icon';

export interface AddNudgeForm { info: string; date: Date | null; time: string | Date | null; }

@Component({
    selector: 'app-add-nudge',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatCardModule, MatSnackBarModule, MatProgressSpinnerModule,
        MatTimepickerModule, MatDatepickerModule, MatIcon],
    templateUrl: './add-nudge.component.html',
    styleUrls: ['./add-nudge.component.scss']
})
export class AddNudgeComponent implements OnInit {

    private fb = inject(FormBuilder);
    private readonly reminderService = inject(ReminderService);
    private router = inject(Router);
    submitting = signal(false);
    createdId = signal<number | null>(null);
    error = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        info: ['', [Validators.required, Validators.maxLength(500)]],
        date: [null as Date | null, [Validators.required]],
        time: [null as string | Date | null, [Validators.required]]
    });

    private snack = inject(MatSnackBar);

    get info() { return this.form.controls.info; }


    ngOnInit(): void {

    }
    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snack.open('Please fill all required fields', 'OK', { duration: 3000 });
            return;
        }

        this.submitting.set(true);
        this.error.set(null);

        const value = this.form.getRawValue();

        // Combine date and time into single DateTime
        const nextReminder = new Date(value.date!);
        if (value.time) {
            // Handle both string "HH:MM" and Date object formats
            if (typeof value.time === 'string') {
                const [hours, minutes] = value.time.split(':').map(Number);
                nextReminder.setHours(hours, minutes, 0, 0);
            } else if (value.time instanceof Date) {
                nextReminder.setHours(value.time.getHours(), value.time.getMinutes(), 0, 0);
            }
        }
        console.log('Creating reminder for:', nextReminder);
        this.reminderService.create(value.info, nextReminder).subscribe({
            next: (reminder) => {
                console.log('✓ Reminder created:', reminder);
                this.createdId.set(reminder.id);
                
                // Show success message
                this.snack.open('✓ Nudge created successfully!', 'View All', { 
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                }).onAction().subscribe(() => {
                    this.navigateToViewAll();
                });
                
                // Reset form for next entry
                this.form.reset();
                this.submitting.set(false);
                
                // Auto-navigate or close after short delay
                setTimeout(() => {
                    if (this.isElectron()) {
                        // Close window in Electron
                        this.closeElectronWindow();
                    } else {
                        // Navigate to view all in browser
                        this.navigateToViewAll();
                    }
                }, 2000);
            },
            error: (err) => {
                console.error('✗ Error creating reminder:', err);
                const errorMsg = this.getErrorMessage(err);
                this.error.set(errorMsg);
                this.snack.open(`✗ ${errorMsg}`, 'Dismiss', { 
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                });
                this.submitting.set(false);
            }
        });
    }

    private isElectron(): boolean {
        return !!(window as any).electronAPI;
    }

    private closeElectronWindow(): void {
        if ((window as any).electronAPI?.closeWindow) {
            (window as any).electronAPI.closeWindow();
        }
    }

    private navigateToViewAll(): void {
        this.router.navigate(['/view-nudge']);
    }

    private getErrorMessage(err: any): string {
        if (err.error?.message) return err.error.message;
        if (err.message) return err.message;
        if (err.status === 0) return 'Cannot connect to server';
        if (err.status === 400) return 'Invalid reminder data';
        if (err.status === 500) return 'Server error occurred';
        return 'Failed to create reminder';
    }
}
