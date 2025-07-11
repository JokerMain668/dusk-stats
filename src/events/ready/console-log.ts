import { Client } from "discord.js";

function consoleLog (client: Client<true>) {
    console.log(`${client.user.username} is ready!`);
}

export default consoleLog;