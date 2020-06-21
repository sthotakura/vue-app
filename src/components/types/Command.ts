export default interface Command {
    label: string;
    execute(o: unknown): void;
    canExecute(o: unknown): boolean;
  }