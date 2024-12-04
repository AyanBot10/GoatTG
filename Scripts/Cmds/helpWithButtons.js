const cmds = global.YukiBot.commands;

module.exports = {
 config: {
  name: "commands",
  version: "1.2",
  author: "Allou Mohamed",
  countDown: 5,
  role: 0,
  description: {
   vi: "bot cmds",
   en: "bot cmds"
  },
  category: "info",
  guide: {
   en: "{pn}"
  }
 },

 onStart: async function ({ message, commandName }) {
  const opti = Array.from(cmds.keys()).map((key) => [
    { text: key, callback_data: key },
  ]);
  const option = {
    reply_markup: {
      inline_keyboard: opti,
    },
  };
   
        return message.reply("Yuki Commands", (info) => {
          global.YukiBot.onCallbackQuery.set(info.messageID, {
            commandName,
            messageID: info.messageID
          });
        }, option);
 },
  onCallbackQuery: async function ({ message, event }) {
    const cmdkey = event.data;
    if (!cmdkey) return;
    const cmd = cmds.get(cmdkey);
    let txt = "";
    if (cmd?.config?.name) txt += "Name: "+cmd.config.name+"\n";
    //add other properties. this just example for peoples who asking for help with buttons
    message.reply(txt);
  }
};