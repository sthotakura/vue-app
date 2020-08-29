<template>
  <div class="header">
    <column-drop-zone v-if="showDropZone" :height="overlayHeight" @dropped="onDropped" />
    <div class="header-text">{{header}}</div>
    <div class="header-menu" @click.prevent="onOpenMenu"></div>
    <div v-if="showSortIndicators" class="sort-indicator" @click.prevent="onSort($event)">
      <div class="asc" :class="{hide: sortDirection == -1}"></div>
      <div class="dsc" :class="{hide: sortDirection == 1}"></div>
    </div>
    <div v-if="showSortIndicators && sortIndex != -1" class="sort-index">{{sortIndex}}</div>
    <column-resizer v-if="showResizeGripper" :height="overlayHeight" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import ColumnDropZone from "./ColumnDropZone.vue";
import { DroppedEvent } from "./ColumnDropZone.vue";
import ColumnResizer from "./ColumnResizer.vue";
import { SortDirection } from "./types/SortDescriptions";

export class SortEvnet {
  column!: string;
  direction!: SortDirection;
  index!: number;
  ctrlKey!: boolean

  constructor(column: string, direction: SortDirection, index: number, ctrlKey: boolean) {
    this.column = column;
    this.direction = direction;
    this.index = index;
    this.ctrlKey = ctrlKey;
  }
}

@Component({
  components: {
    ColumnResizer,
    ColumnDropZone
  }
})
export default class DataGridColumnHeader extends Vue {
  @Prop() showDropZone!: boolean;
  @Prop() header!: string;
  @Prop() showSortIndicators!: boolean;
  @Prop() sortDirection!: SortDirection;
  @Prop() sortIndex!: number;
  @Prop() showResizeGripper!: boolean;
  @Prop() overlayHeight!: number;

  onDropped(e: DroppedEvent) {
    console.log(e);
  }

  onOpenMenu() {
    console.log("open menu");
  }

  onSort(e: MouseEvent) {
    console.log("column header: sort");
    
    this.$emit("sort", new SortEvnet(
      this.header, 
      this.sortDirection, 
      this.sortIndex, 
      e.ctrlKey));
  }
}
</script>

<style scoped>
.header {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
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
  flex: 0 0 auto;
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
.header-text {
  flex: 1 0 auto;
  text-align: center;
}
.header-menu {
  border: 5px solid red;
  cursor: default;
}
</style>