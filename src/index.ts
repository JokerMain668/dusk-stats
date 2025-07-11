import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { CommandKit } from 'commandkit';
import path from 'path';

const TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID as string;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    devGuildIds: [GUILD_ID],
    devUserIds: ['230277630245601280'],
    bulkRegister: true,
    skipBuiltInValidations: true,
})

client.login(TOKEN);