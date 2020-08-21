import 'jasmine';

import { NiceReaction } from './react';
import { Message } from 'discord.js';

describe("React", () => {
    describe("Nice", () => {
        it("should send a nice reaction", async () => {
            const spy = jasmine.createSpyObj<Message>('message', ['content', 'react']);
            spy.content = 'tsla 420.69 meme'
            spy.react.and.returnValue(Promise.resolve({} as any));
            expect(NiceReaction.trigger(spy))
            await NiceReaction.command(spy);
            expect(spy.react).toHaveBeenCalledTimes(4);
        });
    });
});