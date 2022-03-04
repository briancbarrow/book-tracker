import { boot } from "quasar/wrappers";
import { createPinia } from "pinia";

export default boot(({ app }) => {
  console.log("createPinia");
  app.use(createPinia());
});
