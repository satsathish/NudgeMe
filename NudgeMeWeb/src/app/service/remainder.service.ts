import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reminder {
    id?: number;
    message?: string;
    time?: string;
}

@Injectable()
export class ReminderService {
    private readonly http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/reminder';

    getAll(): Observable<Reminder[]> {
        return this.http.get<Reminder[]>(this.apiUrl);
    }

    create(reminder: Reminder): Observable<any> {
        return this.http.post(this.apiUrl, reminder);
    }

    update(id: number, reminder: Reminder): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, reminder);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}