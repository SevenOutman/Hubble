<template>
  <div class="hello">
    <div class="input-group">
      <el-input placeholder="User/Org" v-model="owner" v-if="!requesting" />
      <el-input placeholder="Repo" v-model="repo" v-if="!requesting" />
      <el-button type="primary" :loading="requesting" @click="fetchRepo" :disabled="!owner || !repo">
        {{ !requesting ? 'Start' : `Counting stars (${stargazersCount})`}}
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
import { create } from 'domain';

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
        chartData: [],
        showDialog: false,
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
      saveAccessToken() {
        localStorage.setItem('access_token', this.accessToken)
        this.showDialog = false
        this.fetchRepo()
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
