import Discord, { DMChannel } from 'discord.js';

export class Troutslap {
    public static slap(msg: Discord.Message) {
        if (msg.channel.type == "text") {
            // If @everyone or @here...
            if (msg.mentions.everyone) {                  
                // Assign a random trout
                // Reply in the publicly messaged channel.
                const slapMessage = `_slaps everyone with a ${Troutslap.randomTrout()}_`;
                msg.channel.send(slapMessage)
                    .catch(console.error);
            }
            else if (msg.mentions.users.size > 0) {
                // For each person,
                msg.mentions.users.forEach(function(user, userstr) {
                    // Assign them a random trout
                    // Reply in the publicly messaged channel.
                    const slapMessage = `_slaps ${user.username} around with a ${Troutslap.randomTrout()}_`
                    msg.channel.send(slapMessage)
                        .catch(console.error);
                });
            }
            else {
                Troutslap.dmUsage(msg);
            }
        }
        else {
            Troutslap.dmUsage(msg);
        }
    }

    private static dmUsage(msg: Discord.Message) {
        // Slide into author's DMs with usage.
        if (msg.author.dmChannel === null) {
            msg.author.createDM()
                .then((channel: DMChannel) => channel.send(this.usage()))
        }
        else {
            msg.author.dmChannel.send(this.usage());
        }
    }
    
    private static usage(): String {
        var usage_string = `
Slap users around with a trout.

Usage:
!troutslap @user[ @user @user @user]
    Finds the named users' latest messages and slaps them in that channel for it.

!troutslap @everyone
!troutslap @here
    Slaps all users in the channel.`
        return usage_string;
    }
    
    private static TROUT_LIST = [
        // sized trout
        "giant trout",
        "large trout",
        "small trout",
        "tiny trout",
        "diminutive trout",
        "infitesimally small trout",

        // other adjective trout
        "wet trout",
        "smelly trout",
        "slimy trout",

        // actual trout species
        "Adriatic trout",
        "brown trout",
        "river trout",
        "flathead trout",
        "marble trout",
        "ohrid trout",
        "sevan trout",
        "biwa trout",
        "cutthroat trout",
        "gila trout",
        "Apache trout",
        "rainbow trout",
        "Mexican golden trout",
        "brook trout",
        "bull trout",
        "Dolly Varden trout",
        "lake trout",
        "silver trout",
        "tiger trout",
        "Splake trout",

        // lulz
        "MR402-sized trout"
    ]

    private static randomTrout(): String {
        // TODO: Actually random. Unlike https://xkcd.com/221/
        return this.TROUT_LIST[Math.floor(Math.random() * this.TROUT_LIST.length)]
    }
}