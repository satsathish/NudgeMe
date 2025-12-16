// Backend model reference (C# Reminder):
// public class Reminder { Id:int; Info:string; CreatedDate:DateTime; LastReminded:DateTime?; NextReminder:DateTime; Snooze:bool }

export interface ReminderDto {
    id: number;
    info: string;
    createdDate: string;          // ISO string from API
    lastReminded?: string | null; // ISO or null
    snooze: boolean;
    nextReminder: string;         // ISO string
}

export interface Reminder {
    id: number;
    info: string;
    createdDate: Date;
    lastReminded: Date | null;
    snooze: boolean;
    nextReminder: Date;
}

export function mapReminderDto(dto: ReminderDto): Reminder {
    return {
        id: dto.id,
        info: dto.info,
        createdDate: new Date(dto.createdDate),
        lastReminded: dto.lastReminded ? new Date(dto.lastReminded) : null,
        snooze: dto.snooze,
        nextReminder: new Date(dto.nextReminder)
    };
}

export function toReminderCreatePayload(r: { info: string; nextReminder: Date }): any {
    return {
        info: r.info,
        nextReminder: r.nextReminder.toISOString()
    };
}
