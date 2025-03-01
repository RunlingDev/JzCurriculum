import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';
import dayjs from 'dayjs'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.config.globalProperties.$dayjs = dayjs
app.mount('#app');