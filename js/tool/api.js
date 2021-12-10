// todo 自动获取用户企业名称、企业路径和企业id
const enterpressId = "1";
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

// feat: 混合搜索
// 搜索 issue
// 搜索 PR
// 搜索仓库
// 搜索代码
// 搜索里程碑
// 搜索文档
// 搜索成员
const searchIssue = text => {
  text = text ? text.trim() : "";
  return fetch(
    `https://api.gitee.com/enterprises/${enterpressId}/issues/as_tree?page=1&per_page=3&search=${text}&sort=created_at&parent_id=0`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://e.gitee.com/",
      },
      method: "GET",
      credentials: "include",
    }
  ).then(res => {
    return res.json();
  });
};

const searchPr = text => {
  text = text ? text.trim() : "";
  return fetch(
    `https://api.gitee.com/enterprises/${enterpressId}/pull_requests?page=1&per_page=2&search=${text}&sort=created_at`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://e.gitee.com/",
      },
      method: "GET",
      credentials: "include",
    }
  ).then(res => {
    return res.json();
  });
};


// 搜索仓库
const searchRepo = (text) => {
  // https://api.gitee.com/enterprises/1/projects?page=1&per_page=20&search=1
  text = text ? text.trim() : "";
  return fetch(
    `https://api.gitee.com/enterprises/${enterpressId}/projects?page=1&per_page=2&search=${text}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://e.gitee.com/",
      },
      method: "GET",
      credentials: "include",
    }
  ).then(res => {
    return res.json();
  });
}

const searchMember = (text) => {
  // https://api.gitee.com/enterprises/1/members?page=1&per_page=20&search=%E5%88%98&is_block=0
  text = text ? text.trim() : "";
  return fetch(
    `https://api.gitee.com/enterprises/${enterpressId}/members?page=1&per_page=2&search=${text}&is_block=0`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://e.gitee.com/",
      },
      method: "GET",
      credentials: "include",
    }
  ).then(res => {
    return res.json();
  });
}