import { ElectronAPI } from "@electron-toolkit/preload";
import { GlobalApi } from "./types";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: GlobalApi;
  }
}
