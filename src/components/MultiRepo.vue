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
              <el-color-picker v-model="repo1form.color">
              </el-color-picker>
              <div class="input-group">
                <el-input placeholder="User/Org" v-model="repo1form.owner">
                </el-input>
                <el-input placeholder="Repo" v-model="repo1form.repo">
                </el-input>
              </div>
            </el-form-item>
          </el-col>
          <el-col :md="9" :xs="24">
            <el-form-item class="repo-input-group">
              <el-color-picker v-model="repo2form.color">
              </el-color-picker>
              <div class="input-group">
                <el-input placeholder="User/Org" v-model="repo2form.owner">
                </el-input>
                <el-input placeholder="Repo" v-model="repo2form.repo">
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
      |
      <router-link to="/react-vs-vue">React vs. Vue</router-link>
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
    '#c71585'
  ]

  const randomColor = () => presetColors[Math.round(Math.random() * presetColors.length)]

  export default {
    name: 'MultiRepo',
    data() {
      const defaultColor1 = randomColor()
      const defaultColor2 = presetColors[(presetColors.indexOf(defaultColor1) + 3) % presetColors.length]
      return {
        repo1form: {
          defaultColor: defaultColor1,
          color: defaultColor1,
          owner: '',
          repo: '',
        },
        repo2form: {
          defaultColor: defaultColor2,
          color: defaultColor2,
          owner: '',
          repo: '',
        },
        repo1: {
          owner: '',
          repo: '',
        },
        repo2: {
          owner: '',
          repo: '',
        },
        dates: [],
        chartData1: [],
        chartData2: [],
        displayChartData1: [],
        displayChartData2: [],
        maxTotal: 0,
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
        return `https://hubble.js.org/repo-race?v=${this.repo1fullname}&s=${this.repo2fullname}&start`
      },
      shareMarkdown() {
        return `[![Hubble](${this.badgeImgLink})](${this.shareLink})`
      },
      shareHTML() {
        return `<a href="${this.shareLink}"><img src="${this.badgeImgLink}" alt="Hubble"></a>`
      },
      repo1formfullname() {
        if (!this.repo1form.owner || !this.repo1form.repo) return null
        return `${this.repo1form.owner}/${this.repo1form.repo}`
      },
      repo2formfullname() {
        if (!this.repo2form.owner || !this.repo2form.repo) return null
        return `${this.repo2form.owner}/${this.repo2form.repo}`
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
        const upperMark = {
          symbolRotate: 30,
          label: {
            offset: [-5, 0],
          },
        }
        const lowerMark = {
          symbolRotate: -150,
          label: {
            offset: [5, 12],
          },
        }
        let repo1Mark = upperMark
        let repo2Mark = upperMark
        if (this.displayChartData1.length && this.displayChartData2.length) {
          if (this.displayChartData1[this.displayChartData1.length - 1][1] >= this.displayChartData2[this.displayChartData2.length - 1][1]) {
            repo2Mark = lowerMark
          } else {
            repo1Mark = lowerMark
          }
        } else if (this.displayChartData1.length && !this.displayChartData2.length) {
          repo2Mark = lowerMark
        } else if (!this.displayChartData1.length && this.displayChartData2.length) {
          repo1Mark = lowerMark
        }
        return {
          tooltip: {
            trigger: 'axis',
            formatter([repo1, repo2]) {
              const numberWithCommas = (x) => {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
              let tooltip = `${repo1.data[0]}<br>${repo1.marker}${repo1.seriesName}: ${numberWithCommas(repo1.data[1])}`
              if (repo2) {
                tooltip = `${tooltip}<br>${repo2.marker}${repo2.seriesName}: ${numberWithCommas(repo2.data[1])}<br>Diff: ${numberWithCommas(repo1.data[1] - repo2.data[1])}`
              }

              return tooltip
            }
          },
          grid: {
            top: 12,
            bottom: 5,
            left: window.innerWidth < 500 ? 12 : '8%',
            right: window.innerWidth < 500 ? 20 : '8%',
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
            max: +moment()
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
            max: (Math.floor(this.maxTotal / 100) + 1) * 100
            // max(value) {
            //   return (Math.floor(value.max / 100) + 1) * 100
            // },
          },
          series: [{
            name: this.repo1fullname,
            type: 'line',
            lineStyle: {
              color: this.repo1form.color,
            },
            showSymbol: false,
            itemStyle: {
              color: this.repo1form.color,
            },
            markPoint: {
              data: [{
                type: 'max',
              }],
              ...repo1Mark
            },
            data: this.displayChartData1,
          }, {
            name: this.repo2fullname,
            type: 'line',
            lineStyle: {
              color: this.repo2form.color,
            },
            showSymbol: false,
            itemStyle: {
              color: this.repo2form.color,
            },
            markPoint: {
              data: [{
                type: 'max',
              }],
              ...repo2Mark
            },
            data: this.displayChartData2,
          }],
        }
      },
    },
    methods: {
      start() {
        this.repo1.owner = this.repo1form.owner
        this.repo1.repo = this.repo1form.repo
        this.repo2.owner = this.repo2form.owner
        this.repo2.repo = this.repo2form.repo
        this.maxTotal = 0

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
              onComplete: () => {
                const [lastStarDate, stars] = this.chartData1[this.chartData1.length - 1]
                const today = moment()
                for (let d = moment(lastStarDate).add(1, 'day'); d.isSameOrBefore(today, 'day'); d.add(1, 'day')) {
                  this.chartData1.push([d.format('YYYY-MM-DD'), stars])
                }
              }
            }),
            this.graphqlFetchStargazers(this.repo2.owner, this.repo2.repo, {
              onPageData: data => this.updateDataArray(data, this.chartData2, this.chartData1),
              onComplete: () => {
                const [lastStarDate, stars] = this.chartData2[this.chartData2.length - 1]
                const today = moment()
                for (let d = moment(lastStarDate).add(1, 'day'); d.isSameOrBefore(today, 'day'); d.add(1, 'day')) {
                  this.chartData2.push([d.format('YYYY-MM-DD'), stars])
                }
              }
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
              onComplete: () => {
                const [lastStarDate, stars] = this.chartData1[this.chartData1.length - 1]
                const today = moment()
                for (let d = moment(lastStarDate).add(1, 'day'); d.isSameOrBefore(today, 'day'); d.add(1, 'day')) {
                  this.chartData1.push([d.format('YYYY-MM-DD'), stars])
                }
              }
            }),
            this.fetchStargazers(this.repo2fullname, {
              onPageData: data => this.updateDataArray(data, this.chartData2, this.chartData1),
              onComplete: () => {
                const [lastStarDate, stars] = this.chartData2[this.chartData2.length - 1]
                const today = moment()
                for (let d = moment(lastStarDate).add(1, 'day'); d.isSameOrBefore(today, 'day'); d.add(1, 'day')) {
                  this.chartData2.push([d.format('YYYY-MM-DD'), stars])
                }
              }
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
          this.maxTotal = Math.max(this.maxTotal, data.stargazers_count)
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
      fetchStargazers(fullname, { onPageData, onComplete }) {
        return new Promise((resolve, reject) => {
          restFetchStargazers(fullname, {
            onPageData: data => {
              onPageData && onPageData(data.map(star => star.starred_at.substr(0, 10)))
            },
            onComplete: (fullData) => {
              onComplete && onComplete(fullData)
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
      graphqlFetchStargazers(owner, repo, { onPageData, onComplete }) {
        return new Promise((resolve, reject) => {
          graphqlFetchStargazers(owner, repo, {
            onPageData: data => {
              onPageData && onPageData(data.map(star => star.starredAt.substr(0, 10)))
            },
            onComplete: (fullData) => {
              onComplete && onComplete(fullData)
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
      repo1formfullname: {
        immediate: true,
        handler(val) {
          if (this.repo1form.color === this.repo1form.defaultColor && repoColors[val]) {
            this.repo1form.color = repoColors[val]
          }
        },
      },
      repo2formfullname: {
        immediate: true,
        handler(val) {
          if (this.repo2form.color === this.repo2form.defaultColor && repoColors[val]) {
            this.repo2form.color = repoColors[val]
          }
        },
      },
    },
    created() {
      const { v = '/', s = '/' } = this.$route.query
      const repo1 = v.split('/')
      this.repo1form.owner = repo1[0]
      this.repo1form.repo = repo1[1]
      const repo2 = s.split('/')
      this.repo2form.owner = repo2[0]
      this.repo2form.repo = repo2[1]
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
      width: 96%;
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
