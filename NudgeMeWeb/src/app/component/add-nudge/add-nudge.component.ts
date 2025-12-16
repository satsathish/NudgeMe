import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

interface AddNudgeForm { info: string; date: Date | null; time: string | null; }

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
    submitting = signal(false);
    createdId = signal<number | null>(null);
    error = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        info: ['', [Validators.required, Validators.maxLength(500)]],
        date: [null as Date | null, [Validators.required]],
        time: [null as string | null, [Validators.required]]
    });

    private snack = inject(MatSnackBar);

    get info() { return this.form.controls.info; }


    ngOnInit(): void {
        this.reminderService.getAll().subscribe({
            next: (reminders) => console.log(reminders),
            error: (err) => console.error(err)
        });
    }
    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.error.set(null);

        const value = this.form.getRawValue();
        console.log('Submitting new nudge', value);

        // Combine date and time into single DateTime
        const nextReminder = new Date(value.date!);
        if (value.time) {
            const [hours, minutes] = value.time.split(':').map(Number);
            nextReminder.setHours(hours, minutes, 0, 0);
        }

        this.reminderService.create(value.info, nextReminder).subscribe({
            next: (reminder) => {
                console.log('Created reminder:', reminder);
                this.createdId.set(reminder.id);
                this.form.reset();
                this.snack.open('Nudge created', 'Close', { duration: 3000 });
                this.submitting.set(false);
            },
            error: (err) => {
                console.error('Error creating reminder:', err);
                this.error.set(err.message || 'Failed to create');
                this.snack.open(`Error: ${this.error()}`, 'Close', { duration: 4000 });
                this.submitting.set(false);
            }
        });
    }
}
