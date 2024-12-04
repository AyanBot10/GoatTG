class EventListener {
    constructor() {
        this.listeners = new Map();
    }

    add(key, conditionFunc, resultFunc) {
        if (!key || !conditionFunc || !resultFunc) {
            throw new Error("missed important parameters");
        }

        if (typeof conditionFunc !== 'function' || typeof resultFunc !== 'function') {
            throw new Error("conditionFunc and resultFunc must be functions");
        }

        if (conditionFunc.constructor.name !== 'AsyncFunction') {
            conditionFunc = async (...args) => conditionFunc(...args);
        }

        if (resultFunc.constructor.name !== 'AsyncFunction') {
            resultFunc = async (...args) => resultFunc(...args);
        }

        this.listeners.set(key, { conditionFunc, resultFunc });
    }

    async triggerAll(params) {
        for (let [key, listener] of this.listeners) {
            const { conditionFunc, resultFunc } = listener;

            try {
                if (await conditionFunc(params)) {
                    await resultFunc(params);
                    this.listeners.delete(key);
                }
            } catch (error) {
                console.error(`Error in EventListener for key ${key}:`, error);
                this.listeners.delete(key);
            }
        }
    }
}

global.onListen = new EventListener();

const createFuncMessage = global.utils.messageFunc;
const register = require("./registerUs-Gc");

module.exports = (api, threadModel, userModel, globalModel, threadsData, usersData, globalData) => {
    const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, globalModel, threadsData, usersData, globalData);

    return async function (event) {
        console.log(event);
        if (
            global.YukiBot.config.antiInbox == true &&
            (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
            (event.senderID || event.userID || event.isGroup == false)
        )
            return;

        const message = createFuncMessage(api, event);

        await register(usersData, threadsData, event);
        const handlerChat = await handlerEvents(event, message);
        if (!handlerChat)
            return;

        const {
            onAnyEvent, onFirstChat, onStart, onChat,
            onReply, onEvent, handlerEvent, onCallbackQuery
        } = handlerChat;

        const Params = {
            api,
            threadModel,
            userModel,
            globalModel,
            usersData,
            threadsData,
            globalData,
            event,
            message
        };

        global.onListen.triggerAll(Params);
        onAnyEvent();
        switch (event.type) {
            case "message":
            case "message_reply":
                onFirstChat();
                onChat();
                onStart();
                onReply();
                break;
            case "callback_query":
                onCallbackQuery();
                break;
            case "event":
                handlerEvent();
                onEvent();
                break;
            default:
                break;
        }
    };
};