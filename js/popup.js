// let oDarkBtn = document.querySelector(".option_dark_theme_btn");
// oDarkBtn.addEventListener("click", () => {
//   var isEnable = oDarkBtn.dataset.enable == 1;
//   chrome.tabs.query({}, tabs => {
//     tabs.forEach(tab => {
//       /^(https:\/\/gitee\.com)|(search.gitee.com)/.test(tab.url) &&
//         chrome.tabs.sendMessage(tab.id, { enableDark: !isEnable });
//     });
//   });
//   if (isEnable) {
//     oDarkBtn.dataset.enable = 0;
//     oDarkBtn.innerText = "已禁用";
//   } else {
//     oDarkBtn.dataset.enable = 1;
//     oDarkBtn.innerText = "已启用";
//   }
//   chrome.storage.sync.set({ "gitee-helper-dark": !isEnable }, value => {});
// });
