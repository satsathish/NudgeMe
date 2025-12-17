import { NudgeMeConstant } from "../models/constant";
import { ViewManager } from "./view-manager-service";
import { from, EMPTY, interval, Subscription } from 'rxjs';
import { switchMap, tap, filter, catchError, mergeMap } from 'rxjs/operators';

interface Reminder {
    id: number;
    info: string;
    createdDate: string;
    nextReminder: string;
    snooze: boolean;
}

export class ReminderPollingService {
    private static instance: ReminderPollingService;
    private subscription: Subscription | null = null;
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
        if (this.subscription) {
            console.log('Polling service already running');
            return;
        }

        console.log('Starting reminder polling service...');

        // Check immediately, then every 60 seconds
        this.subscription = interval(60 * 200).pipe(
            tap(() => console.log('Checking for reminders...', `${NudgeMeConstant.ADD_NUDGE_URL}/Reminder`)),
            switchMap(() => this.checkReminders()),
            catchError(error => {
                console.error('Error in polling interval:', error);
                return EMPTY;
            })
        ).subscribe();
    }

    stop(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
            console.log('Polling service stopped');
        }
    }

    private checkReminders() {
        return from(fetch(`${NudgeMeConstant.ADD_NUDGE_URL}/Reminder`)).pipe(
            switchMap(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch reminders: ${response.status} ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Invalid response type: ${contentType}`);
                }

                return from(response.json());
            }),
            mergeMap((reminders: Reminder[]) => from(reminders.filter(r => r.snooze === false))),
            filter(reminder => {
                if (!reminder) {
                    return false;
                }

                const now = new Date(); // System local time
                const reminderTime = new Date(reminder.nextReminder);

                // Trigger if current time >= reminder time (and not too old, within last 5 minutes)
                const shouldTrigger = now.getTime() >= reminderTime.getTime();
              
                console.log('Should trigger:', shouldTrigger);
                
                return shouldTrigger;
            }),
            tap(reminder => this.triggerNotification(reminder)),
            catchError(error => {
                console.error('Error checking reminders:', error);
                return EMPTY;
            })
        );
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
    checkNow(): Subscription {
        return this.checkReminders().subscribe();
    }
}
