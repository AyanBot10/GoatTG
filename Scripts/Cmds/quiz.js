module.exports = {
  config: {
    name: "quiz",
    aliases: ["حزورة"],
    version: "1.6",
    author: "Allou Mohamed",
    countDown: 5,
    role: 0,
    description: {
      ar: "حزورات و اذا ربحت تربح رصيد قليل.",
      en: "Arabic hard quizzes"
    },
    category: "owner",
    guide: {
      ar: "{pn}",
      en: "{pn}"
    }
  },
  onStart: async function ({ message, event, usersData }) {
      const A = helpers.Quiz();
      const quiz = A.quiz;
      const answer = A.answer.trim();
      const aReg = new RegExp(answer);
      global.onListen.add(event.senderID, async ({ event }) => aReg.test(event.body), async ({ message, usersData, event }) => {
          const currentBal = await usersData.getMoney(event.senderID);
          const neBal = currentBal + 10;
          const txt = `😁 ${helpers.BoldText(event.senderName)}:\n✅ جوابك صحيح: ${answer}\n💸 ربحت 10 دنانير تافهة و رصيدك زاد شوي صار ${neBal} دينار.`;
          message.reply(txt);
          await usersData.addMoney(event.senderID, 10);
      });
      message.reply(quiz);
     }
};