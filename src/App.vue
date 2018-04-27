<template>
  <div id="app">
    <a href="https://github.com/SevenOutman/Hubble" target="_blank" class="github-corner">
      <svg width="80" height="80" viewBox="0 0 250 250"
           style="fill:#409EFF; color:#FFFFFF; position: absolute; top: 0; border: 0; right: 0;">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
          fill="currentColor" class="octo-body"></path>
      </svg>
    </a>
    <router-view />
    <el-dialog
      :title="dialogTitle || 'Error: Forbidden'"
      :visible.sync="showDialog"
      :modal="false"
      width="400px"
    >
      <p v-if="dialogBody">{{ dialogBody }}</p>
      <p v-else>You are not allowed to access the API.</p>
      <p>
        You might need to provide an access token.
        Follow <a
        href="https://github.com/settings/tokens/new?scopes=repo&description=Hubble"
        target="_blank"
      >this link</a> to create one and paste it below (<a href="https://github.com/SevenOutman/Hubble/tree/netlify#why-is-access-token-preferred-rather-than-login-with-github" target="_blank">recommended</a>).
      </p>
      <div class="input-group" style="width: auto">
        <el-input v-model="accessToken" placeholder="Paste access token here">
        </el-input>
        <el-button @click="saveAccessToken">Save</el-button>
      </div>
      <div class="divider">or simply</div>
      <el-button type="primary" @click="requireOAuth" style="display: block; width: 100%;line-height: 24px">
        <svg class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
        Login with GitHub</el-button>
      <a
        href="https://github.com/SevenOutman/Hubble/tree/netlify#why-is-it-required"
        target="_blank"
        style="margin: 1em 0 -1em;display: block"
      >Why is this required?</a>
    </el-dialog>
  </div>
</template>

<script>
  import Authenticator from 'netlify-auth-providers'
  import EventBus from './bus'

  export default {
    name: 'App',
    data() {
      return {
        accessToken: '',
        dialogTitle: null,
        dialogBody: null,
        showDialog: false,
        callback: () => {
        }
      }
    },
    methods: {
      saveAccessToken() {
        localStorage.setItem('access_token', this.accessToken)
        this.showDialog = false
        this.callback(this.accessToken)
      },
      requireOAuth() {
        new Authenticator({ site_id: 'hubble.netlify.com' }).authenticate({
          provider: 'github',
          scope: 'repo'
        }, (err, data) => {
          if (err) {
            console.log(err)
            return
          }
          console.log(data)

          this.accessToken = data.token
          this.saveAccessToken()
        })
      }
    },
    created() {
      EventBus.$on('require:accessToken', (callback, { title = null, body = null } = {}) => {
        this.accessToken = ''
        this.dialogTitle = title
        this.dialogBody = body
        this.showDialog = true
        this.callback = callback
      })
    }
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
    color: #2c3e50;

    width: 100vw;
    height: 100vh;

    .octicon {
      margin-right: 10px;
      vertical-align: middle;
      display: inline-block;
      fill: currentColor;
    }

    .divider {
      display: flex;
      align-items: center;

      margin: 1em 0;

      &::before,
      &::after {
        content: '';
        height: 1px;
        flex-grow: 1;
        background-color: #ccc;
      }

      &::before {
        margin-right: 1em;
      }
      &::after {
        margin-left: 1em;
      }
    }

    .el-dialog {
      text-align: center;
      .input-group {
        display: flex;
        align-items: center;
        width: 400px;
        margin: 28px auto 0;
        position: relative;
        .addon {
          position: absolute;
          left: 100%;
          margin-left: 1em;
          white-space: nowrap;
        }
        .el-input {
          flex-grow: 1;
          & > input {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          & + * {
            margin-left: -1px;
            &, & > input {
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
          }
        }
        .el-button {
          flex-grow: 1;
          flex-shrink: 1;
        }
      }

    }

    .github-corner:hover .octo-arm {
      animation: octocat-wave 560ms ease-in-out
    }

    @keyframes octocat-wave {
      0%, 100% {
        transform: rotate(0deg)
      }
      20%, 60% {
        transform: rotate(-25deg)
      }
      40%, 80% {
        transform: rotate(10deg)
      }
    }

    @media (max-width: 500px) {
      .github-corner:hover .octo-arm {
        animation: none
      }

      .github-corner .octo-arm {
        animation: octocat-wave 560ms ease-in-out
      }
    }
  }
</style>
