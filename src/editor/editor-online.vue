<template>
  <div class="editor-online">
    <div class="main-content">
      <el-row>
        <el-col :span="12">
          <div>
            <span class="title">主题切换：</span>
            <el-radio-group v-model="curTheme">
              <el-radio v-for="item in themeOptions" :key="item" :label="item" >{{ item }}</el-radio>
            </el-radio-group>
          </div>
        </el-col>
        <el-col :span="12">
          <div>
            <el-button type="text" @click="runCode">刷新</el-button>
            <el-button type="text" @click="elementUIDoc">element-ui 文档</el-button>
          </div>
        </el-col>
        <el-col :span="12">
          <monaco-editor
            width="100%"
            height="1000"
            :language="language"
            :value="codeStr"
            :options="options"
            :highlighted="highlightLines"
            :changeThrottle="500"
            :theme="curTheme"
            @mounted="onMounted"
            @change="onCodeChange"
            ref="vscode">
          </monaco-editor>
        </el-col>
        <el-col :span="12">
          <iframe
            style="width: 100%;height:1000px"
            ref="previewPage"
            class="result-wrapper"
            frameborder="0"
            src="./preview.html"
            @load="iframeLoad">
          </iframe>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import MonacoEditor from 'monaco-editor-vue';
  import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
  import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
  import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
  import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js';
  import { demo } from './constants/demo.js';
  import { languageOptions } from './constants/language.js';
  import parse from './utils/parse.js';

  export default {
    name: 'editor-online',
    props: {
      sourceCode: {
        type: String,
        default: ''
      }
    },
    components: {
      MonacoEditor
    },
    data () {
      return {
        codeStr: '',
        // 编辑器设置
        language: 'html',   //语言  
        languageOptions,
        highlightLines: [{ number: 0, class: 'red' }],  //高亮
        curTheme: 'vs',
        themeOptions: ['vs', 'hc-black', 'vs-dark'],  // 编辑器样式
        options: {
          foldingStrategy: 'indentation', // 代码可分小段折叠 
          autoClosingBrackets: true, 
          selectOnLineNumbers: false,
          roundedSelection: false,
          readOnly: false,    // 只读
          cursorStyle: 'line',    //光标样式
          automaticLayout: true,  //自动布局
          glyphMargin: true,  //字形边缘
          useTabStops: false,
          fontSize: 12,    //字体大小
          quickSuggestionsDelay: 500,  //代码提示延时
        }
      }
    },
    watch: {
      sourceCode: {
        handler() {
          this.codeStr = this.sourceCode;
          this.runCode();
        },
        immediate: true
      }
    },
    methods: {
      iframeLoad() {
        this.runCode();
      },
      elementUIDoc() {
        window.open('https://element.eleme.io/#/zh-CN/component/button');
      },
      onMounted() {
        this.init();
      },
      onCodeChange(value) {
        this.codeStr = value;
        this.runCode();
      },
      init() {
        this.codeStr = this.sourceCode || demo;
        this.runCode();
      },
      runCode() {
        const parseObj = parse(this.codeStr);
        parseObj.script = parseObj.script.replace(/import[^\;]*\;/igm, '');
        parseObj.script = parseObj.script.replace(/components[^\}]*\}\,/igm, '');
        const postData = {
          type: 'refreshFrame',
          data: {
            template: parseObj.template,
            script: parseObj.script.replace('export default ', 'return '),
            styles: parseObj.styles.join('')
          }
        }
        if (this.$refs.previewPage) {
          this.$refs.previewPage.contentWindow.postMessage(
            postData,
            location.origin
          )
        }
      }
    }
  };
</script>

<style lang="scss">
  .editor-online {
    background: #fff;
    padding: 20px;

    .title {
      font-size: 14px;
    }
  }
</style>