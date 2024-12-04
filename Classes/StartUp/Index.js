process.stdout.write("\x1b]2;Yuki Bot TL - Made by Allou Mohamed\x1b\x5c");
const login = require('node-telegram-bot-api');
const fs = require("fs-extra");
const gradient = require("gradient-string");
const Converter = require("./EventFactory/Converter.js");
const { log, colors } = global.utils;
const { dirAccount } = global.client;
const token = fs.readFileSync(dirAccount, 'utf8').trim();
const bot = new login(token, { polling: true });
const currentVersion = require(`${process.cwd()}/package.json`).version;

function centerText(text, length) {
	const width = process.stdout.columns;
	const leftPadding = Math.floor((width - (length || text.length)) / 2);
	const rightPadding = width - leftPadding - (length || text.length);
	// Build the padded string using the calculated padding values
	const paddedString = ' '.repeat(leftPadding > 0 ? leftPadding : 0) + text + ' '.repeat(rightPadding > 0 ? rightPadding : 0);
	// Print the padded string to the terminal
	console.log(paddedString);
}

// logo
const titles = [
	[
		"██╗░░░██╗██╗░░░██╗██╗░░██╗██╗ ██████╗░░█████╗░████████╗",
				"╚██╗░██╔╝██║░░░██║██║░██╔╝██║ ██╔══██╗██╔══██╗╚══██╔══╝",
				"░╚████╔╝░██║░░░██║█████═╝░██║ ██████╦╝██║░░██║░░░██║░░░",
				"░░╚██╔╝░░██║░░░██║██╔═██╗░██║ ██╔══██╗██║░░██║░░░██║░░░",
				"░░░██║░░░╚██████╔╝██║░╚██╗██║ ██████╦╝╚█████╔╝░░░██║░░░",
				"░░░╚═╝░░░░╚═════╝░╚═╝░░╚═╝╚═╝ ╚═════╝░░╚════╝░░░░╚═╝░░░"
	],
	[
		"█▄█ █░█ █▄▀ █ █▄▄ █▀█ ▀█▀",
		"░█░ █▄█ █░█ █ █▄█ █▄█ ░█░"
	],
	[
		"Y U K I  V 2 @" + currentVersion
	],
	[
		"YukiBot V2"
	]
];
const maxWidth = 40;
const title = maxWidth > 58 ?
	titles[0] :
	maxWidth > 36 ?
		titles[1] :
		maxWidth > 26 ?
			titles[2] :
			titles[3];

console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
console.log();
for (const text of title) {
	const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
	centerText(textColor, text.length);
}
let subTitle = `YukiBot V2@${currentVersion}- A simple Bot chat telegram`;
const subTitleArray = [];
if (subTitle.length > maxWidth) {
	while (subTitle.length > maxWidth) {
		let lastSpace = subTitle.slice(0, maxWidth).lastIndexOf(' ');
		lastSpace = lastSpace == -1 ? maxWidth : lastSpace;
		subTitleArray.push(subTitle.slice(0, lastSpace).trim());
		subTitle = subTitle.slice(lastSpace).trim();
	}
	subTitle ? subTitleArray.push(subTitle) : '';
}
else {
	subTitleArray.push(subTitle);
}
const author = ("Created by Allou Mohamed with ♡");
const srcUrl = ("Contact: https://facebook.com/proarcoder");
const fakeRelease = ("Source Code By Allou ProArCoder");
for (const t of subTitleArray) {
	const textColor2 = gradient("#9F98E8", "#AFF6CF")(t);
	centerText(textColor2, t.length);
}
centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);
centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
centerText(gradient("#f5af19", "#f12711")(fakeRelease), fakeRelease.length);

let widthConsole = process.stdout.columns;
if (widthConsole > 50 || widthConsole < 0)
	widthConsole = 50;

function createLine(content, isMaxWidth = false) {
	if (!content)
		return Array(isMaxWidth ? process.stdout.columns : widthConsole).fill("─").join("");
	else {
		content = ` ${content.trim()} `;
		const lengthContent = content.length;
		const lengthLine = isMaxWidth ? process.stdout.columns - lengthContent : widthConsole - lengthContent;
		let left = Math.floor(lengthLine / 2);
		if (left < 0 || isNaN(left))
			left = 0;
		const lineOne = Array(left).fill("─").join("");
		return lineOne + content + lineOne;
	}
}

async function StartBot() {
	console.log(colors.hex("#f5ab00")(createLine("INFORMATIONS")));
	log.info("NAME", global.YukiBot.config.nickNameBot);
	log.info("PREFIX", global.YukiBot.config.prefix);
	log.info("LANG", global.YukiBot.config.language.toUpperCase());
	const { threadModel, userModel, globalModel, threadsData, usersData, globalData } = await require(process.env.NODE_ENV === 'development' ? "./Loader/loadDataBase.dev.js" : "./Loader/loadDataBase.js")(bot, createLine);
	
await require(process.env.NODE_ENV === 'development' ? "./Loader/loadAllScripts.dev.js" : "./Loader/loadAllScripts.js")(bot, threadModel, userModel, globalModel, threadsData, usersData, globalData, createLine);
const handlerAction = require("./Listener/handlerAction.js")(bot, threadModel, userModel, globalModel, threadsData, usersData, globalData);
	// Handle incoming events
	/* @{ some available events }
			'message',
			'edited_message',
			'new_chat_members',
			'left_chat_member',
			'new_chat_title',
			'new_chat_photo',
			'delete_chat_photo',
			'chat_member',
			'my_chat_member'
			*/
	bot.on("message", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});
	
	bot.on("edited_message", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});

	/*bot.on("new_chat_members", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});*/
	//already handled 
	/*bot.on("left_chat_member", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});*/
	//already handled 
	/*bot.on("new_chat_title", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});*/ 
	//handled already 
	
	/*bot.on("new_chat_photo", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});*/
	
	/*bot.on("delete_chat_photo", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});*/
	
	bot.on("chat_member", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});
	
	bot.on("callback_query", async (s) => {
		const event = Converter(s);
		await handlerAction(event);
	});
	
bot.on("my_chat_member", async (s) => {
	const event = Converter(s);
	await handlerAction(event);
	});
	
	bot.on('polling_error', (error) => {
		console.log(error); 
	});
	console.log(colors.hex("#f5ab00")(createLine("OWNERS")));
	for (let i = 0; i < global.YukiBot.config.adminBot.length; i++) {
		const id = global.YukiBot.config.adminBot[i];
		const name = await usersData.getName(id);
		if (!name) continue;
		log.master("ADMINBOT", name+' | '+id);
	}
	console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
	log.info("The bot ran without any problems and is now receiving events.");
	console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
}

StartBot();