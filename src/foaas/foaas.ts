import { Message } from 'discord.js';
import { escapeMarkdown } from '../utils'
import languages from 'langu-list'
import got from 'got'

// just cache all the operations rather than pulling them from the service.  
import data from './operations.json'

export class FOAAS {
    private static readonly URL: string =  'https://foaas.com';
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


public static search(nameKey:string, myArray:any, prop:string) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i][prop] === nameKey) {
            return myArray[i];
        }
    }
}

    public static async foff(msg:Message): Promise<string> {
        const args = msg.content.slice().trim().split(/ +/);
        const command = args.shift().toLowerCase();

        var language = FOAAS.getLanguageFromArgs(args);

        var insultData = FOAAS.randomFO();
        var insultUrl = insultData.url;

        var name = FOAAS.getNameFromMessage(msg);

        var hasNameField = false;
        insultData.fields.forEach( (element:any) => { 
            var replaceValue = FOAAS.DEFAULT_NOUN;
            if( element.field == "name" ) { 
                replaceValue = name;
                hasNameField = true;
            } 
            else if( element.field == "from") {
                replaceValue = FOAAS.DEFAULT_FROM; 
            } 
            else if( element.field == "company") {
                replaceValue = FOAAS.DEFAULT_COMPANY; 
            }
            insultUrl = insultUrl.replace(':' + element.field, replaceValue);
        })
        
        var requestUrl = FOAAS.URL + insultUrl + '?i18n=' + language;
        const response = await got(requestUrl, {responseType: 'json', headers: { 'content-type':'application/json' }})
        const insult = response.body as any;
        var escapedMessage = escapeMarkdown(insult.message);
        return `_${!hasNameField?escapeMarkdown(name) + ', ':''}${escapedMessage}_`;
    }

    private static getLanguageFromArgs(args: string[]) : string {
        var langCode = FOAAS.DEFAULT_LANGUAGE;
        var nextArgIsLanguage = false;
        args.forEach((arg: string) => {
            if (nextArgIsLanguage) {
                var langCode = languages.getLanguageCode(arg);
                if(langCode == undefined ) {
                    if(languages.getLanguageName(arg)) {
                        langCode = arg
                    } else {
                        langCode = FOAAS.DEFAULT_LANGUAGE
                    }
                }
                nextArgIsLanguage = false;
            }
            else if (arg == 'in') {
                nextArgIsLanguage = true;
            }
        });
        return langCode;
    }

    private static getNameFromMessage(msg: Message) : string {
        var name = FOAAS.DEFAULT_NAME;

        if (msg.mentions.everyone) {
            name = "everyone";
        }
        else if (msg.mentions.users.size > 0) {
            var user = msg.mentions.users.first();
            name = user.username;
        }
        else {
            name = msg.author.username;
        }
        return name;
    }
}