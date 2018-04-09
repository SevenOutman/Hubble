<template>
  <div class="home">
    <header>
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
    </header>
    <main>
    <div class="input-group">
      <el-input placeholder="User/Org" v-model="owner" v-if="!requesting" />
      <el-input placeholder="Repo" v-model="repo" v-if="!requesting" />
      <el-button type="primary" :loading="requesting" @click="fetchRepo" :disabled="!owner || !repo">
        {{ !requesting ? 'Start' : `Counting stars (${stargazersCount})`}}
      </el-button>

    </div>
    <chart :options="chartOptions" ref="chart"></chart>
    </main>
    <footer align="center">
      <router-link to="/my-stars-this-year">How many stars have I earned this year?</router-link>
    </footer>
  </div>
</template>

<script>
  import moment from 'moment'
  import gql from 'graphql-tag'
  import EventBus from '../bus'

  const getRandomRepo = () => {
    const repos = [
      // Gratitude to serving the domain name
      ['js-org', 'dns.js.org']
      
      // custom
      // ...
    ]
    return repos[Math.trunc(Math.random() * repos.length)]
  }

  export default {
    name: 'RepoStars',
    apollo: {
      repository: {
        query: gql`
          query RepoStars($owner: String!, $name: String!, $afterPointer: String) {
            repository(owner: $owner, name: $name) {
              createdAt
              stargazers(after: $afterPointer, first: 100) {
                edges {
                  starredAt
                },
                pageInfo {
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
              }
            }
          }
        `,
        variables() {
          return {
            owner: this.owner,
            name: this.repo,
            afterPointer: this.afterPointer
          }
        },
        skip() {
          return !this.requesting
        },

        // @see https://github.com/Akryum/vue-apollo/issues/48
        manual: true,
        result({ data, loading }) {
          if (!loading) {
            const { createdAt, stargazers: { edges, pageInfo: { endCursor, hasPreviousPage, hasNextPage }, totalCount } } = data.repository

            if (!hasPreviousPage && edges.length) {
              this.chartData = [
                [createdAt.substr(0, 10), 0]
              ]
            }

            this.afterPointer = endCursor

            if (!hasNextPage) {
              this.requesting = false
            }
            this.$nextTick(() => {
              this.updateChartData(edges.map(edge => edge.starredAt.substr(0, 10)))
              if (!hasNextPage) {
                this.suffixChartData()
              }
            })
          }
        },

        error({ networkError }) {
          this.requesting = false
          if (+networkError.statusCode > 400) {
            EventBus.$emit('require:accessToken', this.fetchRepo)
          }
        }
      }
    },
    data() {
      return {
        repository: '',
        afterPointer: null,
        owner: 'js-org',
        repo: 'dns.js.org',
        chartData: [],
        requesting: false,
      }
    },
    computed: {
      stargazersCount() {
        if (!this.chartData.length) {
          return 0
        }
        return this.chartData[this.chartData.length - 1][1]
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
            max (value) {
              return (Math.floor(value.max/ 100) + 1) * 100
            }
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
      suffixChartData() {
        let [lastDate, total] = this.chartData[this.chartData.length - 1]
        let append = []
        let today = moment()
        for (let d = moment(lastDate).add(1, 'day'); d.isSameOrBefore(today, 'day'); d = d.add(1, 'day')) {
          append.push([d.format('YYYY-MM-DD'), total])
        }
        this.chartData = [...this.chartData, ...append]
      },
      updateChartData(stargazers) {
        let lastData = this.chartData[this.chartData.length - 1]
        let count = 0
        stargazers.forEach(date => {
          if (lastData[0] === date) {
            lastData[1]++
          } else if (lastData[0] < date) {
            while (lastData[0] < date) {
              if (this.chartData.indexOf(lastData) === -1) {
                this.chartData.push(lastData)
              }

              lastData = [
                moment(lastData[0]).add(1, 'day').format('YYYY-MM-DD'),
                lastData[1]
              ]
            }
            lastData[1]++
          } else if (lastData[0] > date) {
          }
        })
        if (this.chartData.indexOf(lastData) === -1) {
          this.chartData.push(lastData)
        }
      },
      fetchRepo() {
        this.chartData = []
        this.afterPointer = null
        this.requesting = true
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
    },
    created() {
      const { owner = '', repo = '' } = this.$route.query
      if (owner || repo) {
        this.owner = owner
        this.repo = repo
      } else {
        const [ randomOwner, randomRepo ] = getRandomRepo()
        this.owner = randomOwner
        this.repo = randomRepo
      }
    },
    mounted() {
      window.addEventListener('resize', this.resizeChart)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeChart)
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .home {
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
    .input-group {
      display: flex;
      align-items: center;
      width: 400px;
      max-width: 96%;
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

    .echarts {
      flex-grow: 1;
      width: 100%;
      height: auto;
    }
    }
  }
</style>
