// todo feat: 搜索合并issue、pr 、仓库名、代码， 直接在搜索框列表显示结果， 副标题小字显示类型
// todo bug: 建议按顺序插入, 显示列表却交叉显示了?
import { searchRepo, searchMember, searchPr, searchIssue } from "./tool/api";
import { getStorage } from "./utils/storage";
(async function () {
  let storageEntInfo = await getStorage("select-enterprises");
  let enterpressPath = storageEntInfo.path || "oschina";
  let inputTimer = null;
  chrome.omnibox.setDefaultSuggestion({
    description: `在 ${storageEntInfo.name || "oschina"} 中搜索Issue、PR、代码、仓库、里程碑、文档 或 成员`,
  });
  // chrome.omnibox.DescriptionStyleType();
  // chrome.omnibox.setDefaultSuggestion({
  //   description: "默认提示",
  // });
  // 由于浏览器限制， 地址栏备选长度最多为8 - 10 ，edge://flags/#omnibox-ui-max-autocomplete-matches 修改最大 12
  let featKeyword = [
    // { content: "Issue: ", description: "搜索 Issue" },
    // { content: "PR: ", description: "搜索 PR" },
    // { content: "Code: ", description: "搜索 代码" },
    // { content: "New PR", description: "新建 PR" },
    // { content: "New Issue", description: "新建 Issue" },
  ];
  chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    clearTimeout(inputTimer);
    let suggestList = [...featKeyword];
    // let arrSuggest = featKeyword;
    // let searchResultIssueSuggestList = [];
    // let searchResultPRSuggestList = [];
    // let searchResultRepoSuggestList = [];
    inputTimer = setTimeout(() => {
      console.log("inputChanged: " + text);
      if (!text) return;
      text = text.toLocaleLowerCase().trim();
      if (/^https:/i.test(text)) return;
      // 不符合过滤关键词, 则为聚合搜索
      if (
        !featKeyword.some(item => {
          return item.content.trim() === text;
        })
      ) {
        searchIssue(text)
          .then(result => {
            let resList = result.data;
            let list = resList.map(item => {
              let assigneeName = item.assignee ? item.assignee.remark || item.assignee.name : "无负责人";
              return {
                content: `https://e.gitee.com/${enterpressPath}/issues/list?issue=${item.ident}`,
                description: `<dim>Issue：</dim><match>${item.title}</match>` + ` 【负责人: ${assigneeName}】`,
              };
            });
            suggestList.push(...list);
            suggest(suggestList);
          })
          .catch(err => {
            console.log(err);
          });

        searchPr(text)
          .then(result => {
            let resList = result.data;
            let list = resList.map(item => {
              let nameSpace = item.project.namespace.path;
              let repoPath = item.project.path;
              let PrId = item.iid;
              let author = item.author.remark || item.author.username;
              // https://e.gitee.com/${enterpressPath}/repos/${nameSpace}/${repoPath}/pulls/${PrId}
              let url = `https://e.gitee.com/${enterpressPath}/repos/${nameSpace}/${repoPath}/pulls/${PrId}`;
              return { content: url, description: `<dim>PR：</dim>${item.title} 【创建者：${author}】` };
            });
            suggestList.push(...list);
            suggest(suggestList);
          })
          .catch(err => {
            console.log(err);
          });

        // 仓库
        searchRepo(text)
          .then(result => {
            let resList = result.data;
            let list = resList.map(item => {
              let namespace = item.namespace.path;
              let repoPath = item.path;
              let description = item.description ? item.description : "暂无简介";
              // /oschina/repos/oschina/openharmony-2021
              return {
                content: `https://e.gitee.com/${enterpressPath}/repos/${namespace}/${repoPath}`,
                description: `<dim>仓库：</dim><match>${item.name}</match>` + ` 【简介: ${description}】`,
              };
            });
            suggestList.push(...list);
            suggest(suggestList);
          })
          .catch(err => {
            console.log(err);
          });
        // 成员
        searchMember(text)
          .then(result => {
            let resList = result.data;
            let list = resList.map(item => {
              let remark = item.remark;
              let name = item.name;
              let userId = item.username;
              // https://e.gitee.com/oschina/members/trend/kesin
              return {
                content: `https://e.gitee.com/oschina/members/trend/${userId}`,
                description: `<dim>成员：</dim><match>${remark}</match>` + ` 【昵称: ${name}】`,
              };
            });
            suggestList.push(...list);
            suggest(suggestList);
          })
          .catch(err => {
            console.log(err);
          });
      }
    }, 450);
  });

  chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    console.log("inputEntered: " + text);
    text = text ? text.trim() : "";
    if (!text) return;
    let url = "";

    if (/^Issue:/i.test(text)) {
      url = `https://gitee.com/${enterpressPath}/gitee/issues?issue_search=${text.replace(/^Issue:/i, "").trim()}`;
      // url = `https://e.gitee.com/${enterpressPath}/search?q=${text.replace("Issue: ", "")}&type=issue`;
    } else if (/^PR:/i.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/code/pulls?pr[search]=${text.replace(/^PR:/i, "").trim()}&page=1`;
    } else if (/^Code:/i.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/search?q=${text.replace(/^Code:/i, "").trim()}&type=code`;
    } else if (/^New Issue/i.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/dashboard?issue=new`;
    } else if (/^New PR/i.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/code/pulls/new`;
    } else {
      url = text.trim();
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
})();
