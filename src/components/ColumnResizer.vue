<template>
  <div class="gripper" ref="gripper"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Ref } from "vue-property-decorator";

@Component
export default class ColumnResizer extends Vue {
  @Prop() height!: number;

  @Ref("gripper") readonly gripper!: HTMLDivElement;

  private currentPosition = -1;
  private curCol!: HTMLTableHeaderCellElement | null;
  private nextCol!: HTMLTableHeaderCellElement | null;
  private curColWidth = -1;
  private nextColWidth = -1;

  mounted() {
    this.curCol = this.gripper.closest("th") as HTMLTableHeaderCellElement;
    this.nextCol = this.curCol?.nextSibling as HTMLTableHeaderCellElement;

    this.gripper.onpointerdown = this.beginSliding;
    this.gripper.onpointerup = this.endSliding;

    this.setHeight();
  }

  @Watch("height") onHeightChanged() {
    this.setHeight();
  }

  setHeight() {
    this.gripper.style.height = this.height + "px";
  }

  beginSliding(e: PointerEvent) {
    e.preventDefault();

    this.currentPosition = e.clientX;

    if (this.curCol) {
      this.curColWidth = this.curCol.offsetWidth;
    }

    if (this.nextCol) {
      this.nextColWidth = this.nextCol.offsetWidth;
    }

    this.gripper.onpointermove = this.slide;
    this.gripper.setPointerCapture(e.pointerId);
  }

  endSliding(e: PointerEvent) {
    e.preventDefault();

    this.curColWidth = -1;
    this.nextColWidth = -1;
    this.gripper.onpointermove = null;
    this.gripper.releasePointerCapture(e.pointerId);
  }

  slide(e: PointerEvent) {
    e.preventDefault();

    const diff = e.clientX - this.currentPosition;

    if (this.curCol) {
      this.curCol.style.width = this.curColWidth + diff + "px";
    }

    if (this.nextCol) {
      this.nextCol.style.width = this.nextColWidth - diff + "px";
    }
  }
}
</script>

<style scoped>
.gripper {
  position: absolute;
  top: 0;
  right: 0;
  width: 5px;
  cursor: col-resize;
  user-select: none;
  z-index: 1;
}

.gripper:hover {
  border-right: 2px solid #00000f;
}
</style>