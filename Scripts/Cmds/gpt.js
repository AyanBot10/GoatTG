const ai = require('unlimited-ai');
const userHistories = {};

module.exports = {
    config: {
        name: "gpt",
        aliases: ["ai"],
        version: "1.4",
        author: "Allou Mohamed",
        countDown: 5,
        role: 0,
        description: "chat ais",
        category: "Education",
        guide: {
            ar: "{pn} كلام",
            en: "{pn} prompt"
        }
    },
    onStart: async function({
        message, event, args, commandName
    }) {
        const p = args.join(" ");
        if (!p) return message.reply("أهلا كيف أساعدك يا"+ event.senderName);
        response = await generateResponse(p, event.senderID);
        message.reply(response, (info) => {
            global.YukiBot.onReply.set(info.messageID, {
                commandName,
                author: event.senderID
            });
        });
    },
    onReply: async function({
        message, event, args, Reply, commandName
    }) {
        if (event.senderID != Reply.author) return;
        const p = args.join(" ");
        response = await generateResponse(p, event.senderID);
        message.reply(response, (info) => {
            global.YukiBot.onReply.set(info.messageID, {
                commandName,
                author: event.senderID
            });
        });
    },

};

async function generateResponse(prompt, userID) {
    const model = 'gpt-4-turbo-2024-04-09';
    if (!userHistories[userID]) {
        userHistories[userID] = [];
    }

    userHistories[userID].push({
        role: 'user', content: prompt
    });

    if (userHistories[userID].length > 4) {
        userHistories[userID].shift();
    }

    const systemMessage = {
        role: 'system',
        content: 'You are a helpful assistant.'
    };

    const messages = [systemMessage,
        ...userHistories[userID]];

    const aiResponse = await ai.generate(model, messages);

    userHistories[userID].push({
        role: 'assistant', content: aiResponse
    });

    if (userHistories[userID].length > 4) {
        userHistories[userID].shift();
    }
    return aiResponse;
}