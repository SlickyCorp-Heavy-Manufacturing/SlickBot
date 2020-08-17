export interface ICommand {
    name: String;
    helpDescription: String;
    command: (...args: any[]) => Promise<string>;
}