import { EventName, GetPathName, OpenWindownOptions } from "@/share";
import {
  BrowserWindow,
  MessageBoxOptions,
  OpenDialogOptions,
  SaveDialogOptions,
  app,
  dialog,
  ipcMain
} from "electron";
import { getVideoInfo } from "./ffmpeg";
import { createWindow } from "./utils";

export const initEvents = (mainWindow: BrowserWindow) => {
  ipcMain.handle(EventName.GetVideoInfo, async (_event, fileUrl: string) => {
    return getVideoInfo(fileUrl);
  });
  ipcMain.on(EventName.OpenWindown, (event, options: OpenWindownOptions) => {
    // 获取发送消息的窗口
    const win = BrowserWindow.fromWebContents(event.sender);
    const createWin = createWindow(options, win || mainWindow);
    // 只通知一次
    createWin.once("show", () => {
      // 通知渲染进行创建成功
      event.sender.send(EventName.OpenWindownSuccess, {
        webContentsId: createWin.webContents.id
      });
    });
  });

  ipcMain.handle(EventName.ShowMessageBox, (event, options: MessageBoxOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return dialog.showMessageBox(win || mainWindow, options);
  });
  ipcMain.on(EventName.CloseWindown, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    // 关闭当前窗口
    if (win) {
      win.close();
    }
  });
  ipcMain.handle(EventName.GetPath, async (_event, name: GetPathName) => {
    return app.getPath(name);
  });
  ipcMain.handle(EventName.ShowSaveDialog, async (event, options: SaveDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    return dialog.showSaveDialog(win, options);
  });
  ipcMain.handle(EventName.ShowOpenDialog, async (event, options: OpenDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
    return dialog.showOpenDialog(win, options);
  });
};
