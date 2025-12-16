import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Reminder, ReminderDto, mapReminderDto, toReminderCreatePayload } from '../model/reminder.model';
import { environment } from '../../environments/environment';

@Injectable()
export class ReminderService {
    private readonly http = inject(HttpClient);
    
    // Dynamically construct API URL based on current domain
    private apiUrl = `${window.location.origin}`;

    getAll(): Observable<Reminder[]> {
        return this.http.get<ReminderDto[]>(this.apiUrl + '/Reminder')
            .pipe(map(list => list.map(mapReminderDto)));
    }

    create(info: string, nextReminder: Date): Observable<Reminder> {
        const payload = toReminderCreatePayload({ info, nextReminder });
        return this.http.post<ReminderDto>(this.apiUrl + '/Reminder', payload)
            .pipe(map(mapReminderDto));
    }

    update(id: number, patch: Partial<{ info: string; nextReminder: string; lastReminded: string | null }>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/Reminder/${id}`, patch);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateSnooze(id: number, snooze: boolean): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/Reminder/${id}/snooze`, { snooze });
    }
}