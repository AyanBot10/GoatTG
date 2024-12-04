module.exports = {
  config: {
    name: "goodbye",
    category: "Utils",
    author: "allou Mohamed",
    description: {
      en: "Handle member leaving or being kicked",
      ar: "التعامل مع مغادرة الأعضاء أو طردهم"
    }
  },
  onStart: async function({ event, message, threadsData }) {
    const data = await threadsData.get(event.threadID);
    let { members = [] } = data;

    if (event.left_chat_participant) {
      return async () => {
      const id = event.left_chat_participant.id;
      const name = event.left_chat_participant.first_name || "Bad Member";

      members = members.filter(u => u.id !== id);
      data.members = members;
      await threadsData.set(event.threadID, data);

      const threadName = event.threadName || "this group";
      message.send(`🥲 Goodbye ${name}, we will miss you in ${threadName}.`);
      }
    }
  }
};