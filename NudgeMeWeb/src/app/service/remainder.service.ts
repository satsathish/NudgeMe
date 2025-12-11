import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Reminder, ReminderDto, mapReminderDto, toReminderCreatePayload } from '../model/reminder.model';
import { environment } from '../../environments/environment';

@Injectable()
export class ReminderService {
    private readonly http = inject(HttpClient);
    // Prefer relative when served via same domain (nginx / container) else set environment
    //private apiUrl = 'http://localhost:8080/api/reminder';

    private apiUrl = `${environment.apiBase}`;

    getAll(): Observable<Reminder[]> {
        return this.http.get<ReminderDto[]>(this.apiUrl + '/Reminder')
            .pipe(map(list => list.map(mapReminderDto)));
    }

    create(info: string, gapMinutes: number): Observable<Reminder> {
        const payload = toReminderCreatePayload({ info, gapMinutes });
        return this.http.post<ReminderDto>(this.apiUrl + '/Reminder', payload)
            .pipe(map(mapReminderDto));
    }

    update(id: number, patch: Partial<{ info: string; gapSeconds: number; lastReminded: string | null }>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, patch);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}