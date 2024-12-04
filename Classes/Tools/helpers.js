const Canvas = require('canvas');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const fs = require("fs");
const path = require("path");
const { URL } = require('url');
const quizs = require('./QuizGen.js');
const cheerio = require('cheerio');

function Quiz() {
    const i = Math.floor(Math.random() * quizs.length);
    const quiz = quizs[i][1][0][0];
    const answer = quizs[i][0][0];
    const help = quizs[i][1][1][0];

    return { quiz: quiz, answer: answer, help: help };
}

async function YukiBB(source) {
  let buffer;
  try {
    new URL(source);
    const response = await axios.get(source, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data, 'binary');
  } catch (error) {
    buffer = await fs.promises.readFile(source);
  }
  const form = new FormData();
  form.append('gallery', '');
  form.append('optsize', '0');
  form.append('expire', '0');
  form.append('numfiles', '1');
  form.append('upload_session', Date.now() + '.' + Math.random());
  form.append('file', buffer, { filename: 'image.jpg' });

  try {
    const response = await axios.post('https://postimages.org/json/rr', form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'DNT': '1',
        'Sec-Ch-Ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://postimages.org/'
      }
    });

    const html = (await axios.get(response.data.url)).data;

    const $ = cheerio.load(html);
    const metaTag = $('meta[property="og:image"]').attr('content');

    if (metaTag) {
      response.data.stream = metaTag;
    } else {
      console.error("Could not find meta tag");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

 function formatTimestamp(timestamp, timeZone) {
   let time;
   if (timeZone) {
     time = timeZone;
   } else {
     time = 'Africa/Algiers';
   }
  const options = {
    timeZone: time,
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  };

  const formattedDate = new Date(timestamp).toLocaleString('en-US', options);
  return formattedDate;
}

function BoldText(text) {
    const replacements = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
        'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽',
        'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅',
        'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛',
        'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣',
        'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫',
        'Y': '𝗬', 'Z': '𝗭',
        'À': '𝗔', 'Á': '𝗔', 'Ä': '𝗔', 'Æ': '𝗔', 'Å': '𝗔',
        'á': '𝗮'
    };

    const regex = new RegExp(Object.keys(replacements).join('|'), 'g');

    return text.replace(regex, match => replacements[match]);
}
function getUserOrder(userID, userDataArray) {
  const sortedData = userDataArray.sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const userIndex = sortedData.findIndex(user => user.userID === userID);
  if (userIndex !== -1) {

    return userIndex + 1;
  } else {
    return -1; 
  }
}

function outOrder(userID, us) {
  const userOrder = global.yuki.getUserOrder(userID, us);
  if (userOrder !== -1) {
    return userOrder;
  } else {
    return `• ${userID} not found.`;
  }
}

function getGUID() {
  var sectionLength = Date.now();
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
    return _guid;
  });
  return id;
}

function generateRandomText() {
  const randomWords = ["أنا بخير طالما الأشياء الصغيرة تبهجني ☁💙\nⁱ'ᵐ ᶠⁱⁿᵉ ᵃˢ ˡᵒⁿᵍ ᵃˢ ˡⁱᵗᵗˡᵉ ᵗʰⁱⁿᵍˢ ᵐᵃᵏᵉ ᵐᵉ ʰᵃᵖᵖʸ ☁💙", "غباء منك أن تكون حزينا، بسبب شخص يعيش حياته بكل سعادة 🖤📜\n𝐈𝐭'𝐬 𝐬𝐭𝐮𝐩𝐢𝐝 𝐨𝐟 𝐲𝐨𝐮 𝐭𝐨 𝐛𝐞 𝐬𝐚𝐝, 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐨𝐟 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐰𝐡𝐨 𝐥𝐢𝐯𝐞𝐬 𝐡𝐢𝐬 𝐥𝐢𝐟𝐞 𝐡𝐚𝐩𝐩𝐢𝐥𝐲 🖤📜", "لا أريد أن أشهد غيابك، أريد أن أغيب معه 🙂❤\n𝐈 𝐃𝐎𝐍'𝐓 𝐖𝐀𝐍𝐓 𝐓𝐎 𝐖𝐈𝐓𝐍𝐄𝐒𝐒 𝐘𝐎𝐔𝐑 𝐀𝐁𝐒𝐄𝐍𝐂𝐄, 𝐈 𝐖𝐀𝐍𝐓 𝐓𝐎 𝐁𝐄 𝐀𝐁𝐒𝐄𝐍𝐓 𝐖𝐈𝐓𝐇 𝐈𝐓 🙂❤", "في وقت الشدة فقط، تعرف من هم أحبابك ومن هم حثالة اختيارك 😑💙\n𝖮𝗇𝗅𝗒 𝗂𝗇 𝗍𝗂𝗆𝖾𝗌 𝗈𝖿 𝗍𝗋𝗈𝗎𝖻𝗅𝖾, 𝗒𝗈𝗎 𝗄𝗇𝗈𝗐 𝗐𝗁𝗈 𝗒𝗈𝗎𝗋 𝗅𝗈𝗏𝖾𝖽 𝗈𝗇𝖾𝗌 𝖺𝗋𝖾 𝖺𝗇𝖽 𝗐𝗁𝗈 𝖺𝗋𝖾 𝗍𝗁𝖾 𝗌𝖼𝗎𝗆 𝗈𝖿 𝗒𝗈𝗎𝗋 𝖼𝗁𝗈𝗂𝖼𝖾 😑💙", "الأفضل أن تعرف المخرج قبل أن تغامر 👻⛈️\nℬℯ𝓉𝓉ℯ𝓇 𝓉ℴ 𝓀𝓃ℴ𝓌 𝓉𝒽ℯ ℯ𝓍𝒾𝓉 𝒷ℯ𝒻ℴ𝓇ℯ 𝓎ℴ𝓊 𝓋ℯ𝓃𝓉𝓊𝓇ℯ 👻⛈️", "دائما تأكد بأنه في ذات الوقت الذي يراك أحدهم هامشا، هناك آخر يراك أمنيته 😐❤️‍🩹\nᵃˡʷᵃʸˢ ᵐᵃᵏᵉ ˢᵘʳᵉ ᵗʰᵃᵗ ᵃᵗ ᵗʰᵉ ˢᵃᵐᵉ ᵗⁱᵐᵉ ˢᵒᵐᵉᵒⁿᵉ ˢᵉᵉˢ ʸᵒᵘ ᵃˢ ᵃ ˢⁱᵈᵉˡⁱⁿᵉ, ᵗʰᵉʳᵉ ⁱˢ ᵃⁿᵒᵗʰᵉʳ ʷʰᵒ ˢᵉᵉˢ ʸᵒᵘ ᵃˢ ʰⁱˢ ʷⁱˢʰ 😐❤️‍🩹", "الغريب في عقلك أنه لا يعمل سوى ليؤنب قلبك على أخطائه 😹🤞🏻\n𝑻𝒉𝒆 𝒔𝒕𝒓𝒂𝒏𝒈𝒆 𝒕𝒉𝒊𝒏𝒈 𝒊𝒏 𝒚𝒐𝒖𝒓 𝒎𝒊𝒏𝒅 𝒊𝒔 𝒕𝒉𝒂𝒕 𝒊𝒕 𝒐𝒏𝒍𝒚 𝒘𝒐𝒓𝒌𝒔 𝒕𝒐 𝒔𝒄𝒐𝒍𝒅 𝒚𝒐𝒖𝒓 𝒉𝒆𝒂𝒓𝒕 𝒇𝒐𝒓 𝒊𝒕𝒔 𝒎𝒊𝒔𝒕𝒂𝒌𝒆𝒔 😹🤞🏻", "Løü Fï هو صانع البوت 😊\nيا أخي أرجوك لا تكثر 👀❤️\nplease don't spam my bot 🙂❤️", "جرب أن تكون ملتزما أحيانا 👨🏻‍🚀🌵\n𝗧𝗥𝗬 𝗧𝗢 𝗕𝗘 𝗢𝗕𝗦𝗘𝗥𝗩𝗔𝗡𝗧 𝗦𝗢𝗠𝗘𝗧𝗜𝗠𝗘𝗦 👨🏻‍🚀🌵", "وفي صباح الجمعة، اللهم بشرنا بما تتمناه قلوبنا 🥺🤲🏻\n𝘼𝙣𝙙 𝙤𝙣 𝙁𝙧𝙞𝙙𝙖𝙮 𝙢𝙤𝙧𝙣𝙞𝙣𝙜, 𝙢𝙖𝙮 𝘼𝙡𝙡𝙖𝙝 𝙜𝙞𝙫𝙚 𝙪𝙨 𝙜𝙤𝙤𝙙 𝙣𝙚𝙬𝙨 𝙤𝙛 𝙬𝙝𝙖𝙩 𝙤𝙪𝙧 𝙝𝙚𝙖𝙧𝙩𝙨 𝙙𝙚𝙨𝙞𝙧𝙚 🥺🤲🏻", "لا تكن شخصا لطيفا، فهذا العالم وقح جدا 📜💫\nᴅᴏɴ'ᴛ ʙᴇ ᴀ ɴɪᴄᴇ ᴘᴇʀsᴏɴ, ᴛʜɪs ᴡᴏʀʟᴅ ɪs ᴠᴇʀʏ ʀᴜᴅᴇ 📜💫", "حتى لو كان وباؤهم ينتشر، فهو لن يشملك لأنك أقوى 🦾💉\nᵉᵛᵉⁿ ⁱᶠ ᵗʰᵉⁱʳ ᵉᵖⁱᵈᵉᵐⁱᶜ ˢᵖʳᵉᵃᵈˢ, ⁱᵗ ʷⁱˡˡ ⁿᵒᵗ ⁱⁿᶜˡᵘᵈᵉ ʸᵒᵘ ᵇᵉᶜᵃᵘˢᵉ ʸᵒᵘ ᵃʳᵉ ˢᵗʳᵒⁿᵍᵉʳ 🦾💉", "أنا لا أفكر بالمستقبل، لأنه يأتي بسرعة 🙃🥂\n𝐈 𝐝𝐨𝐧'𝐭 𝐭𝐡𝐢𝐧𝐤 𝐚𝐛𝐨𝐮𝐭 𝐟𝐮𝐭𝐮𝐫𝐞, 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐢𝐭 𝐜𝐨𝐦𝐞𝐬 𝐬𝐨 𝐟𝐚𝐬𝐭 🙃🥂", "قد لا أكون حبك الأول، ولكني أريد أن أكون الأخير 🥺🤍\n𝘔𝘢𝘺 𝘐'𝘮 𝘯𝘰𝘵 𝘺𝘰𝘶𝘳 𝘧𝘪𝘳𝘴𝘵 𝘭𝘰𝘷𝘦, 𝘣𝘶𝘵 𝘐 𝘸𝘢𝘯𝘵 𝘵𝘰 𝘣𝘦 𝘵𝘩𝘦 𝘭𝘢𝘴𝘵 🥺🤍", "سأحبك حتى عندما تكره نفسك 🌝🤎\n𝗜 𝘄𝗶𝗹𝗹 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂 𝗲𝘃𝗲𝗻 𝘄𝗵𝗲𝗻 𝘆𝗼𝘂 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳 🌝🤎", "اشتقنا لأناس كانوا سعادتنا... كانوا حياتنا... كانوا كل شيء 💛🤧\nᴡᴇ ᴍɪssᴇᴅ ᴘᴇᴏᴘʟᴇs ᴡᴇʀᴇ ᴏᴜʀ ʜᴀᴘɪɴᴇss... ᴡᴇʀᴇ ᴏᴜʀ ʟɪғᴇ... ᴡᴇʀᴇ ᴇᴠᴇʀʏᴛʜɪɴɢ 💛🤧", "ما أخفته القلوب أظهرته المواقف 🌝🪞\n𝔚𝔥𝔞𝔱 𝔦𝔰 𝔥𝔦𝔡𝔡𝔢𝔫 𝔦𝔫 𝔥𝔢𝔞𝔯𝔱𝔰 𝔰𝔥𝔬𝔴𝔫 𝔦𝔫 𝔞𝔱𝔱𝔦𝔱𝔲𝔡𝔢𝔰 🌝🪞", "قد يمنحك القدر شخصاً يعيد لك إتزان قلبك 💚🌾\n𝖬𝖺𝗒 𝖽𝖾𝗌𝗍𝗂𝗇𝗒 𝗀𝗂𝗏𝖾𝗌 𝗒𝗈𝗎 𝗌𝗈𝗆𝖾𝗈𝗇𝖾 𝗐𝗁𝗈 𝗋𝖾𝗌𝗍𝗈𝗋𝖾𝗌 𝗍𝗁𝖾 𝖻𝖺𝗅𝖺𝗇𝖼𝖾 𝗈𝖿 𝗒𝗈𝗎𝗋 𝗁𝖾𝖺𝗋𝗍", "مرهق وكأني عشت ألف حزن، بألف شخص، بألف ألم 😓🖤☄️\nᴡᴇᴀʀʏ ᴀs ɪғ ɪ ʟɪᴠᴇᴅ ᴀ ᴛʜᴏᴜsᴀɴᴅ sᴏʀʀᴏᴡs, ᴀ ᴛʜᴏᴜsᴀɴᴅ ᴘᴇᴏᴘʟᴇ, ᴀ ᴛʜᴏᴜsᴀɴᴅ ᴘᴀɪɴ 😓🖤☄️", "اللهم خيرا، في كل اختيار 🤲🏻💙🎐\n𝙾𝙷 𝙶𝙾𝙳, 𝙶𝙾𝙾𝙳 𝙸𝙽 𝙴𝚅𝙴𝚁𝚈 𝙲𝙷𝙾𝙸𝙲𝙴 🤲🏻💙🎐", "صلي على ❤️ رسول الله 🤍 صلى الله عليه و على آله وسلم ❤️", "ولو تخلى عنك الكون كله، فأنا موجود 😌💛\n𝑨𝒏𝒅 𝒊𝒇 𝒕𝒉𝒆 𝒘𝒉𝒐𝒍𝒆 𝒖𝒏𝒊𝒗𝒆𝒓𝒔𝒆 𝒂𝒃𝒂𝒏𝒅𝒐𝒏𝒆𝒅 𝒚𝒐𝒖, 𝑰 𝒆𝒙𝒊𝒔𝒕 😌💛", "الجبناء لا يخوضون المعارك أصلا 🤧🎐\n𝘊𝘰𝘸𝘢𝘳𝘥𝘴 𝘥𝘰𝘯'𝘵 𝘦𝘷𝘦𝘯 𝘧𝘪𝘨𝘩𝘵 𝘣𝘢𝘵𝘵𝘭𝘦𝘴 🤧🎐"];

  return randomWords[Math.floor(Math.random() * randomWords.length)];
}

async function post(api, text, message, imageLinks = []) {
  if (!text) return message.reply('Provide the text.');

  const post = {
    input: {
      composer_entry_point: "inline_composer",
      composer_source_surface: "timeline",
      source: "WWW",
      attachments: [],
      audience: {
        privacy: {
          allow: [],
          base_state: "EVERYONE",
          deny: [],
          tag_expansion_state: "UNSPECIFIED"
        }
      },
      message: {
        ranges: [],
        text: text
      },
      with_tags_ids: [],
      inline_activities: [],
      explicit_place_id: "0",
      text_format_preset_id: "0",
      logging: {
        composer_session_id: getGUID()
      },
      tracking: [null],
      actor_id: api.getCurrentUserID(),
      client_mutation_id: Math.floor(Math.random() * 17)
    },
    displayCommentsFeedbackContext: null,
    displayCommentsContextEnableComment: null,
    displayCommentsContextIsAdPreview: null,
    displayCommentsContextIsAggregatedShare: null,
    displayCommentsContextIsStorySet: null,
    feedLocation: "TIMELINE",
    feedbackSource: 0,
    focusCommentID: null,
    gridMediaWidth: 230,
    groupID: null,
    scale: 3,
    privacySelectorRenderLocation: "COMET_STREAM",
    renderLocation: "timeline",
    useDefaultActor: false,
    inviteShortLinkKey: null,
    isFeed: false,
    isFundraiser: false,
    isFunFactPost: false,
    isGroup: false,
    isTimeline: true,
    isSocialLearning: false,
    isPageNewsFeed: false,
    isProfileReviews: false,
    isWorkSharedDraft: false,
    UFI2CommentsProvider_commentsKey: "ProfileCometTimelineRoute",
    hashtag: null,
    canUserManageOffers: false
  };

  async function downloadAndUploadImages(imageLinks) {
    let uploadedImages = [];

    for (let link of imageLinks) {
      try {
        const response = await axios({
          url: link,
          responseType: 'stream',
        });

        const filePath = path.join(__dirname, 'image_temp.jpg');
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const form = {
          file: fs.createReadStream(filePath),
        };

        const uploadResponse = await api.httpPostFormData(
          `https://www.facebook.com/profile/picture/upload/?profile_id=${api.getCurrentUserID()}&photo_source=57&av=${api.getCurrentUserID()}`,
          form
        );

        uploadedImages.push(JSON.parse(uploadResponse.replace('for (;;);', '')).payload.fbid.toString());

        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error downloading or uploading image from ${link}:`, error);
      }
    }

    return uploadedImages;
  }

  if (imageLinks.length > 0) {
    const imageFbIds = await downloadAndUploadImages(imageLinks);

    imageFbIds.forEach(fbId => {
      post.input.attachments.push({
        photo: {
          id: fbId,
        },
      });
    });
  }

  api.httpPost(
    "https://www.facebook.com/api/graphql/",
    {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "7711610262190099",
      variables: JSON.stringify(post),
    },
    (error, info) => {
      if (error) {
        console.error(error);
        return;
      }

      try {
        info = JSON.parse(info.replace("for (;;);", ""));
        const postID = info.data.story_create.story.legacy_story_hideable_id;
        const urlPost = info.data.story_create.story.url;

        return message.reply(`✅ Post ID: ${postID}\n🔗 Post Link: ${urlPost}`);
      } catch (error) {
        console.error(error);
      }
    }
  );
}

function Li(text) {
    const maxLength = 28+6+1;
    const lineLength = maxLength + 4;
    const paddingLength = Math.floor((lineLength - text.length) / 2);
    const padding = "─".repeat(paddingLength - 1); 
    const colorCode = "\x1b[93m"; 
    const resetCode = "\x1b[0m"; 

    if (text.length >= maxLength) {
        return text.substring(0, maxLength); 
    } else {
        const result = " " + padding + " " + text + " " + padding + " ";
        let coloredResult = colorCode + result + resetCode;
        return coloredResult.length <= lineLength ? coloredResult : coloredResult.substring(0, lineLength); 
    }
}

const flags = {
    "ad": "أندورا",
    "ae": "الإمارات العربية المتحدة",
    "af": "أفغانستان",
    "ag": "أنتيغوا وبربودا",
    "ai": "أنغويلا",
    "al": "ألبانيا",
    "am": "أرمينيا",
    "ao": "أنغولا",
    "aq": "القطب الجنوبي",
    "ar": "الأرجنتين",
    "as": "ساموا الأمريكية",
    "at": "النمسا",
    "au": "أستراليا",
    "aw": "أروبا",
    "ax": "جزر آلاند",
    "az": "أذربيجان",
    "ba": "البوسنة والهرسك",
    "bb": "باربادوس",
    "bd": "بنغلاديش",
    "be": "بلجيكا",
    "bf": "بوركينا فاسو",
    "bg": "بلغاريا",
    "bh": "البحرين",
    "bi": "بوروندي",
    "bj": "بنين",
    "bl": "سان بارتيلمي",
    "bm": "برمودا",
    "bn": "بروناي",
    "bo": "بوليفيا",
    "bq": "هولندا الكاريبية",
    "br": "البرازيل",
    "bs": "البهاما",
    "bt": "بوتان",
    "bv": "جزيرة بوفيه",
    "bw": "بوتسوانا",
    "by": "بيلاروسيا",
    "bz": "بليز",
    "ca": "كندا",
    "cc": "جزر كوكوس (كيلينغ)",
    "cd": "جمهورية الكونغو الديمقراطية",
    "cf": "جمهورية أفريقيا الوسطى",
    "cg": "جمهورية الكونغو",
    "ch": "سويسرا",
    "ci": "ساحل العاج",
    "ck": "جزر كوك",
    "cl": "تشيلي",
    "cm": "الكاميرون",
    "cn": "الصين",
    "co": "كولومبيا",
    "cr": "كوستاريكا",
    "cu": "كوبا",
    "cv": "الرأس الأخضر",
    "cw": "كوراساو",
    "cx": "جزيرة الكريسماس",
    "cy": "قبرص",
    "cz": "تشيكيا",
    "de": "ألمانيا",
    "dj": "جيبوتي",
    "dk": "الدنمارك",
    "dm": "دومينيكا",
    "do": "جمهورية الدومينيكان",
    "dz": "الجزائر",
    "ec": "الإكوادور",
    "ee": "إستونيا",
    "eg": "مصر",
    "eh": "الصحراء الغربية",
    "er": "إريتريا",
    "es": "إسبانيا",
    "et": "إثيوبيا",
    "eu": "الاتحاد الأوروبي",
    "fi": "فنلندا",
    "fj": "فيجي",
    "fk": "جزر فوكلاند",
    "fm": "ميكرونيزيا",
    "fo": "جزر فارو",
    "fr": "فرنسا",
    "ga": "الجابون",
    "gb": "المملكة المتحدة",
    "gb-eng": "إنجلترا",
    "gb-nir": "إيرلندا الشمالية",
    "gb-sct": "اسكتلندا",
    "gb-wls": "ويلز",
    "gd": "غرينادا",
    "ge": "جورجيا",
    "gf": "غويانا الفرنسية",
    "gg": "غيرنزي",
    "gh": "غانا",
    "gi": "جبل طارق",
    "gl": "غرينلاند",
    "gm": "غامبيا",
    "gn": "غينيا",
    "gp": "جوادلوب",
    "gq": "غينيا الاستوائية",
    "gr": "اليونان",
    "gs": "جورجيا الجنوبية",
    "gt": "غواتيمالا",
    "gu": "غوام",
    "gw": "غينيا بيساو",
    "gy": "غيانا",
    "hk": "هونغ كونغ",
    "hm": "جزيرة هيرد وجزر ماكدونالد",
    "hn": "هندوراس",
    "hr": "كرواتيا",
    "ht": "هايتي",
    "hu": "هنغاريا",
    "id": "إندونيسيا",
    "ie": "أيرلندا",
    "im": "جزيرة مان",
    "in": "الهند",
    "io": "إقليم المحيط الهندي البريطاني",
    "iq": "العراق",
    "ir": "إيران",
    "is": "آيسلندا",
    "it": "إيطاليا",
    "je": "جيرسي",
    "jm": "جامايكا",
    "jo": "الأردن",
    "jp": "اليابان",
    "ke": "كينيا",
    "kg": "قيرغيزستان",
    "kh": "كمبوديا",
    "ki": "كيريباتي",
    "km": "جزر القمر",
    "kn": "سانت كيتس ونيفيس",
    "kp": "كوريا الشمالية",
    "kr": "كوريا الجنوبية",
    "kw": "الكويت",
    "ky": "جزر كايمان",
    "kz": "كازاخستان",
    "la": "لاوس",
    "lb": "لبنان",
    "lc": "سانت لوسيا",
    "li": "ليختنشتاين",
    "lk": "سريلانكا",
    "lr": "ليبيريا",
    "ls": "ليسوتو",
    "lt": "ليتوانيا",
    "lu": "لوكسمبورغ",
    "lv": "لاتفيا",
    "ly": "ليبيا",
    "ma": "المغرب",
    "mc": "موناكو",
    "md": "مولدوفا",
    "me": "الجبل الأسود",
    "mf": "سانت مارتن",
    "mg": "مدغشقر",
    "mh": "جزر مارشال",
    "mk": "مقدونيا الشمالية",
    "ml": "مالي",
    "mm": "ميانمار",
    "mn": "منغوليا",
    "mo": "ماكاو",
    "mp": "جزر ماريانا الشمالية",
    "mq": "مارتينيك",
    "mr": "موريتانيا",
    "ms": "مونتسرات",
    "mt": "مالطا",
    "mu": "موريشيوس",
    "mv": "المالديف",
    "mw": "ملاوي",
    "mx": "المكسيك",
    "my": "ماليزيا",
    "mz": "موزمبيق",
    "na": "ناميبيا",
    "nc": "كاليدونيا الجديدة",
    "ne": "النيجر",
    "nf": "جزيرة نورفوك",
    "ng": "نيجيريا",
    "ni": "نيكاراغوا",
    "nl": "هولندا",
    "no": "النرويج",
    "np": "نيبال",
    "nr": "ناورو",
    "nu": "نيوي",
    "nz": "نيوزيلندا",
    "om": "عمان",
    "pa": "بنما",
    "pe": "بيرو",
    "pf": "بولينيزيا الفرنسية",
    "pg": "بابوا غينيا الجديدة",
    "ph": "الفيلبين",
    "pk": "باكستان",
    "pl": "بولندا",
    "pm": "سان بيير وميكولون",
    "pn": "جزر بيتكيرن",
    "pr": "بورتوريكو",
    "ps": "فلسطين",
    "pt": "البرتغال",
    "pw": "بالاو",
    "py": "باراغواي",
    "qa": "قطر",
    "re": "ريونيون",
    "ro": "رومانيا",
    "rs": "صربيا",
    "ru": "روسيا",
    "rw": "رواندا",
    "sa": "المملكة العربية السعودية",
    "sb": "جزر سليمان",
    "sc": "سيشل",
    "sd": "السودان",
    "se": "السويد",
    "sg": "سنغافورة",
    "sh": "سانت هيلينا وأسينشين وتريستان دا كونا",
    "si": "سلوفينيا",
    "sj": "سفالبارد ويان ماين",
    "sk": "سلوفاكيا",
    "sl": "سيراليون",
    "sm": "سان مارينو",
    "sn": "السنغال",
    "so": "الصومال",
    "sr": "سورينام",
    "ss": "جنوب السودان",
    "st": "ساو تومي وبرينسيبي",
    "sv": "السلفادور",
    "sx": "سانت مارتن",
    "sy": "سوريا",
    "sz": "إسواتيني (سوازيلاند)",
    "tc": "جزر تركس وكايكوس",
    "td": "تشاد",
    "tf": "الأقاليم الفرنسية الجنوبية والأنتارتيكية",
    "tg": "توغو",
    "th": "تايلاند",
    "tj": "طاجيكستان",
    "tk": "توكيلاو",
    "tl": "تيمور الشرقية",
    "tm": "تركمانستان",
    "tn": "تونس",
    "to": "تونغا",
    "tr": "تركيا",
    "tt": "ترينيداد وتوباغو",
    "tv": "توفالو",
    "tw": "تايوان",
    "tz": "تنزانيا",
    "ua": "أوكرانيا",
    "ug": "أوغندا",
    "um": "جزر الولايات المتحدة البعيدة الصغيرة",
    "un": "الأمم المتحدة",
    "us": "الولايات المتحدة",
    "us-ak": "ألاسكا",
    "us-al": "ألاباما",
    "us-ar": "أركنساس",
    "us-az": "أريزونا",
    "us-ca": "كاليفورنيا",
    "us-co": "كولورادو",
    "us-ct": "كونيتيكت",
    "us-de": "ديلاوير",
    "us-fl": "فلوريدا",
    "us-ga": "جورجيا",
    "us-hi": "هاواي",
    "us-ia": "آيوا",
    "us-id": "أيداهو",
    "us-il": "إلينوي",
    "us-in": "إنديانا",
    "us-ks": "كانساس",
    "us-ky": "كنتاكي",
    "us-la": "لويزيانا",
    "us-ma": "ماساتشوستس",
    "us-md": "ماريلاند",
    "us-me": "ماين",
    "us-mi": "ميشيغان",
    "us-mn": "مينيسوتا",
    "us-mo": "ميزوري",
    "us-ms": "ميسيسيبي",
    "us-mt": "مونتانا",
    "us-nc": "كارولينا الشمالية",
    "us-nd": "داكوتا الشمالية",
    "us-ne": "نبراسكا",
    "us-nh": "نيو هامبشير",
    "us-nj": "نيو جيرسي",
    "us-nm": "نيو مكسيكو",
    "us-nv": "نيفادا",
    "us-ny": "نيويورك",
    "us-oh": "أوهايو",
    "us-ok": "أوكلاهوما",
    "us-or": "أوريغون",
    "us-pa": "بنسلفانيا",
    "us-ri": "رود آيلاند",
    "us-sc": "كارولينا الجنوبية",
    "us-sd": "داكوتا الجنوبية",
    "us-tn": "تينيسي",
    "us-tx": "تكساس",
    "us-ut": "يوتا",
    "us-va": "فيرجينيا",
    "us-vt": "فيرمونت",
    "us-wa": "واشنطن",
    "us-wi": "ويسكونسن",
    "us-wv": "فرجينيا الغربية",
    "us-wy": "وايومنغ",
    "uy": "أوروغواي",
    "uz": "أوزبكستان",
    "va": "الفاتيكان (الكرسي الرسولي)",
    "vc": "سانت فنسنت والغرينادين",
    "ve": "فنزويلا",
    "vg": "جزر العذراء البريطانية",
    "vi": "جزر العذراء الأمريكية",
    "vn": "فيتنام",
    "vu": "فانواتو",
    "wf": "واليس وفوتونا",
    "ws": "ساموا",
    "xk": "كوسوفو",
    "ye": "اليمن",
    "yt": "مايوت",
    "za": "جنوب أفريقيا",
    "zm": "زامبيا",
    "zw": "زيمبابوي"
};

async function getFlag(n) {
  const name = await utils.translateAPI(n, "ar");
  for (const [code, countryName] of Object.entries(flags)) {
    if (countryName === name) {
      return `https://flagcdn.com/h240/${code}.png`;
    }
  }
  return false;
}

const achievements = {};
const achs_b = {
    crown: "https://i.postimg.cc/vZshsZXj/Picsart-24-08-03-22-51-09-883.jpg",
    facebook: "https://i.postimg.cc/8PdjfpBL/Picsart-24-08-04-02-18-16-140.png",
    githubsheild: "https://i.postimg.cc/d1Qdn8zQ/2020-Arctic-Code-Vault-Badge.png",
    git_galaxy_brain: "https://i.postimg.cc/63Q2CBvy/Galaxy-Brain.png",
    git_blue_shark: "https://i.postimg.cc/263yVTsW/3351b4e170fc2e4e92d06fe4ec40df52.jpg",
    git_SponsorBadge: "https://i.postimg.cc/BvmtSRVs/Git-Hub-Sponsor-Badge.png",
    GitHub: "https://i.postimg.cc/SRS4tG4s/b51b78ecc9e5711274931774e433b5e6.jpg",
    GitHub_1: "https://i.postimg.cc/5Nt1BppK/acb3513e5a2664ba59bec11222863a40.jpg",
    GitHub_2: "https://i.postimg.cc/MZ5qfg0j/8925a64f6b430a0b1bb061dfbfa66bf4.jpg",
    GitHub_3D: "https://i.postimg.cc/DyYhBsMv/7e461a93bd0e3b6fde03ac5aeb20ad2e.jpg"
};

const badges = {
    blue_verfied: "https://i.postimg.cc/MZy1dJ6m/Blue-Badge.png",
    spider: "https://i.postimg.cc/kMRbgZy6/Picsart-24-08-07-01-34-03-536.jpg"
};

async function setP(usersData, id, x, z) {
    if (!z) {
        await usersData.deleteKey(id, "data.status." + x);
        return;
    }

    await usersData.set(id, x, "data.status." + z);
    return;
}

const newUtils = {
  Quiz,
  BoldText,
  outOrder,
  getUserOrder,
  getStampDate: formatTimestamp,
  generateRandomText,
  post,
  Li,
  getFlag,
  achievements,
  achs_b,
  badges,
  YukiBB,
  setP
};

module.exports = newUtils;