// // content_scripts中不可以跨域请求了, 即使拥有其他域名权限
// // 也可以通过 insertCSS 插入, 先遍历所有符合条件的 tab
// // chrome.tabs.insertCSS(
// //   tabId?: number,
// //   details: InjectDetails,
// //   callback?: function,
// // )

// const getStorage = key => {
//   return new Promise((resolve, reject) => {
//     chrome.storage.sync.get(key, value => {
//       resolve(value[key]);
//     });
//   });
// };

// function insertCSS () {
//   let darkCssUrl = chrome.extension.getURL("css/dark.css");
//   // chrome.tabs.insertCSS(null, { file: darkCssUrl });

//   let oLink = document.createElement("link");
//   oLink.className = "gitee-helper-dark";
//   oLink.href = darkCssUrl;
//   oLink.type = "text/css";
//   oLink.rel = "stylesheet";
//   document.documentElement.insertBefore(oLink);
// }
// insertCSS();
// function removeCss () {
//   let oLink = document.querySelector(".gitee-helper-dark");
//   oLink && document.removeChild(oLink);
// }
// (async function () {
//   let isEnableDark = await getStorage("gitee-helper-dark");
//   // 未设置 或 true
//   (isEnableDark === undefined || isEnableDark) && insertCSS();
// })();
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   // request 接收到的信息
//   // sender 接收源信息, 一般是tab信息。sender.tab.url sender.tab.title...
//   console.log(request);

//   if (request.enableDark) {
//     insertCSS();
//   } else {
//     // removeCss();
//   }
// });
