<template>
  <div class="home">
    <header>
      <h1>
        Hubble
      </h1>
      <h2>Travel through GitHub Stars' history</h2>
    </header>
    <main>
      <div class="input-group el-form-item" :class="{'is-error': errorMessage}">
        <el-input placeholder="User/Org" v-model="owner" v-if="!requesting" @keydown.enter.native="start" />
        <el-input placeholder="Repo" v-model="repo" v-if="!requesting" @keydown.enter.native="start" />
        <el-button type="primary" :loading="requesting" @click.native="start" :disabled="!owner || !repo">
          {{ !requesting ? 'Start' : `Counting stars (${stargazersCount})`}}
        </el-button>
      </div>
      <span>{{ errorMessage}}</span>
      <div class="chart-place">
        <chart :options="chartOptions" ref="chart"></chart>
        <div class="buttons">
          <el-button round icon="el-icon-share" v-show="showShareButton" @click="showShareDialog = true">Share
          </el-button>
        </div>
      </div>
    </main>
    <footer align="center">
      <router-link to="/repo-race">Repo race</router-link>
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
  import moment from 'moment'
  import gql from 'graphql-tag'
  import AxiosFactory from 'axios'
  import parseLinkHeader from 'parse-link-header'

  import EventBus from '../bus'

  const getRandomRepo = () => {
    const repos = [
      // Gratitude to serving the domain name
      ['js-org', 'js.org'],

      // custom
      ['rsuite', 'rsuite'],
    ]
    return repos[Math.trunc(Math.random() * repos.length)]
  }

  const axios = AxiosFactory.create({
    baseURL: 'https://api.github.com',
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  })

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
            afterPointer: this.afterPointer,
          }
        },
        skip() {
          return !this.useGraphQL || !this.requesting
        },

        // @see https://github.com/Akryum/vue-apollo/issues/48
        manual: true,
        result({ data, loading }) {
          if (!loading) {
            const { createdAt, stargazers: { edges, pageInfo: { endCursor, hasPreviousPage, hasNextPage }, totalCount } } = data.repository
            this.since = createdAt.substr(0, 4)

            if (!hasPreviousPage && edges.length) {
              this.chartData = [
                [createdAt.substr(0, 10), 0],
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

        error({ graphQLErrors, networkError }) {
          this.requesting = false

          console.log(graphQLErrors)
          if (graphQLErrors && graphQLErrors[0].type === 'NOT_FOUND') {
            this.errorMessage = graphQLErrors[0].message
          } else if (+networkError.statusCode > 400) {
            EventBus.$emit('require:accessToken', this.start)
          }
        },
      },
    },
    data() {
      return {
        repository: '',
        afterPointer: null,
        owner: 'js-org',
        repo: 'js.org',
        since: '',
        chartData: [],
        requesting: false,
        useGraphQL: false,
        errorMessage: '',
        showShareButton: false,
        showShareDialog: false,
      }
    },
    computed: {
      badgeImgLink() {
        return `https://img.shields.io/badge/since-${this.since}-409eff.svg?style=flat-square`
      },
      shareLink() {
        return `https://hubble.js.org?owner=${this.owner}&repo=${this.repo}&start`
      },
      shareMarkdown() {
        return `[![Hubble](${this.badgeImgLink})](${this.shareLink})`
      },
      shareHTML() {
        return `<a href="${this.shareLink}"><img src="${this.badgeImgLink}" alt="Hubble"></a>`
      },

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
          grid: {
            bottom: 5,
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
              color: '#409EFF',
            },
            showSymbol: false,
            itemStyle: {
              color: '#409EFF',
            },
            markPoint: {
              data: [{
                type: 'max',
              }],
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
                lastData[1],
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
      start() {
        this.since = ''
        this.errorMessage = ''
        this.chartData = []
        this.requesting = true

        // If access token is not present, use APIv3
        if (!localStorage.getItem('access_token')) {
          this.v3start()
        } else {
          this.v4start()
        }
      },
      // GraphQL API
      v4start() {
        this.afterPointer = null
        this.useGraphQL = true
      },
      // REST API
      v3start() {
        this.fetchRepo()
          .then((repo) => {
            // todo console.log(repo.stargazers_url)
            this.fetchStargazers()
          })
      },
      fetchRepo() {
        return axios(`/repos/${this.owner}/${this.repo}`)
          .then(({ data }) => {
            // APIv3 cannot fetch more than 400 pages of stargazers
            this.since = data.created_at.substr(0, 4)
            if (data.stargazers_count > 6000) {
              this.requesting = false
              EventBus.$emit('require:accessToken', this.start, {
                title: 'Warning: Stars > 6,000',
                body: 'Requests will exceed rate limit - 60req/min',
              })
              return Promise.reject()
            } else {
              this.chartData = [
                [data.created_at.substr(0, 10), 0],
              ]
            }
            return data
          })
          .catch(({ response: { status, headers, data } }) => {
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
      fetchStargazers(page = 1) {
        return axios(`/repos/${this.owner}/${this.repo}/stargazers`, {
          params: {
            page,
            per_page: 100,
          },
          headers: {
            Accept: 'application/vnd.github.v3.star+json',
          },
        })
          .then(({ headers, data }) => {
            const links = parseLinkHeader(headers['link'])
            if (links && links.next) {
              this.fetchStargazers(+links.next.page)
            } else {
              this.requesting = false
            }
            this.$nextTick(() => {
              this.updateChartData(data.map(star => star.starred_at.substr(0, 10)))
            })
            return data
          })
          .catch(({ response: { status, headers } }) => {
            this.requesting = false
            if (status > 400) {
              EventBus.$emit('require:accessToken', this.start, {
                title: headers['x-ratelimit-remaining'] === '0' ? 'Rate Limit Exceeded' : null,
                body: headers['x-ratelimit-remaining'] === '0' ? 'Request rate limit of 60req/min is exceeded' : null,
              })
            }
            return Promise.reject()
          })
      },
      resizeChart() {
        this.$refs.chart.resize()
      },
    },
    watch: {
      requesting(val) {
        this.showShareButton = !val
      },
      badgeImgLink(val) {
        // preload
        const image = new Image()
        image.src = val
      }
    },
    created() {
      const { owner = '', repo = '' } = this.$route.query
      if (owner || repo) {
        this.owner = owner
        this.repo = repo
      } else {
        const [randomOwner, randomRepo] = getRandomRepo()
        this.owner = randomOwner
        this.repo = randomRepo
      }
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

        flex-shrink: 0;
        position: relative;
        & + span {
          color: #f56c6c;
          font-size: 12px;
          line-height: 1;
          padding-top: 4px;
        }
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
