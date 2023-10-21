import 'dotenv/config';
import { InstallGlobalCommands } from './discord.js';

// Command containing options
const XLS_INFO = {
  name: 'process',
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

const ALL_COMMANDS = [XLS_INFO];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);