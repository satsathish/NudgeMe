import { NudgeMeConstant } from "../models/constant";
import { ViewManager } from "./view-manager-service";

interface Reminder {
    id: number;
    info: string;
    createdDate: string;
    lastReminded: string | null;
    nextReminder: string;
    snooze: boolean;
}

export class ReminderPollingService {
    private static instance: ReminderPollingService;
    private intervalId: NodeJS.Timeout | null = null;
    private viewManager: ViewManager;

    private constructor() {
        this.viewManager = ViewManager.getInstance();
    }

    static getInstance(): ReminderPollingService {
        if (!ReminderPollingService.instance) {
            ReminderPollingService.instance = new ReminderPollingService();
        }
        return ReminderPollingService.instance;
    }

    start(): void {
        if (this.intervalId) {
            console.log('Polling service already running');
            return;
        }

        console.log('Starting reminder polling service...');

        // Check immediately
        this.checkReminders();

        // Then check every 1 minute
        this.intervalId = setInterval(() => {
            this.checkReminders();
        }, 60 * 1000); // 60 seconds
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Polling service stopped');
        }
    }

    private async checkReminders(): Promise<void> {
        try {
            console.log('Checking for reminders...', `${NudgeMeConstant.ADD_NUDGE_URL}/Reminder`);
            const response = await fetch(`${NudgeMeConstant.ADD_NUDGE_URL}/Reminder`);

            if (!response.ok) {
                console.error('Failed to fetch reminders:', response.status, response.statusText);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Invalid response type:', contentType);
                const text = await response.text();
                console.error('Response body:', text.substring(0, 200));
                return;
            }

            const reminders: Reminder[] = await response.json();
            console.log(`Fetched ${reminders.length} reminders`);
            const now = new Date();

            reminders.forEach(reminder => {
                console.log('Checking reminder:', reminder);

                console.log('Checking reminder:', reminder.info, reminder.nextReminder);
                const reminderTime = new Date(reminder.nextReminder);
                const timeDiff = reminderTime.getTime() - now.getTime();

                // Trigger notification if reminder time is within the next minute
                // or if it's already past (within last 5 minutes to avoid spam)
                if (timeDiff >= -300000 && timeDiff <= 60000) {
                    this.triggerNotification(reminder);
                }
            });
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    }

    private triggerNotification(reminder: Reminder): void {
        const notification = this.viewManager.get('notification');

        if (notification && !notification.isVisible()) {
            // Pass reminder ID to load specific reminder detail
            const url = `${NudgeMeConstant.ADD_NUDGE_URL}/nudge/${reminder.id}`;
            notification.show(url);

            console.log(`Notification triggered for: ${reminder.info} at ${reminder.nextReminder}`);
        }
    }

    // Manual check for testing
    async checkNow(): Promise<void> {
        await this.checkReminders();
    }
}
