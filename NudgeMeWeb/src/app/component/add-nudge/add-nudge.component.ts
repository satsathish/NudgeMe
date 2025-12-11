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

interface AddNudgeForm { info: string; gapMinutes: number; }

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
        date: [null, [Validators.required]],
        time: [null, [Validators.required]],
        gap: [60, [Validators.required, Validators.min(1), Validators.max(24 * 60)]]
    });

    private snack = inject(MatSnackBar);

    get info() { return this.form.controls.info; }
    get gap() { return this.form.controls.gap; }


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

        // TODO: Inject a Reminder service once aligned with backend; placeholder below.
        const value = this.form.getRawValue();
        console.log('Submitting new nudge', value);



        this.reminderService.create(value.info, 60).subscribe({
            next: (reminders) => console.log(reminders),
            error: (err) => console.error(err)
        });
        // Placeholder fetch example (adjust endpoint to match backend once service is updated):
        // fetch('/api/Reminder', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         info: value.info,
        //         gap: { minutes: value.gapMinutes }
        //     })
        // }).then(async r => {
        //     if (!r.ok) throw new Error(await r.text());
        //     const data = await r.json();
        //     this.createdId.set(data.id ?? null);
        //     this.form.reset({ info: '', gapMinutes: 60 });
        //     this.snack.open('Nudge created', 'Close', { duration: 3000 });
        // }).catch(err => {
        //     this.error.set(err.message || 'Failed to create');
        //     this.snack.open(`Error: ${this.error()}`, 'Close', { duration: 4000 });
        // }).finally(() => this.submitting.set(false));
    }
}
