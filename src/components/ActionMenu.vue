<template>
  <div ref="actionMenu" class="action-menu" tabindex="0" @click="openMenu" @blur="closeMenu">
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
  height: 5px;
  width: 5px;
  border-radius: 50%;
  background: #555555;
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
  top: 100%;
  left: 40%;
  border: 1px solid #cccccc;
  border-radius: 2px;
  z-index: 100;
  min-width: 100px;
  background: white;
}
.action-menu-item {
  text-align: left;
  padding: 0.5rem;
  cursor: pointer;
}
.action-menu-item:hover {
  background: #eeeeee;
}
</style>