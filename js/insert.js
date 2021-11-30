// content_scripts中不可以跨域请求了, 即使拥有其他域名权限
(async function () {
  // const arr = await fetch("https://zhihu.com/notifications/notices?scope=referer", {
  //   // headers: {
  //   //   cookie: document.cookie,
  //   // },
  //   method: "GET",
  //   credentials: "include",
  // }).then(res => res.text());
  // console.log(arr);
})();
