import { onBeforeUnmount, onMounted } from "vue";

export const useDrop = (action: (fileUrl: string) => unknown) => {
  const onDrop = (event: DragEvent) => {
    //必须要阻止拖拽的默认事件
    event.preventDefault();
    event.stopPropagation();

    //获得拖拽的文件集合
    const files = event.dataTransfer?.files;

    if (files && files.length > 0 && files[0].path) {
      action(files[0].path);
    }
  };
  const onDropOver = (event: DragEvent) => {
    // 必须要阻止拖拽的默认事件
    event.preventDefault();
    event.stopPropagation();
  };
  onMounted(() => {
    document.addEventListener("drop", onDrop);
    document.addEventListener("dragover", onDropOver);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("drop", onDrop);
    document.removeEventListener("dragover", onDropOver);
  });
};
