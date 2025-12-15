// Electron API declarations for Angular
export {};

declare global {
  interface Window {
    nudgeme?: {
      version: string;
      closeWindow: () => void;
      closeNotification: () => void;
    };
  }
}
