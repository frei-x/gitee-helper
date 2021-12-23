import { getClassWithColor, getClass } from "file-icons-js";
// console.log(getClassWithColor("readme.md") + "?" + getClass("readme.md"));
function insertFileIcon () {
  const isProjectPage = document.querySelector("#project-wrapper");
  if (!isProjectPage) return;
  const oTree = document.querySelector("#tree-slider");
  if (!oTree) return;
  const treeItemFileNameParent = oTree.querySelectorAll(".tree-item[data-type=file] .tree-item-file-name");
  treeItemFileNameParent.length &&
    treeItemFileNameParent.forEach(node => {
      const oIcon = node.querySelector(".iconfont.icon-file");
      if (oIcon) {
        let fileName = node.querySelector("a").innerText || node.querySelector("a").title;
        let iconClass = getClassWithColor(fileName) || "iconfont icon-file";
        let iconName = getClass(fileName) ? getClass(fileName).slice(0, -5) : "";
        oIcon.title = iconName;
        oIcon.className = `gitee-helper-icon ${iconClass}`;
        oIcon.style.cssText = "margin-right: 8px;margin-top: 2px;font-style: normal;min-width: 16px;";
      }
    });
}

export { insertFileIcon };
