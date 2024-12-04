//Yuki TG V1.0.0 By allou ✓
//anti shut down
process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));
process.emitWarning = (warning, type) => {
  if (type !== 'DeprecationWarning') {
    console.warn(warning);
  }
};
//By allou Mohamed I don't know if you will respect my credits or no but you know that this source not by you it's by me (: - respect -
const fs = require("fs-extra");
const { execSync } = require('child_process');
const log = require('./Classes/Console/log.js');
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

function validJSON(pathDir) {
  try {
    if (!fs.existsSync(pathDir))
      throw new Error(`File "${pathDir}" not found`);
    execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
    return true;
  }
  catch (err) {
    let msgError = err.message;
    msgError = msgError.split("\n").slice(1).join("\n");
    const indexPos = msgError.indexOf("    at");
    msgError = msgError.slice(0, indexPos != -1 ? indexPos - 1 : msgError.length);
    throw new Error(msgError);
  }
}

const { NODE_ENV } = process.env;
const dirConfig = path.normalize(`${__dirname}/config${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`);
const dirAccount = path.normalize(`${__dirname}/account${['production', 'development'].includes(NODE_ENV) ? '.dev.txt' : '.txt'}`);

for (const pathDir of [dirConfig, dirConfigCommands]) {
  try {
    validJSON(pathDir);
  }
  catch (err) {
    log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n${err.message.split("\n").map(line => `  ${line}`).join("\n")}\nPlease fix it and restart bot`);
    process.exit(0);
  }
}
const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

global.YukiBot = {
  startTime: Date.now() - process.uptime() * 1000, 
  commands: new Map(), 
  eventCommands: new Map(), 
  commandFilesPath: [], 
  eventCommandsFilesPath: [], 
  aliases: new Map(), 
  onAnyEvent: [],
  onFirstChat: [], 
  onChat: [], 
  onEvent: [], 
  onReply: new Map(), 
  onCallbackQuery: new Map(), 
  config, 
  configCommands, 
  envCommands: {}, 
  envEvents: {}, 
  envGlobal: {}, 
  storage5Message: [], 
  tgApi: null, 
  botID: null // store bot id
};

//added by allou to load the goat
global.GoatBot = global.YukiBot;

global.db = {
  // all data
  allThreadData: [],
  allUserData: [],
  allGlobalData: [],

  // model
  threadModel: null,
  userModel: null,
  globalModel: null,

  // handle data
  threadsData: null,
  usersData: null,
  globalData: null,

  receivedTheFirstMessage: {}

  // all will be set in bot/login/loadData.js
};

global.client = {
  dirConfig,
  dirConfigCommands,
  dirAccount,
  countDown: {},
  cache: {},
  database: {
    creatingThreadData: [],
    creatingUserData: [],
    creatingDashBoardData: [],
    creatingGlobalData: []
  },
  commandBanned: configCommands.commandBanned
};

const utils = require("./Utils.js");
const helpers = require("./Classes/Tools/helpers.js");
global.helpers = helpers;
global.utils = utils;

global.temp = {
  createThreadData: [],
  createUserData: [],
  createThreadDataError: [], 
  filesOfGoogleDrive: {
    arraybuffer: {},
    stream: {},
    fileNames: {}
  },
  contentScripts: {
    cmds: {},
    events: {}
  }
};


const watchAndReloadConfig = (dir, type, prop, logName) => {
  let lastModified = fs.statSync(dir).mtimeMs;
  let isFirstModified = true;

  fs.watch(dir, (eventType) => {
    if (eventType === type) {
      const oldConfig = global.YukiBot[prop];

      // wait 200ms to reload config
      setTimeout(() => {
        try {
          // if file change first time (when start bot, maybe you know it's called when start bot?) => not reload
          if (isFirstModified) {
            isFirstModified = false;
            return;
          }
          // if file not change => not reload
          if (lastModified === fs.statSync(dir).mtimeMs) {
            return;
          }
          global.YukiBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
          log.success(logName, `Reloaded ${dir.replace(process.cwd(), "")}`);
        }
        catch (err) {
          log.warn(logName, `Can't reload ${dir.replace(process.cwd(), "")}`);
          global.YukiBot[prop] = oldConfig;
        }
        finally {
          lastModified = fs.statSync(dir).mtimeMs;
        }
      }, 200);
    }
  });
};

watchAndReloadConfig(dirConfigCommands, 'change', 'configCommands', 'CONFIG COMMANDS');
watchAndReloadConfig(dirConfig, 'change', 'config', 'CONFIG');

global.YukiBot.envGlobal = global.YukiBot.configCommands.envGlobal;
global.YukiBot.envCommands = global.YukiBot.configCommands.envCommands;
global.YukiBot.envEvents = global.YukiBot.configCommands.envEvents;

// ———————————————— LOAD LANGUAGE ———————————————— //
const getText = global.utils.getText;

// ———————————————— AUTO RESTART ———————————————— //
if (config.autoRestart) {
  const time = config.autoRestart.time;
  if (!isNaN(time) && time > 0) {
    utils.log.info("AUTO RESTART", getText("Yuki", "autoRestart1", utils.convertTime(time, true)));
    setTimeout(() => {
      utils.log.info("AUTO RESTART", "Restarting...");
      process.exit(2);
    }, time);
  }
  else if (typeof time == "string" && time.match(/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/gmi)) {
    utils.log.info("AUTO RESTART", getText("Yuki", "autoRestart2", time));
    const cron = require("node-cron");
    cron.schedule(time, () => {
      utils.log.info("AUTO RESTART", "Restarting...");
      process.exit(2);
    });
  }
}

(async () => {
  // ———————————————————— Start ———————————————————— //
  require(`./Classes/StartUp/Index${NODE_ENV === 'development' ? '.dev.js' : '.js'}`);
})();