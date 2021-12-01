const getToken = () => {
  return new Promise((resolve, reject) => {
    fetch(`https://gitee.com/login_state`, {
      headers: {
        "x-requested-with": "XMLHttpRequest", //
      },
      method: "get",
      credentials: "include",
    })
      .then(res => {
        return res.text();
      })
      .then(text => {
        const token = JSON.parse(text.match(/<meta content=(.*) name=\"csrf-token\">/)[1]);
        resolve(token);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

const getNotices = function (type) {
  // @ referer , 私信 messages , 通知 infos
  return fetch(`https://gitee.com/notifications/notices?scope=${type}`, {
    method: "GET",
    credentials: "include",
  }).then(res => {
    // if (res.status >= 400) {
    //   throw new Error(res);
    // } else {
    return res.json();
    // }
  });
};

// const curHeaders = new Headers({
//   'Content-Type': 'text/plain',
//   'Content-Length': content.length.toString(),
//   'X-Custom-Header': 'ProcessThisImmediately'
// });

const markNotice = async function (id) {
  // todo 写一个事件总线, 从自定义事件中共享数据
  var token = await getToken();
  console.log("token: " + token);
  return fetch(`https://gitee.com/notifications/mark`, {
    headers: {
      "x-csrf-token": token,
      "x-requested-with": "XMLHttpRequest",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      referer: "https://gitee.com",
    },
    method: "PUT",
    body: `noti_ids=${id}`,
    credentials: "include",
  }).then(res => {
    return res.json();
  });
};
