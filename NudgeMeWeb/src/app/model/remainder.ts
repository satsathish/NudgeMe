export interface Reminder {
    id: number;
    title: string;
    description?: string;
    time: Date;
    done: boolean;
}