<template>
  <div class="hello">
    <div class="header">
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
      <div class="input-group">
        <el-input placeholder="User/Org" v-model="owner" v-if="!requesting" />
        <el-input placeholder="Repo" v-model="repo" v-if="!requesting" />
        <el-button type="primary" :loading="requesting" @click="fetchRepo" :disabled="!owner || !repo">
          {{ !requesting ? 'Start' : `Counting stars (${stargazers.length})`}}
        </el-button>
      </div>
    </div>
    <chart :options="chartOptions" ref="chart"></chart>
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
        owner: 'js-org',
        repo: 'dns.js.org',
        stargazers: [],
        showDialog: false,
        requesting: false,
        totalPages: 1,
        firstStar: ''
      }
    },
    computed: {
      chartData() {
        if (this.requesting) {
          let xAxisData = []
          if (this.firstStar) {
            let start = moment(this.firstStar).subtract(1, 'day')
            let end = moment()
            xAxisData.push([start.format('YYYY-MM-DD'), 0])
            for (let d = start.add(1, 'day'); d.isSameOrBefore(end, 'day'); d = d.add(1, 'day')) {
              xAxisData.push([d.format('YYYY-MM-DD')])
            }
          }
          return xAxisData
        }
        let chartData = []
        if (this.stargazers.length === 1) {
          chartData = [this.stargazers[0], 1]
        } else if (this.stargazers.length > 1) {
          let start = moment(this.stargazers[0]).subtract(1, 'day')
          // let end = moment(this.stargazers[this.stargazers.length - 1].starred_at)
          let end = moment()
          let i = 0
          let total = 0
          for (let d = start; d.isSameOrBefore(end, 'day'); d = d.add(1, 'day')) {
            let count = 0
            if (i >= this.stargazers.length) {
              total = undefined
            } else {
              if (d.isBefore(moment(this.stargazers[i]), 'day')) {
              } else {
                for (; i < this.stargazers.length; i++) {
                  let starred_at = moment(this.stargazers[i])
                  if (starred_at.isSame(d, 'day')) {
                    count++
                  }
                  if (starred_at.isAfter(d, 'day')) {
                    break;
                  }
                }
                total += count
              }
            }
            chartData.push([d.format('YYYY-MM-DD'), total])
          }
        }
        return chartData
      },
      chartOptions() {
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
            max: this.totalPages * 100
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
            markPoint: {
              data: [{
                type: 'max'
              }]
            },
            data: this.chartData,
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
        this.fetchFirstPage()
      },
      fetchPage(page) {
        const pageUrl = `/repos/${this.owner}/${this.repo}/stargazers?per_page=100&page=${page}`
        return axios(pageUrl, {
          headers: {
            Authorization: this.accessToken ? `token ${this.accessToken}` : undefined,
          },
        })
          .then((res) => {
            this.stargazers = [...this.stargazers, ...res.data.map(({ starred_at }) => starred_at)].sort()
            if (page > 1 && this.stargazers.length > (this.totalPages - 1) * 100) {
              this.requesting = false
            }
            return res
          })
          .catch(error => {
            this.requesting = false
            if (error.response.status > 400) {
              this.accessToken = ''
              this.showDialog = true
            }
          })
      },
      fetchFirstPage() {
        this.fetchPage(1)
          .then(({ headers, data }) => {
            if (data.length > 0) {
              this.firstStar = data[0].starred_at
            }
            const links = parseLinkHeader(headers['link'])
            if (!links) {
              // no more than 100 stars
              // only 1 page
              this.requesting = false
            } else {
              this.totalPages = +links.last.page
              if (this.totalPages === 1) {
                this.requesting = false
              } else {
                for (let page = 2; page <= this.totalPages; page++) {
                  this.fetchPage(page)
                }
              }
            }
          })
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
    },
    mounted() {
      window.addEventListener('resize', this.resizeChart, false)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeChart, false)
    }
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
      align-items: center;
      width: 400px;
      margin: 28px auto 0;
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

    .echarts {
      flex-grow: 1;
      width: 100%;
      height: auto;
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
