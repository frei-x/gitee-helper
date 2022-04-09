// 只要 permissions 中有相对应网址的权限, background.js中就可以直接跨域请求, 而不用在 content_scripts 中请求
// "<all_urls>": matches any URL that starts with a permitted scheme (http:, https:, file:, or ftp:).
// "*://*/*": Matches any URL that uses the https: or http: scheme.\
// 暗黑主题
// 桌面通知消息
// 判断工作时间、后台执行、执行频率、点击消息打开页面消息详情
// 用户点击桌面通知详情按钮后, 自动标记已读
// 通过注入的js 判断页面已登录, 发消息给background.js， 让其继续执行， 否则发现未登录则停止执行， 并且发出通知。

// chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
//   console.log("创建了");
//   console.log(tab);
//   var tabUrl = tab.url;
//   if (/^(https:\/\/gitee\.com)|(search.gitee.com)/.test(tabUrl)) {
//     chrome.tabs.insertCSS(tab.id, {
//       file: "css/dark.css",
//     });
//   }
// });
// webNavigation 权限已取消
// chrome.webNavigation.onBeforeNavigate.addListener(function (tab) {
//   console.log(tab);
//   var tabUrl = tab.url;
//   if (/^(https:\/\/gitee\.com)|(search.gitee.com)/.test(tabUrl)) {
//     chrome.tabs.insertCSS(tab.tabId, {
//       file: "css/dark.css",
//     });
//   }
// });

import "./bg-omnibox.js";
import { getStorage } from "./utils/storage";
import { markNotice, getNotices } from "./tool/api";
const sendNotification = function ({ message, url, updated_at, messageId }, btnText) {
  const opt = {
    type: "basic",
    iconUrl: "../img/favicon.ico",
    title: "Gitee 通知",
    message: message,
    priority: 2, // 优先级，从 -2 到 2，-2 优先级最低，2 最高，默认为零。
    eventTime: new Date(updated_at).getTime(),
    requireInteraction: false, // 保持桌面上可见, 除非用户关闭
    silent: true, // true则不发出声音
    buttons: [
      {
        title: btnText || "查看详情",
      },
    ],
  };
  // 创建通知, 并且把通知内容特殊信息存于 notificationId
  chrome.notifications.create(JSON.stringify({ updated_at, url, messageId }), opt, e => {
    // 加入消息列表后 5s 自动标记已读
    setTimeout(() => {
      messageId && markNotice(messageId);
    }, 5000);
  });
};
// 点击桌面消息 查看详情按钮
function handleClickSingleMessage (notificationId) {
  let oInfo = JSON.parse(notificationId);
  let url = oInfo.url || "/";
  let messageId = oInfo.messageId;
  chrome.tabs.create({ url: `https://gitee.com${url}`, active: true }, tab => { });
  // 并且标记已读
  messageId && markNotice(messageId);
}
// 点击到查看详情按钮
chrome.notifications.onButtonClicked.addListener(handleClickSingleMessage);
// 点击到消息
chrome.notifications.onClicked.addListener(handleClickSingleMessage);
// 点击到关闭按钮
chrome.notifications.onClosed.addListener((notificationId) => {
  console.error('点击了关闭按钮!');
  let oInfo = JSON.parse(notificationId);
  let messageId = oInfo.messageId;
  messageId && markNotice(messageId);
});
// 设置未读消息数量, 现在至扩展图标上
// 首次启动时清空数量, 防止残留
chrome.browserAction.setBadgeText({ text: "" });
const setUnreadLen = function (num) {
  if (typeof num === 'number') {
    if (num >= 1000) num = "1k+";
    chrome.browserAction.setBadgeText({ text: String(num) });
    chrome.browserAction.setBadgeBackgroundColor({ color: [18, 150, 219, 255] });
  } else {
    chrome.browserAction.setBadgeText({ text: num });
  }
};
const launcher = result => {
  let arr = result.list;
  console.log(result);
  if (!Array.isArray(arr) || arr.length === 0) return;
  console.log(arr);
  arr.forEach(item => {
    item.message = item.message ? item.message : item.content;
    sendNotification({ message: item.message, updated_at: item.updated_at, url: item.url, messageId: item.id });
  });
};

let noticesTimer = null;
const INTERVAL = 15000;
const getAllNotices = function () {
  Promise.all([getNotices("referer"), getNotices("messages"), getNotices("infos")])
    .then(values => {
      if (values[0].status >= 400) {
        sendNotification({ message: values[0].message, url: "/login" }, "去登录");
        // 暂时不取消轮询. todo: 如果取消轮询 需要判断用户已登录 ,再通知开启轮询
        // clearInterval(noticesTimer);
      } else {
        launcher(values[0]);
        launcher(values[1]);
        launcher(values[2]);
        let num = values.reduce((sum, value) => {
          return sum + (value.total_count || 0);
        }, 0); // initialValue 参数 如果没有提供初始值，则将使用数组中的第一个元素,在没有初始值的空数组上调用 reduce 将报错。
        // 提供了 initialValue 参数, sum 将不会是第一个元素, value变为从第一个元素开始遍历.
        setUnreadLen(num);
      }
    })
    .catch(err => {
      console.log(err);
    });
};
const startLoop = () => {
  clearInterval(noticesTimer);
  let hour = new Date().getHours();
  noticesTimer = setInterval(() => {
    if (hour >= 9 && hour < 19) {
      getAllNotices();
      console.count("累计运行次数");
    } else {
      // clearInterval(noticesTimer); // 不再清除定时器, 避免免打扰时期, 轮询停止, 数量存在残留
      setUnreadLen('😴');
    }
  }, INTERVAL);
};
startLoop();
getAllNotices();
// 支持下载单个文件
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "download") {
    chrome.downloads.download({ url: request.value }, e => {
      console.log("下载信息: ", e);
    });
    return;
  }
});

// onUpdated在页面初始化时不会执行(刷新页面), url改变才执行
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!changeInfo.url || changeInfo.url.indexOf("#") > -1) return;
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      type: "url-change",
    });
  }
});

// 首次安装
chrome.runtime.onInstalled.addListener(async () => {
  let storageEntInfo = await getStorage("select-enterprises");
  console.log(storageEntInfo);
  !storageEntInfo && chrome.tabs.create({ url: "html/options.html", active: false }, tab => { });
});
