// 只要 permissions 中有相对应网址的权限, background.js中就可以直接跨域请求, 而不用在 content_scripts 中请求
// "<all_urls>": matches any URL that starts with a permitted scheme (http:, https:, file:, or ftp:).
// "*://*/*": Matches any URL that uses the https: or http: scheme.\
// 暗黑主题
// 桌面通知消息
// 判断工作时间、后台执行、执行频率、点击消息打开页面消息详情
// 用户点击桌面通知详情按钮后, 自动标记已读
// 通过注入的js 判断页面已登录, 发消息给background.js， 让其继续执行， 否则发现未登录则停止执行， 并且发出通知。
const sendNotification = function ({ message, url, updated_at, messageId }, btnText) {
  const opt = {
    type: "basic",
    iconUrl: "../img/favicon.ico",
    title: "Gitee Notices",
    message: message,
    priority: 2, // 优先级，从 -2 到 2，-2 优先级最低，2 最高，默认为零。
    eventTime: new Date(updated_at).getTime(),
    // requireInteraction: true, // 保持桌面上可见, 除非用户关闭
    silent: true, // true则不发出声音
    buttons: [
      {
        title: btnText || "查看详情",
      },
    ],
  };
  chrome.notifications.create(JSON.stringify({ message, updated_at, url, messageId }), opt, e => {
    console.log(e);
  });
};
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  let oInfo = JSON.parse(notificationId);
  let url = oInfo.url;
  let messageId = oInfo.messageId;
  chrome.tabs.create({ url: `https://gitee.com${url}`, active: true }, tab => {});
  messageId && markNotice(messageId);
});
const launcher = result => {
  let arr = result.list;
  console.log(result);
  if (!Array.isArray(arr)) return;
  console.log(arr);
  arr.forEach(item => {
    item.message = item.message ? item.message : item.content;
    sendNotification({ message: item.message, updated_at: item.updated_at, url: item.url, messageId: item.id });
  });
};

let noticesTimer = null;
const INTERVAL = 60000;
const getAllNotices = function () {
  Promise.all([getNotices("referer"), getNotices("messages"), getNotices("infos")])
    .then(values => {
      if (values[0].status >= 400) {
        sendNotification({ message: values[0].message, url: "https://gitee.com/login" }, "去登录");
        // 暂时不取消轮询. todo: 如果取消轮询 需要判断用户已登录 ,再通知开启轮询
        // clearInterval(noticesTimer);
      } else {
        launcher(values[0]);
        launcher(values[1]);
        launcher(values[2]);
      }
    })
    .catch(err => {
      console.log(err);
    });
};
const startLoop = () => {
  clearInterval(noticesTimer);
  noticesTimer = setInterval(() => {
    getAllNotices();
    console.count("累计运行次数");
  }, INTERVAL);
};
startLoop();
