<template>
  <div
    class="dropzone"
    ref="dropzone"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  ></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit, Ref } from "vue-property-decorator";

export interface DroppedEvent {
  to: number;
}

@Component
export default class ColumnDropZone extends Vue {
  @Prop() height!: number;

  @Ref("dropzone") readonly dropzone!: HTMLDivElement;

  mounted() {
    this.setHeight();
  }

  @Watch("height") onHeightChanged() {
    this.setHeight();
  }

  setHeight() {
    this.dropzone.style.height = this.height + "px";
  }

  onDragEnter() {
    this.dropzone.style.borderLeft = "2px solid deepskyblue";
  }

  onDragLeave() {
    this.dropzone.style.borderLeft = "";
  }

  onDrop() {
    const th = this.dropzone.closest("th") as HTMLTableHeaderCellElement;

    this.emitDropped({
      to: th.cellIndex
    });
    this.dropzone.style.borderLeft = "";
  }

  @Emit("dropped") emitDropped(e: DroppedEvent) {
    return e;
  }
}
</script>

<style scoped>
.dropzone {
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  user-select: none;
}
</style>