import { Component } from '@angular/core';
import { ReminderService } from '../service/remainder.service';
import { Reminder } from '../model/reminder.model';

@Component({
  standalone: true,
  selector: 'reminder',
  template: `
    <h2>Reminders</h2>     
  `
})
export class ReminderComponent {
  title = '';
  time = '';
  reminders: Reminder[] = [];

  get reminders$() {
    return this.service.getAll();
  }

  constructor(private service: ReminderService) {
    this.service.getAll().subscribe(reminders => {
      this.reminders = reminders;
    });
  }

  addReminder() {

  }

  markDone(id: number) {
    // this.service.markDone(id);
  }
}
