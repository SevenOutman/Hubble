<template>
  <div class="my-stars">
    <header>
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
    </header>
    <main>
    <div class="input-group">
      <el-input :value="`Stars ${username || 'I'} have earned this year`" readonly v-if="!requesting" />
      <el-button type="primary" :loading="requesting" @click="start">
        {{ !requesting ? `${username ? stargazersCount : 'Start'}` : `Counting stars (${stargazersCount})`}}
      </el-button>
    </div>
    <chart :options="chartOptions" ref="chart"></chart>
    </main>
    <footer align="center">
      <router-link to="/">Home</router-link>
    </footer>
  </div>
</template>

<script>
  import moment from 'moment'
  import gql from 'graphql-tag'

  import EventBus from '../bus'

  const YEAR = new Date().getFullYear()

  export default {
    name: 'MyStars',
    apollo: {
      repositories: {
        query: gql`
          query MyBestarredRepos($after: String) {
            viewer {
              login
              repositories(first: 100, after: $after, orderBy: { field: STARGAZERS, direction: DESC }) {
                nodes {
                  name
                  stargazers {
                    totalCount
                  }
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables() {
          return {
            after: this.afterPointer
          }
        },
        skip() {
          return !this.useGraphQL || !this.requesting
        },
        // @see https://github.com/Akryum/vue-apollo/issues/48
        manual: true,
        result({ data, loading }) {
          if (!loading) {
            const { login, repositories: { nodes, pageInfo: { endCursor, hasNextPage } } } = data.viewer
            this.username = login
            this.reposWithStars = [...this.reposWithStars, ...nodes.filter(repository => repository.stargazers.totalCount > 0).map(repository => repository.name)]

            if (hasNextPage && !nodes.find(repository => repository.stargazers.totalCount <= 0)) {
              this.afterPointer = endCursor
            } else if (this.reposWithStars.length) {
              this.repo = this.reposWithStars[0]
            }
          }
        },

        error({ networkError }) {
          this.requesting = false
          if (+networkError.statusCode > 400) {
            EventBus.$emit('require:accessToken', this.start)
          }
        }
      },
      repository: {
        query: gql`
          query RepoStars($owner: String!, $name: String!, $beforePointer: String) {
            repository(owner: $owner, name: $name) {
              stargazers(after: $beforePointer, first: 100, orderBy: { direction: DESC, field: STARRED_AT }) {
                edges {
                  starredAt
                },
                pageInfo {
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables() {
          return {
            owner: this.username,
            name: this.repo
          }
        },
        skip() {
          return !this.useGraphQL || !this.requesting || !this.username || !this.repo
        },
        manual: true,
        result({ data, loading }) {
          if (!loading) {
            const { stargazers: { edges, pageInfo: { endCursor, hasPreviousPage, hasNextPage }}} = data.repository
            const starsFromPreviousYears = edges.filter(star => star.starredAt.substr(0, 4) !== `${YEAR}`).length

            const indexOfRepo = this.reposWithStars.indexOf(this.repo)

            if (starsFromPreviousYears < edges.length) {
              if (!hasPreviousPage) {
                this.chartData.push([this.repo, 0])
              }
              this.chartData[this.chartData.length - 1][1] += edges.length - starsFromPreviousYears
            }
            if (!hasNextPage || starsFromPreviousYears > 0) {
              if (indexOfRepo < this.reposWithStars.length - 1) {
                this.repo = this.reposWithStars[indexOfRepo + 1]
              } else {
                this.requesting = false
                this.repo = ''
                this.afterPointer = null
                this.beforePointer = null
              }
            }
          }
        },

        error({ networkError }) {
          if (+networkError.statusCode > 400) {
            this.requesting = false
            EventBus.$emit('require:accessToken', this.start)
          }
        }
      }
    },
    data() {
      return {
        username: '',
        repo: '',
        reposWithStars: [],
        beforePointer: null,
        afterPointer: null,
        chartData: [],
        requesting: false,
        useGraphQL: false
      }
    },
    computed: {
      stargazersCount() {
        return this.chartData.filter(d => !!d).reduce((sum, [name, count]) => sum + count, 0)
      },
      chartOptions() {
        return {
          tooltip: {
            trigger: 'item',
          },
          xAxis: {
            type: 'category',
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
            }
          },
          series: [{
            type: 'bar',
            lineStyle: {
              color: '#409EFF',
            },
            showSymbol: false,
            itemStyle: {
              color: '#409EFF',
            },
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            },
            data: this.chartData.filter(d => !!d),
          }],
        }
      },
    },
    methods: {
      start() {
        this.reposWithStars = []
        this.chartData = []
        this.requesting = true

        if(!localStorage.getItem('access_token')) {
          this.requesting = false
          EventBus.$emit('require:accessToken', this.start, {
            title: 'Tell Hubble who you are',
            body: 'Hubble recognize you by your access token'
          })
        } else {
          this.v4start()
        }
      },
      v3start() {
        
      },
      v4start() {
        this.beforePointer = null
        this.afterPointer = null
        this.useGraphQL = true
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
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .my-stars {
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
