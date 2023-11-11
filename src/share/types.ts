export interface OpenWindownOptions {
  url: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  show?: boolean;
  autoHideMenuBar?: boolean;
  modal?: boolean;
  webSecurity?: boolean;
}

export interface ReadFileRespond {
  audioBitrate: string;
  channels: number;
  codec: string;
  duration: number;
  filename: string;
  formatName: string;
  height: number;
  size: number;
  videoBitrate: string;
  width: number;
}

export interface ConvertFileParams {
  params: {
    filePath: string;
    width: number;
    height: number;
    ratio: number;
    start: number;
    end: number;
    videoBitrate: string;
    audioBitrate: string;
    channels: number;
    output: string;
  };
  onStart?: () => void;
  onProgress?: (percent: number) => void;
  onError?: (err: any) => void;
  onSuccess?: (output: string) => void;
  onComplete?: () => void;
}

export interface OnPreviewFileRespond {
  output: string;
}
