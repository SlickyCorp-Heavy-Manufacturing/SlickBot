import Discord, { Intents } from 'discord.js';

export class DiscordClient {
  private discordClient: Discord.Client;

  constructor(private token?: string) {
  }

  public init(): Promise<Discord.Client> {
    if (!this.discordClient) {
      const client = new Discord.Client({
        intents: [
          Intents.FLAGS.DIRECT_MESSAGES,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_VOICE_STATES,
          Intents.FLAGS.GUILDS,
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
    const commit = process.env.HEROKU_SLUG_COMMIT;
    const releaseDate = process.env.HEROKU_RELEASE_CREATED_AT;

    if (commit) {
      return `${commit} created at ${releaseDate}`;
    }
    return 'haha you dont test in prod';
  }
}
