<template>
  <div class="multi-repo">
    <header>
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
    </header>
    <main>
      <h2>100k Star race, React vs. Vue</h2>
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
    name: 'ReactVsVue',
    data() {
      const defaultColor1 = randomColor()
      const defaultColor2 = presetColors[(presetColors.indexOf(defaultColor1) + 3) % presetColors.length]
      return {
        reactCount: 0,
        vueCount: 0,
        showShareButton: false,
        showShareDialog: false,

        chartType: 'bar',
        errorMessage: ''
      }
    },
    computed: {
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
            max(value) {
              return (Math.floor(value.max / 100) + 1) * 100
            },
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
            top: 12,
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
        // If access token is not present, use APIv3
        if (!localStorage.getItem('access_token')) {
          this.v3start()
        } else {
          this.v4start()
        }
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
          setTimeout(this.fetchReactCount, 3000)
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
          setTimeout(this.fetchVueCount, 3000)
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
        graphqlFetchStargazerCount('facebook', 'react').then((count) => {
          this.reactCount = count
          setTimeout(this.graphqlFetchReactCount, 3000)
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
        graphqlFetchStargazerCount('vuejs', 'vue').then((count) => {
          this.vueCount = count
          setTimeout(this.graphqlFetchVueCount, 3000)
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
