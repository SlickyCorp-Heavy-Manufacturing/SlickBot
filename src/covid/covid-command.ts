import { ICommand } from '../icommand';
import { Message, TextChannel } from 'discord.js';
import got from 'got';

interface UsDaily {
    date: string;
    states: number,
    positive: number,
    negative: number,
    pending: number,
    hospitalizedCurrently: number,
    hospitalizedCumulative: number,
    inIcuCurrently: number,
    inIcuCumulative: number,
    onVentilatorCurrently: number,
    onVentilatorCumulative: number,
    recovered: number,
    dateChecked: string,
    death: number
    hospitalized: number
    lastModified: string,
    total: number
    totalTestResults: number
    posNeg: number
    deathIncrease: number
    hospitalizedIncrease: number
    negativeIncrease: number
    positiveIncrease: number
    totalTestResultsIncrease: number
    hash: string
}

export const CovidCommand: ICommand = {
    name: '!covid',
    helpDescription: 'Return the new daily deaths from covid today.',
    showInHelp: true,
    trigger: (msg: Message) => msg.content.startsWith('!covid') && (msg.channel as TextChannel).name === 'covid-tendies', 
    command: (msg: Message) => {
        got('https://covidtracking.com/api/us/daily', { responseType: 'json' }).then((value) => {
            const body = value.body as UsDaily[];
            msg.channel.send(`${body[0].deathIncrease} Americans laid down their lives for Mike's tendies today.`);
        });
    },
}
