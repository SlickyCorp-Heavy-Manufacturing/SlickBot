import Discord from 'discord.js';

export class Troutslap {
    public static slap(msg: Discord.Message): Promise<string> {
        // pm format:
            // !troutslap @person @person @person
            // !troutslap @everyone||@here #channel
        // public format:
            // !troutslap @person @person @person
            // !troutslap @everyone||@here
        const client = msg.client
        
        // If private messaged...
        if (msg.channel.type == "dm") {
            // If @everyone or @here
            if (msg.mentions.everyone) {  
                // For each channel in the list
                msg.mentions.channels.forEach(function(channel, channelstr) {
                    // Assign a random trout
                    // Write a message to that channel
                    const slapMessage = "/me hands out slaps with a " + this.randomTrout() + " to everyone.";
                    channel.send(slapMessage)
                        .catch(console.error);
                })
            }
            // If @people...
            else if (msg.mentions.users) {
                // For each person,
                msg.mentions.users.forEach(function(user, userstr) {
                    // Get the last channel they talked in
                    // Assign them a random trout
                    // Write a message to that channel
                    user.lastMessage.reply("/me slaps " + user.username + " around with a " + this.randomTrout())
                        .catch(console.error);
                });
            }
            else {
                // Slide into author's DMs with usage.
                msg.author.dmChannel.send(this.usage());
            }
        }
        // If public messaged...
        else if (msg.channel.type == "text") {
            // TODO: reply in channel, ignoring provided #channel

            // If @everyone or @here...
            if (msg.mentions.everyone) {                  
                // Assign a random trout
                // Reply in the publicly messaged channel.
                const slapMessage = "Slaps with a " + this.randomTrout() + " all around!";
                msg.channel.send(slapMessage)
                    .catch(console.error);
            }
            else if (msg.mentions.users) {
                // For each person,
                msg.mentions.users.forEach(function(user, userstr) {
                    // Assign them a random trout
                    // Reply in the publicly messaged channel.
                    msg.channel.send("/me slaps " + user.username + " around with a " + this.randomTrout())
                        .catch(console.error);
                });
            }
            else {
                // Slide into author's DMs with usage.
                msg.author.dmChannel.send(this.usage());
            }
        }
        else {
            // Slide into author's DMs with usage.
            msg.author.dmChannel.send(this.usage());
        }
        return Promise.resolve(null);
    }
    
    private static usage(): String {
        var usage_string = `
        Slap users around with a trout. You may DM SlickBot so no one knows who requested the slapping.

        Usage:
            !troutslap @user[ @user @user @user]
                Finds the named users' latest messages and slaps them in that channel for it.
            
            !troutslap @everyone #channel
            !troutslap @here #channel
                Slaps users in the given channels.
            
            !troutslap help
            !troutslap usage
                Replies with this message.
        `
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