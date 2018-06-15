<template>
  <div class="multi-repo">
    <header>
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
    </header>
    <main>
      <transition name="fade" mode="out-in">
        <h2 style="margin:.5em 0" v-if="showDiff" v-html="diffMessage" key="diff">

        </h2>
        <h2 style="margin:.5em 0" v-else key="title">
          100k<i class="el-icon-star-on"></i> race, React vs. Vue
        </h2>
      </transition>
      <el-row style="width: 100%">
        <el-col :md="12" :xs="24" style="color:#61dafb">
          <div class="marquee-container">
            <transition name="marquee">
              <div v-if="reactLast" :key="reactLast.starredAt + reactLast.node.login">
                Latest: {{ reactLast.starredAt | datetime }} by {{ reactLast.node.login }}
              </div>
              <div v-else>&nbsp;</div>
            </transition>
          </div>
        </el-col>

        <el-col :md="12" :xs="24" style="color:#41b883">
          <div class="marquee-container">
            <transition name="marquee">
              <div v-if="vueLast" :key="vueLast.starredAt + vueLast.node.login">
                Latest: {{ vueLast.starredAt | datetime }} by {{ vueLast.node.login }}
              </div>
              <div v-else>&nbsp;</div>
            </transition>
          </div>
        </el-col>
      </el-row>
      <div class="chart-place">
        <chart :options="chartOptions" ref="chart" v-loading="isChartLoading"></chart>
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
      <div class="divider">or</div>
      <div class="fb-share-button" data-href="https://hubble.js.org/react-vs-vue" data-layout="button_count"
           data-size="small" data-mobile-iframe="true">
        <a target="_blank"
           href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fhubble.js.org%2Freact-vs-vue&amp;src=sdkpreparse"
           class="fb-xfbml-parse-ignore"
           style="text-decoration: none"
        >
          <el-button
            type="primary"
            style="display: block; width: 100%;line-height: 24px;margin-bottom: 15px;background-color: #4267b2">
            <svg
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px"
              y="0px" width="50" height="50" viewBox="0 0 50 50"
              style="width:24px;height:24px"
              class="octicon"
            >
              <path
                d="M40,0H10C4.486,0,0,4.486,0,10v30c0,5.514,4.486,10,10,10h30c5.514,0,10-4.486,10-10V10C50,4.486,45.514,0,40,0z M39,17h-3 c-2.145,0-3,0.504-3,2v3h6l-1,6h-5v20h-7V28h-3v-6h3v-3c0-4.677,1.581-8,7-8c2.902,0,6,1,6,1V17z"
                style="fill:#ffffff;transform: scale(.96,.96)"
              ></path>
            </svg>
            Share
          </el-button>
        </a>
        <a target="_blank"
           :href="twitterShareLink"
           class="twitter-share-button"
           style="text-decoration: none"
        >
          <el-button type="primary" style="display: block; width: 100%;line-height: 24px; background-color: #1da1f2">
            <svg
              class="octicon"
              viewbox="0 0 2000 1625.36"
              width="2000"
              height="1625.36"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              style="width:24px;height:24px"
            >
              <path
                d="m 1999.9999,192.4 c -73.58,32.64 -152.67,54.69 -235.66,64.61 84.7,-50.78 149.77,-131.19 180.41,-227.01 -79.29,47.03 -167.1,81.17 -260.57,99.57 C 1609.3399,49.82 1502.6999,0 1384.6799,0 c -226.6,0 -410.328,183.71 -410.328,410.31 0,32.16 3.628,63.48 10.625,93.51 -341.016,-17.11 -643.368,-180.47 -845.739,-428.72 -35.324,60.6 -55.5583,131.09 -55.5583,206.29 0,142.36 72.4373,267.95 182.5433,341.53 -67.262,-2.13 -130.535,-20.59 -185.8519,-51.32 -0.039,1.71 -0.039,3.42 -0.039,5.16 0,198.803 141.441,364.635 329.145,402.342 -34.426,9.375 -70.676,14.395 -108.098,14.395 -26.441,0 -52.145,-2.578 -77.203,-7.364 52.215,163.008 203.75,281.649 383.304,284.946 -140.429,110.062 -317.351,175.66 -509.5972,175.66 -33.1211,0 -65.7851,-1.949 -97.8828,-5.738 181.586,116.4176 397.27,184.359 628.988,184.359 754.732,0 1167.462,-625.238 1167.462,-1167.47 0,-17.79 -0.41,-35.48 -1.2,-53.08 80.1799,-57.86 149.7399,-130.12 204.7499,-212.41"
                style="fill:#ffffff;transform: scale(.012, .012)"
              />
            </svg>
            Tweet
          </el-button>
        </a>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import EventBus from '../bus'
  import moment from 'moment'
  import _merge from 'lodash.merge'
  import { fetchStargazerCount, graphqlFetchStargazerCount, graphqlFetchStargazers, restFetchStargazers } from '@/utils'

  export default {
    name: 'ReactVsVue',
    metaInfo: {
      title: 'React vs. Vue',
      meta: [
        // facebook
        { property: 'og:url', content: 'https://hubble.js.org/react-vs-vue' },
        { property: 'og:title', content: 'React vs. Vue · Hubble' },
        { property: 'og:description', content: '100k stars race between React and Vue is LIVE now.' },
        { property: 'og:image', content: 'https://hubble.js.org/static/react-vs-vue.png' },
        // twitter
        { property: 'twitter:title', content: 'React vs. Vue · Hubble' },
        { property: 'twitter:description', content: '100k stars race between React and Vue is LIVE now.' },
      ],
    },
    data() {
      return {
        reactCount: 0,
        vueCount: 0,
        reactLast: null,
        vueLast: null,

        reactStarHistory: [],
        vueStarHistory: [],

        reactLineDataToday: null,
        vueLineDataToday: null,

        reactLineData: [],
        vueLineData: [],

        reactLineDataNow: null,
        vueLineDataNow: null,

        lineDataPlaceholder: [],

        showShareButton: false,
        showShareDialog: false,

        chartType: 'line',
        errorMessage: '',

        timeout: {
          react: null,
          vue: null,
          line: null,
        },
        showDiff: false,
        barChartLoading: true,
        lineChartLoading: true,
      }
    },
    computed: {
      twitterShareLink() {
        const base = 'https://twitter.com/intent/tweet'
        let text = 'React vs. Vue 100k stars race is LIVE!'
        if (this.reactCount > this.vueCount) {
          text = `React leads by ${this.reactCount - this.vueCount} in the 100k stars race against Vue!`
        }
        if (this.reactCount < this.vueCount) {
          text = `Vue leads by ${this.vueCount - this.reactCount} in the 100k stars race against React!`
        }
        const params = {
          text,
          url: 'https://hubble.js.org/react-vs-vue',
          hashtags: ['vuejs', 'reactjs', 'javascript'],
        }

        function composeParams(params) {
          return Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value instanceof Array ? value.join(',') : value)}`).join('&')
        }

        return `${base}?${composeParams(params)}`
      },
      diffMessage() {
        if (this.lineChart) {
          return 'Final stage'
        }
        const numberWithCommas = (x) => {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        if (this.reactCount > this.vueCount) {
          return `React leads by ${numberWithCommas(this.reactCount - this.vueCount)}<i class="el-icon-star-on"></i>`
        }
        if (this.vueCount > this.reactCount) {
          return `Vue leads by ${numberWithCommas(this.vueCount - this.reactCount)}<i class="el-icon-star-on"></i>`
        }
        return `100k<i class="el-icon-star-on"></i> race, React vs. Vue`
      },
      lineChart: {
        get() {
          return this.chartType === 'line'
        },
        set(val) {
          this.chartType = val ? 'line' : 'bar'
        },
      },
      isChartLoading() {
        return this[`${this.chartType}ChartLoading`]
      },
      badgeImgLink() {
        return `https://img.shields.io/badge/Hubble-React%20vs%20Vue-409eff.svg?style=flat-square`
      },
      shareLink() {
        return `https://hubble.js.org/react-vs-vue`
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
            left: window.innerWidth < 500 ? 12 : '8%',
            right: window.innerWidth < 500 ? 12 : '8%',
            containLabel: true,
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
            min: 0,
            max: 110000,
          },
          series: [{
            name: 'GitHub Stars',
            type: 'bar',
            showSymbol: false,
            label: {
              show: true,
              formatter: params => `{h1|${params.name}}\n{h2|${`${params.value}`.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}}`,
              rich: window.innerWidth >= 980 ? {
                h1: {
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  align: 'center',
                },
                h2: {
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  align: 'center',
                },
              } : {
                h1: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  align: 'center',
                },
                h2: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  align: 'center',
                },
              },
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
                },
              },
            },
            data: [this.reactCount, this.vueCount],
          }],
        }
      },
      lineChartOptions() {
        const upperMark = {}
        const lowerMark = {
          symbolRotate: 180,
          label: {
            offset: [0, 12],
          },
        }
        return {
          tooltip: {
            trigger: 'axis',
            formatter: ([repo1, repo2]) => {
              let timeFormat = 'YYYY-MM-DD'
              // if (repo1.seriesIndex > 1 || repo1.dataIndex === this.reactLineData.length - 1) {
              timeFormat = 'YYYY-MM-DD HH:mm:ss'
              // }
              const numberWithCommas = (x) => {
                if (isNaN(x)) return '?'
                return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }
              let tooltip = `${moment(repo1.data[0]).format(timeFormat)}<br>${repo1.marker}${repo1.seriesName}: ${numberWithCommas(repo1.data[1])}`
              if (repo2) {
                tooltip = `${tooltip}<br>${repo2.marker}${repo2.seriesName}: ${numberWithCommas(repo2.data[1])}<br>Diff: ${numberWithCommas(repo1.data[1] - repo2.data[1])}`
              }

              return tooltip
            },
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
            minInterval: 1000 * 60,
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
            max({ max }) {
              return +moment(max).add(300, 'seconds')
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
            // max: ({ max, min }) => {
            //   let paddingTop = 240
            //   let paddingBottom = 50
            //   let minAxis = Math.floor((min - paddingBottom) / 100) * 100
            //   let markHeight = 43
            //   let chartFullHeight = this.$refs.chart.$el.clientHeight
            //   (maxAxis - max) / (maxAxis - minAxis) = markHeight / chartFullHeight
            // let maxAxis = (chartFullHeight * max - markHeight * minAxis) / (chartFullHeight - markHeight)
            // let closedHundred = Math.ceil(maxAxis / 100) * 100
            // return closedHundred
            // },
            // min: ({ min }) => {
            //   let paddingBottom = 50
            //   let closedHundred = Math.floor((min - paddingBottom) / 100) * 100
            //   return closedHundred
            // },
            max: ({ max }) => Math.floor((max + 100) / 10) * 10,
            min: ({ min }) => Math.ceil((min - 100) / 10) * 10,
          },
          // dataZoom: [
          //   {
          //     type: 'inside',
          //     start: 75,
          //     minSpan: 25,
          //   },
          //   {
          //     minSpan: 25,
          //     start: 75
          //   }
          // ],
          series: [{
            name: 'React',
            type: 'line',
            showSymbol: false,
            lineStyle: {
              color: '#61dafb',
            },
            itemStyle: {
              color: '#61dafb',
            },
            markPoint: _merge(
              {
                label: {
                  formatter: () => {
                    return this.reactCount
                  },
                },
                data: [
                  { type: 'max', valueDim: 'x' },
                ],
              },
              this.reactCount > this.vueCount ? upperMark : lowerMark,
            ),
            data: [...this.reactLineData],
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
            markPoint: _merge(
              {
                label: {
                  formatter: () => {
                    return this.vueCount
                  },
                },
                data: [
                  { type: 'max', valueDim: 'x' },
                ],

              },
              this.vueCount >= this.reactCount ? upperMark : lowerMark,
            ),
            data: [...this.vueLineData],
          },
            // {
            //   name: 'React(est.)',
            //   type: 'line',
            //   showSymbol: false,
            //   lineStyle: {
            //     color: '#61dafb',
            //     opacity: 0.2,
            //   },
            //   itemStyle: {
            //     color: '#61dafb',
            //     opacity: 0.2,
            //   },
            //   data: [],
            // }, {
            //   name: 'Vue(est.)',
            //   type: 'line',
            //   showSymbol: false,
            //   lineStyle: {
            //     color: '#41b883',
            //     opacity: 0.2,
            //   },
            //   itemStyle: {
            //     color: '#41b883',
            //     opacity: 0.2,
            //   },
            //   data: [],
            // },
          ],
        }
      },
    },
    filters: {
      datetime(isoDate) {
        const date = new Date(isoDate)
        const pad0 = n => n < 10 ? `0${n}` : `${n}`
        return `${date.getFullYear()}-${pad0(date.getMonth() + 1)}-${pad0(date.getDate())} ${pad0(date.getHours())}:${pad0(date.getMinutes())}:${pad0(date.getSeconds())}`
      },
    },
    methods: {
      updateLineChartData() {
        const upperMark = {
          data: [{
            type: 'max',
          }],
          symbolRotate: 20,
          label: {
            offset: [-3, 0],
          },
        }
        const lowerMark = {
          data: [{
            type: 'max',
          }],
          symbolRotate: 200,
          label: {
            offset: [3, 10],
          },
        }
        this.$nextTick(() => {
          if (this.lineChart) {
            const reactEstData = []
            const vueEstData = []

            let reactRate
            let vueRate

            let reactEst100k
            let vueEst100k

            let now

            if (this.reactLineData.length >= 2) {
              let latest = this.reactLineData[this.reactLineData.length - 1]
              let previous = this.reactLineData[0] //this.reactLineData[this.reactLineData.length - 2]
              now = latest[0]
              reactEstData.push(latest)
              reactRate = (latest[1] - previous[1]) / (latest[0] - previous[0])
              reactEst100k = latest[0] + Math.round((100000 - latest[1]) / reactRate)
            }

            if (this.vueLineData.length >= 2) {
              let latest = this.vueLineData[this.vueLineData.length - 1]
              let previous = this.vueLineData[0] // this.vueLineData[this.vueLineData.length - 2]
              vueEstData.push(latest)
              vueRate = (latest[1] - previous[1]) / (latest[0] - previous[0])
              vueEst100k = latest[0] + Math.round((100000 - latest[1]) / vueRate)
            }


            let estCatchUpCount
            if (this.reactCount > this.vueCount) {
              let approchRate = vueRate - reactRate
              let estCatchUp = Math.round((this.reactCount - this.vueCount) / approchRate)
              // reactEstData.push([now + estCatchUp, this.reactCount + estCatchUp * reactRate])
              // vueEstData.push([now + estCatchUp, this.vueCount + estCatchUp * vueRate])
            }
            reactEstData.push([reactEst100k, 100000])
            vueEstData.push([vueEst100k, 100000])

            this.lineDataPlaceholder = []
            for (let d = moment(now).add(1, 'second'), i = 0; i < 300; d.add(1, 'second'), i++) {
              this.lineDataPlaceholder.push([d.format('YYYY-MM-DD HH:mm:ss'), null]);
            }

            this.$refs.chart.mergeOptions({
              series: [
                {
                  data: [...this.reactLineData, ...this.lineDataPlaceholder],
                  markPoint: this.reactCount >= this.vueCount ? upperMark : lowerMark,
                },
                {
                  data: [...this.vueLineData, ...this.lineDataPlaceholder],
                  markPoint: this.vueCount > this.reactCount ? upperMark : lowerMark,
                },
                // {
                //   data: reactEstData,
                // },
                // {
                //   data: vueEstData,
                // },
              ],
            })
          }
        })
      },
      async start() {
        // If access token is not present, use APIv3
        try {
          if (!localStorage.getItem('access_token')) {
            await this.v3start()
          } else {
            await this.v4start()
          }
        } finally {
          this.barChartLoading = false
          try {
            await this.fetchHistoryStars()
          } finally {
            this.lineChartLoading = false
            // this.updateLineChartData()
            this.pushLineData()
          }
        }
      },
      async fetchHistoryStars() {
        const { data: { date: updatedAt } } = await axios('https://bestofjs-api-v2.firebaseapp.com/projects.json')
        for (let d = moment(updatedAt).add(1, 'day'), i = 0; i < 14; d.add(1, 'day'), i++) {
          this.lineDataPlaceholder.push([+d, null])
        }
        return Promise.all([
          axios('https://bestofjs-api-v1.now.sh/projects/facebook/react')
            .then(({ data }) => {
              const dailyTrends = data['daily-trends']
              const yesterday = data.github.stargazers_count
              const history = [[+moment(updatedAt), yesterday]]
              let stars = yesterday
              // for (let d = moment(updatedAt).subtract(1, 'day'), i = dailyTrends.length - 1; i >= 0; d.subtract(1, 'day'), i--) {
              //   stars -= dailyTrends[i]
              //   history.unshift([+d, stars])
              // }
              this.reactLineData = [] //history
              this.reactStarHistory = history
            }),
          axios('https://bestofjs-api-v1.now.sh/projects/vuejs/vue')
            .then(({ data }) => {
              const dailyTrends = data['daily-trends']
              const yesterday = data.github.stargazers_count
              const history = [[+moment(updatedAt), yesterday]]
              let stars = yesterday
              // for (let d = moment(updatedAt).subtract(1, 'day'), i = dailyTrends.length - 1; i >= 0; d.subtract(1, 'day'), i--) {
              //   stars -= dailyTrends[i]
              //   history.unshift([+d, stars])
              // }
              this.vueLineData = [] // history
              this.vueStarHistory = history
            }),
        ])
      },
      pushLineData() {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        if (this.vueCount && this.reactCount) {
          // if (this.reactLineDataToday.length) {
          // if (!this.reactLineDataToday) {
          //   this.reactLineDataToday = [now, this.reactCount]
          //   this.reactLineData.push(this.reactLineDataToday)
          // } else {
          //   [this.reactLineDataToday[0], this.reactLineDataToday[1]] = [now, this.reactCount]
          // }
          // if (!this.vueLineDataToday) {
          //   this.vueLineDataToday = [now, this.vueCount]
          //   this.vueLineData.push(this.vueLineDataToday)
          // } else {
          //   [this.vueLineDataToday[0], this.vueLineDataToday[1]] = [now, this.vueCount]
          // }

          this.reactLineDataNow = [now, this.reactCount]
          this.reactLineData.push(this.reactLineDataNow)

          this.vueLineDataNow = [now, this.vueCount]
          this.vueLineData.push(this.vueLineDataNow)
          // this.updateLineChartData()
        }
        this.timeout.line = setTimeout(this.pushLineData, 1000)
      },
      // GraphQL API
      v4start() {
        return Promise.all([
          this.graphqlFetchReactCount(),
          this.graphqlFetchVueCount(),
        ])
      },
      // REST API
      v3start() {
        return Promise.all([
          this.fetchReactCount(),
          this.fetchVueCount(),
        ])
      },
      fetchReactCount() {
        return fetchStargazerCount('facebook/react').then((count) => {
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
        return fetchStargazerCount('vuejs/vue').then((count) => {
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
        return graphqlFetchStargazerCount('facebook', 'react').then(({ total, last }) => {
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
        return graphqlFetchStargazerCount('vuejs', 'vue').then(({ total, last }) => {
          this.vueCount = total
          this.timeout.vue = setTimeout(this.graphqlFetchVueCount, 3000)
          this.vueLast = last
        }, ([{ type }]) => {
          if (type === 'RATE_LIMITED') {
            EventBus.$emit('require:accessToken', this.start, {
              title: 'Rate Limit Exceeded',
              body: 'Request rate limit of 60req/min is exceeded',
            })
          }
        })
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
    },
    created() {
      const image = new Image()
      image.src = this.badgeImgLink
    },
    mounted() {
      window.addEventListener('resize', this.resizeChart)
      if (!window.__PRERENDER_INJECTED) {
        this.start()
      }

      this.interval = setInterval(() => {
        this.showDiff = !this.showDiff
      }, 5000)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeChart)
      clearTimeout(this.timeout.react)
      clearTimeout(this.timeout.vue)
      clearTimeout(this.timeout.line)
      clearInterval(this.interval)
    },
  }
</script>

<style lang="less">
  .multi-repo {

    h2 {
      will-change: opacity;
      &.fade-enter-active,
      &.fade-leave-active {
        transition: opacity 500ms;
      }
      &.fade-enter,
      &.fade-leave-to {
        opacity: 0;
      }
      &.fade-leave,
      &.fade-enter-to {
        opacity: 1;
      }
    }

    .marquee-container {
      height: 18px;
      overflow: hidden;
      position: relative;
      .marquee-enter-active,
      .marquee-leave-active {
        will-change: transform;
        transition: transform 500ms;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        text-align: center;
      }
      .marquee-enter {
        transform: translateY(100%);
      }
      .marquee-leave-to {
        transform: translateY(-100%);
      }
      .marquee-leave,
      .marquee-enter-to {
        transform: translateY(0);
      }

    }

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

      @media screen and (max-width: 500px) {
        h2 {
          display: none;
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
