<template>
  <div ref="contextMenu" tabindex="0" class="context-menu">
    <div v-if="isOpen" class="context-menu-content">
      <div v-for="action in actions" 
        :key="action.label" 
        class="context-menu-item"
        @click.stop="onActionClick(action)">
        {{action.label}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref, Watch, Emit } from "vue-property-decorator";
import Command from "./types/Command";

@Component
export default class ContextMenu extends Vue {
  @Prop() actions!: Command[];
  @Prop() show!: boolean;
  @Prop() positionX!: number;
  @Prop() positionY!: number;

  @Ref("contextMenu") readonly contextMenu!: HTMLDivElement;

  @Watch("show") onShowChanged() {
      this.isOpen = this.show;
      
      if(this.isOpen) {
        document.addEventListener('click', this.onDocumentClick);
      } else {
        document.removeEventListener('click', this.onDocumentClick);
      }
  }

  @Watch("positionX") onPositionXChanged() {
      if(this.positionX) {
        this.contextMenu.style.left = this.positionX + "px";
      }
  }

  @Watch("positionY") onPositionYChanged() {
      if(this.positionY) {
          this.contextMenu.style.top = this.positionY + "px";
      }
  }

  public isOpen = false;

  public onActionClick(action: Command) {
      if(action.canExecute(null)) {
          action.execute(null);
      }
      this.closeMenu();
  }

  public onDocumentClick(e: MouseEvent) {
    const isClickedOutside = !this.contextMenu.contains(e.target as Node);

    if (isClickedOutside) {
        this.closeMenu();
        document.removeEventListener('click', this.onDocumentClick);
    }
  }

  public openMenu() {
      if(this.isOpen) return;

      this.isOpen = true;
  }

  public closeMenu() {
      if(!this.isOpen) return;

      this.isOpen = false;
      this.emitClosed();
  }

  @Emit("closed") emitClosed() {
      return {};
  }
}
</script>

<style scoped>
.context-menu {
    position: absolute;
    cursor: pointer;
}
.context-menu-content {
  position: absolute;
  border: 1px solid #cccccc;
  border-radius: 4px;
  z-index: 100;
  background: white;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  box-shadow: 0 2px 6px #bbbbbb;
  padding-right: 1rem;
  user-select: none;
}
.context-menu-item {
  text-align: left;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  cursor: pointer;
  width: 100%;
  white-space: nowrap;
}
.context-menu-item:hover {
    background: #eeeeee;
}
</style>