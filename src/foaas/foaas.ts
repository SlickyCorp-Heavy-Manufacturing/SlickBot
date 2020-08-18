import got from 'got';
import data from './operations.json'


export class FOAAS {
    private static readonly URL: string =  'https://foaas.com';
    private static readonly DEFAULT_LANGUAGE: string = '?i18n=de';

    private static randomIndex(max: number) : number {
        return Math.floor(Math.random() * Math.floor(max)); 
    }

    private static randomFO() : any {
        return data[FOAAS.randomIndex(data.length)];
    }

    public static async insult(): Promise<string> {
        var insultData = FOAAS.randomFO();
        var insultUrl = insultData.url;

        console.log(insultData)
        insultData.fields.forEach( function(element:any) { 
            var replaceValue = "rubarb";
            if( element.field == "name" ) { 
                replaceValue = "Mr. X"
            } else if( element.field == "from") {
                replaceValue = "SlickBot"
            } else if( element.field == "company") {
                replaceValue = "The Rock"
            }
            insultUrl = insultUrl.replace(':' + element.field, replaceValue);
        })
        
        var requestUrl = FOAAS.URL + insultUrl + FOAAS.DEFAULT_LANGUAGE;
        console.log(requestUrl);
        const response = await got(requestUrl, {responseType: 'json', headers: { 'content-type':'application/json' }})
        const insult = response.body as any;
        return `${insult.message}`;
    }
}