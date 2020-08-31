import { Message } from 'discord.js';
import localeCode from 'iso-639-1';
import got from 'got';
import { escapeMarkdown } from '../utils';

// just cache all the operations rather than pulling them from the service.
import data from './operations.json';

export class FOAAS {
    private static readonly URL: string = 'https://foaas.com';

    private static readonly DEFAULT_LANGUAGE: string = 'en';

    private static readonly DEFAULT_NAME: string = 'Mr. X';

    private static readonly DEFAULT_FROM: string = 'SlickBot';

    private static readonly DEFAULT_COMPANY: string = 'Acme';

    private static readonly DEFAULT_NOUN: string = 'rubarb';

    private static randomIndex(max: number) : number {
      return Math.floor(Math.random() * Math.floor(max));
    }

    private static randomFO() : any {
      return data[FOAAS.randomIndex(data.length)];
    }

    public static search(nameKey:string, myArray:any[], prop:string) {
      return myArray.find((item) => item[prop] === nameKey);
    }

    public static async foff(msg:Message, user:string=undefined): Promise<string> {
      const args = msg.content.slice().trim().split(/ +/);
      const command = args.shift().toLowerCase();

      const language = FOAAS.getLanguageFromArgs(args);

      const insultData = FOAAS.randomFO();
      let insultUrl = insultData.url;

      var name = '';
      if (user == undefined) {
        name = FOAAS.getNameFromMessage(msg);
      } else {
        name = user;
      }

      let hasNameField = false;
      insultData.fields.forEach((element:any) => {
        let replaceValue = FOAAS.DEFAULT_NOUN;
        if (element.field === 'name') {
          replaceValue = name;
          hasNameField = true;
        } else if (element.field === 'from') {
          replaceValue = FOAAS.DEFAULT_FROM;
        } else if (element.field === 'company') {
          replaceValue = FOAAS.DEFAULT_COMPANY;
        }
        insultUrl = insultUrl.replace(`:${element.field}`, replaceValue);
      });

      const requestUrl = `${FOAAS.URL + insultUrl}?i18n=${language}`;
      const response = await got(requestUrl, { responseType: 'json', headers: { 'content-type': 'application/json' } });
      const insult = response.body as any;
      const escapedMessage = escapeMarkdown(insult.message);
      return `_${!hasNameField ? `${escapeMarkdown(name)}, ` : ''}${escapedMessage}_`;
    }

    private static getLanguageFromArgs(args: string[]) : string {
      let langCode = FOAAS.DEFAULT_LANGUAGE;
      let nextArgIsLanguage = false;
      args.forEach((arg: string) => {
        if (nextArgIsLanguage) {
          langCode = localeCode.getCode(arg);
          if (langCode === '') {
            if (localeCode.validate(arg)) {
              langCode = arg;
            } else {
              langCode = FOAAS.DEFAULT_LANGUAGE;
            }
          }
          nextArgIsLanguage = false;
        } else if (arg === 'in') {
          nextArgIsLanguage = true;
        }
      });
      return langCode;
    }

    private static getNameFromMessage(msg: Message) : string {
      let name = FOAAS.DEFAULT_NAME;

      if (msg.mentions.everyone) {
        name = 'everyone';
      } else if (msg.mentions.users.size > 0) {
        const user = msg.mentions.users.first();
        name = user.username;
      } else {
        name = msg.author.username;
      }
      return name;
    }
}
