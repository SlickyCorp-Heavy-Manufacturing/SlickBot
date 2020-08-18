import Discord from 'discord.js';

export class DiscordClient {
    private discordClient: Discord.Client;

    constructor(private token?: string) {
    }

    public init(): Promise<Discord.Client> {
        if(!this.discordClient) {
            const client = new Discord.Client();
            let clientToken: string;
            if (this.token) {
                clientToken = this.token;
            } else {
                clientToken = process.env.TOKEN;
            }
            client.login(clientToken);

            return new Promise( (resolve) => {
                client.on('ready', () => {
                    this.discordClient = client;
                    console.info(`Logged in as ${client.user.tag}!`);
                    resolve();
                });
            })

        } else {
            return Promise.resolve(this.discordClient);
        }
    }

    public get client(): Discord.Client {
        return this.discordClient;
    }
}