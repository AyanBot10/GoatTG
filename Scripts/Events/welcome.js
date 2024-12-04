module.exports = {
  config: {
    name: "welcome",
    category: "Utils",
    author: "allou Mohamed",
    description: {
      en: "welcome new members",
      ar: "ترحيب بالأعضاء الجدد"
    }
  },
  onStart: async function({ event, message, threadsData }) {
    const data = await threadsData.get(event.threadID);
    let { members } = data;

    if (event.new_chat_participant) {
    return async () => {
      const id = event.new_chat_participant.id;
      const firstName = event.new_chat_participant.first_name || "New";
      const lastName = event.new_chat_participant.last_name || "Member";
      const name = `${firstName} ${lastName}`;

      const isMemberExisting = members.some(u => u.id == id);

      if (!isMemberExisting) {
        members.push({ id, name, count: 0 });
        data.members = members;
        await threadsData.set(event.threadID, data);
      }

      const threadName = event.threadName || "this group";
      message.send(`Hi 🤩 ${name}, welcome to ${threadName},🔮 You are the member number ${members.length} in this group according to my data. Please respect your friends and chat members.`);
      }
    }
  }
};