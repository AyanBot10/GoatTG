const RAW = "https://raw.githubusercontent.com/Varnosbit/MathQsJsonByAllou/main/questions.json";
const axios = require("axios");
const DEFAULT_LEVEL = "EASY";
const LEVELS = ["EASY", "MEDIUM", "HARD"];
const {BoldText} = helpers;

module.exports = {
    config: {
        name: "math",   
        aliases: ["mathr", "mathgen", "questiongen"],
        category: "Education",
        author: "Allou Mohamed",
        countDown: 5,
        description: {
            en: "Generates random math questions based on difficulty level.",
            ar: "لعبة رياضيات"
        },
        role: 0
    },
    QS: undefined,
    servedQuestions: {},
    gameListner: {},

    async getRandomExpression(level = DEFAULT_LEVEL, requestId = null) {
        try {
            const selectedLevel = LEVELS.includes(level.toUpperCase()) ? level.toUpperCase() : DEFAULT_LEVEL;

            if (!this.QS) {
                const { data } = await axios.get(RAW);
                if (data && Array.isArray(data) && data.length > 0) {
                    this.QS = data;
                } else {
                    this.QS = null;
                    return "No math questions available 🐔";
                }
            }

            if (!this.servedQuestions[requestId]) this.servedQuestions[requestId] = [];
            const filterQss = this.QS.filter(Qs => Qs.level === selectedLevel && !this.servedQuestions[requestId].includes(Qs.question));

            if (filterQss.length === 0) {
                return "No more questions available for this level.";
            }

            const randomIndex = Math.floor(Math.random() * filterQss.length);
            const QS = filterQss[randomIndex];

            this.servedQuestions[requestId].push(QS.question);

            return QS;
        } catch (error) {
            console.error("Error fetching or processing questions:", error);
            return "An error occurred while fetching questions.";
        }
    },

    onStart: async function({ usersData, event, message, threadsData, api, args, role }) {
        const id = event.senderID;
        const lastGame = await usersData.get(id, "data.mathr_date");
        const cooldownTime = 30 * 60 * 1000; 

        if ((Date.now() - lastGame) < cooldownTime && role < 2) {
            const remainingTime = cooldownTime - (Date.now() - lastGame);
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);

            return message.reply(`You can play again after ${minutes} ${BoldText("minute(s)")} and ${seconds} ${BoldText("second(s)")} because you can play only 1 game every 30 minutes.`);
        }

        let lvl = args[0] ? args[0].toUpperCase() : DEFAULT_LEVEL;

        if (!LEVELS.includes(lvl)) {
            lvl = DEFAULT_LEVEL;
        }

        await usersData.set(id, Date.now(), "data.mathr_date");
        const name = await usersData.getName(id);
        if (event.threadID != event.senderID) message.reply("Game started in private chat. Please come inbox to play.");

        this.gameListner[id] = {
            currentQs: await this.getRandomExpression(lvl, id),
            totalAnswers: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            startTime: Date.now(),
            level: lvl,
            timer: null
        };

        const questionText = `${BoldText("Math Rush")} : ${BoldText(lvl)}\nAnswer maximum questions in the next 60 ${BoldText("seconds")}\n\n- ${BoldText("Total")}: #${this.gameListner[id].totalAnswers}\n- ${BoldText("Question")}: ${this.gameListner[id].currentQs.question}`;
        api.sendMessage(event.senderID, questionText);

        this.gameListner[id].timer = setTimeout(async () => {
            const gameData = this.gameListner[id];
            const earnedMoney = gameData.correctAnswers * 50;
            if (earnedMoney > 0) {
                await usersData.addMoney(id, earnedMoney);
            }

            const summaryMessage = `${BoldText("time's up !")} 🎉\n\n${BoldText("- Correct answers:")} ${gameData.correctAnswers}\n${BoldText("- Wrong answers:")} ${gameData.wrongAnswers}\n${BoldText("- Total earned money:")} ${earnedMoney} ${BoldText("Da")}.`;
            delete this.gameListner[id];
            return api.sendMessage(event.senderID, summaryMessage);
        }, 60000);
    },

    onChat: async function({ event, message, usersData, api, args }) {
        const id = event.senderID;
        if (event.threadID !== event.senderID) return;
        if (!this.gameListner[id]) return;

        const gameData = this.gameListner[id];
        const { currentQs } = gameData;
        const answer = parseInt(args[0]) || NaN;
        if (isNaN(answer)) return;
        const correctAnswer = currentQs.answer;


        if (!this.gameListner[id]) return;

        if (answer === correctAnswer) {
            gameData.correctAnswers++;
            gameData.totalAnswers++;


            gameData.currentQs = await this.getRandomExpression(gameData.level, id);
            gameData.startTime = Date.now(); 

            api.sendMessage(event.senderID, `${BoldText("- Total:")} #${gameData.totalAnswers}\n${BoldText("- Question:")} ${gameData.currentQs.question}`);
        } else {
            gameData.wrongAnswers++;
            gameData.totalAnswers++;


            gameData.currentQs = await this.getRandomExpression(gameData.level, id);
            gameData.startTime = Date.now(); 

            api.sendMessage(event.senderID, `${BoldText("- Total:")} ${gameData.totalAnswers}\n${BoldText("- Question:")} ${gameData.currentQs.question}`);
        }
    }
};