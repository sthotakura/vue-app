<template>
  <div>
    <table ref="table">
      <thead>
        <tr ref="headRow">
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
                <div class="asc" :class="{hide: sortDescriptions.getDirection(column) == -1}">
                  <span>{{sortDescriptions.getIndex(column)}}</span>
                </div>
                <div class="dsc" :class="{hide: sortDescriptions.getDirection(column) == 1}">
                  <span>{{sortDescriptions.getIndex(column)}}</span>
                </div>
              </div>
              <column-resizer v-if="settings.canResizeColumns" :height="colResizerHeight" />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, rowindex) in items" :key="rowindex" ref="bodyRows">
          <td v-for="(column, colindex) in columns" :key="column">
            <row-resizer v-if="settings.canResizeRows && colindex == 0" :width="rowResizerWidth" />
            {{item[column]}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Ref } from "vue-property-decorator";
import ColumnResizer from "./ColumnResizer.vue";
import RowResizer from "./RowResizer.vue";
import ColumnDropZone from "./ColumnDropZone.vue";
import { DroppedEvent } from "./ColumnDropZone.vue";

export declare interface DataGridSettings {
  autoGenerateColumns: boolean;
  canResizeColumns: boolean;
  canResizeRows: boolean;
  canReorderColumns: boolean;
  canSortColumns: boolean;
  stickyHeaders: boolean;
}

export enum SortDirection {
  Ascending = 1,
  Descending = -1
}

export declare interface SortDescription {
  column: string;
  direction: SortDirection;
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
    return this.sortDescriptions.findIndex(d => d.column == column);
  }
}

@Component({
  components: {
    ColumnResizer,
    RowResizer,
    ColumnDropZone
  }
})
export default class DataGrid extends Vue {
  @Prop() settings!: DataGridSettings;
  @Prop() items!: Array<unknown>;

  public colResizerHeight = 0;
  public colDropperHeight = 0;
  public rowResizerWidth = 0;
  public sortDescriptions = new SortDescriptions();

  private from = -1;

  @Ref("table") readonly table!: HTMLTableElement;
  @Ref("headRow") readonly headRow!: HTMLTableRowElement;
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

  @Watch("settings", { deep: true }) onSettingsChanged() {
    this.configure();
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
    const shiftKeyPressed = e.shiftKey;
    const description = this.sortDescriptions.get(column);

    if (shiftKeyPressed) {
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
</style>