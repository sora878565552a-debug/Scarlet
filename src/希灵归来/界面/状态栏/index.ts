import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

$(() => {
  waitGlobalInitialized('Mvu');
  waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data')).then(() => {
    createApp(App).use(createPinia()).mount('#app');
  });
});
