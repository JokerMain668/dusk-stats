import { SlashCommandProps } from "commandkit";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType, 
    EmbedBuilder,
    inlineCode,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import fetchPlayerPlacements from "../functions/fetchPlayerPlacements";
import { PlayerListEmbedType, PlayerObject } from "../type/PlayerObject";
import config from '../../config.json';
import playerPlacementsPage from "../functions/playerPlacementsPage";

interface Location {
    [key: string]: string;
}

const emoji = config.emoji as Location;

const players = new SlashCommandBuilder()
    .setName('players')
    .setDescription('Show recent placements of specified player')
    .addStringOption((option) => option
        .setName('player')
        .setDescription('The player to show placements for')
        .setRequired(true)
    )

async function run({ interaction }: SlashCommandProps) {
    const playerName = interaction.options.getString('player') as string;
    let page = 0;
    let selected = false;
    const fetchPlayerComp = await fetchPlayerPlacements(playerName);
    const playersArr = fetchPlayerComp ? fetchPlayerComp.players : null;
    const len = fetchPlayerComp ? fetchPlayerComp.length : 0;
    
    if (playersArr && playersArr[0].length > 1) {
        const playerListPage = playerList(interaction.user.id, playersArr[page], true, 
            playersArr.length <= 1, len);

        const reply = await interaction.reply({
            embeds: playerListPage.embeds,
            components: playerListPage.components as any,
        });
        
        // // POST PLAYERS COMMAND
        const buttonCollector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === interaction.user.id && (i.customId === 'previous' || i.customId === 'next'),
            time: 60000,
        });

        buttonCollector.on('collect', async (i) => {
            if (i.customId === 'previous') page--;
            if (i.customId === 'next') page++;

            const playerListPage = playerList(interaction.user.id, playersArr[page], page === 0, 
                page === playersArr.length, len);

            await interaction.editReply({
                embeds: playerListPage.embeds,
                components: playerListPage.components as any,
            });
            i.deferUpdate();
        });

        buttonCollector.on('end', async () => {
            if (!selected) await interaction.editReply({
                content: 'Selection expired, please re-run the command.',
                embeds: [],
                components: [],
            })
        });

        const playerCollector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === 'player-select',
            time: 60000,
        });

        playerCollector.on('collect', async (i) => {
            if (!i.values.length) return;

            selected = true;
            const player = await playerPlacementsPage(i.values[0]);

            await interaction.editReply({
                embeds: player.embeds,
                content: player.content,
                components: [],
                files: player.files
            });
            i.deferUpdate();
        });

        
    } else if (playersArr) {
        const player = await playerPlacementsPage(playersArr[0][0].id.toString());

            await interaction.reply({
                embeds: player.embeds,
                content: player.content,
                files: player.files,
            });
    } else {
        interaction.reply({ content: 'No placements found for this player.' });
    }
}

function playerList(id: string, players: PlayerObject[], leftBtnHide: boolean, rightBtnHide: boolean, len: number): PlayerListEmbedType {
    let string = '';
    players.map((player, i) => {
        string += `${inlineCode(player.index.toString())}. <:${player.location}` + 
            `:${emoji[player.location]}> ${inlineCode(player.location)} · ${player.name}`
        if (i < players.length - 1) string += '\n';
    });

    const selectMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
        .setCustomId('player-select')
        .setPlaceholder('Select a player...')
        .addOptions(
            players.map(player => {
                return {
                    label: player.name,
                    description: player.location,
                    value: player.id.toString(),
                    emoji: emoji[player.location],
                }
            })
        )
    );

    const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
            id: 1,
            custom_id: 'previous',
            emoji: '◀️',
            style: ButtonStyle.Secondary,
            disabled: leftBtnHide
        }),
        new ButtonBuilder({
            id: 2,
            custom_id: 'next',
            emoji: '▶️',
            style: ButtonStyle.Secondary,
            disabled: rightBtnHide
        })
    )

    const embed = new EmbedBuilder()
        .setTitle('Player Search Results')
        .setDescription(`<@${id}>, please select a character using the menu below.`)
        .addFields({ name: `Showing players ${players[0].index}-` + 
            `${players[players.length - 1].index} of ${len}`, value: string });
    
    return {
        components: [selectMenu, buttonRow],
        embeds: [embed],
    }
}

export { players as data, run };