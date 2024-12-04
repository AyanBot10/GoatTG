const path = require('path');
const { log, colors } = utils;
module.exports = async function (bot, c) {
  console.log(colors.hex("#f5ab00")(c("DATABASE")));
  const controller = await require(path.join(__dirname, '..', '..', '..', 'Database/controller/index.js'))(bot);
  const { threadModel, userModel, globalModel, threadsData, usersData, globalData, sequelize } = controller;
  log.info("DATABASE", "Loaded Controller Elements.");
  const allGCdata = await threadsData.getAll();
  const allGCs = allGCdata.filter(gc => gc.isGroup != false);
  const allUss = await usersData.getAll();
  const txt = `Total Users: ${allUss.length}, Groups: ${allGCs.length}`
  log.info("Database", txt);
  return {
    threadModel,
    userModel,
    globalModel,
    threadsData,
    usersData,
    globalData,
    sequelize
  };
};