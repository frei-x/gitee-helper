import { insertFileIcon } from "./insert-file-icon.js";

// 部分dom为js插入, 延迟方便调整结构和样式
function createImgBtn ({ isBlobpage } = {}) {
  const downloadImgURL = chrome.extension.getURL("img/download.svg");
  let oImg = document.createElement("img");
  oImg.src = downloadImgURL;
  oImg.title = "下载此文件";
  oImg.className = "gitee-helper-download-img";
  isBlobpage && oImg.classList.add("blob-page");
  oImg.style.cssText = "vertical-align: text-top; margin-left: 8px; width: 20px; cursor: pointer;";
  if (isBlobpage) {
    let a = document.createElement("a");
    a.className = "ui button gitee-helper-download-img blob-page";
    a.style.lineHeight = "26px";
    a.style.padding = "0";
    a.style.marginRight = "8px";
    a.appendChild(oImg);
    return a;
  }
  return oImg;
}

function insertTreeDownbtn () {
  const isProjectPage = document.querySelector("#project-wrapper");
  if (!isProjectPage) return;
  const oTree = document.querySelector("#tree-slider");
  if (!oTree) return;
  const oTimeAgos = oTree.querySelectorAll(".tree-item[data-type=file] .tree_time_ago");

  for (let item of Array.from(oTimeAgos)) {
    item.insertAdjacentElement("beforeend", createImgBtn());
  }
}
function insertBlobPageDownBtn () {
  let header = document.querySelector(".blob-header-title");
  if (!header) return;
  let buttonWrapper = header.querySelector(".buttons");
  buttonWrapper.insertAdjacentElement("afterbegin", createImgBtn({ isBlobpage: true }));
}
function insertDownloadbtn () {
  insertBlobPageDownBtn();
  insertTreeDownbtn();
}

insertDownloadbtn();
insertFileIcon();
// 监听页面URL变化 (dom被刷掉, 但是页面未重载)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "url-change") {
    insertDownloadbtn();
    insertFileIcon();
  }
});
// dom 变化时 重新插入, 不存在才插入一次, 否则会导致无限递归
if (document.querySelector("#tree-holder")) {
  let observerTargetDom = new MutationObserver(() => {
    if (!document.querySelector(".gitee-helper-icon")) {
      insertFileIcon();
    }
    if (!document.querySelector(".gitee-helper-download-img")) {
      insertDownloadbtn();
    }
  });
  observerTargetDom.observe(document.querySelector("#tree-holder"), {
    childList: true,
    subtree: true,
  });
}

document.body.addEventListener(
  "click",
  function (e) {
    let downloadUrl = "";
    if (e.target.className === "gitee-helper-download-img") {
      let treeItem = e.target.closest(".tree-item");
      let branchName = treeItem.dataset.branch;
      let [projectPath, baranchFilePath] = treeItem.querySelector("[data-path] a").href.split("blob");
      downloadUrl = `${projectPath}raw${baranchFilePath}`;
      console.log("当前下载文件: ", downloadUrl);
    } else if (e.target.classList.contains("gitee-helper-download-img")) {
      // blob 页面 raw 按钮的 url
      let raw = document.querySelector(".ui.button.edit-raw");
      raw && (downloadUrl = document.querySelector(".ui.button.edit-raw").href);
    }
    downloadUrl &&
      chrome.runtime.sendMessage({
        type: "download",
        value: downloadUrl,
      });
  },
  true
);
