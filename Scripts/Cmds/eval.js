const { removeHomeDir, log } = global.utils;
const fs = require("fs");

module.exports = {
  config: {
    name: "eval",
    version: "1.6",
    author: "Allou Mohamed",
    countDown: 5,
    role: 2,
    description: {
      vi: "Test code nhanh",
      en: "Test code quickly"
    },
    category: "owner",
    guide: {
      vi: "{pn} <đoạn code cần test>",
      en: "{pn} <code to test>"
    }
  },

  langs: {
    vi: {
      error: "❌ Đã có lỗi xảy ra:"
    },
    en: {
      error: "❌ An error occurred:"
    },
        ar: {
            error: "❌ حدث خطأ:"
        }
  },

  onStart: async function (run) {
      const { api, args, message, event, role, commandName, getLang, threadModel, userModel, globalModel, threadsData, usersData, globalData, prefix, envCommands,
      envEvents, envGlobal } = run;
    
      if (event.senderID != global.YukiBot.config.adminBot[0]) return message.reply('Error you cant use eval.');
    
    const code = fs.readFileSync(__dirname+"/zzz_eval.txt", "utf-8");
    
    function output(msg) {
      if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
      msg = msg.toString();
      else if (msg instanceof Map) {
        let text = `Map(${msg.size}) `;
        text += JSON.stringify(mapToObj(msg), null, 2);
        msg = text;
      }
      else if (typeof msg == "object")
        msg = JSON.stringify(msg, null, 2);
      else if (typeof msg == "undefined")
        msg = "undefined";

      message.reply(msg);
    }
    function out(msg) {
      output(msg);
    }
    function mapToObj(map) {
      const obj = {};
      map.forEach(function (v, k) {
        obj[k] = v;
      });
      return obj;
    }
    const cmd = `
    (async () => {
      try {
        ${args.join(" ").replace(/\*\*/g, '`') || code}
      }
      catch(err) {
        log.err("eval command", err);
        message.send(
          "${getLang("error")}\\n" +
          (err.stack ?
            removeHomeDir(err.stack) :
            removeHomeDir(JSON.stringify(err, null, 2) || "")
          )
        );
      }
    })()`;
    eval(cmd);
  }
};