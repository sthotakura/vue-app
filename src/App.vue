<template>
  <div id="app">
    <div class="container">
      <h2>Settings</h2>
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
        <div class="setting">
          <input type="checkbox" v-model="settings.canSelectRows" id="canSelectRows" />
          <label for="canSelectRows">Selectable Rows</label>
        </div>
        <div class="setting">
          <label for="numberOfRows">Rows</label>
          <input type="text" v-model="appData.rows" id="numberOfRows" />
        </div>
        <div class="setting">
          <label for="numberOfColumns">Columns</label>
          <input type="text" v-model="appData.cols" id="numberOfColumns" />
        </div>
      </div>
      <data-grid :settings="settings" :items="items" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import DataGridSettings from "./components/types/DataGridSettings";
import {
  SortDirection,
  SortDescription
} from "./components/types/SortDescriptions";

import Command from "./components/types/Command";
import { RowActionsPosition } from "./components/types/RowActionsPosition";
import DataGrid from "./components/DataGrid.vue";

class AppData {
  rows = 100;
  cols = 10;
  settings = new DataGridSettings();
  items = new Array<unknown>();
}

class CommandImpl implements Command {
  public label: string;

  constructor(label: string) {
    this.label = label;
  }

  public canExecute(): boolean {
    return true;
  }

  public execute() {
    alert(`executing ${this.label}`);
  }
}

@Component({
  components: {
    DataGrid
  }
})
export default class App extends Vue {
  public appData = new AppData();

  constructor() {
    super();
  }

  created() {
    this.appData.settings.canResizeColumns = true;
    this.appData.settings.showSearchBar = true;
    this.appData.settings.canSelectRows = true;
    this.appData.settings.canResizeRows = true;
    this.appData.settings.canReorderColumns = true;
    this.appData.settings.canSortColumns = true;
    this.appData.settings.rowActionsPosition = RowActionsPosition.Both;
    this.setSortDescriptions();
    this.setTableActions();
    this.setRowActions();
    this.createItems();
  }

  get settings() {
    return this.appData.settings;
  }

  get items() {
    return this.appData.items;
  }

  @Watch("appData.rows") onRowsChanged() {
    this.createItems()
  }

  @Watch("appData.cols") onColsChanged() {
    this.createItems();
  }

  createItems() {
    const data: Array<unknown> = [];
    for (let i = 0; i < this.appData.rows; ++i) {
      const dataItem: any = {};
      for (let j = 0; j < this.appData.cols; ++j) {
        dataItem["Column " + j] = "Data r" + i + " c" + j;
      }
      data.push(dataItem);
    }
    this.appData.items = data;
  }

  setSortDescriptions() {
    this.appData.settings.sortDescriptions.add(
      new SortDescription("Column 5", SortDirection.Ascending)
    );
    this.appData.settings.sortDescriptions.add(
      new SortDescription("Column 7", SortDirection.Descending)
    );
  }

  setRowActions() {
    this.appData.settings.rowActionsPosition = RowActionsPosition.Right;

    this.appData.settings.rowActions = [
      new CommandImpl("Edit"),
      new CommandImpl("Action Two"),
      new CommandImpl("Action 3")
    ];
  }

  setTableActions() {
    this.appData.settings.tableActions = [
      new CommandImpl("Table Action 1"),
      new CommandImpl("Table Action 2"),
      new CommandImpl("Table Action 3"),
      new CommandImpl("Table Action 4"),
      new CommandImpl("Table Action 5")
    ];
  }

  execute(o: unknown) {
    console.log("execute");
    console.log(o);
  }

  canExecute(o: unknown) {
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
}
.container {
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  padding: 0.25rem;
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
.setting > label {
  user-select: none;
  margin-left: 5px;
  margin-right: 5px;
}
</style>
