import { getEnterpriseList } from "./tool/api";
import { getStorage, setStorage } from "./utils/storage";
(async function () {
  let storageEntInfo = await getStorage("select-enterprises");
  console.log(storageEntInfo);
  const oSelect = document.querySelector("#select-enterprises");
  oSelect.addEventListener("change", async e => {
    const options = oSelect.options;
    const selectedIndex = oSelect.selectedIndex;
    console.log(options[selectedIndex]);
    const currentSelect = options[selectedIndex];
    const { path, name, id } = currentSelect.dataset;
    setStorage("select-enterprises", { path, name, id }).then(result => {
      // 直接重启 避免重复去读取配置
      chrome.runtime.reload();
    });
  });

  const createEnterprisesOptionList = arr => {
    let template = "";
    if (Array.isArray(arr)) {
      arr.forEach(item => {
        // 存储后 number 变 string了
        var isSelected = storageEntInfo && storageEntInfo.id == item.id;
        template += `
        <option value="${item}" data-path='${item.path}' data-name='${item.name}' data-id='${item.id}' ${isSelected
          ? "selected"
          : ""}>
            ${item.name}
        </option>`;
      });
    }
    // 没有配置过企业, 默认取最高等级
    if (!storageEntInfo) {
      let defaultEnt = arr.sort((a, b) => {
        return b.level - a.level;
      })[0];
      if (!defaultEnt || !defaultEnt.path) return;
      setStorage("select-enterprises", {
        path: defaultEnt.path,
        name: defaultEnt.name,
        id: defaultEnt.id,
      }).then(result => {
        chrome.runtime.reload();
      });
    }
    oSelect.innerHTML = template;
  };
  getEnterpriseList()
    .then(result => {
      console.log(result);
      let list = result.enterprises;
      createEnterprisesOptionList(list);
    })
    .catch(err => {
      console.log(err);
    });
})();
