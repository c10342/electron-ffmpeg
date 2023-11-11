import ffmpeg from "fluent-ffmpeg/lib/fluent-ffmpeg";
import path from "node:path";
import ffprobe from "@ffprobe-installer/ffprobe";

// http://www.manongjc.com/detail/54-idnkdidsnhhrtfi.html

const initFfmpeg = () => {
  const ffmpegPath = path.join(
    __dirname,
    "../../node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe"
  );
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobe.path);
};

initFfmpeg();

export default ffmpeg;

// export const getVideoInfo = (fileUrl: string) => {
//   return new Promise<VideoInfo>((resolve, reject) => {
//     ffmpeg.ffprobe(fileUrl, (err, metadata) => {
//       if (err) {
//         reject(err);
//       } else {
//         const format = metadata.format;
//         const info: VideoInfo = {
//           duration: format.duration,
//           size: format.size
//         };
//         resolve(info);
//       }
//     });
//   });
// };
