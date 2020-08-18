import Discord from 'discord.js';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { findChannelByName } from '../src/utils'
import { DiscordClient } from '../src/discordClient';
import { commandList } from '../src/commandList';

const TEST_CHANNEL: string = 'butt-tester'

describe('ping', () => {
    let _buttUnderTest: DiscordClient;
    let _userClient: DiscordClient;
    let _lastMessage: Subject<Discord.Message> = new Subject();

    beforeAll( async () => {
        console.log('intgration test');
        console.log(process.env);
        
        _userClient = new DiscordClient(process.env.TEST_USER_TOKEN);
        await _userClient.init();

        _buttUnderTest = new DiscordClient();
        await _buttUnderTest.init();

        _buttUnderTest.client.on('message', (msg: Discord.Message) => {
            _lastMessage.next(msg);

            const commands = commandList.filter((command) => command.trigger(msg));
            commands.forEach((command): void => command.command(msg));
          });

    })
    
    it('ping should post pong', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('ping');

        _lastMessage.pipe(filter(msg => msg.author.username === 'TestSlickBot')).subscribe( msg => {
            expect(msg.content).toBe('pong');
            done();
        });
    })
})
