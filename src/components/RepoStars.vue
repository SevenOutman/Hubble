<template>
  <div class="hello">
    <div class="input-group">
      <el-input placeholder="User/Org" v-model="owner" v-if="!requesting" />
      <el-input placeholder="Repo" v-model="repo" v-if="!requesting" />
      <el-button type="primary" :loading="requesting" @click="fetchRepo" :disabled="!owner || !repo">
        {{ !requesting ? 'Start' : `Counting stars (${stargazers.length})`}}
      </el-button>
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
  import moment from 'moment'

  import gql from 'graphql-tag'
import { setInterval, clearInterval } from 'timers';

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
        fetchPolicy: 'network-only',
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
            this.createdAt = createdAt
            // this.cachedStargazers = [...this.cachedStargazers, ...edges.map(edge => edge.starredAt)]
            this.totalPages = Math.ceil(totalCount / 100)

            if (!hasPreviousPage && edges.length) {
              this.firstStar = edges[0].starredAt
            }

            this.afterPointer = endCursor

            if (!hasNextPage) {
              this.requesting = false
            }
            this.$nextTick(() => {
              this.stargazers = [...this.stargazers, ...edges.map(edge => edge.starredAt)]
            })
          }
        },

        error({ networkError }) {
          if (+networkError.statusCode > 400) {
            this.requesting = false
            this.accessToken = ''
            this.showDialog = true
          }
        }
      }
    },
    data() {
      return {
        repository: '',
        afterPointer: null,
        accessToken: localStorage.getItem('access_token'),
        owner: 'js-org',
        repo: 'dns.js.org',
        createdAt: '',
        stargazers: [],
        cachedStargazers: [],
        showDialog: false,
        requesting: false,
        totalPages: 1,
        firstStar: ''
      }
    },
    computed: {
      chartData() {
        // if (this.requesting) {
        //   let xAxisData = []
        //   if (this.firstStar) {
        //     let start = moment(this.firstStar).subtract(1, 'day')
        //     let end = moment()
        //     xAxisData.push([start.format('YYYY-MM-DD'), 0])
        //     for (let d = start.add(1, 'day'); d.isSameOrBefore(end, 'day'); d = d.add(1, 'day')) {
        //       xAxisData.push([d.format('YYYY-MM-DD')])
        //     }
        //   }
        //   return xAxisData
        // }
        let chartData = []
        if (this.createdAt) {
          let start = moment(this.createdAt)
          if (!this.stargazers.length) {
            return [
              [start.format('YYYY-MM-DD'), 0]
            ]
          }
          let end = moment(this.stargazers[this.stargazers.length - 1])
          let i = 0
          let total = 0
          for (let d = start; d.isSameOrBefore(end, 'day'); d = d.add(1, 'day')) {
            let count = 0
            if (i >= this.stargazers.length) {
              total = 0
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
      saveAccessToken() {
        localStorage.setItem('access_token', this.accessToken)
        this.showDialog = false
        this.fetchRepo()
      },
      fetchRepo() {
        this.stargazers = []
        this.cachedStargazers = []
        this.firstStar = ''
        this.afterPointer = null
        this.requesting = true
        // this.interval = setInterval(this.syncCached, 3000)
      },
      syncCached() {
        if (this.cachedStargazers.length !== this.stargazers.length) {
          this.stargazers = [...this.cachedStargazers]
        }
        if (!this.requesting) {
          clearInterval(this.interval)
        }
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
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

  }
</style>
