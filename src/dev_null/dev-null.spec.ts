import nock from 'nock';

import { DevNullCommand } from './dev-null-command';
import { Message } from 'discord.js';

describe("dev-null", () => {
    it("should send your message to /dev/null", async () => {
        const spy = jasmine.createSpyObj<Message>('message', ['content', 'delete']);
        spy.content = 'tsla 420.69 meme'
        spy.delete.and.returnValue(Promise.resolve({} as any));
        expect(DevNullCommand.trigger(spy));
        
        nock('https://devnull-as-a-service.com')
            .post('/dev/null')
            .reply(200, { });
  
            await DevNullCommand.command(spy);
            expect(spy.delete).toHaveBeenCalled();
    });
});