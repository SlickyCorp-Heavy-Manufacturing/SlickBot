import { generateDependencyReport } from '@discordjs/voice';
import Discord, { Events, GatewayIntentBits } from 'discord.js';
import { readFileSync } from 'fs';

export class DiscordClient {
  private discordClient: Discord.Client;

  constructor(private token?: string) {
  }

  public init(): Promise<Discord.Client> {
    if (!this.discordClient) {
      const client = new Discord.Client({
        intents: [
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.MessageContent,
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
        client.on(Events.ClientReady, () => {
          this.discordClient = client;
          console.info(`Logged in as ${client.user.tag}!`);
          console.info(generateDependencyReport());

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

    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      return JSON.parse(readFileSync('/app/package.json', 'utf8')).version;
    }

    return 'haha you dont test in prod';
  }
}
