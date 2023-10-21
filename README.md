## XLS Career Discord Bot

Discord bot that takes a .xlsx file and processes job types using AI to give other job variations.
A new file is returned with job variations for a specific career to the discord channel.

## How to use:
- Get started with the discord bot creation: https://discord.com/developers/docs/getting-started
- Take the `example.env` then copy and rename it to `.env`
- Populate the missing fields for the ENV variables in the new `.env`
- `npm install`
- Start the server `npm run start`

## Note:
- Make sure the discord bot interactions endpoint url is setup to point to where the remote server to this running app
    - https://discord.com/developers/docs/getting-started#step-3-handling-interactivity


The last bits are installing the bot to the server then adding the bot with permissions to read and files then using the relevant setup slash commands ( in this case what ever the `name` of the commnads are in `commands.js`)