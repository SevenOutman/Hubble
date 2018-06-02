<template>
  <div class="multi-repo">
    <header>
      <h1>
        Hubble
      </h1>
    </header>
    <main>
      <el-form :disabled="requesting">
        <el-row :gutter="10">
          <el-col :md="9" :xs="24">
            <el-form-item class="repo-input-group">
              <el-color-picker v-model="repo1.color">
              </el-color-picker>
              <div class="input-group">
                <el-input placeholder="User/Org" v-model="repo1.owner">
                </el-input>
                <el-input placeholder="Repo" v-model="repo1.repo">
                </el-input>
              </div>
            </el-form-item>
          </el-col>
          <el-col :md="9" :xs="24">
            <el-form-item class="repo-input-group">
              <el-color-picker v-model="repo2.color">
              </el-color-picker>
              <div class="input-group">
                <el-input placeholder="User/Org" v-model="repo2.owner">
                </el-input>
                <el-input placeholder="Repo" v-model="repo2.repo">
                </el-input>
              </div>
            </el-form-item>
          </el-col>
          <el-col :md="6" :xs="24">
            <el-form-item>
              <el-button class="btn-block" type="primary" @click="start" :loading="requesting">
                {{ requesting ? 'Counting stars...' : 'Race'}}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="chart-place">
        <chart :options="chartOptions" ref="chart"></chart>
        <div class="buttons">
          <el-button round icon="el-icon-share" v-show="showShareButton" @click="showShareDialog = true">Share
          </el-button>
        </div>
      </div>
    </main>
    <footer align="center">
      <router-link to="/">Home</router-link>
      |
      <router-link to="/my-stars-this-year?start">How many stars have I earned this year?</router-link>
    </footer>
    <el-dialog
      title="Get your Hubble badge"
      :visible.sync="showShareDialog"
      :modal="false"
      width="400px"
    >
      <el-form label-position="left" label-width="80px">
        <el-form-item label="Badge" style="text-align: start">
          <img :src="badgeImgLink" alt="Hubble" style="vertical-align: middle">
        </el-form-item>
        <el-form-item label="Markdown">
          <el-input v-model="shareMarkdown" readonly></el-input>
        </el-form-item>
        <el-form-item label="HTML">
          <el-input v-model="shareHTML" readonly></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import AxiosFactory from 'axios'
  import EventBus from '../bus'
  import moment from 'moment'
  import { graphqlFetchStargazers, restFetchStargazers } from '@/utils'


  const axios = AxiosFactory.create({
    baseURL: 'https://api.github.com',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${localStorage.getItem('access_token')}`,
    },
  })

  const repoColors = {
    'vuejs/vue': '#41b883',
    'facebook/react': '#61dafb',
  }

  const presetColors = [
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577',
  ]

  const randomColor = () => presetColors[Math.round(Math.random() * presetColors.length)]

  export default {
    name: "MultiRepo",
    data() {
      const defaultColor1 = randomColor()
      const defaultColor2 = presetColors[(presetColors.indexOf(defaultColor1) + 3) % presetColors.length]
      return {
        repo1: {
          defaultColor: defaultColor1,
          color: defaultColor1,
          owner: '',
          repo: '',
        },
        repo2: {
          defaultColor: defaultColor2,
          color: defaultColor2,
          owner: '',
          repo: '',
        },
        dates: [],
        chartData1: [],
        chartData2: [],
        displayChartData1: [],
        displayChartData2: [],
        requesting: false,

        displayStartDate: '',
        displayEndDate: '',

        useGraphQL: false,
        errorMessage: '',
        showShareButton: false,
        showShareDialog: false,
      }
    },
    computed: {
      badgeImgLink() {
        return `https://img.shields.io/badge/Hubble-${this.repo1.repo.replace('-', '--')}%20vs%20${this.repo2.repo.replace('-', '--')}-409eff.svg?style=flat-square`
      },
      shareLink() {
        return `https://hubble.js.org/#/repo-race?v=${this.repo1fullname}&s=${this.repo2fullname}&start`
      },
      shareMarkdown() {
        return `[![Hubble](${this.badgeImgLink})](${this.shareLink})`
      },
      shareHTML() {
        return `<a href="${this.shareLink}"><img src="${this.badgeImgLink}" alt="Hubble"></a>`
      },
      repo1fullname() {
        if (!this.repo1.owner || !this.repo1.repo) return null
        return `${this.repo1.owner}/${this.repo1.repo}`
      },
      repo2fullname() {
        if (!this.repo2.owner || !this.repo2.repo) return null
        return `${this.repo2.owner}/${this.repo2.repo}`
      },
      chartOptions() {
        return {
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            bottom: 5,
            containLabel: true,
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
            max(value) {
              return (Math.floor(value.max / 100) + 1) * 100
            },
          },
          series: [{
            type: 'line',
            lineStyle: {
              color: this.repo1.color,
            },
            showSymbol: false,
            itemStyle: {
              color: this.repo1.color,
            },
            markPoint: {
              data: [{
                type: 'max',
              }],
            },
            data: this.displayChartData1,
          }, {
            type: 'line',
            lineStyle: {
              color: this.repo2.color,
            },
            showSymbol: false,
            itemStyle: {
              color: this.repo2.color,
            },
            markPoint: {
              data: [{
                type: 'max',
              }],
            },
            data: this.displayChartData2,
          }],
        }
      },
    },
    methods: {
      start() {
        this.displayStartDate = ''
        this.displayEndDate = ''
        this.displayChartData1 = []
        this.displayChartData2 = []
        this.chartData1 = []
        this.chartData2 = []
        this.requesting = true
        this.showShareButton = false

        // If access token is not present, use APIv3
        if (!localStorage.getItem('access_token')) {
          this.v3start()
        } else {
          this.v4start()
        }
      },
      // GraphQL API
      v4start() {
        this.useGraphQL = true
        Promise.all([
          this.fetchRepo(this.repo1fullname),
          this.fetchRepo(this.repo2fullname),
        ]).then(([repo1, repo2]) => {
          if (repo1.created_at < repo2.created_at) {
            this.displayStartDate = repo1.created_at.substr(0, 10)
            this.chartData1 = [
              [this.displayStartDate, 0],
            ]
            this.chartData2 = [
              [repo2.created_at.substr(0, 10), 0],
            ]
          } else {
            this.displayStartDate = repo2.created_at.substr(0, 10)
            this.chartData1 = [
              [repo1.created_at.substr(0, 10), 0],
            ]
            this.chartData2 = [
              [this.displayStartDate, 0],
            ]
          }
          // todo console.log(repo.stargazers_url)
          Promise.all([
            this.graphqlFetchStargazers(this.repo1.owner, this.repo1.repo, {
              onPageData: data => this.updateDataArray(data, this.chartData1, this.chartData2),
            }),
            this.graphqlFetchStargazers(this.repo2.owner, this.repo2.repo, {
              onPageData: data => this.updateDataArray(data, this.chartData2, this.chartData1),
            }),
          ]).then(() => {
            this.requesting = false
            this.showShareButton = true
          })
        })
      },
      // REST API
      v3start() {
        this.useGraphQL = false

        Promise.all([
          this.fetchRepo(this.repo1fullname),
          this.fetchRepo(this.repo2fullname),
        ]).then(([repo1, repo2]) => {
          if (repo1.created_at < repo2.created_at) {
            this.displayStartDate = repo1.created_at.substr(0, 10)
            this.chartData1 = [
              [this.displayStartDate, 0],
            ]
            this.chartData2 = [
              [repo2.created_at.substr(0, 10), 0],
            ]
          } else {
            this.displayStartDate = repo2.created_at.substr(0, 10)
            this.chartData1 = [
              [repo1.created_at.substr(0, 10), 0],
            ]
            this.chartData2 = [
              [this.displayStartDate, 0],
            ]
          }
          // todo console.log(repo.stargazers_url)
          Promise.all([
            this.fetchStargazers(this.repo1fullname, {
              onPageData: data => this.updateDataArray(data, this.chartData1, this.chartData2),
            }),
            this.fetchStargazers(this.repo2fullname, {
              onPageData: data => this.updateDataArray(data, this.chartData2, this.chartData1),
            }),
          ]).then(() => {
            this.requesting = false
            this.showShareButton = true
          })
        })
      },
      fetchRepo(fullname) {
        return axios(`/repos/${fullname}`, {
          headers: {
            Authorization: `token ${localStorage.getItem('access_token')}`,
          },
        }).then(({ data }) => {
          // APIv3 cannot fetch more than 400 pages of stargazers
          // if (!this.useGraphQL && data.stargazers_count > 6000) {
          //   this.requesting = false
          //   EventBus.$emit('require:accessToken', this.start, {
          //     title: 'Warning: Stars > 6,000',
          //     body: 'Requests will exceed rate limit - 60req/min',
          //   })
          //   return Promise.reject()
          // }
          return data
        }, ({ response: { status, headers, data } }) => {
          this.requesting = false
          if (status === 404) {
            this.errorMessage = data.message
          } else if (status > 400) {
            EventBus.$emit('require:accessToken', this.start, {
              title: headers['x-ratelimit-remaining'] === '0' ? 'Rate Limit Exceeded' : null,
              body: headers['x-ratelimit-remaining'] === '0' ? 'Request rate limit of 60req/min is exceeded' : null,
            })
          }
          return Promise.reject()
        })
      },
      fetchStargazers(fullname, { onPageData }) {
        return new Promise((resolve, reject) => {
          restFetchStargazers(fullname, {
            onPageData: data => {
              onPageData && onPageData(data.map(star => star.starred_at.substr(0, 10)))
            },
            onComplete: (fullData) => {
              resolve(fullData)
            },
            onError: ([error]) => {
              const { response: { status, headers } } = error
              if (status > 400) {
                EventBus.$emit('require:accessToken', this.start, {
                  title: headers['x-ratelimit-remaining'] === '0' ? 'Rate Limit Exceeded' : null,
                  body: headers['x-ratelimit-remaining'] === '0' ? 'Request rate limit of 60req/min is exceeded' : null,
                })
              }
              reject(error)
            },
          })
        })
      },
      graphqlFetchStargazers(owner, repo, { onPageData }) {
        return new Promise((resolve, reject) => {
          graphqlFetchStargazers(owner, repo, {
            onPageData: data => {
              onPageData && onPageData(data.map(star => star.starredAt.substr(0, 10)))
            },
            onComplete: (fullData) => {
              resolve(fullData)
            },
            onError: (error) => {
              const { response: { status, headers } } = error
              if (status > 400) {
                EventBus.$emit('require:accessToken', this.start, {
                  title: headers['x-ratelimit-remaining'] === '0' ? 'Rate Limit Exceeded' : null,
                  body: headers['x-ratelimit-remaining'] === '0' ? 'Request rate limit of 60req/min is exceeded' : null,
                })
              }
              reject(error)
            },
          })
        })
      },
      updateDataArray(stargazers, array, anotherArray) {
        let lastData = array.pop()
        let count = 0
        stargazers.forEach(date => {
          if (lastData[0] === date) {
            lastData[1]++
          } else if (lastData[0] < date) {
            while (lastData[0] < date) {
              if (array.indexOf(lastData) === -1) {
                array.push(lastData)
              }

              lastData = [
                moment(lastData[0]).add(1, 'day').format('YYYY-MM-DD'),
                lastData[1],
              ]
            }
            lastData[1]++
          } else if (lastData[0] > date) {
          }
        })
        if (array.indexOf(lastData) === -1) {
          array.push(lastData)
        }

        this.updateDisplayData()
      },
      updateDisplayData() {
        const start1 = this.chartData1[0][0]
        const start2 = this.chartData2[0][0]
        const end1 = this.chartData1[this.chartData1.length - 1][0]
        const end2 = this.chartData2[this.chartData2.length - 1][0]

        let start = start1 < start2 ? start1 : start2
        let end = end1 < end2 ? end1 : end2

        this.displayChartData1 = this.chartData1.filter(([date]) => date >= start && date <= end)
        this.displayChartData2 = this.chartData2.filter(([date]) => date >= start && date <= end)
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
    },
    watch: {
      repo1fullname: {
        immediate: true,
        handler(val) {
          if (this.repo1.color === this.repo1.defaultColor && repoColors[val]) {
            this.repo1.color = repoColors[val]
          }
        },
      },
      repo2fullname: {
        immediate: true,
        handler(val) {
          if (this.repo2.color === this.repo2.defaultColor && repoColors[val]) {
            this.repo2.color = repoColors[val]
          }
        },
      },
    },
    created() {
      const { v = '/', s = '/' } = this.$route.query
      const repo1 = v.split('/')
      this.repo1.owner = repo1[0]
      this.repo1.repo = repo1[1]
      const repo2 = s.split('/')
      this.repo2.owner = repo2[0]
      this.repo2.repo = repo2[1]
    },
    mounted() {
      window.addEventListener('resize', this.resizeChart)

      if (this.$route.query.start !== undefined) {
        this.start()
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeChart)
    },
  }
</script>

<style lang="less">
  .multi-repo {

    .el-form {
      width: 100%;
      max-width: 720px;
      margin: 28px auto 0;
    }
    .repo-input-group {
      .el-form-item__content {
        display: flex;

        .el-color-picker__trigger {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right: 0;
        }

        .input-group {
          display: flex;

          .el-input:first-child input {
            border-radius: 0;
            border-right: 0;
          }

          .el-input:last-child input {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }
        }

      }
    }

    .btn-block {
      display: block;
      width: 100%;
    }
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    margin: 0 auto;
    height: 100vh;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;

    header {
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
    footer {
      padding: 20px 0 50px;
    }

    main {
      flex-grow: 1;
      width: 100%;

      display: flex;
      flex-direction: column;
      align-items: center;
      .chart-place {
        flex-grow: 1;
        width: 100%;
        display: flex;
        flex-direction: column;

        .echarts {
          width: 100%;
          flex-grow: 1;
        }

        .buttons {
          flex-shrink: 0;
          height: 40px;
          width: 100%;
          text-align: center;
        }
      }
    }
  }
</style>
