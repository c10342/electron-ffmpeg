<template>
  <el-scrollbar v-loading="loading">
    <el-form :model="formModel" class="form-wrapper" label-width="120px" label-position="left">
      <page-header title="视频信息">
        <el-row :gutter="gutter">
          <el-col :span="12">
            <el-form-item label="文件：">
              {{ videoInfo.filename }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="格式：">
              {{ videoInfo.formatName }}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="gutter">
          <el-col :span="12">
            <el-form-item label="宽高：">
              {{ videoInfo.width }}x{{ videoInfo.height }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="大小：">
              {{ formatSize(videoInfo.size) }}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="gutter">
          <el-col :span="12">
            <el-form-item label="时长：">
              {{ videoInfo.duration }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="视频比特率：">
              {{ videoInfo.videoBitrate }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="gutter">
          <el-col :span="12">
            <el-form-item label="音频比特率：">
              {{ videoInfo.audioBitrate }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编码：">
              {{ videoInfo.codec }}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="gutter">
          <el-col :span="12">
            <el-form-item label="声道：">
              {{ videoInfo.channels }}
            </el-form-item>
          </el-col>
        </el-row>
      </page-header>

      <page-header title="操作">
        <el-form-item label="范围：">
          <el-slider
            v-model="formModel.range"
            range
            :marks="videoInfo.duration <= 300 ? marks : undefined"
            :max="videoInfo.duration"
            :step="0.1"
            :format-tooltip="formatTooltip"
            :disabled="disabled"
          />
        </el-form-item>
        <el-form-item label="宽高：">
          <el-slider
            v-model="formModel.ratio"
            :min="1"
            :max="2"
            :step="0.25"
            :format-tooltip="ratioFormatTooltip"
            :disabled="disabled"
          />
        </el-form-item>

        <el-form-item label="画质：">
          <el-radio-group v-model="formModel.videoBitrate" :disabled="disabled">
            <el-radio label="200k">普通</el-radio>
            <el-radio label="400k">标清</el-radio>
            <el-radio label="800k">高清</el-radio>
            <el-radio label="1600k">超清</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="音质：">
          <el-radio-group v-model="formModel.audioBitrate" :disabled="disabled">
            <el-radio label="32k">AM</el-radio>
            <el-radio label="64k">FM</el-radio>
            <el-radio label="128k">CD</el-radio>
            <el-radio label="256k">DVD</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="声道：">
          <el-radio-group v-model="formModel.channels" :disabled="disabled">
            <el-radio :label="2">双声道</el-radio>
            <el-radio :label="1">单声道</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="转换进度">
          <el-progress
            style="width: 100%"
            :text-inside="true"
            :stroke-width="18"
            :percentage="percentage"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :disabled="disabled"
            :loading="convertIng"
            @click="onConfirmClick"
          >
            转换
          </el-button>
        </el-form-item>
      </page-header>
    </el-form>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { formatSize } from "@renderer/services/utils";
import PageHeader from "./pageHeader.vue";
import { computed } from "vue";
import { ReadFileRespond, logError } from "@/share";

const gutter = 20;

const loading = ref(false);

const percentage = ref(0);
const convertIng = ref(false);

const disabled = computed(() => {
  return !videoInfo.filename;
});

const formModel = reactive({
  range: [0, 10],
  ratio: 1,
  videoBitrate: "",
  audioBitrate: "",
  channels: 2
});

// 视频信息
const videoInfo = reactive({
  filename: "",
  formatName: "",
  width: 0,
  height: 0,
  size: 0,
  duration: 0,
  videoBitrate: "",
  audioBitrate: "",
  codec: "",
  channels: 0,
  fileUrl: ""
});

const marks = {
  10: "10 秒",
  30: "30 秒",
  60: "60 秒",
  300: "5 分钟"
};

const formatTooltip = (value: number) => `${value} 秒`;
const ratioFormatTooltip = () =>
  `${videoInfo.width * formModel.ratio} x ${videoInfo.height * formModel.ratio}`;

const onConfirmClick = () => {
  window.api
    .showSaveDialog({
      filters: [{ name: "video", extensions: ["mp4"] }]
    })
    .then((res) => {
      if (!res.canceled && res.filePath) {
        convertFile(res.filePath);
      }
    });
};

const convertFile = (output: string) => {
  const { range, ratio, videoBitrate, audioBitrate, channels } = formModel;
  window.api.convertFile({
    params: {
      ratio,
      start: range[0],
      end: range[1],
      videoBitrate: videoBitrate ?? videoInfo.videoBitrate,
      audioBitrate: audioBitrate ?? videoInfo.audioBitrate,
      channels,
      filePath: videoInfo.fileUrl,
      width: videoInfo.width,
      height: videoInfo.height,
      output
    },
    onStart() {
      percentage.value = 0;
      convertIng.value = true;
    },
    onProgress(percent) {
      percentage.value = percent;
    },
    onError() {
      console.log("onError");
    },
    onSuccess() {
      // todo
    },
    onComplete() {
      convertIng.value = false;
    }
  });
};

window.api.onSelectFile((fileUrl: string) => {
  loading.value = true;
  window.api
    .readFile(fileUrl)
    .then((res: ReadFileRespond) => {
      const { duration, videoBitrate, audioBitrate, channels } = res;
      videoInfo.filename = res.filename;
      videoInfo.formatName = res.formatName;
      videoInfo.width = res.width;
      videoInfo.height = res.height;
      videoInfo.size = res.size;
      videoInfo.duration = res.duration;
      videoInfo.videoBitrate = res.videoBitrate;
      videoInfo.audioBitrate = res.audioBitrate;
      videoInfo.codec = res.codec;
      videoInfo.channels = res.channels;
      videoInfo.fileUrl = fileUrl;

      formModel.range = [0, duration];
      formModel.videoBitrate = videoBitrate;
      formModel.audioBitrate = audioBitrate;
      formModel.channels = channels;
    })
    .catch(logError)
    .finally(() => {
      loading.value = false;
    });
});
</script>

<style lang="scss" scoped>
.form-wrapper {
  padding: 20px;
}
</style>
