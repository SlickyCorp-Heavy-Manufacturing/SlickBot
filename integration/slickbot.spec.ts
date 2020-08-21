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
            commands.forEach((command): void => command.command(msg));
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
                expect(msg.content).toContain('slaps');
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
                expect(msg.content).toContain('!foff');
                done();
            });
    }, 10000);

    it('foass should f off', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!foff @everyone');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('everyone')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toContain('everyone')
                done();
            });
    }, 15000);

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

    it('tendies should post given stock change in meme format', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!tendies TSLA');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('TSLA')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toMatch(/\*\*TSLA:\*\*\s(\+|\-)\d+\.\d+\s\(\d+\.\d+%\)\s:chart_with_(upwards|downwards)_trend:/gm);
                expect(msg.content).toContain('https://tenor.com');
                done();
            });
    }, 15000);

    it('tendies should post a random stock if none specified', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!tendies');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => /^(\*\*)?[A-Z\.\+\-\=\^]+(\*\*)?:\s/gm.test(msg.content)))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toMatch(/^\*\*[A-Z\.\+\-\=\^]+\*\*:\s(\+|\-)\d+\.\d+\s\(\d+\.\d+%\)\s:chart_with_(upwards|downwards)_trend:/m);
                expect(msg.content).toContain('https://tenor.com');
                done();
            });
    }, 15000);

    it('tendies should post a note if the stock wasn\'t found', (done) => {
        const testChannel = findChannelByName(_userClient.client, TEST_CHANNEL)
        testChannel.send('!tendies thisstockdoesnotexist');

        _lastMessage
            .pipe(filter(msg => msg.author.username === 'TestSlickBot'))
            .pipe(filter(msg => msg.content.includes('thisstockdoesnotexist')))
            .pipe(take(1))
            .subscribe( msg => {
                expect(msg.content).toBe('Ticker symbol \'thisstockdoesnotexist\' was not found.');
                done();
            });
    }, 15000);

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

});
