// Preload script - exposes limited, secure APIs
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  version: '0.1.0',
  closeWindow: () => {
    console.log('Sending closeWindow event to main process');
    ipcRenderer.send('closeWindow');
  },
  closeNotification: () => {
    console.log('Sending closeNotification event to main process');
    ipcRenderer.send('closeNotification');
  }
});
