const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;

module.exports = async function (usersData, threadsData, event) {
  const { threadID, senderID, threadName, senderName, isGroup, userName } = event;

  // ———————————— CHECK THREAD DATA ———————————— //
  if (threadID && isGroup) {
    try {
      if (global.temp.createThreadDataError.includes(threadID))
        return;

      const findInCreatingThreadData = creatingThreadData.find(t => t.threadID == threadID);
      if (!findInCreatingThreadData) {
        if (global.db.allThreadData.some(t => t.threadID == threadID))
          return;
        const adminIDs = await threadsData.getadminIDs(threadID);
        const threadData = await threadsData.create(threadID, {
          threadName,
          adminIDs,
          isGroup
        });
        log.info("DATABASE", `New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`);
      }
      else {
        await findInCreatingThreadData.promise;
      }
    }
    catch (err) {
      if (err.name != "DATA_ALREADY_EXISTS") {
        global.temp.createThreadDataError.push(threadID);
        log.err("DATABASE", getText("handlerCheckData", "cantCreateThread", threadID), err);
      }
    }
  }


  // ————————————— CHECK USER DATA ————————————— //
  if (senderID) {
    try {
      const findInCreatingUserData = creatingUserData.find(u => u.userID == senderID);
      if (!findInCreatingUserData) {
        if (db.allUserData.some(u => u.userID == senderID))
          return;

        const userData = await usersData.create(senderID, {
          name: senderName,
          vanity: userName
        });
        log.info("DATABASE", `New User: ${senderID} | ${userData.name} | ${config.database.type}`);
      }
      else {
        await findInCreatingUserData.promise;
      }
    }
    catch (err) {
      if (err.name != "DATA_ALREADY_EXISTS")
        log.err("DATABASE", getText("handlerCheckData", "cantCreateUser", senderID), err);
    }
  }
};