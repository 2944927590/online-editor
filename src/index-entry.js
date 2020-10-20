import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Editor from '@src/editor.vue';

Vue.use(ElementUI);

new Vue({
  render: h => h(Editor)
}).$mount('#app');

