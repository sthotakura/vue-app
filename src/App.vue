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
        <div class="setting">
          <input type="checkbox" v-model="settings.canSelectRows" id="canSelectRows" />
          <label for="canSelectRows">Selectable Rows</label>
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
  SortDirection,
  SortDescription,
  SortDescriptions,
  RowActionsPosition,
  Command
} from "./components/DataGrid.vue";
import DataGrid from "./components/DataGrid.vue";

class AppData {
  rows = 100;
  cols = 10;
  settings = new DataGridSettings();
}

class CommandImpl implements Command {
  public label: string;
  
  constructor(label: string) {
    this.label = label;
  }  

  public canExecute(o: unknown): boolean {
    return true;
  }

  public execute(o: unknown) {
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
    this.setSortDescriptions();
    this.setTableActions();
    this.setRowActions();
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

  setSortDescriptions() {
    this.appData.settings.sortDescriptions.add(new SortDescription("Column 5", SortDirection.Ascending));
    this.appData.settings.sortDescriptions.add(new SortDescription("Column 7", SortDirection.Descending));
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
      new CommandImpl("Table Action 5"),
    ]
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
