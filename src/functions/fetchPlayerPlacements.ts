import mysql from "../utils/connectMySQL";
import { RowDataPacket } from "mysql2";
import { PlayerObject } from "../type/PlayerObject";
import convertTo2DArray from "../utils/convertTo2DArray";

type fetchPlayerListType = {
    players: PlayerObject[][];
    length: number;
}

const fetchPlayerPlacements = async (query: string): Promise<fetchPlayerListType | null>  => {
    try {
        const conn = await mysql();
        if (!conn) throw new Error("Failed to connect to the database.");
        const [rows] = await conn.execute<RowDataPacket[]>(
            `SELECT f.ID, f.NAME, f.SPONSOR, f.TWITTER, f.LOCATION 
            FROM FETCH_PLAYERS_TEST f WHERE f.NAME LIKE '%${query}%'`
        );

        if (rows.length === 0) return null; // No players found

        const players: PlayerObject[] = rows.map((player, index) => {
            return {
                index: index + 1,
                id: player.ID,
                name: player.SPONSOR != null ? player.SPONSOR + ' | ' + player.NAME : player.NAME,
                location: player.LOCATION
            }
        });

        return {
            players: convertTo2DArray(players, 10),
            length: players.length
        };
    } catch (error) {
        console.error("Error fetching player placements:", error);
        return null;
    }
}

export default fetchPlayerPlacements;