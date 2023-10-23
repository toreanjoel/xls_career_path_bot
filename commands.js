import 'dotenv/config';
import { InstallGlobalCommands } from './app/discord.js';

// Command containing options
const XLS_INFO = {
  name: 'process_careers',
  description: 'Process a file',
  options: [
    {
      type: 11,
      name: 'object',
      description: 'Add a file to process',
      required: true,
    },
  ],
  type: 1,
};

const AI_QUERY = {
  name: 'ai_query',
  description: 'Ask AI for something specific. Ask Anything.',
  options: [
    {
      type: 3,
      name: 'query',
      description: 'Send a question here, note that with every new question, the answer wont have context of the last ',
      required: true,
    }
  ],
  type: 1,
};

const ALL_COMMANDS = [XLS_INFO, AI_QUERY];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);