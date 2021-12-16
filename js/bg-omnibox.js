// todo feat: 搜索合并issue、pr 、仓库名、代码， 直接在搜索框列表显示结果， 副标题小字显示类型
// todo bug: 建议按顺序插入, 显示列表却交叉显示了?
import { searchRepo, searchMember, searchPr, searchIssue, searchDoc } from "./tool/api";
import {
  reSearchIssue,
  reSearchPR,
  reSearchRepo,
  reSearchMember,
  reSearchCode,
  reNewIssue,
  reNewPR,
  reNewRepo,
  reSearchDoc,
} from "./tool/featKeyWord";
import { getStorage } from "./utils/storage";
(async function () {
  let storageEntInfo = (await getStorage("select-enterprises")) || {};
  let enterpressPath = storageEntInfo.path || "oschina";
  let inputTimer = null;
  let suggestList = [];
  chrome.omnibox.setDefaultSuggestion({
    description: `在 ${storageEntInfo.name || "oschina"} 中搜索Issue、PR、代码、仓库、里程碑、文档 或 成员`,
  });
  // 由于浏览器限制， 地址栏备选长度最多为8 - 10 ，edge://flags/#omnibox-ui-max-autocomplete-matches 修改最大 12
  let featKeyword = [
    // { content: "Issue: ", description: "搜索 Issue" },
    // { content: "PR: ", description: "搜索 PR" },
    // { content: "Code: ", description: "搜索 代码" },
    // { content: "New PR", description: "新建 PR" },
    // { content: "New Issue", description: "新建 Issue" },
  ];
  const createIssueList = ({ text, len, suggest }) => {
    searchIssue(text, len)
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
  };
  const createPRList = ({ text, len, suggest }) => {
    searchPr(text, len)
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
  };
  const createRepoList = ({ text, len, suggest }) => {
    searchRepo(text, len)
      .then(result => {
        let resList = result.data;
        let list = resList.map(item => {
          let namespace = item.namespace.path;
          let repoPath = item.path;
          let description = item.description ? item.description : "暂无简介";
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
  };
  const createMemberList = ({ text, len, suggest }) => {
    searchMember(text, len)
      .then(result => {
        let resList = result.data;
        let list = resList.map(item => {
          let remark = item.remark;
          let name = item.name;
          let userId = item.username;
          return {
            content: `https://e.gitee.com/${enterpressPath}/members/trend/${userId}`,
            description: `<dim>成员：</dim><match>${remark}</match>` + ` 【昵称: ${name}】`,
          };
        });
        suggestList.push(...list);
        suggest(suggestList);
      })
      .catch(err => {
        console.log(err);
      });
  };
  const createDocList = ({ text, len, suggest }) => {
    searchDoc(text, len)
      .then(result => {
        let resList = result.data;
        let list = resList.map(item => {
          let name = item.info_name || item.name;
          let content = item.content;
          let doc_id = item.doc_id;
          let info_id = item.info_id;
          let id = item.id;
          let update_time = item.last_updated_at;
          return {
            // doc_id  info_id  id
            // /docs/816085/file/1921347?sub_id=4975935
            content: `https://e.gitee.com/${enterpressPath}/docs/${doc_id}/file/${info_id}?sub_id=${id}`,
            description: `<dim>文档：</dim><match>${name}</match>` + ` 【更新时间: ${update_time}】`,
          };
        });
        console.log(list);
        suggestList.push(...list);
        suggest(suggestList);
      })
      .catch(err => {
        console.log(err);
      });
  };
  chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    clearTimeout(inputTimer);
    suggestList = [...featKeyword];
    inputTimer = setTimeout(() => {
      console.log("inputChanged: " + text);
      if (!text) return;
      text = text.toLocaleLowerCase().trim();
      if (/^https:/i.test(text)) return;
      // 不符合过滤关键词, 则为聚合搜索
      if (!featKeyword.some(item => item.content.trim() === text)) {
      }
      if (reSearchIssue.test(text)) {
        // issue
        suggestList = [];
        text = text.replace(reSearchIssue, "").trim();
        createIssueList({ text, len: 10, suggest });
      } else if (reSearchPR.test(text)) {
        // PR
        suggestList = [];
        text = text.replace(reSearchPR, "").trim();
        createPRList({ text, len: 10, suggest });
      } else if (reSearchCode.test(text)) {
        // code
        suggestList = [];
        text = text.replace(reSearchCode, "").trim();
        // createRepoList({ text, len: 10, suggest });
      } else if (reSearchRepo.test(text)) {
        // 仓库
        suggestList = [];
        text = text.replace(reSearchRepo, "").trim();
        createRepoList({ text, len: 2, suggest });
      } else if (reSearchMember.test(text)) {
        // 成员
        suggestList = [];
        text = text.replace(reSearchMember, "").trim();
        createMemberList({ text, len: 2, suggest });
      } else if (reSearchDoc.test(text)) {
        // 文档
        suggestList = [];
        text = text.replace(reSearchDoc, "").trim();
        createDocList({ text, len: 2, suggest });
      } else {
        // 聚合搜索
        createIssueList({ text, len: 3, suggest });
        createPRList({ text, len: 2, suggest });
        createRepoList({ text, len: 2, suggest });
        createMemberList({ text, len: 2, suggest });
      }
    }, 450);
  });

  chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    console.log("inputEntered: " + text);
    text = text ? text.trim() : "";
    if (!text) return;
    let url = "";
    if (reNewIssue.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/dashboard?issue=new`;
    } else if (reNewPR.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/code/pulls/new`;
    } else if (reNewRepo.test(text)) {
      url = `https://e.gitee.com/${enterpressPath}/repos/new`;
    } else if (/^https:/i.test(text)) {
      url = text.trim();
    } else {
      url = `https://e.gitee.com/${enterpressPath}/issues?list?is[search]=${text.replace(reSearchIssue, "").trim()}`;
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
