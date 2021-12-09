chrome.omnibox.setDefaultSuggestion({
  description: "输入Issue: 、PR: 、Code: 、New PR、New Issue",
});
// chrome.omnibox.DescriptionStyleType();
// chrome.omnibox.setDefaultSuggestion({
//   description: "默认提示",
// });
const enterpressPath = "oschina";
let featKeyword = [
  { content: "Issue: ", description: "搜索 Issue" },
  { content: "PR: ", description: "搜索 PR" },
  { content: "Code: ", description: "搜索 代码" },
  { content: "New PR", description: "新建 PR" },
  { content: "New Issue", description: "新建 Issue" },
];
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log("inputChanged: " + text);
  if (!text) return;
  let textLower = text.toLocaleLowerCase();
  let arrSuggest = featKeyword;
  if (textLower === "issue") {
  } else if (textLower === "pr" || textLower === "pull request") {
  } else {
  }
  suggest(arrSuggest);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  console.log("inputEntered: " + text);
  text = text ? text.trim() : "";
  if (!text) return;
  let url = "";

  if (/^Issue:/i.test(text)) {
    url = `https://gitee.com/${enterpressPath}/gitee/issues?issue_search=${text.replace(/^Issue:/i, "")}`;
    // url = `https://e.gitee.com/${enterpressPath}/search?q=${text.replace("Issue: ", "")}&type=issue`;
  } else if (/^PR:/i.test(text)) {
    url = `https://e.gitee.com/${enterpressPath}/code/pulls?pr[search]=${text.replace(/^PR:/i, "")}&page=1`;
  } else if (/^Code:/i.test(text)) {
    url = `https://e.gitee.com/${enterpressPath}/search?q=${text.replace(/^Code:/i, "")}&type=code`;
  } else if (/^New Issue/i.test(text)) {
    url = `https://e.gitee.com/${enterpressPath}/dashboard?issue=new`;
  } else if (/^New PR/i.test(text)) {
    url = `https://e.gitee.com/${enterpressPath}/code/pulls/new`;
  } else {
    url = `https://e.gitee.com/${enterpressPath}/search?q=${text.replace(/^Issue:/i, "")}&type=issue`;
  }
  switch (disposition) {
    case "currentTab":
      chrome.tabs.update({ url });
      break;
    case "newForegroundTab":
      chrome.tabs.create({ url });
      break;
    case "newBackgroundTab":
      chrome.tabs.create({ url, active: false });
      break;
  }
  // chrome.tabs.create({ url: url, active: true }, tab => {});
});
