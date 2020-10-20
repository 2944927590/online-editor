export const demo = `<template>
  <div>
    <el-button type="primary" @click="handleClick">点我+1</el-button>
    <span class="count">{{ count }}</span>
  </div>
</template>

<script>
  export default {
    name: 'count',
    data() {
      return {
        count: 0
      };
    },
    components: {

    },
    methods: {
      handleClick() {
        this.count ++;
      }
    }
  }
</script>

<style scoped>
  .count {
    padding: 0 10px;
    color: red;
  }
</style>
`;