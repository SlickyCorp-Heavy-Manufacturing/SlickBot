import Discord from 'discord.js';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { findChannelByName } from '../src/utils'
import { DiscordClient } from '../src/discordClient';
import { commandList } from '../src/commandList';

const TEST_CHANNEL: string = 'butt-tester'

describe('slickbot', () => {
    let _buttUnderTest: DiscordClient;
    let _userClient: DiscordClient;
    let _lastMessage: Subject<Discord.Message> = new Subject();

    beforeAll( async () => { 
        _userClient = new DiscordClient(process.env.TEST_USER_TOKEN);
        await _userClient.init();

        _buttUnderTest = new DiscordClient();
        await _buttUnderTest.init();

        _buttUnderTest.client.on('message', (msg: Discord.Message) => {
            _lastMessage.next(msg);

            const commands = commandList.filter((command) => command.trigger(msg));
            Promise.all(commands.map(async (command) => {
                command.command(msg)
              })).then();
        });

    }, 10000);

    afterAll( async () => {
        // Destory clients
        await _userClient.client.destroy();
        await _buttUnderTest.client.destroy();
    }, 10000);
    
    it('ping should post pong', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('ping');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content === 'pong'))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toBe('pong');
                done();
            });
    });

    it('weather should post the weather', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!weather');

        _lastMessage.pipe(filter(msg => msg.author.username === 'TestSlickBot')).pipe(take(1)).subscribe( msg => {
            expect(msg.content.length > 5)
            done();
        });
    }, 10000);

    it('troutslap should slap everyone', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!troutslap @everyone');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('slaps')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('slaps @everyone');
                done();
            });
    });

    it('troutslap should slap one non at-able object', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!troutslap you');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('slaps')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('slaps you');
                done();
            });
    });

    it('troutslap should slap multiple non at-able objects', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!troutslap your whole family, your cow, you');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('slaps')))
            .pipe(take(3))
            .subscribe( msg => {
                expect(msg.content).toMatch(/slaps your whole family|slaps your cow|slaps you/);
                done();
            });
    });

    it('xkcd should post xkcd', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!xkcd');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('https://imgs.xkcd.com')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('https://imgs.xkcd.com')
                done();
            });
    }, 10000);


    it('help should post help', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!help');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('!help')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('!help');
                expect(msg.content).toContain('ping');
                expect(msg.content).toContain('!weather');
                expect(msg.content).toContain('!troutslap');
                expect(msg.content).toContain('xkcd');
                expect(msg.content).toContain('!meme');
                done();
            });
    }, 10000);

    it('covid should post todays new covid deaths', (done) => {
        const testChannel = findChannelByName(_userClient.client, 'covid-tendies')
        testChannel.send('!covid');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('Americans laid down')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toMatch(/\d+ Americans laid down their lives for Mike's tendies today./)
                done();
            });
    }, 15000);

    it('!crypto btc should post the exchange rate of BTC', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!crypto btc');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('Current:')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('Current:');
                expect(msg.content).toContain('Low (24 hrs):');
                expect(msg.content).toContain('High (24 hrs):');
                done();
            });
    }, 30000);

    it('!meme should post a meme', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!meme --template "asdf --box1 "box1"');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('https://i.imgflip.com')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('https://i.imgflip.com')
                done();
            });
    }, 15000);

    it('!tweet should post a tweet', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!tweet elonmusk I\'m bored');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.attachments.size > 0 && msg.attachments.some((attachment) => {
                return attachment.name && attachment.name.startsWith('tweet-elonmusk');
            })))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.attachments.size > 0)
                done();
            });
    }, 60000);
});
