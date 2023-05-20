import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

let db;

const connect = () => {
    // this is needed because in development we don't want to restart
    // the server with every change, but we want to make sure we don't
    // create a new connection to the DB with every change either.
    if (process.env.NODE_ENV !== 'production') {
        if (global.__db) {
            db = global.__db;
            return;
        }
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    db = drizzle(pool, { logger: true });
    global.__db = db;

    console.log('Connection has been established successfully.')
}

connect();

export {db};


