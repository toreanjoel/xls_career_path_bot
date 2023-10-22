import "dotenv/config";
import express from "express";
import fs from "fs";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { Client, GatewayIntentBits } from "discord.js";
import { VerifyDiscordRequest } from "./app/discord.js";
import { computeCourses } from "./app/openai.js"; // this needs to change to a function to query
import { createSheetDownloadable, parseSheet } from "./app/xls.js";

// Init the discord bot
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.login(process.env.BOT_TOKEN);

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Route entry point
app.post("/interactions", async function (req, res) {
  const { type, data, channel_id, member } = req.body;
  switch (type) {
    case InteractionType.APPLICATION_COMMAND:
      const { name } = data;
      // TODO: Cleanup
      if (name === "process_careers") {
        if (data.resolved && data.resolved.attachments) {
          // We get the first sent attatchement below sent
          console.log("LOG: ==== START ====")
          console.log("LOG: Get uploaded file data")
          const attachmentId = Object.keys(data.resolved.attachments)[0];
          // This will be the path where discord saves the files uploaded
          const fileURL = data.resolved.attachments[attachmentId].url;

          // message to let user know
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Processing... A message with a file will be attatched once completed.`,
            },
          });

          // attempt to get and clean data
          console.log("LOG: Read uploaded file data from discord stored CDN")
          const readUploadedFile = await parseSheet(fileURL)
          console.log("LOG: Process the data using AI")
          const computePromptData = await computeCourses(readUploadedFile)

          if (!computePromptData) {
            // message to let user know
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: "File issues, unable to process the file, try again or contact Torean",
              },
            });
          }

          // Attempt the downloader
          try {
            console.log("LOG: Get Discord channel metadata")
            const channel = await client.channels.fetch(channel_id);

            // create the buffer for the spreadsheet
            console.log("LOG: Create a spreadsheet file with generated data")
            const buffer = createSheetDownloadable(JSON.parse(computePromptData.message.content))
            
            // If we cant get the buffer to make the file
            if (buffer) {
              // save a local copy
              console.log("LOG: Write generated file data to local fs")
              fs.writeFileSync("./files/career_options.xls", buffer);
              
              console.log("LOG: DONE")
              console.log("LOG: ==== END ====")
              return channel.send({
                content: `Here's the generated spreadsheet:`,
                files: [
                  {
                    attachment: buffer,
                    name: `career_options-${Date.now()}.xls`,
                  },
                ],
              });
            } else {
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: "Unable to create the file to download. Try again.",
                },
              });
            }
          } catch (error) {
            console.error("Error:", error);
            // message to let user know
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: "There was an error.",
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
