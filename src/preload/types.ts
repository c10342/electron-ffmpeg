import { ConvertFileParams, OnPreviewFileRespond, ReadFileRespond } from "@/share";

export interface GlobalApi {
  readFile: (fileUrl: string) => Promise<ReadFileRespond>;
  convertFile: (options: ConvertFileParams) => void;
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  onSelectFile: (cb: (fileUrl: string) => void) => void;
  onPreviewFile: (cb: (data: OnPreviewFileRespond) => void) => void;
}
