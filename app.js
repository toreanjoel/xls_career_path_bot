import "dotenv/config";
import express from "express";
import fs from "fs";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { VerifyDiscordRequest, init as discord_init } from "./app/discord.js";
import { chatCompletion } from "./app/openai.js"; // this needs to change to a function to query
import { xlsFileBuffer, parseSheet } from "./app/xls.js";

// Init the discord bot
discord_init();

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Route entry point
app.post("/interactions", async function (req, res) {
  const { type, data, channel_id } = req.body;

  switch (type) {
    case InteractionType.APPLICATION_COMMAND:
      const { name } = data;
      // TODO: Cleanup
      if (name === "process") {
        // TODO: Consider limiting the file types
        if (data.resolved && data.resolved.attachments) {
          // We get the first sent attatchement below sent
          const attachmentId = Object.keys(data.resolved.attachments)[0];
          // This will be the path where discord saves the files uploaded
          const fileURL = data.resolved.attachments[attachmentId].url;

          try {
            // TODO: Cleaup to make the payload less tokens for to run through AI
            // This needs to be run through AI to get the new data
            // We can send all as one but later we might need to make separate calls and slow it down
            // sending all will make it easy to get duplicates and manage with no temprature
            console.log(parseSheet(fileURL));

            const channel = await client.channels.fetch(channel_id);

            // save a local copy
            fs.writeFileSync("./files/career_options.xls", xlsFileBuffer);

            channel.send({
              content: `Here's the generated spreadsheet:`,
              files: [
                {
                  attachment: xlsFileBuffer,
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
      break;
    case InteractionType.PING:
      // Pong back to caller
      res.send({
        type: InteractionResponseType.PONG,
        data: {
          content: `PONG`,
        },
      });
      break;

    default:
      // Dont support other types, just break
      break;
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
