import { SlashCommandProps } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';

const ping = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!');

function run({ interaction, client }: SlashCommandProps) {
    interaction.reply(`:ping_pong: Pong! ${client.ws.ping}ms`);
}

export { ping as data, run }