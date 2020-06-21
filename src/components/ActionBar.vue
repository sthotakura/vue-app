<template>
    <div class="action-bar">
        <button v-for="(action, acitonIndex) in actions"
                :key="acitonIndex"
                class="aciton-button"
                @click.stop.prevent="onClick(action)">
                {{action.label}}
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Command from "./types/Command";

@Component
export default class ActionBar extends Vue {
  @Prop() actions!: Command[];

  onClick(action: Command) {
      if(action.canExecute({})) {
          action.execute({});
      }
  }
}
</script>

<style scoped>
.action-bar {
    width: 100%;
    text-align: left;
    margin-bottom: 0.5rem;
}
.aciton-button {
    margin: 0.25rem;
}
</style>