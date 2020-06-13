<template>
  <div id="app">
    <div class="container">
      <div id="settings">
        <div class="setting">
          <input type="checkbox" v-model="settings.autoGenerateColumns" id="autoGenerateColumns" />
          <label for="autoGenerateColumns">Auto Generate Columns</label>
        </div>
        <div class="setting">
          <input type="checkbox" v-model="settings.canResizeColumns" id="canResizeColumns" />
          <label for="canResizeColumns">Can Resize Columns</label>
        </div>
        <div class="setting">
          <input type="checkbox" v-model="settings.canResizeRows" id="canResizeRows" />
          <label for="canResizeRows">Can Resize Rows</label>
        </div>
        <div class="setting">
          <input type="checkbox" v-model="settings.canReorderColumns" id="canReorderColumns" />
          <label for="canReorderColumns">Can Reorder Columns</label>
        </div>
        <div class="setting">
          <input type="checkbox" v-model="settings.canSortColumns" id="canSortColumns" />
          <label for="canSortColumns">Can Sort Columns</label>
        </div>
        <div class="setting">
          <input type="checkbox" v-model="settings.stickyHeaders" id="stickyHeaders" />
          <label for="stickyHeaders">Sticky Headers</label>
        </div>
        <div class="setting">
          <input type="checkbox" v-model="settings.showSearchBar" id="showSearchBar" />
          <label for="showSearchBar">Show Search Bar</label>
        </div>
      </div>
      <data-grid :settings="settings" :items="items" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  DataGridSettings,
  SortDescriptions,
  SortDirection,
  RowActionsPosition
} from "./components/DataGrid.vue";
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
        stickyHeaders: false,
        sortDescriptions: new SortDescriptions(),
        tableActions: [],
        rowActions: [],
        rowActionsPosition: RowActionsPosition.Both,
        showSearchBar: false
      }
    };

    this.appData.settings.sortDescriptions.add({
      column: "Column 5",
      direction: SortDirection.Ascending
    });
    this.appData.settings.sortDescriptions.add({
      column: "Column 7",
      direction: SortDirection.Descending
    });
    this.appData.settings.rowActions = [
      {
        label: "Edit",
        execute: this.edit,
        canExecute: this.canEdit
      },
      {
        label: "Action Two",
        execute: this.edit,
        canExecute: this.canEdit
      },
      {
        label: "Action 3",
        execute: this.edit,
        canExecute: this.canEdit
      }    
      ];
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

  edit(o: unknown) {
    console.log("execute");
    console.log(o);
  }

  canEdit(o: unknown) {
    console.log("can execute");
    console.log(o);
    return true;
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
