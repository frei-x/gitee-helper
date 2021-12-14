const getStorage = key => {
  return new Promise(resolve => {
    chrome.storage.sync.get(key, value => {
      resolve(value[key]);
    });
  });
};
const setStorage = (key, value) => {
  return new Promise(resolve => {
    chrome.storage.sync.set({ [key]: value }, function () {
      resolve();
    });
  });
};
export { getStorage, setStorage };
