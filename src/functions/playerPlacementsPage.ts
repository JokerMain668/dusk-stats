import { RowDataPacket } from "mysql2";
import mysql from "../utils/connectMySQL"
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import config from '../../config.json';
import path from "path";

interface Location {
    [key: string]: string;
}

type playerPlacementsPageType = {
    embeds?: EmbedBuilder[];
    content?: string;
    files?: AttachmentBuilder[];
}

const emoji = config.emoji as Location;

const playerPlacementsPage = async (id: string): Promise<playerPlacementsPageType> => {
    try {
        const conn = await mysql();
        if (!conn) throw new Error("Failed to connect to the database.");
        const [mains] = await conn.execute<RowDataPacket[]>(
            `SELECT NAME, SPONSOR, TWITTER, LOCATION, CODE, MAIN, GAME FROM 
            ( SELECT f.NAME, f.SPONSOR, f.TWITTER, f.LOCATION, COUNT(b.GAME) AS COUNT,
            c.IMG AS CODE, c.NAME AS MAIN, c.GAME FROM PLACEMENT p INNER 
            JOIN BRACKET b ON b.ID = p.TOURNEY INNER JOIN MAINS m  ON 
            m.PLAYER_ID = p.PLAYER AND m.GAME = b.GAME INNER JOIN 
            CHARACTERS c ON m.CHARACTER = c.VALUE INNER JOIN FETCH_PLAYERS f
            ON f.ID = p.PLAYER WHERE p.PLAYER = ${id}
            GROUP BY b.GAME ORDER BY COUNT DESC ) c WHERE GAME = 'TK8'
            OR GAME = 'SF6'`
        );
        const [placements] = await conn.execute<RowDataPacket[]>(
            `SELECT TOURNEY, PLACEMENT, COUNT FROM FETCH_PLACEMENTS WHERE 
            PLAYER = ${id} AND (GAME = 'SF6' OR GAME = 'TK8') LIMIT 15`
        );
        const main = mains[0];
        if (placements && mains && main) {
            let mainString = '';
            mains.map((main, i) => {
                mainString += `${main.GAME} - ${main.MAIN}`;
                if (i < mains.length - 1) mainString += '\n';
            });

            let string = '';
            placements.map((placement, i) => {
                string += placement.TOURNEY + ' [' + placement.PLACEMENT + '/' + placement.COUNT + ']';
                if (i < placements.length - 1) string += '\n';
            });

            const attachment = main.CODE ? new AttachmentBuilder(
                path.join(__dirname, '../../imgs', main.CODE + '.png'), 
                { name: 'player_char.png' }) 
            : null;
            console.log(path.join(__dirname, '../../imgs', main.CODE + '.png'));
            const embed = new EmbedBuilder()
                .setTitle(main.SPONSOR == null ? main.NAME : `${main.SPONSOR} | ${main.NAME}`)
                .setDescription(`<:${main.LOCATION}:${emoji[main.LOCATION]}> ${main.LOCATION}`)
                .setThumbnail(main.CODE ? 'attachment://player_char.png' : '')
                .addFields({ name: 'Main Character', value: mainString })
                .addFields({ name: 'Placements', value: string });

            return {
                embeds: [embed],
                files: attachment ? [attachment] : []
            }
        }

        return { content: `No placements found for player` }
        
                    
    } catch (error) {
        console.error("Error fetching player placements:", error);
        return { content: `No placements found for player` }
    }
}

export default playerPlacementsPage;