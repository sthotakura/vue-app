export enum SortDirection {
  Ascending = 1,
  Descending = -1
}

export class SortDescription {
  column!: string;
  direction!: SortDirection;

  constructor(column: string, direction: SortDirection) {
    this.column = column;
    this.direction = direction;
  }
}

export class SortDescriptions {
  private sortDescriptions = Array<SortDescription>();

  public add(sortDescription: SortDescription) {
    this.sortDescriptions.push(sortDescription);
  }

  public remove(column: string) {
    const description = this.get(column);
    if (description) {
      const descriptionIndex = this.sortDescriptions.indexOf(description);
      this.sortDescriptions.splice(descriptionIndex, 1);
    }
  }

  public clear() {
    this.sortDescriptions = [];
  }

  public get(column: string) {
    return this.sortDescriptions.find(d => d.column == column);
  }

  public getDirection(column: string) {
    const description = this.get(column);
    return description ? description.direction : undefined;
  }

  public flipDirection(column: string) {
    const description = this.get(column);
    if(description == null) {
      return;
    }
    description.direction = description.direction == SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending;
  }

  public getIndex(column: string) {
    const index = this.sortDescriptions.findIndex(d => d.column == column);
    return index != -1 ? index + 1 : index;
  }

  public clone() {
    const cloned = new SortDescriptions();
    this.sortDescriptions.forEach(d =>
      cloned.add({
        column: d.column,
        direction: d.direction
      })
    );
    return cloned;
  }
}