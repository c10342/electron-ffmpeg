import { BrowserWindow, shell } from "electron";
import icon from "../../resources/icon.png?asset";
import path, { join } from "path";
import { is } from "@electron-toolkit/utils";
import { OpenWindownOptions } from "@/share";

export const createWindow = (options: OpenWindownOptions, parentindow?: BrowserWindow) => {
  const win = new BrowserWindow({
    parent: parentindow,
    width: options.width ?? 800,
    height: options.height ?? 500,
    minWidth: options.minWidth ?? 800,
    minHeight: options.minHeight ?? 500,
    show: options.show ?? false,
    autoHideMenuBar: options.autoHideMenuBar ?? true,
    // 模态框，子窗口出现后，父窗口是否可以进行交互
    modal: options.modal ?? false,

    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: options.webSecurity ?? true
    }
  });

  // win.set

  win.on("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  const envUrl = process.env["ELECTRON_RENDERER_URL"];
  if (is.dev && envUrl) {
    const locationUrl = path.join(envUrl, options.url);
    win.loadURL(locationUrl).then(() => {
      win.webContents.openDevTools();
      win.maximize();
    });
  } else {
    win.loadFile(join(__dirname, `../renderer/${options.url}`));
  }

  return win;
};

export const isString = (data: any): data is string => {
  return typeof data === "string";
};
