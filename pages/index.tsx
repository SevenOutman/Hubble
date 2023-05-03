import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const [errorMessage] = useState();
  return (
    <div className="home">
      <header>
        <h1>Hubble</h1>
        <h2>{"Travel through GitHub Stars' history"}</h2>
      </header>
      <main>
        <div
          className={cn("input-group el-form-item", {
            "is-error": errorMessage,
          })}
        >
          {/* <el-autocomplete
                v-model="repoFullName"
                :fetch-suggestions="querySearchAsync"
                value-key="full_name"
                :placeholder="`Search for repository, e.g. ${repo}`"
                v-if="!requesting"
                @keydown.enter.native="start"
        >
          <template slot-scope="{ item }">
            <div className="name">{ item.full_name }</div>
          </template>
        </el-autocomplete>
        <el-button type="primary" :loading="requesting" @click.native="start" :disabled="!owner || !repo">
          { !requesting ? 'Start' : `Counting stars for ${repoFullName}... ${totalStars ? Math.round(100 * stargazersCount / totalStars) : 0}%`}
        </el-button> */}
        </div>
        <span>{errorMessage}</span>
        <div className="chart-place">
          {/* <chart :options="chartOptions" ref="chart"></chart> */}
          <div className="buttons">
            {/* <el-button round icon="el-icon-share" v-show="showShareButton" @click="showShareDialog = true">Share
          </el-button> */}
          </div>
        </div>
      </main>
      <footer align="center">
        {/* <router-link to="/repo-race">Repo race</router-link>
      |
      <router-link to="/my-stars-this-year?start">How many stars have I earned this year?</router-link>
      |
      <router-link to="/react-vs-vue">React vs. Vue</router-link> */}
      </footer>
      {/* <el-dialog
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
    </el-dialog> */}
    </div>
  );
}
