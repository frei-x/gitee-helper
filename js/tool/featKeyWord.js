const reSearchIssue = /^(Issue|任务):/i;
const reSearchPR = /^(PR|pull request):/i;
const reSearchRepo = /^(Repo|Project|仓库):/i;
const reSearchMember = /^(Member|成员|用户):/i;
const reSearchCode = /^(Code|代码):/i;
const reSearchDoc = /^(doc|文档|知识库):/i;
const reNewIssue = /^(New Issue|新建任务):/i;
const reNewPR = /^(New PR|新建评审):/i;
const reNewRepo = /^(New Project|New Repo|新建仓库):/i;

export {
  reSearchIssue,
  reSearchPR,
  reSearchRepo,
  reSearchDoc,
  reSearchMember,
  reSearchCode,
  reNewIssue,
  reNewPR,
  reNewRepo,
};
