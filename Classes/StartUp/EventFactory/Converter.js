module.exports = (event) => {
    let returnPromise = event;
    if (event?.text) {
        returnPromise.type = "message";
        returnPromise.body = event.text;
        delete returnPromise.text;
    }
    if (event?.chat?.id) {
        returnPromise.threadID = String(event.chat.id);
        delete returnPromise.chat.id;
    }
    if (event?.from?.id) {
        returnPromise.senderID = String(event.from.id);
        delete returnPromise.from.id;
    }
    if (event?.date) {
        returnPromise.timestamp = event.date;
        delete returnPromise.date;
    }
    if (event?.message_id) {
        returnPromise.messageID = String(event.message_id);
        delete returnPromise.message_id;
    }
    if (event?.from?.username) {
        returnPromise.userName = event.from.username;
        delete returnPromise.from.username;
    }
    if (event?.from?.first_name && event?.from?.last_name) {
        returnPromise.senderName = `${event.from.first_name} ${event.from.last_name}`;
        delete returnPromise.from.first_name;
        delete returnPromise.from.last_name;
    }
    if (event?.chat?.first_name && event?.chat?.last_name) {
        returnPromise.threadName = `${event.chat.first_name} ${event.chat.last_name}`;
        delete returnPromise.chat.first_name;
        delete returnPromise.chat.last_name;
    }
    if (event?.from?.language_code) {
        returnPromise.senderLang = event.from.language_code;
        delete returnPromise.from.language_code;
    }
    if (event?.chat?.title) {
        returnPromise.threadName = event.chat.title;
        delete returnPromise.chat.title;
    }
    if (event?.chat?.type) {
        returnPromise.isGroup = event.chat.type === 'private' ? false : true;
        delete returnPromise.chat.type;
    }
    if (event?.from?.is_bot == false) {
        returnPromise.isBot = false;
        delete returnPromise.from.is_bot;
    }
    if (event?.from?.is_bot == true) {
        returnPromise.isBot = true;
        delete returnPromise.from.is_bot;
    }
    if (event?.photo) {
        returnPromise.attachments = event.photo;
        delete returnPromise.photo;
    }
    if (returnPromise?.reply_to_message) {
        returnPromise.type = "message_reply";
        const messageReply = {};
        messageReply.messageID = String(event.reply_to_message.message_id);
        delete returnPromise.reply_to_message.message_id;
        messageReply.senderID = String(event.reply_to_message.from.id);
        delete returnPromise.reply_to_message.from.id;
        if (returnPromise?.reply_to_message?.text) {
            messageReply.body = event.reply_to_message.text;
            delete returnPromise.reply_to_message.text;
        }
        if (returnPromise?.reply_to_message?.photo) {
            messageReply.attachments = event.reply_to_message.photo;
            delete returnPromise.reply_to_message.photo;
        }
        returnPromise.messageReply = messageReply;
    }

    if (returnPromise?.entities) {
        let mentions = {};
        returnPromise.entities.forEach(entity => {
            if (entity.type === 'mention') {
                const xus = event.body.substring(entity.offset, entity.offset + entity.length);
                const id = utils.getMentionId(xus);
                mentions[id] = xus;
            }
        });
        returnPromise.mentions = mentions;
        returnPromise.entities = returnPromise.entities.filter(entity => entity.type !== 'mention');
    }
    if (returnPromise?.left_chat_participant || returnPromise?.left_chat_member || returnPromise?.new_chat_title || returnPromise?.new_chat_participant || returnPromise?.new_chat_member || returnPromise?.new_chat_photo) {
        returnPromise.type = "event";
    }
    if (returnPromise?.data) {
        returnPromise.type = "callback_query";
        returnPromise.threadID = String(event?.message?.chat?.id);
        delete returnPromise.message.chat.id;
        returnPromise.messageID = String(event?.message?.message_id);
        delete returnPromise.message.message_id;
        returnPromise.threadName = event?.message?.chat?.title;
        delete returnPromise.message.chat.title;
        returnPromise.isGroup = event?.message?.chat?.type !== "private" ? true : false;
        delete returnPromise.message.chat.title;
    }
    const createFilteredEvent = (returnPromise) => {
        return Object.fromEntries(
            Object.entries(returnPromise).filter(([_, value]) =>
                value !== undefined && !(typeof value === 'object' && Object.keys(value).length === 0)
            )
        );
    };

    const filteredEvent = createFilteredEvent(returnPromise);
    if (!filteredEvent.mentions) filteredEvent.mentions = {};
    return filteredEvent;
};