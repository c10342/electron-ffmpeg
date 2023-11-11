import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  dialog,
  ipcMain,
  protocol
} from "electron";
import { createWindow, isString } from "./utils";
import Application from "./Application";
import os from "node:os";
import { ConvertFileParams, EventName, OnPreviewFileRespond, allowFormats } from "@/share";
import path from "node:path";
import ffmpeg from "./ffmpeg";

const isMac = process.platform === "darwin";

class Main extends Application {
  private mainWin?: BrowserWindow;
  onReady(
    event: { preventDefault: () => void; readonly defaultPrevented: boolean },
    launchInfo: Record<string, any> | Electron.NotificationResponse
  ): void {
    super.onReady(event, launchInfo);
    this.createMainWindow();
    // 使用自定义协议解决electron不能播放本地视频资源
    // "atom:///"
    protocol.registerFileProtocol("atom", (request, callback) => {
      const url = request.url.substr(7);
      callback(decodeURI(path.normalize(url)));
    });
  }
  onActivate(
    event: { preventDefault: () => void; readonly defaultPrevented: boolean },
    hasVisibleWindows: boolean
  ): void {
    super.onActivate(event, hasVisibleWindows);
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow();
    }
  }
  // 创建主窗口
  createMainWindow() {
    this.mainWin = createWindow({
      url: "index.html",
      autoHideMenuBar: false
    });
    this.setMenu();
  }

  setMenu() {
    const template: MenuItemConstructorOptions[] = [
      {
        label: "文件",
        submenu: [
          {
            label: "选择视频",
            click: this.selectFile.bind(this),
            accelerator: "CmdOrCtrl+O"
          },
          { type: "separator" },
          isMac
            ? {
                role: "close",
                label: "退出",
                accelerator: "Cmd+Q"
              }
            : {
                role: "quit",
                label: "退出",
                accelerator: "Ctrl+Q"
              }
        ]
      },
      {
        label: "帮助",
        submenu: [
          // {
          //   label: "刷新",
          //   role: "reload"
          // },
          {
            label: "关于",
            click: this.onAboutClick.bind(this)
          },
          {
            label: "技术支持"
          }
        ]
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    // 所有窗口公用一个菜单
    // Menu.setApplicationMenu(menu);
    // 设置当前窗口的菜单
    this.mainWin?.setMenu(menu);
    this.addEventListener();
  }

  onAboutClick() {
    dialog.showMessageBox(this.mainWin!, {
      title: "关于",
      message: `    
      Electron:${process.versions.electron}
      Chromium:${process.versions.chrome}
      Node.js:${process.versions.node}
      V8:${process.versions.v8}
      OS:${process.env.OS} ${os.arch} ${os.release}
      `
    });
  }

  async selectFile() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: "video", extensions: allowFormats }]
    });
    if (!canceled && filePaths?.[0]) {
      this.mainWin?.webContents.send(EventName.SelectFile, filePaths?.[0]);
    }
  }

  async readFile(fileUrl: string) {
    return new Promise((resolve, reject) => {
      const ext = path.extname(fileUrl).slice(1);
      if (!allowFormats.includes(ext)) {
        dialog.showMessageBox({
          type: "error",
          message: "文件格式不支持"
        });
        reject(new Error("文件格式不支持"));
        return;
      }
      ffmpeg(fileUrl).ffprobe((err: any, data: { format: any; streams: any }) => {
        if (err) {
          const errMsg = isString(err) ? err : err?.toString() || "未知错误";
          dialog.showMessageBox({
            type: "error",
            message: errMsg
          });
          reject(new Error(errMsg));
          return;
        }

        const { format, streams } = data;
        const { format_name, duration, size, bit_rate } = format;
        let audioBitrate = bit_rate,
          videoBitrate = bit_rate,
          codec = "",
          width = 0,
          height = 0,
          channels = 1;
        const video = streams.find((item: { codec_type: string }) => item.codec_type === "video");
        if (video) {
          width = video.width;
          height = video.height;
          codec = video.codec_name;
          videoBitrate = Math.round(video.bit_rate / 1000) + "k";
        }
        const audio = streams.find((item: { codec_type: string }) => item.codec_type === "audio");
        if (audio) {
          audioBitrate = Math.round(audio.bit_rate / 1000) + "k";
          channels = audio.channels;
          codec += `/${audio.codec_name}`;
        }

        const params = {
          filename: path.parse(fileUrl).name,
          formatName: format_name,
          width,
          height,
          size,
          duration,
          videoBitrate,
          audioBitrate,
          codec,
          channels
        };
        resolve(params);
      });
    });
  }

  createPreviewWindow() {
    const win = createWindow({
      url: "preview.html"
      // webSecurity: false
    });
    return win;
  }

  addEventListener() {
    ipcMain.handle(EventName.ReadFile, (_, fileUrl: string) => {
      return this.readFile(fileUrl);
    });
    ipcMain.handle(EventName.ShowSaveDialog, (event, options: Electron.SaveDialogOptions) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      return dialog.showSaveDialog(win!, options);
    });
    ipcMain.on(EventName.ConvertFile, (event, optios: ConvertFileParams["params"]) => {
      // const output = this.isDev
      //   ? "temp.mp4"
      //   : path.join(app.getPath("temp"), `${app.getName()}_temp.mp4`);
      const { filePath, start, end, videoBitrate, audioBitrate, channels, ratio, output } = optios;
      event.reply(EventName.ConvertFileStart);

      ffmpeg(filePath)
        .outputOptions([`-ss ${start}`, `-to ${end}`])
        // set video bitrate
        .videoBitrate(videoBitrate)
        // set target codec
        .videoCodec("libx264")
        // set audio bitrate
        .audioBitrate(audioBitrate)
        // set audio codec
        .audioCodec("libmp3lame")
        // set number of audio channels
        .audioChannels(channels)
        .size(`${ratio * 100}%`)
        // set custom option
        // set output format to force
        .format("mp4")
        // save to file
        .save(output)
        // setup event handlers
        .on("progress", (progress: { percent: number }) => {
          const percent = Math.floor(progress.percent);

          event.reply(EventName.ConvertFileProgress, percent);
        })
        .on("end", () => {
          event.reply(EventName.ConvertFileProgress, 100);
          event.reply(EventName.ConvertFileSuccess, output);
          event.reply(EventName.ConvertFileComplete);
          const win = this.createPreviewWindow();
          win.webContents.on("dom-ready", () => {
            const params: OnPreviewFileRespond = {
              output
            };
            win.webContents.send(EventName.PreviewFile, params);
          });
        })
        .on("error", (err: any) => {
          console.log(err);
          event.reply(EventName.ConvertFileError, err);
          event.reply(EventName.ConvertFileComplete);
        });
    });
  }
}

new Main();
