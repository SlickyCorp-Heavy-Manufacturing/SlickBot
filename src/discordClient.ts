import Discord, { GatewayIntentBits } from 'discord.js';

export class DiscordClient {
  private discordClient: Discord.Client;

  constructor(private token?: string) {
  }

  public init(): Promise<Discord.Client> {
    if (!this.discordClient) {
      const client = new Discord.Client({
        intents: [
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.Guilds,
        ],
      });
      let clientToken: string;
      if (this.token) {
        clientToken = this.token;
      } else {
        clientToken = process.env.TOKEN;
      }
      client.login(clientToken);

      return new Promise((resolve) => {
        client.on('ready', () => {
          this.discordClient = client;
          console.info(`Logged in as ${client.user.tag}!`);

          client.user.setActivity(DiscordClient.note());

          resolve(client);
        });
      });
    }
    return Promise.resolve(this.discordClient);
  }

  public get client(): Discord.Client {
    return this.discordClient;
  }

  private static note(): string {
    const commit = process.env.GIT_REV;

    if (commit) {
      return commit;
    }
    return 'haha you dont test in prod';
  }
}
