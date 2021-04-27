import got from 'got';

export interface EthermineDashboardStatistics {
  activeWorkers: number;
  currentHashrate: number;
  invalidShares: number;
  lastSeen: number;
  reportedHashrate: number;
  staleShares: number;
  time: number;
  unpaid: number;
  validShares: number;
}

export interface EthermineDashboardData {
  currentStatistics: EthermineDashboardStatistics;
  statistics: EthermineDashboardStatistics[];
  settings: {
    email: string;
    minPayout: number;
    monitor: number;
  };
  workers: {
    currentHashrate: number;
    invalidShares: number;
    lastSeen: number;
    reportedHashrate: number;
    staleShares: 1
    time: number;
    validShares: number;
    worker: string;
  }[];
}

export interface EthermineDashboardInfo {
  data: EthermineDashboardData;
  status: string;
}

export class EthermineDashboard {
  public static async info(walletAddress: string): Promise<EthermineDashboardInfo> {
    const response = await got(`https://api.ethermine.org/miner/${walletAddress}/dashboard`, { responseType: 'json' });
    return response.body as EthermineDashboardInfo;
  }
}
