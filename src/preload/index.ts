import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

import { GlobalApi } from "./types";
import { EventName, OnPreviewFileRespond } from "@/share";

// Custom APIs for renderer
const api: GlobalApi = {
  readFile(fileUrl) {
    return ipcRenderer.invoke(EventName.ReadFile, fileUrl);
  },
  convertFile(options) {
    ipcRenderer.send(EventName.ConvertFile, options.params);
    options.onStart && ipcRenderer.on(EventName.ConvertFileStart, options.onStart);
    options.onProgress &&
      ipcRenderer.on(EventName.ConvertFileProgress, (_, data) => {
        options.onProgress?.(data);
      });
    options.onError &&
      ipcRenderer.on(EventName.ConvertFileError, (_, data) => {
        options.onError?.(data);
      });
    options.onSuccess &&
      ipcRenderer.on(EventName.ConvertFileSuccess, (_, data) => {
        options.onSuccess?.(data);
      });
    options.onComplete && ipcRenderer.on(EventName.ConvertFileComplete, options.onComplete);
  },
  showSaveDialog(options) {
    return ipcRenderer.invoke(EventName.ShowSaveDialog, options);
  },
  onSelectFile(cb) {
    ipcRenderer.on(EventName.SelectFile, (_, fileUrl: string) => {
      cb(fileUrl);
    });
  },
  onPreviewFile(cb) {
    ipcRenderer.on(EventName.PreviewFile, (_, data: OnPreviewFileRespond) => {
      cb(data);
    });
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
