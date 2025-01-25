const { Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()


class Commands {
    constructor() {
        this.load();
    }

    load() {
        this.commandList = new Collection();

        // Grab all the command folders from the commands directory you created earlier
        const foldersPath = path.join(__dirname);
        const commandLocation = fs.readdirSync(foldersPath);

        //Finds and loads command files
        for (const object of commandLocation) {
            var f = fs.statSync(path.join(foldersPath, object));

            if (!f.isDirectory()) continue;

            const commandsPath = path.join(foldersPath, object);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    this.commandList.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }

    getCommandList() {
        return this.commandList;
    }
}

module.exports = Commands