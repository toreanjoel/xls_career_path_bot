import "dotenv/config";
import express from "express";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { VerifyDiscordRequest } from "./utils.js";
import fetch from "node-fetch";
import xlsx from "xlsx";
import { Client, GatewayIntentBits } from "discord.js";
import fs from 'fs';


// Initialize the Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.login(process.env.BOT_TOKEN); // Make sure you have your bot token in the .env file

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Generate a new spreadsheet
// TODO: Make a function
const workbook = xlsx.utils.book_new();
const worksheetData = [
  { Name: "Hello", Age: 25 },
  { Name: "world", Age: 30 },
];
const worksheet = xlsx.utils.json_to_sheet(worksheetData);
xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

// TODO: use constants
const newFileBuffer = xlsx.write(workbook, {
  type: "buffer",
  bookType: "xlsx",
});

app.post("/interactions", async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    // TODO: Cleanup
    if (name === "process") {
      // TODO: Consider limiting the file types
      if (data.resolved && data.resolved.attachments) {
        const attachmentId = Object.keys(data.resolved.attachments)[0];
        const fileURL = data.resolved.attachments[attachmentId].url;

        try {
          // TODO: clean this up and move the processing of file data
          const response = await fetch(fileURL);
          const fileBuffer = await response.buffer();
          const workbook = xlsx.read(fileBuffer, { type: "buffer" });
          const parsedData = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]]
          );

          // TODO: Cleaup to make the payload less tokens for to run through AI
          // This needs to be run through AI to get the new data
          // We can send all as one but later we might need to make separate calls and slow it down
          // sending all will make it easy to get duplicates and manage with no temprature
          console.log(parsedData);

          const channelId = req.body.channel_id;
          const channel = await client.channels.fetch(channelId);

          // save a local copy
          // TODO: timestamp name generation
          fs.writeFileSync('career_options.xls', newFileBuffer);

          channel.send({
            content: `Here's the generated spreadsheet:`,
            files: [
              {
                attachment: newFileBuffer,
                // TODO: timestamp name generation
                // Potentially email this off to someone?
                name: "career_options.xls",
              },
            ],
          });

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Processed the data! Check the channel for the generated spreadsheet.`,
            },
          });
        } catch (error) {
          console.error("Error:", error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `There was an error processing the file.`,
            },
          });
        }
      }
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
