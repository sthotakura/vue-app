<template>
  <div ref="actionMenu" class="action-menu" @click="openMenu" @blur="closeMenu">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div v-if="isOpen" class="action-menu-content">
      <div v-for="action in actions" 
        :key="action.label" 
        class="action-menu-item"
        @click.stop="onActionClick(action)">
        {{action.label}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref } from "vue-property-decorator";
import { Command } from "./DataGrid.vue";

@Component
export default class ActionMenu extends Vue {
  @Prop() actions!: Command[];
  @Prop() item: unknown;

  @Ref("actionMenu") readonly actionMenu!: HTMLDivElement;

  public isOpen = false;

  public onActionClick(action: Command) {
    if(action.canExecute(this.item)) {
      action.execute(this.item)
    }
    this.closeMenu();
  }

  public openMenu() {
    if(this.isOpen) return;
    
    this.isOpen = true;
  }

  public closeMenu() {
    if(!this.isOpen) return;

    this.isOpen = false;
    this.actionMenu.blur();
  }
}
</script>

<style scoped>
.circle {
  height: 4px;
  width: 4px;
  border-radius: 50%;
  background: #666666;
  margin-bottom: 2px;
  margin-left: auto;
  margin-right: auto;
}
.action-menu {
  position: relative;
  width: 10px;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid transparent;
  cursor: pointer;
}
.action-menu-content {
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
.action-menu-item {
  text-align: left;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  cursor: pointer;
  width: 100%;
  white-space: nowrap;
}
.action-menu-item:hover {
  background: #eeeeee;
}
</style>