import { generateDependencyReport } from '@discordjs/voice';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { readFileSync } from 'fs';

export class DiscordClient {
  private discordClient: Client;

  constructor(private token?: string) {
  }

  public async init(): Promise<Client> {
    if (!this.discordClient) {
      console.log('Creating Discord client...');
      const client = new Client({
        intents: [
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.MessageContent,
        ],
      });
      let clientToken: string | undefined;
      if (this.token) {
        clientToken = this.token;
      } else {
        clientToken = process.env.TOKEN;
      }

      if (clientToken) {
        console.log('Logging into Discord...');
        await client.login(clientToken);

        return new Promise((resolve) => {
          client.on(Events.ClientReady, () => {
            this.discordClient = client;
            console.info(`Logged in as ${client.user?.tag}!`);
            console.info(generateDependencyReport());

            client.user?.setActivity(DiscordClient.note());

            resolve(client);
          });
        });
      }
    }
    return Promise.resolve(this.discordClient);
  }

  public get client(): Client {
    return this.discordClient;
  }

  private static note(): string {
    const commit = process.env.GIT_REV;
    if (commit) {
      return commit;
    }

    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      const packageJson = JSON.parse(readFileSync('/app/package.json', 'utf8')) as { version?: string };
      if (packageJson.version) {
        return packageJson.version;
      }
    }

    return 'haha you dont test in prod';
  }
}
