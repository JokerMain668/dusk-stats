import { ActionRowBuilder, EmbedBuilder } from "discord.js";

type PlayerObject = {
    index: number;
    id: number;
    name: string;
    location: string;
}

type PlayerListEmbedType = {
    components: ActionRowBuilder[];
    embeds: EmbedBuilder[];
}


export type { PlayerObject, PlayerListEmbedType };