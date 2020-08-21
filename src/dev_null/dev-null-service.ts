

import got from 'got';

export class DevNull {
    public static readonly DEV_NULL: string =  'https://devnull-as-a-service.com/dev/null';

    public static async devNullaSS(content: string): Promise<void> {
        const result = await got.post(DevNull.DEV_NULL, {
            json: {
                content,
            },
        });
        console.log(result);
    }
}


