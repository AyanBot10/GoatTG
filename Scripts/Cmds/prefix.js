const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    aliases: ["رمز"],
    version: "1.4",
    author: "allou Mohamed",
    countDown: 5,
    role: 0,
    description: "تعديل رمز البوت في المجموعات.",
    category: "config",
    guide: {
      vi: "   {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn"
        + "\n   Ví dụ:"
        + "\n    {pn} #"
        + "\n\n   {pn} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)"
        + "\n   Ví dụ:"
        + "\n    {pn} # -g"
        + "\n\n   {pn} reset: thay đổi prefix trong box chat của bạn về mặc định",
      en: "   {pn} <new prefix>: change new prefix in your box chat"
        + "\n   Example:"
        + "\n    {pn} #"
        + "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
        + "\n   Example:"
        + "\n    {pn} # -g"
        + "\n\n   {pn} reset: change prefix in your box chat to default",
        ar: "   {pn} <new prefix>: change new prefix in your box chat"
        + "\n   Example:"
        + "\n    {pn} #"
        + "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
        + "\n   Example:"
        + "\n    {pn} # -g"
        + "\n\n   {pn} reset: change prefix in your box chat to default"
    }
  },

  langs: {
    vi: {
      reset: "Đã reset prefix của bạn về mặc định: %1",
      onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
      confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
      confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
      successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
      successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
      myPrefix: "🌐 Prefix của hệ thống: %1\n🛸 Prefix của nhóm bạn: %2"
    },
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change prefix of system bot",
      confirmGlobal: "Please react to this message to confirm change prefix of system bot",
      confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
      successGlobal: "Changed prefix of system bot to: %1",
      successThisThread: "Changed prefix in your box chat to: %1",
      myPrefix: "🌐 System prefix: %1\n🛸 Your box chat prefix: %2"
    },
    ar: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change prefix of system bot",
      confirmGlobal: "Please react to this message to confirm change prefix of system bot",
      confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
      successGlobal: "Changed prefix of system bot to: %1",
      successThisThread: "Changed prefix in your box chat to: %1",
      myPrefix: "🌐 System prefix: %1\n🛸 Your box chat prefix: %2"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang, api }) {
    if (!args[0])
      return message.SyntaxError();

    if (args[0] == 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅', callback_data: 'confirm' },
                    { text: '❎', callback_data: 'cancel' },
                ],
            ],
        },
    };
    
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g")
      if (role < 2)
        return message.reply(getLang("onlyAdmin"));
      else
        formSet.setGlobal = true;
    else
      formSet.setGlobal = false;

    return api.sendMessage(event.threadID, args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), options) 
      .then(info => {
      formSet.messageID = String(info.message_id);
      global.YukiBot.onCallbackQuery.set(String(info.message_id), formSet);
    });
  },

  onCallbackQuery: async function ({ message, threadsData, event, Query, getLang }) {
    const { author, newPrefix, setGlobal } = Query;
    if (event.data == "cancel") {
      global.YukiBot.onCallbackQuery.delete(Query.messageID);
      message.unsend(Query.messageID);
      message.reply("❎ Cancelled the task.");
      return;
    }
    if (event.senderID !== author)
      return;
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }
    else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === ("prefix" ?? "الرمز")) return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)));
  }
};