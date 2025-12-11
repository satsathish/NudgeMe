// Preload script (optional) - exposes limited, secure APIs
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('nudgeme', {
  version: '0.1.0'
});
