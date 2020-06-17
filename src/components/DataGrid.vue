<template>
  <div>
    <input
      v-if="settings.showSearchBar"
      type="text"
      placeholder="Search"
      class="search-bar"
      v-model="searchText"
    />
    <action-bar v-if="hasTableActions" :actions="settings.tableActions" />
    <table ref="table">
      <thead>
        <tr ref="headRow">
          <th v-if="settings.canSelectRows">Select</th>
          <th v-if="showRowActionsOnLeft">Actions</th>
          <th
            v-for="column in columns"
            :key="column"
            :class="{sticky: settings.stickyHeaders}"
            :draggable="settings.canReorderColumns"
            @dragstart="handleDragStart"
          >
            <div class="header">
              <column-drop-zone
                v-if="settings.canReorderColumns"
                :height="colDropperHeight"
                @dropped="onDropped"
              />
              <div class="header-text">{{column}}</div>
              <div
                class="sort-indicator"
                v-if="settings.canSortColumns"
                @click.prevent="sortBy(column, $event)"
              >
                <div class="asc" :class="{hide: sortDescriptions.getDirection(column) == -1}"></div>
                <div class="dsc" :class="{hide: sortDescriptions.getDirection(column) == 1}"></div>
              </div>
              <span
                class="sort-index"
                v-if="sortDescriptions.getDirection(column) && sortDescriptions.getDirection(column) != 0"
              >{{sortDescriptions.getIndex(column)}}</span>
              <column-resizer v-if="settings.canResizeColumns" :height="colResizerHeight" />
            </div>
          </th>
          <th v-if="showRowActionsOnRight">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, rowindex) in items" :key="rowindex" ref="bodyRows">
          <td v-if="settings.canSelectRows">
            <row-resizer v-if="settings.canResizeRows" :width="rowResizerWidth" />
            <input ref="rowSelectors" type="checkbox" @click="select(item, rowindex)" />
          </td>
          <td v-if="showRowActionsOnLeft" class="actions-cell">
            <row-resizer
              v-if="settings.canResizeRows && !settings.canSelectRows"
              :width="rowResizerWidth"
            />
            <action-menu :actions="settings.rowActions" :item="item" />
          </td>
          <td v-for="(column, colindex) in columns" :key="column">
            <row-resizer
              v-if="settings.canResizeRows && colindex == 0 && !showRowActionsOnLeft && !settings.canSelectRows"
              :width="rowResizerWidth"
            />
            {{item[column]}}
          </td>
          <td v-if="showRowActionsOnRight" class="actions-cell">
            <action-menu :actions="settings.rowActions" :item="item" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Ref, Emit } from "vue-property-decorator";
import ColumnResizer from "./ColumnResizer.vue";
import RowResizer from "./RowResizer.vue";
import ColumnDropZone from "./ColumnDropZone.vue";
import { DroppedEvent } from "./ColumnDropZone.vue";
import ActionMenu from "./ActionMenu.vue";
import ActionBar from "./ActionBar.vue";

export enum RowActionsPosition {
  Left = -1,
  Both = 0,
  Right = 1
}

export enum SortDirection {
  Ascending = 1,
  Descending = -1
}

export class SortDescription {
  column!: string;
  direction!: SortDirection;

  constructor(column: string, direction: SortDirection) {
    this.column = column;
    this.direction = direction;
  }
}

export class SortDescriptions {
  private sortDescriptions = Array<SortDescription>();

  public add(sortDescription: SortDescription) {
    this.sortDescriptions.push(sortDescription);
  }

  public remove(column: string) {
    const description = this.get(column);
    if (description) {
      const descriptionIndex = this.sortDescriptions.indexOf(description);
      this.sortDescriptions.splice(descriptionIndex, 1);
    }
  }

  public clear() {
    this.sortDescriptions = [];
  }

  public get(column: string) {
    return this.sortDescriptions.find(d => d.column == column);
  }

  public getDirection(column: string) {
    const description = this.get(column);
    return description ? description.direction : undefined;
  }

  public getIndex(column: string) {
    const index = this.sortDescriptions.findIndex(d => d.column == column);
    return index != -1 ? index + 1 : index;
  }

  public clone() {
    const cloned = new SortDescriptions();
    this.sortDescriptions.forEach(d =>
      cloned.add({
        column: d.column,
        direction: d.direction
      })
    );
    return cloned;
  }
}

export interface Command {
  label: string;
  execute(o: unknown): void;
  canExecute(o: unknown): boolean;
}

export class DataGridSettings {
  autoGenerateColumns = true;
  canResizeColumns = false;
  canResizeRows = false;
  canReorderColumns = false;
  canSortColumns = false;
  stickyHeaders = false;
  sortDescriptions = new SortDescriptions();
  tableActions!: Command[];
  rowActions!: Command[];
  rowActionsPosition!: RowActionsPosition;
  showSearchBar!: boolean;
  canSelectRows!: boolean;
}

@Component({
  components: {
    ColumnResizer,
    RowResizer,
    ColumnDropZone,
    ActionMenu,
    ActionBar
  }
})
export default class DataGrid extends Vue {
  @Prop() settings!: DataGridSettings;
  @Prop() items!: Array<unknown>;

  public colResizerHeight = 0;
  public colDropperHeight = 0;
  public rowResizerWidth = 0;
  public sortDescriptions = new SortDescriptions();
  public searchText = "";
  public selectedItems = new Array<unknown>();

  private from = -1;
  private searchTextTimeout = 0;

  @Ref("table") readonly table!: HTMLTableElement;
  @Ref("headRow") readonly headRow!: HTMLTableRowElement;
  @Ref("rowSelectors") readonly rowSelectors!: Array<HTMLInputElement>;
  @Ref("bodyRows") readonly bodyRows!: Array<HTMLTableRowElement>;

  constructor() {
    super();
  }

  mounted() {
    this.configure();
    window.onresize = () => this.configureOverlays();
  }

  get columns() {
    if (this.settings.autoGenerateColumns && this.items && this.items.length) {
      const item = this.items[0] as object;
      return Object.keys(item);
    }

    return null;
  }

  get hasTableActions(): boolean {
    return this.settings.tableActions && this.settings.tableActions.length != 0;
  }

  get hasRowActions(): boolean {
    return this.settings.rowActions && this.settings.rowActions.length != 0;
  }

  get showRowActionsOnLeft(): boolean {
    return this.hasRowActions && this.settings.rowActionsPosition <= 0;
  }

  get showRowActionsOnRight(): boolean {
    return this.hasRowActions && this.settings.rowActionsPosition >= 0;
  }

  @Watch("settings", { deep: true }) onSettingsChanged() {
    this.configure();
  }

  @Watch("searchText") onSearchTextChanged() {
    clearTimeout(this.searchTextTimeout);
    this.searchTextTimeout = setTimeout(() => this.emitSearch(), 500);
  }

  handleDragStart(e: DragEvent) {
    if (!this.settings.canReorderColumns) return;

    if (e.dataTransfer) e.dataTransfer.setData("text/plain", "");

    const targetElement = e.target as HTMLTableHeaderCellElement;
    targetElement.style.cursor = "grabbing";
    this.from = targetElement.cellIndex;
  }

  configure() {
    this.configureOverlays();
    this.configureStickyHeaders();
    this.configureSortDescriptions();
  }

  configureOverlays() {
    this.colResizerHeight = this.settings.canResizeColumns
      ? this.table.offsetHeight
      : 0;

    this.colDropperHeight = this.settings.canReorderColumns
      ? this.table.offsetHeight
      : 0;

    this.rowResizerWidth = this.settings.canResizeRows
      ? this.table.offsetWidth
      : 0;
  }

  configureStickyHeaders() {
    const headerRow = this.headRow;
    const top = this.settings.stickyHeaders
      ? headerRow.getBoundingClientRect().top + "px"
      : "0";

    const children = headerRow.children;

    for (let i = 0; i < children.length; ++i) {
      const element = children[i] as HTMLElement;
      element.style.top = top;
    }
  }

  configureSortDescriptions() {
    if (!this.settings.canSortColumns) {
      this.sortDescriptions.clear();
    } else {
      this.sortDescriptions = this.settings.sortDescriptions.clone();
    }
  }

  onDropped(e: DroppedEvent) {
    if (this.from == e.to) return;

    let fromCell = this.headRow.children[this.from];
    let toCell = this.headRow.children[e.to];

    this.headRow.insertBefore(fromCell, toCell);

    this.bodyRows.forEach(row => {
      fromCell = row.children[this.from];
      toCell = row.children[e.to];

      row.insertBefore(fromCell, toCell);
    });

    this.from = -1;
  }

  sortBy(column: string, e: MouseEvent) {
    const ctrlKeyPressed = e.ctrlKey;
    const description = this.sortDescriptions.get(column);

    if (ctrlKeyPressed) {
      if (description) {
        this.sortDescriptions.remove(column);
      } else {
        this.sortDescriptions.add({
          column: column,
          direction: SortDirection.Ascending
        });
      }
    } else {
      if (description) {
        description.direction =
          description.direction == SortDirection.Ascending
            ? SortDirection.Descending
            : SortDirection.Ascending;
      } else {
        this.sortDescriptions.clear();
        this.sortDescriptions.add({
          column: column,
          direction: SortDirection.Ascending
        });
      }
    }

    this.emitSort();
  }

  select(item: unknown, itemIndex: number) {
    if (this.rowSelectors[itemIndex].checked) {
      this.selectedItems.push(item);
    } else {
      const index = this.selectedItems.indexOf(item);
      if (index > -1) this.selectedItems.splice(index, 1);
    }

    this.emitSelectionChanged();
  }

  @Emit("sort") emitSort() {
    return this.sortDescriptions.clone();
  }

  @Emit("search") emitSearch() {
    return this.searchText;
  }

  @Emit("selectionChanged") emitSelectionChanged() {
    return this.selectedItems;
  }
}
</script>

<style scoped>
table {
  border: 1px solid #cccccc;
  border-collapse: collapse;
  width: 100%;
}
th {
  background: linear-gradient(#ffffff, #cccccc, #aaaaaa);
}
[draggable="true"] {
  cursor: grab;
}
th,
td {
  border: 1px solid #cccccc;
  position: relative;
}
.sticky {
  position: sticky;
}
.header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
}
.header-text {
  flex: 1 0 auto;
}
.sort-indicator {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  cursor: pointer;
}
.sort-indicator .asc {
  height: 0;
  width: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid black;
  margin-bottom: 2px;
}
.sort-indicator .asc.hide {
  opacity: 0;
}
.sort-indicator .dsc {
  height: 0;
  width: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid black;
  margin-top: 2px;
}
.sort-indicator .dsc.hide {
  opacity: 0;
}
.sort-index {
  background: #007bff;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  margin: auto 3px auto 3px;
  min-width: 10px;
}
.search-bar {
  width: 100%;
  margin-bottom: 0.5rem;
  height: 1.5rem;
  padding-left: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions-cell {
  text-align: center;
}
</style>