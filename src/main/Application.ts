import { optimizer, is } from "@electron-toolkit/utils";
import { app } from "electron";

class Application {
  isDev = is.dev;

  constructor() {
    app.on("ready", (event, launchInfo) => {
      this.onReady(event, launchInfo);
    });
    app.on("window-all-closed", () => {
      this.onWindowAllClosed();
    });
    app.on("activate", (event, hasVisibleWindows) => {
      this.onActivate(event, hasVisibleWindows);
    });
    app.on("browser-window-created", (event, win) => {
      this.onBrowserWindowCreated(event, win);
    });
  }

  onReady(event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse) {
    // todo
  }

  onWindowAllClosed() {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  onActivate(event: Electron.Event, hasVisibleWindows: boolean) {
    // todo
  }

  onBrowserWindowCreated(event: Electron.Event, win: Electron.BrowserWindow) {
    optimizer.watchWindowShortcuts(win);
  }
}

export default Application;
