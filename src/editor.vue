<template>
  <div>
    <editor-online :source-code="sourceCode"></editor-online>
  </div>
</template>

<script>
  import EditorOnline from './editor/editor-online.vue';
  import { demo } from './editor/constants/demo.js';

  export default {
    name: 'editor',
    components: {
      EditorOnline
    },
    data () {
      return {
        sourceCode: demo
      }
    }
  }
</script>

