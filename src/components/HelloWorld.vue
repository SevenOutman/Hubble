<template>
  <div class="hello">
    <h1>
      Hubble
    </h1>
    <h2>Travel through GitHub Stars' history</h2>

    <div class="input-group">
      <el-input placeholder="User/Org" v-model="owner" />
      <el-input placeholder="Repo" v-model="repo" />
      <el-button type="primary" @click="fetchRepo" :disabled="!owner || !repo">Start</el-button>
    </div>
    <chart :options="chartOptions"></chart>
    <el-dialog
      title="Error: Forbidden"
      :visible.sync="showDialog"
      :modal="false"
      width="400px"
    >
      <p>
        You are not allowed to access the API.
        You might need to provide an access token.
        Follow <a
        href="https://github.com/settings/tokens/new?scopes=repo&description=Hubble"
        target="_blank"
      >this link</a> to create one and paste it below.
      </p>
      <div class="input-group" style="width: auto">
        <el-input v-model="accessToken" placeholder="Paste access token here">
        </el-input>
        <el-button @click="saveAccessToken">Save</el-button>
      </div>
      <a
        href="https://github.com/SevenOutman/Hubble#access-token"
        target="_blank"
      >Why is this required?</a>
    </el-dialog>
  </div>
</template>

<script>
  import GitHub from 'github-api'
  import axiosFactory from 'axios'
  import parseLinkHeader from 'parse-link-header'
  import moment from 'moment'

  const axios = axiosFactory.create({
    baseURL: 'https://api.github.com',
    headers: {
      Accept: 'application/vnd.github.v3.star+json',
    },
  })
  export default {
    name: 'HelloWorld',
    data() {
      return {
        accessToken: localStorage.getItem('access_token'),
        owner: 'SevenOutman',
        repo: 'vue-aplayer',
        stargazers: [],
        showDialog: false,
        requesting: false,
      }
    },
    computed: {
      chartOptions() {
        let chartData = []
        if (this.stargazers.length === 1) {
          chartData = [this.stargazers[0].starred_at, 1]
        } else if (this.stargazers.length > 1) {
          let start = moment(this.stargazers[0].starred_at).subtract(1, 'day')
          let end = this.requesting ? moment(this.stargazers[this.stargazers.length - 1].starred_at) : moment()
          let i = 0
          let total = 0
          for (let d = start; d.isSameOrBefore(end, 'day'); d = d.add(1, 'day')) {
            let count = 0
            for (; i < this.stargazers.length; i++) {
              let starred_at = moment(this.stargazers[i].starred_at)
              if (starred_at.isSame(d, 'day')) {
                count++
              }
              if (starred_at.isAfter(d, 'day')) {
                break;
              }
            }
            total += count
            chartData.push([d.format('YYYY-MM-DD'), total])
          }
        }
        return {
          tooltip: {
            trigger: 'axis',
          },
          xAxis: {
            type: 'time',
            axisLine: {
              lineStyle: {
                color: '#cccccc',
              },
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: '#333333',
            },
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
              },
            },
          },
          series: [{
            type: 'line',
            lineStyle: {
              color: '#409EFF',
            },
            showSymbol: false,
            itemStyle: {
              color: '#409EFF',
            },
            data: chartData,
          }],
        }
      },
    },
    methods: {
      saveAccessToken() {
        localStorage.setItem('access_token', this.accessToken)
        this.showDialog = false
        this.fetchRepo()
      },
      fetchRepo() {
        this.stargazers = []
        this.requesting = true
        this.fetchPage()
      },
      fetchPage(pageUrl = `/repos/${this.owner}/${this.repo}/stargazers?per_page=100`) {
        axios(pageUrl, {
          headers: {
            Authorization: this.accessToken ? `token ${this.accessToken}` : undefined,
          },
        })
          .then(({ headers, data }) => {
            this.stargazers = [...this.stargazers, ...data]
            const links = parseLinkHeader(headers['link'])
            if (links.next) {
              this.fetchPage(links.next.url)
            } else {
              this.requesting = false
            }
          })
          .catch(error => {
            this.requesting = false
            if (error.response.status === 403) {
              this.showDialog = true
            }
          })
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .hello {
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    .input-group {
      display: flex;
      width: 400px;
      margin: 28px auto 0;
      .el-input {
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
    }

    .echarts {
      flex-grow: 1;
      width: 100%;
    }

    h1, h2 {
      font-weight: normal;
    }

    h1 {
      font-size: 48px;
      position: relative;
      display: inline-block;
      margin-bottom: 0;
      &::before {
        content: '';
        background-image: url(../assets/logo.png);
        position: absolute;
        left: -53px;
        top: 0;
        height: 48px;
        width: 48px;
        background-size: contain;
        display: block;
      }
    }

  }
</style>
