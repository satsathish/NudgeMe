// Preload script - exposes limited, secure APIs
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nudgeme', {
  version: '0.1.0',
  closeWindow: () => ipcRenderer.send('close-window'),
  closeNotification: () => ipcRenderer.send('close-notification')
});
