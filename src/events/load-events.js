const { Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()


class EveEvents {

    static load(client) {
        this.eventList = new Collection();

        // Grab all the command folders from the commands directory you created earlier
        const eventsPath = path.join(__dirname);
        const eventFiles = fs.readdirSync(eventsPath);

        //Finds and loads command files
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            if (filePath === "load-events.js") continue;

            const event = require(filePath);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }

    }
}

module.exports = { EveEvents };