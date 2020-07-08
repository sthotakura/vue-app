<template>
  <input class="search-bar" type="text" :placeholder="placeholder" v-model="searchText" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";

@Component({})
export default class SearchBar extends Vue {
  @Prop({default: "Search"}) placeholder!: string;

  public searchText = "";
  private searchTextTimeout = 0;

  @Watch("searchText") 
  onSearchTextChanged() {
    clearTimeout(this.searchTextTimeout);
    this.searchTextTimeout = setTimeout(() => this.emitChanged(), 500);
  }

  @Emit("change") 
  emitChanged() {
    return this.searchText;
  }
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  margin-bottom: 0.5rem;
  height: 1.5rem;
  padding-left: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>