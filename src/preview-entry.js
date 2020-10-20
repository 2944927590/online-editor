import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { loadScriptQueue } from './editor/utils/load-script.js';

Vue.use(ElementUI);

const $previewApp = document.getElementById('app');

window.addEventListener('message', init, false);

function buildLinks(links) {
  let strs = '';
  links.forEach(url => {
    strs += `<link href="${url}" rel="stylesheet">`;
  });
  return strs;
}

function init(event) {
  if (event.data.type === 'refreshFrame') {
    const code = event.data.data;
    let links = '';

    if (Array.isArray(code.links) && code.links.length > 0) {
      links = buildLinks(code.links);
    }

    $previewApp.innerHTML = `${links}<style>${code.styles}</style><div id="preview"></div>`;

    if (Array.isArray(code.scripts) && code.scripts.length > 0) {
      loadScriptQueue(code.scripts, () => {
        newVue(code.script, code.template);
      })
    } else {
      newVue(code.script, code.template);
    }
  }
}

function createObject(body) {
  return (new Function('', `return ${body}`))();
}

function newVue(script, template) {
  script = createObject(`(${script})`);
  script.template = `<div>${template}</div>`
  new Vue({
    ...script
  }).$mount('#preview');
}
