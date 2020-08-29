<template>
  <tr ref="headRow">
    <th v-if="settings.canSelectRows" :class="{sticky: settings.stickyHeaders}">Select</th>
    <th v-if="showActionsOnLeft" :class="{sticky: settings.stickyHeaders}">Actions</th>
    <th
      v-for="(column, columnIndex) in pinnedColumns"
      :key="column"
      @contextmenu.prevent="handlePinnedContextMenu(columnIndex, $event)"
    >
      <data-grid-column-header
        :showDropZone="settings.canReorderColumns"
        :header="column"
        :showSortIndicators="settings.canSortColumns"
        :sortDirection="sortDescriptions.getDirection(column)"
        :sortIndex="sortDescriptions.getIndex(column)"
        :showResizeGripper="settings.canResizeColumns"
        :overlayHeight="colResizerHeight"
        @sort="onSort"
      />
    </th>
    <th
      v-for="(column, columnIndex) in columns"
      :key="column"
      :class="{sticky: settings.stickyHeaders}"
      :draggable="settings.canReorderColumns"
      @dragstart="onDragStart"
      @contextmenu.prevent="handleMainContextMenu(columnIndex, $event)"
    >
      <data-grid-column-header
        :showDropZone="settings.canReorderColumns"
        :header="column"
        :showSortIndicators="settings.canSortColumns"
        :sortDirection="sortDescriptions.getDirection(column)"
        :sortIndex="sortDescriptions.getIndex(column)"
        :showResizeGripper="settings.canResizeColumns"
        :overlayHeight="colResizerHeight"
      />
    </th>
    <th v-if="showActionsOnRight" :class="{sticky: settings.stickyHeaders}">Actions</th>
  </tr>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Ref, Emit } from "vue-property-decorator";
import ColumnDropZone from "./ColumnDropZone.vue";
import { DroppedEvent } from "./ColumnDropZone.vue";
import ColumnResizer from "./ColumnResizer.vue";
import ContextMenu from "./ContextMenu.vue";
import DataGridColumnHeader, { SortEvnet } from "./DataGridColumnHeader.vue";
import DataGridSettings from "./types/DataGridSettings";
import { SortDescriptions } from "./types/SortDescriptions";

@Component({
  components: {
    ColumnResizer,
    ColumnDropZone,
    ContextMenu,
    DataGridColumnHeader
  }
})
export default class DataGridColumnHeaders extends Vue {
  @Prop() settings!: DataGridSettings;
  @Prop() showActionsOnLeft!: boolean;
  @Prop() showActionsOnRight!: boolean;
  @Prop() columns!: Array<string>;
  @Prop() colDropperHeight!: number;
  @Prop() colResizerHeight!: number;
  @Prop() sortDescriptions!: SortDescriptions;

  @Ref("headRow") readonly headRow!: HTMLTableRowElement;

  public pinnedColumns = new Array<string>();

  private from = -1;

  mounted() {
    this.configure();
  }

  configure() {
    this.configureSticky();
  }

  configureSticky() {
    const headRow = this.headRow;
    const top = this.settings.stickyHeaders
      ? headRow.getBoundingClientRect().top + "px"
      : "0";

    const children = headRow.children;

    for (let i = 0; i < children.length; ++i) {
      const element = children[i] as HTMLElement;
      element.style.top = top;
    }
  }

  @Watch("settings", { deep: true })
  onSettingsChanged() {
    this.configure();
  }

  @Emit("sort")
  onSort(e: Array<unknown>) {
    console.log("column headers: sort");
    return e;
  }

  onDragStart(e: DragEvent) {
    if (!this.settings.canReorderColumns) return;

    if (e.dataTransfer) e.dataTransfer.setData("text/plain", "");

    const targetElement = e.target as HTMLTableHeaderCellElement;
    targetElement.style.cursor = "grabbing";
    this.from = targetElement.cellIndex;
  }

  onDropped(e: DroppedEvent) {
    if (this.from == e.to) return;

    const fromCell = this.headRow.children[this.from];
    const toCell = this.headRow.children[e.to];

    this.headRow.insertBefore(fromCell, toCell);

    this.from = -1;
  }
}
</script>

<style scoped>
th {
  background: linear-gradient(#ffffff, #cccccc, #aaaaaa);
  cursor: default;
  user-select: none;
  border: 1px solid #ccc;
  position: relative;
}
[draggable="true"] {
  cursor: grab;
}
.sticky {
  position: sticky;
}
</style>