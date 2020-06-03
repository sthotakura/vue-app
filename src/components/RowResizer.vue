<template>
  <div class="gripper" ref="gripper"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Ref } from "vue-property-decorator";

@Component
export default class RowResizer extends Vue {
  @Prop() width!: number;

  @Ref("gripper") readonly gripper!: HTMLDivElement;

  private currentPosition = -1;
  private curRow!: HTMLTableRowElement | null;
  private nextRow!: HTMLTableRowElement | null;
  private curRowHeight = -1;
  private nextRowHeight = -1;

  mounted() {
    this.curRow = this.gripper.closest("tr") as HTMLTableRowElement;
    this.nextRow = this.curRow?.nextSibling as HTMLTableRowElement;

    this.gripper.onpointerdown = this.beginSliding;
    this.gripper.onpointerup = this.endSliding;

    this.setWidth();
  }

  @Watch("width") onHeightChanged() {
    this.setWidth();
  }

  setWidth() {
    this.gripper.style.width = this.width + "px";
  }

  beginSliding(e: PointerEvent) {
    e.preventDefault();

    this.currentPosition = e.clientY;

    if (this.curRow) {
      this.curRowHeight = this.curRow.offsetHeight;
    }

    if (this.nextRow) {
      this.nextRowHeight = this.nextRow.offsetHeight;
    }

    this.gripper.onpointermove = this.slide;
    this.gripper.setPointerCapture(e.pointerId);
  }

  endSliding(e: PointerEvent) {
    e.preventDefault();

    this.curRowHeight = -1;
    this.nextRowHeight = -1;
    this.gripper.onpointermove = null;
    this.gripper.releasePointerCapture(e.pointerId);
  }

  slide(e: PointerEvent) {
    e.preventDefault();

    const diff = e.clientY - this.currentPosition;

    if (this.curRow) {
      let newHeight = this.curRowHeight + diff;
      if (newHeight < 0) {
        newHeight = this.curRowHeight;
      }
      this.curRow.style.height = newHeight + "px";
    }

    if (this.nextRow) {
      this.nextRow.style.height = this.nextRowHeight - diff + "px";
    }
  }
}
</script>

<style scoped>
.gripper {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  cursor: row-resize;
  z-index: 1;
}

.gripper:hover {
  border-bottom: 2px solid #00000f;
}
</style>