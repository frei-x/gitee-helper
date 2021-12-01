"use strict";
var eventBus = {
  // 事件总线:
  on: function () {},
  emit: function () {},
  _arrOnEvent: [],
  // 处理先emit后on的情况,将漫游中的emit'暂存'
  _arrCacheEmit: [{}, {}],
};

/**
 * @description 检测数据类型
 * @param {*} variable
 * @returns {String} type 返回类型,首字母大写
 */
eventBus.getType = function (variable) {
  var type = Object.prototype.toString.call(variable).slice(8, -1);
  return type;
};

/**
 * @description 根据on与emit的参数执不同的策略
 * @param {String | Array} eventName
 * @param {Function} callback
 */
eventBus._eventPublicCheckArgType = function (eventName, callback) {
  let arrEventName = [];
  if (Array.isArray(eventName) && eventName.length > 0) {
    //console.log("数组");
    arrEventName = eventName;
  } else if (typeof eventName == "string" && eventName.trim().length > 0 && eventName.split(",").length > 1) {
    //console.log("多字符串拆数组");
    arrEventName = eventName.split(",");
  } else if (typeof eventName == "string" && eventName.trim().length > 0 && eventName.split(",").length == 1) {
    //console.log('单字符串还原数组');
    arrEventName = [eventName];
  } else {
    console.error("未知类型");
  }
  callback.call(this, arrEventName);
};

/**
 * @description 发送事件
 * @param {String | Array} eventName
 * @param {*} params
 */
eventBus.emit = function (eventName, params) {
  let sItemEvent = "";
  function funCheckArrFunHaveEventName (arrEventName) {
    var arrEventNameLen = arrEventName.length;
    for (let i = 0; i < arrEventNameLen; i++) {
      (i => {
        let isHaveEvent = this._arrOnEvent.some((item, index) => {
          sItemEvent = item;
          return item.name == arrEventName[i];
        });
        if (isHaveEvent) {
          sItemEvent.fun(params);
          return true;
        } else {
          console.error(eventName, "该事件未被监听,emit被挂起");
          this._arrCacheEmit.push({ name: eventName, param: params });
          return false;
        }
      })(i);
    }
  }
  eventBus._eventPublicCheckArgType.call(this, eventName, funCheckArrFunHaveEventName);
};

/**
* @description 监听事件
* @param {String | Array} eventName
* @param {Function} [callback=function () { }]
*/
eventBus.on = function (eventName, callback = function () {}) {
  function funAddon (arrEventName) {
    if (eventBus.getType(callback) === "Function") {
      // 先检查存在漫游事件
      this._arrCacheEmit.forEach(function (item, index) {
        for (let i = 0; i < arrEventName.length; i++) {
          // item.name == arrEventName[i].name可能都为undefined....
          if (item.name && arrEventName[i] && item.name == arrEventName[i]) {
            //有漫游
            callback(item.param);
            console.log(item.name, arrEventName[i]);
          } else {
            this._arrOnEvent.push({ name: eventName, fun: callback.bind(this) });
          }
        }
      }, this);
    } else {
      console.error(callback + " is not function");
    }
  }
  this._eventPublicCheckArgType.call(this, eventName, funAddon);
};
