import Command from "./Command";
import {SortDescriptions} from "./SortDescriptions";
import {RowActionsPosition} from "./RowActionsPosition";

export default class DataGridSettings {
    autoGenerateColumns = true;
    canResizeColumns = false;
    canResizeRows = false;
    canReorderColumns = false;
    canSortColumns = false;
    stickyHeaders = false;
    sortDescriptions = new SortDescriptions();
    tableActions!: Command[];
    rowActions!: Command[];
    rowActionsPosition!: RowActionsPosition;
    showSearchBar!: boolean;
    canSelectRows!: boolean;
  }
