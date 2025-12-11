// Backend model reference (C# Reminder):
// public class Reminder { Id:int; Info:string; CreatedDate:DateTime; LastReminded:DateTime?; Gap:TimeSpan; NextReminder => (LastReminded ?? CreatedDate)+Gap }

export interface ReminderDto {
    id: number;
    info: string;
    createdDate: string;          // ISO string from API
    lastReminded?: string | null; // ISO or null
    gapSeconds: number;           // numeric seconds (if API returns gapSeconds)
    // optional server computed field if later exposed
    nextReminder?: string;
}

export interface Reminder {
    id?: number;
    info: string;
    createdDate: Date;
    lastReminded: Date | null;
    gap: number;          // total seconds
    nextReminder?: Date;  // optional
}

export function mapReminderDto(dto: ReminderDto): Reminder {
    return {
        id: dto.id,
        info: dto.info,
        createdDate: new Date(dto.createdDate),
        lastReminded: dto.lastReminded ? new Date(dto.lastReminded) : null,
        gap: dto.gapSeconds,
        nextReminder: dto.nextReminder ? new Date(dto.nextReminder) : undefined
    };
}

export function toReminderCreatePayload(r: { info: string; gapMinutes: number }): any {
    return {
        info: r.info,
        // backend expects gapSeconds field (adjust if different)
        gapSeconds: r.gapMinutes * 60
    };
}
