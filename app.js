import "dotenv/config";
import express from "express";
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
app.use(express.static('public'))

// Route entry point
app.post("/interactions", async function (req, res) {
  const { type, data, channel_id } = req.body;

  switch (type) {
    case InteractionType.APPLICATION_COMMAND:
      const { name } = data;
      if (name === "process_careers") {
        if (data.resolved && data.resolved.attachments) {
          // Send an immediate response to the user
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `A message with a file will be attached once completed.`,
            },
          });

          // ref message to pass along with process async
          client.channels.fetch(channel_id).then(async channel => {
            const msgRef = await channel.send(`Processing: 0%`);

            // Continue processing in the background
            processInBackground(data, channel_id, msgRef).catch(error => {
              console.error("Error:", error);
              // Inform the user about the error
              client.channels.fetch(channel_id).then(channel => {
                channel.send(`Error processing the file: ${error.message}`);
              });
            });
          })
          return;
        }
      }
      break;

    case InteractionType.PING:
      // Pong back to caller
      res.send({
        type: InteractionResponseType.PONG,
        data: { content: `PONG` },
      });
      break;

    default:
      res.status(400).send("Unsupported interaction type.");
      break;
  }
});

async function processInBackground(data, channel_id, msgRef) {
  const attachmentId = Object.keys(data.resolved.attachments)[0];
  const fileURL = data.resolved.attachments[attachmentId].url;

  msgRef.edit("Processing: 10%")
  const readUploadedFile = await parseSheet(fileURL);
  console.log("readUploadedFile")
  console.log(readUploadedFile)
  if (readUploadedFile.length > 15) {
    throw new Error("The system allows only 15 rows max per upload to be processed")
  }
  
  msgRef.edit("Processing: 20%")
  const computePromptData = await computeCourses(readUploadedFile);

  msgRef.edit("Processing: 35%")

  msgRef.edit("Processing: 44%")
  const channel = await client.channels.fetch(channel_id);
  // const buffer = await createSheetDownloadable(JSON.parse(computePromptData.message.content));

  msgRef.edit("Processing: 75%")
  // if (!buffer) {
  //   msgRef.edit("Processing failed.")
  //   throw new Error("Unable to create the file to download.");
  // }

  msgRef.edit("Processing: 90%")
  // channel.send({
  //   content: `Here's the generated spreadsheet:`,
  //   files: [{ attachment: buffer, name: `career_options-${Date.now()}.xls` }],
  // });

  msgRef.edit("Processing Done. See code block below:")

  console.log(JSON.stringify(computePromptData.message.content, null, 2))
  const datas = JSON.parse(computePromptData.message.content)
  channel.send("```" + JSON.stringify(datas, null, 2) + "```");
}

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
