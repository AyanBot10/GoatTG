const { graphQlQueryToJson } = require("graphql-query-to-json");
const { log, getText } = global.utils;
const { config } = global.GoatBot;
const databaseType = config.database.type;

// with add null if not found data
function fakeGraphql(query, data, obj = {}) {
	if (typeof query != "string" && typeof query != "object")
		throw new Error(`The "query" argument must be of type string or object, got ${typeof query}`);
	if (query == "{}" || !data)
		return data;
	if (typeof query == "string")
		query = graphQlQueryToJson(query).query;
	const keys = query ? Object.keys(query) : [];
	for (const key of keys) {
		if (typeof query[key] === 'object') {
			if (!Array.isArray(data[key]))
				obj[key] = data.hasOwnProperty(key) ? fakeGraphql(query[key], data[key] || {}, obj[key]) : null;
			else
				obj[key] = data.hasOwnProperty(key) ? data[key].map(item => fakeGraphql(query[key], item, {})) : null;
		}
		else
			obj[key] = data.hasOwnProperty(key) ? data[key] : null;
	}
	return obj;
	// i don't know why but it's working by Copilot suggestion :)
}

module.exports = async function (api) {
	var threadModel, userModel, globalModel, sequelize = null;
	log.info("DATABASE", "Loading database...");
	switch (databaseType) {
		case "mongodb": {
			try {
				var { threadModel, userModel, globalModel } = await require("../connectDB/connectMongoDB.js")(config.database.uriMongodb);
				log.info("MONGODB", getText("indexController", "connectMongoDBSuccess"));
			}
			catch (err) {
				log.err("MONGODB", getText("indexController", "connectMongoDBError"), err);
				process.exit();
			}
			break;
		}
		case "sqlite": {
			try {
				var { threadModel, userModel, globalModel, sequelize } = await require("../connectDB/connectSqlite.js")();
				log.info("SQLITE", getText("indexController", "connectMySQLSuccess"));
			}
			catch (err) {
				log.err("SQLITE", getText("indexController", "connectMySQLError"), err);
				process.exit();
			}
			break;
		}
		default:
			break;
	}

	const threadsData = await require("./threadsData.js")(databaseType, threadModel, api, fakeGraphql);
	const usersData = await require("./usersData.js")(databaseType, userModel, api, fakeGraphql);
	const globalData = await require("./globalData.js")(databaseType, globalModel, fakeGraphql);

	global.db = {
		...global.db,
		threadModel,
		userModel,
		globalModel,
		threadsData,
		usersData,
		globalData,
		sequelize
	};

	return {
		threadModel,
		userModel,
		globalModel,
		threadsData,
		usersData,
		globalData,
		sequelize,
		databaseType
	};
};