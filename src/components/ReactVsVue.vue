<template>
  <div class="multi-repo">
    <header>
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
    </header>
    <main>
      <h2 style="margin:.5em 0">100k<i class="el-icon-star-on"></i> race, React vs. Vue</h2>
      <el-row style="width: 100%">
        <el-col :md="12" :xs="24" style="color:#61dafb">
          <div v-if="reactLast">
            React's latest star: {{ reactLast.starredAt | datetime }} by {{ reactLast.node.login }}
          </div>
        </el-col>

        <el-col :md="12" :xs="24" style="color:#41b883">
          <div v-if="vueLast">
            Vue's latest star: {{ vueLast.starredAt }} by {{ vueLast.node.login }}
          </div>
        </el-col>
      </el-row>
      <div class="chart-place">
        <chart :options="chartOptions" ref="chart"></chart>
        <div class="buttons">
          <el-switch
            v-model="lineChart"
            active-text="Line chart"
            inactive-text="Bar chart"
            style="margin-right: 1em"
          >
          </el-switch>
          <el-button round icon="el-icon-share" @click="showShareDialog = true">Share
          </el-button>
        </div>
      </div>
    </main>
    <footer align="center">
      <router-link to="/">Home</router-link>
      |
      <router-link to="/repo-race">Repo race</router-link>
      |
      <router-link to="/my-stars-this-year">How many stars have I earned this year?</router-link>
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
  import { fetchStargazerCount, graphqlFetchStargazerCount, graphqlFetchStargazers, restFetchStargazers } from '@/utils'


  const axios = AxiosFactory.create({
    baseURL: 'https://api.github.com',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${localStorage.getItem('access_token')}`,
    },
  })

  export default {
    name: 'ReactVsVue',
    data() {
      return {
        reactCount: 0,
        vueCount: 0,
        reactLast: null,
        vueLast: null,
        reactLineData: [],
        vueLineData: [],
        showShareButton: false,
        showShareDialog: false,

        chartType: 'bar',
        errorMessage: '',

        timeout: {
          react: null,
          vue: null,
          line: null
        }
      }
    },
    computed: {
      lineChart: {
        get() {
          return this.chartType === 'line'
        },
        set(val) {
          this.chartType = val ? 'line' : 'bar'
        }
      },
      badgeImgLink() {
        return `https://img.shields.io/badge/Hubble-React%20vs%20Vue-409eff.svg?style=flat-square`
      },
      shareLink() {
        return `https://hubble.js.org/#/react-vs-vue`
      },
      shareMarkdown() {
        return `[![Hubble](${this.badgeImgLink})](${this.shareLink})`
      },
      shareHTML() {
        return `<a href="${this.shareLink}"><img src="${this.badgeImgLink}" alt="Hubble"></a>`
      },
      chartOptions() {
        return this[`${this.chartType}ChartOptions`]
      },
      barChartOptions() {
        return {
          tooltip: {
            trigger: 'item',
          },
          grid: {
            top: 12,
            bottom: 0,
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['React', 'Vue'],
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
            }
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
            min: 0,
            max: 110000
          },
          series: [{
            name: 'GitHub Stars',
            type: 'bar',
            showSymbol: false,
            label: {
              show: window.innerWidth >= 980,
              formatter: params => `{h1|${params.name}}\n{h2|${`${params.value}`.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}}`,
              rich: {
                h1: {
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  align: 'center'
                },
                h2: {
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  align: 'center'
                }
              }
            },
            barMaxWidth: 300,
            itemStyle: {
              normal: {
                color: function (params) {
                  const colorList = [
                    '#61dafb', // react
                    '#41b883', // vue
                  ]
                  return colorList[params.dataIndex]
                }
              },
            },
            data: [this.reactCount, this.vueCount],
          }],
        }
      },
      lineChartOptions() {
        return {
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            bottom: 0,
            containLabel: true
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
            min: 90000,
            max: 101000
          },
          series: [{
            name: 'React',
            type: 'line',
            showSymbol: false,
            lineStyle: {
              color: '#61dafb'
            },
            itemStyle: {
              color: '#61dafb'
            },
            markLine: {
              data: [{
                yAxis: this.reactCount,
              }],
            },
            data: this.reactLineData,
          }, {
            name: 'Vue',
            type: 'line',
            showSymbol: false,
            lineStyle: {
              color: '#41b883',
            },
            itemStyle: {
              color: '#41b883',
            },
            markLine: {
              data: [{
                yAxis: this.vueCount,
              }],
            },
            data: this.vueLineData,
          }],
        }
      },
    },
    filters: {
      datetime(isoDate) {
        const date = new Date(isoDate)
        const pad0 = n => n < 10 ? `0${n}` : `${n}`
        return `${date.getFullYear()}-${pad0(date.getMonth() + 1)}-${pad0(date.getDate())} ${pad0(date.getHours())}:${pad0(date.getMinutes())}:${pad0(date.getSeconds())}`
      }
    },
    methods: {
      start() {
        // If access token is not present, use APIv3
        if (!localStorage.getItem('access_token')) {
          this.v3start()
        } else {
          this.v4start()
        }
        this.pushLineData()
      },
      pushLineData() {
        const now = Math.trunc(Date.now() / 1000) * 1000
        if (this.vueCount && this.reactCount) {
          if (this.reactLineData.length) {
            this.reactLineData.push([now, this.reactCount])
          } else {
            for (let i = 299; i >= 0; i--) {
              this.reactLineData.push([now - i * 1000, this.reactCount])
            }
          }
          while (this.reactLineData.length > 300) {
            this.reactLineData.shift()
          }

          if (this.vueLineData.length) {
            this.vueLineData.push([now, this.vueCount])
          } else {
            for (let i = 299; i >= 0; i--) {
              this.vueLineData.push([now - i * 1000, this.vueCount])
            }
          }
          while (this.vueLineData.length > 300) {
            this.vueLineData.shift()
          }
        }
        this.timeout.line = setTimeout(this.pushLineData, 1000)
      },
      // GraphQL API
      v4start() {
        this.graphqlFetchReactCount()
        this.graphqlFetchVueCount()
      },
      // REST API
      v3start() {
        this.fetchReactCount()
        this.fetchVueCount()
      },
      fetchReactCount() {
        fetchStargazerCount('facebook/react').then((count) => {
          this.reactCount = count
          this.timeout.react = setTimeout(this.fetchReactCount, 3000)
        }, ({ response: { status, headers, data } }) => {
          if (status === 404) {
            this.errorMessage = data.message
          } else if (status > 400) {
            EventBus.$emit('require:accessToken', this.start, {
              title: headers['x-ratelimit-remaining'] === '0' ? 'Rate Limit Exceeded' : null,
              body: headers['x-ratelimit-remaining'] === '0' ? 'Request rate limit of 60req/min is exceeded' : null,
            })
          }
        })
      },
      fetchVueCount() {
        fetchStargazerCount('vuejs/vue').then((count) => {
          this.vueCount = count
          this.timeout.vue = setTimeout(this.fetchVueCount, 3000)
        }, ({ response: { status, headers, data } }) => {
          if (status === 404) {
            this.errorMessage = data.message
          } else if (status > 400) {
            EventBus.$emit('require:accessToken', this.start, {
              title: headers['x-ratelimit-remaining'] === '0' ? 'Rate Limit Exceeded' : null,
              body: headers['x-ratelimit-remaining'] === '0' ? 'Request rate limit of 60req/min is exceeded' : null,
            })
          }
        })
      },
      graphqlFetchReactCount() {
        graphqlFetchStargazerCount('facebook', 'react').then(({ total, last }) => {
          this.reactCount = total
          this.timeout.react = setTimeout(this.graphqlFetchReactCount, 3000)
          this.reactLast = last
        }, ([{ type }]) => {
          if (type === 'RATE_LIMITED') {
            EventBus.$emit('require:accessToken', this.start, {
              title: 'Rate Limit Exceeded',
              body: 'Request rate limit of 60req/min is exceeded',
            })
          }
        })
      },
      graphqlFetchVueCount() {
        graphqlFetchStargazerCount('vuejs', 'vue').then(({ total, last }) => {
          this.vueCount = total
          this.timeout.vue = setTimeout(this.graphqlFetchVueCount, 3000)
          this.vueLast = last
        }, ([{ type }]) => {
          if (type === 'RATE_LIMITED') {
            EventBus.$emit('require:accessToken', this.start, {
              title: 'Rate Limit Exceeded',
              body: 'Request rate limit of 60req/min is exceeded'
            })
          }
        })
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
    },
    mounted() {
      window.addEventListener('resize', this.resizeChart)
      this.start()
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeChart)
      clearTimeout(this.timeout.react)
      clearTimeout(this.timeout.vue)
      clearTimeout(this.timeout.line)
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
