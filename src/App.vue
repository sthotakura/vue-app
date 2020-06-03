<template>
  <div id="app">
    <div class="container">
      <div id="settings">
        <div class="setting" v-for="key in Object.keys(settings)" :key="key">
          <input type="checkbox" :id="key" v-model="settings[key]" />
          <label :for="key">{{key}}</label>
        </div>
      </div>

      <data-grid :settings="settings" :items="items" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { DataGridSettings } from "./components/DataGrid.vue";
import DataGrid from "./components/DataGrid.vue";

declare interface AppData {
  rows: number;
  cols: number;
  settings: DataGridSettings;
}

@Component({
  components: {
    DataGrid
  }
})
export default class App extends Vue {
  private appData: AppData;

  constructor() {
    super();

    this.appData = {
      rows: 100,
      cols: 10,
      settings: {
        autoGenerateColumns: true,
        canResizeColumns: false,
        canResizeRows: false,
        canReorderColumns: false,
        canSortColumns: false,
        stickyHeaders: false
      }
    };
  }

  get settings() {
    return this.appData.settings;
  }

  get items() {
    const data: Array<unknown> = [];
    for (let i = 0; i < this.appData.rows; ++i) {
      const dataItem: any = {};
      for (let j = 0; j < this.appData.cols; ++j) {
        dataItem["Column " + j] = "Data " + i + j;
      }
      data.push(dataItem);
    }
    return data;
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.container {
  width: 1000px;
  margin-left: auto;
  margin-right: auto;
}
#settings {
  display: flex;
  flex-flow: row wrap;
  margin-bottom: 10px;
}
.setting {
  flex: 0 1 auto;
  margin-right: 10px;
}
</style>
