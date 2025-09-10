import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReminderComponent } from './component/remainder';
import { ReminderService } from './service/remainder.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [ReminderService],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('NudgeMeWeb');
}
