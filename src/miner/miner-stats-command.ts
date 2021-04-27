import { Message } from 'discord.js';
import { ICommand } from '../icommand';
import { EthermineDashboard } from './ethermine';

const walletRegex = new RegExp('0x[A-Za-z0-9]+');

export const MinerStatsCommand: ICommand = {
  name: '!miner-stats',
  helpDescription: 'Get the statistics of a miner on ethermine. Usage "!miner-stats <wallet-address>"',
  showInHelp: true,
  trigger: (msg: Message) => msg.content.includes('!miner-stats'),
  command: async (msg: Message) => {
    const walletAddress = msg.content.replace('!miner-stats', '').trim();
    if (!walletRegex.test(walletAddress)) {
      msg.reply('Invalid wallet address provided');
      return;
    }

    const info = await EthermineDashboard.info(walletAddress);
    await msg.reply(`Ethermine statistics for ${walletAddress}:
> Active Workers: ${info.data.currentStatistics.activeWorkers}
> Current Hashrate: ${(info.data.currentStatistics.currentHashrate / 1000000).toFixed(3)} MH/s
> Invalid Shares: ${info.data.currentStatistics.invalidShares}
> Stale Shares: ${info.data.currentStatistics.staleShares}
> Valid Shares: ${info.data.currentStatistics.validShares}`);
  },
};
