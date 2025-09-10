import { Component } from '@angular/core';
import { Reminder, ReminderService } from '../service/remainder.service';

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
