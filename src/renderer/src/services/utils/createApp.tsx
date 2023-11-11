import { createApp } from "vue";
import "@renderer/assets/css/index.scss";
import AppConfig from "@renderer/components/appConfig.vue";

export const createVueApp = (App: any) => {
  const RootComponent = (
    <AppConfig>
      <App></App>
    </AppConfig>
  );
  const app = createApp(RootComponent).mount("#app");
  return app;
};
