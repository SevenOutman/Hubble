<template>
  <div id="app">

    <router-view />

    <footer align="center">
      Created by <a href="https://github.com/SevenOutman" target="_blank">SevenOutman at GitHub</a>
    </footer>
  </div>
</template>

<script>
  export default {
    name: 'App',
  }
</script>

<style lang="less">
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
  }

  #app {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0 auto;

    width: 100%;

    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    footer {
      padding: 20px 0 50px;
    }
  }
</style>
