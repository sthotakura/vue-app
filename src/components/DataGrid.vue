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
    <context-menu
      :actions="contextMenuCommands"
      :show="isContextMenuOpen"
      :positionX="contextMenuPositionX"
      :positionY="contextMenuPositionY"
      @closed="onContextMenuClosed"
    />
    <div style="display: flex; flex-flow: row nowrap">
      <table v-if="hasPinnedRows" ref="pinned">
        <thead>
          <tr>
            <th v-for="pinnedColumn in pinnedColumns" :key="pinnedColumn">
              <div class="header-text">{{pinnedColumn}}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowindex) in items" :key="rowindex">
            <td v-for="(col, colindex) in pinnedColumns" :key="colindex">{{row[col]}}</td>
          </tr>
        </tbody>
      </table>
      <table ref="table">
        <thead>
          <tr ref="headRow">
            <th v-if="settings.canSelectRows" :class="{sticky: settings.stickyHeaders}">Select</th>
            <th v-if="showRowActionsOnLeft" :class="{sticky: settings.stickyHeaders}">Actions</th>
            <th
              v-for="(column, columnIndex) in columns"
              :key="column"
              :class="{sticky: settings.stickyHeaders}"
              :draggable="settings.canReorderColumns"
              @dragstart="handleDragStart"
              @contextmenu.prevent="handleContextMenu(columnIndex, $event)"
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
            <th v-if="showRowActionsOnRight" :class="{sticky: settings.stickyHeaders}">Actions</th>
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
import ContextMenu from "./ContextMenu.vue";
import DataGridSettings from "./types/DataGridSettings";
import { SortDescriptions, SortDirection } from "./types/SortDescriptions";
import Command from "./types/Command";

@Component({
  components: {
    ColumnResizer,
    RowResizer,
    ColumnDropZone,
    ActionMenu,
    ActionBar,
    ContextMenu
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
  public contextMenuCommands = new Array<Command>();
  public isContextMenuOpen = false;
  public contextMenuPositionX = 0;
  public contextMenuPositionY = 0;
  public pinnedColumns = new Array<string>();

  private from = -1;
  private searchTextTimeout = 0;
  private contextMenuOpenedOnColumn!: number | undefined;

  @Ref("table") readonly table!: HTMLTableElement;
  @Ref("headRow") readonly headRow!: HTMLTableRowElement;
  @Ref("rowSelectors") readonly rowSelectors!: Array<HTMLInputElement>;
  @Ref("bodyRows") readonly bodyRows!: Array<HTMLTableRowElement>;

  constructor() {
    super();
  }

  created() {
    this.contextMenuCommands = [
      {
        label: "Pin Column",
        canExecute: this.canPinColumn,
        execute: this.pinColumn
      }
    ];
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

  get hasPinnedRows(): boolean {
    return this.pinnedColumns && this.pinnedColumns.length != 0;
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

  handleContextMenu(columnIndex: number, e: MouseEvent) {
    this.isContextMenuOpen = true;

    if (e.pageX || e.pageY) {
      this.contextMenuPositionX = e.pageX;
      this.contextMenuPositionY = e.pageY;
    } else if (e.clientX || e.clientY) {
      this.contextMenuPositionX =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      this.contextMenuPositionY =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    this.contextMenuOpenedOnColumn = columnIndex;
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

  onContextMenuClosed() {
    this.isContextMenuOpen = false;
    this.contextMenuOpenedOnColumn = undefined;
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

  canPinColumn(o: unknown) {
    return true;
  }

  pinColumn(o: unknown) {
    if (this.contextMenuOpenedOnColumn !== undefined) {
      this.pinnedColumns.push(this.columns![this.contextMenuOpenedOnColumn]);
    }
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
  cursor: default;
  user-select: none;
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