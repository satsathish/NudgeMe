// Backend model reference (C# Reminder):
// public class Reminder { Id:int; Info:string; CreatedDate:DateTime; NextReminder:DateTime; Snooze:bool }

export interface ReminderDto {
    id: number;
    info: string;
    createdDate: string;          // ISO string from API
    snooze: boolean;
    nextReminder: string;         // ISO string
}

export interface Reminder {
    id: number;
    info: string;
    createdDate: Date;
    snooze: boolean;
    nextReminder: Date;
}

export function mapReminderDto(dto: ReminderDto): Reminder {
    return {
        id: dto.id,
        info: dto.info,
        createdDate: new Date(dto.createdDate),
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
