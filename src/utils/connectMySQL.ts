import 'dotenv/config';
import mysql, { Connection } from 'mysql2/promise';

const connectMySQL = async (): Promise<Connection | null> => {
    try {
        const con: Connection = await mysql.createConnection({
            host: process.env.HOST, 
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: 'dusk'
        });

        return con;
    } catch (error) {
        console.error("Error connecting to MySQL:", error);
        return null;
    }
}

export default connectMySQL;