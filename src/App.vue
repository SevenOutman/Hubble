<template>
  <div id="app">

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

  a:visited {
    color: inherit;
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
