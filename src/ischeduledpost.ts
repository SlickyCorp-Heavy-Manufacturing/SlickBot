export interface IScheduledPost {
    cronDate: string;
    channel: string;
    getMessage: () => Promise<string>;
}
