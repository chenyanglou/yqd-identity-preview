/* 仅供公开界面预览。所有人员、申请、授权均为虚构示例，数据不持久化、不发送网络请求。 */
const previewNativeLocation = window.location;
const previewNativeHistory = window.history;
const previewPath = () => previewNativeLocation.hash.slice(1) || '/login';
const location = {
  get pathname(){return previewPath().split('?')[0]},
  get search(){const i=previewPath().indexOf('?');return i<0?'':previewPath().slice(i)},
  get origin(){return previewNativeLocation.origin},
  assign(){throw new Error('界面预览不连接外部认证服务')},
};
const history = {
  replaceState(a,b,p){previewNativeHistory.replaceState(a,b,'#'+p);previewMarkNavigation()},
  pushState(a,b,p){previewNativeHistory.pushState(a,b,'#'+p);previewMarkNavigation()},
};
const previewTime = Date.now();
const previewGrant = () => ({id:'example-grant-001',capability:'portal.overview.read',scope:{mode:'self'},validFrom:previewTime,expiresAt:null,version:1});
const previewPositions = [
  {id:'operator',label:'运营人员',summary:'审核通过后开通本人工作空间；运营业务模块待接入。'},
  {id:'nursery',label:'苗场人员',summary:'审核通过后开通本人工作空间；苗场业务模块待接入。'},
  {id:'warehouse',label:'仓库人员',summary:'审核通过后开通本人工作空间；仓库业务模块待接入。'},
];
const previewTemplates = previewPositions.map(p=>({...p,version:1,enabled:true,grants:[previewGrant()],digest:'example-template-'+p.id}));
const previewRequest = (id,name,position,index=0) => ({id,kind:'registration',applicationName:name,target:{id:100+index,name},position:previewPositions.find(p=>p.id===position),template:previewTemplates.find(p=>p.id===position),templateDigest:'example-template-'+position,status:'open',version:1,createdAt:previewTime-(index+1)*3600000});
const previewData = {
  me:null,
  requests:[previewRequest('example-request-001','示例员工·林禾','operator',1),previewRequest('example-request-002','示例员工·陈苗','nursery',2),previewRequest('example-request-003','示例员工·周仓','warehouse',3)],
  users:[{id:101,accountLabel:'DEMO-0101',name:'示例员工·林禾',registrationState:'approved',status:'enabled',version:1,grants:[previewGrant()],assignments:[],isAdmin:false},{id:102,accountLabel:'DEMO-0102',name:'示例员工·陈苗',registrationState:'open',status:'enabled',version:1,grants:[],assignments:[],isAdmin:false},{id:103,accountLabel:'DEMO-0103',name:'示例员工·周仓',registrationState:'approved',status:'disabled',version:1,grants:[],assignments:[],isAdmin:false}],
  audit:[{id:'example-audit-001',actorName:'示例管理员',event:'registration.approved（示例）',targetId:'DEMO-0101',createdAt:previewTime-3600000},{id:'example-audit-002',actorName:'示例管理员',event:'account.disabled（示例）',targetId:'DEMO-0103',createdAt:previewTime-7200000}],
};
function previewIdentity(path){
  if(path.startsWith('/login'))return null;
  const isAdmin=path.startsWith('/admin');
  const registrationState=path.startsWith('/register')?'not_submitted':path.startsWith('/pending')?'open':'approved';
  return {state:'authenticated',contextId:'example-page-context',csrf:'not-a-real-token',user:{id:isAdmin?900:101,displayName:isAdmin?'示例管理员':'示例员工·林禾',accountLabel:isAdmin?'DEMO-ADMIN':'DEMO-0101'},registrationState,isAdmin,capabilities:['portal.overview.read',...(isAdmin?['system.registrations.review','system.accounts.manage','system.grants.manage','system.audit.read','system.sessions.manage']:[])],menus:isAdmin?[{id:'admin',label:'管理中心'}]:[],cAssignments:[],businessAccess:{enabled:false},idleExpiresAt:previewTime+1800000,absoluteExpiresAt:previewTime+43200000};
}
function previewMarkNavigation(){
  const path=previewPath();
  document.querySelectorAll('[data-preview]').forEach(b=>{const p=b.dataset.preview;const current=path===p||(p==='/admin?tab=requests'&&path==='/admin');if(current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function previewNavigate(path){
  clearIdentity();previewData.me=previewIdentity(path);state.me=previewData.me;state.config={configured:true};state.requestStatus='open';state.search='';history.pushState({},'',path);renderRoute();
}
document.querySelector('#preview-navigation').addEventListener('click',e=>{const button=e.target.closest('[data-preview]');if(button)previewNavigate(button.dataset.preview)});
window.addEventListener('hashchange',()=>previewNavigate(previewPath()));
async function previewApi(path,{method='GET',body}={}){
  // 没有HTTP客户端或真实账号；生产API契约仅用于复用同一套界面。
  const url=new URL(path,'https://preview.invalid');const pathname=url.pathname;
  if(pathname==='/api/auth/config')return {configured:true,companyName:'原起点',productName:'产品与种苗管理平台',preview:true};
  if(pathname==='/api/auth/me'){
    if(!previewData.me){const error=new Error('预览登录页面');error.status=401;throw error}
    return structuredClone(previewData.me);
  }
  if(pathname==='/api/auth/bootstrap')return {loginCsrf:'preview-only',autoEligible:false};
  if(pathname==='/api/auth/registration-positions')return {feishuName:'示例员工·林禾',positions:previewPositions};
  if(pathname==='/api/auth/my-registration')return {request:previewData.requests[0]};
  if(pathname==='/api/auth/permission-requests'&&method==='POST'){
    previewData.requests[0]=previewRequest('example-request-001',body.applicationName,body.positionId,1);previewData.me.registrationState='open';return {request:previewData.requests[0]};
  }
  if(pathname==='/api/workspace/overview')return {preview:true};
  if(pathname==='/api/auth/my-access')return {grants:[previewGrant()]};
  if(pathname==='/api/auth/sessions')return {items:[{id:'example-session',current:true,clientLabel:'界面预览 · 示例浏览器',createdAt:previewTime,absoluteExpiresAt:previewTime+43200000}]};
  if(pathname==='/api/auth/logout'||pathname==='/api/auth/logout-all'){previewData.me=null;return {ok:true}}
  if(pathname==='/api/admin/templates')return {items:previewTemplates};
  if(pathname==='/api/admin/audit')return {items:previewData.audit};
  if(pathname==='/api/admin/users')return {items:previewData.users};
  if(pathname==='/api/admin/permission-requests')return {items:previewData.requests.filter(r=>url.searchParams.get('status')==='closed'?r.status!=='open':r.status==='open')};
  let match=pathname.match(/^\/api\/admin\/permission-requests\/([^/]+)(?:\/(activate|reject))?$/);
  if(match){const request=previewData.requests.find(r=>r.id===match[1]);if(!request)throw new Error('示例申请不存在');if(match[2]){request.status='closed';request.outcome=match[2]==='activate'?'granted':'declined';request.closeReason=body.reason;request.version++;previewData.audit.unshift({id:'example-audit-'+crypto.randomUUID(),actorName:'示例管理员',event:'申请'+(match[2]==='activate'?'通过':'拒绝')+'（仅本页示例）',targetId:request.target.id,createdAt:Date.now()});}return {request:structuredClone(request)}}
  match=pathname.match(/^\/api\/admin\/users\/([^/]+)(?:\/(status|grants))?$/);
  if(match){const user=previewData.users.find(u=>String(u.id)===match[1]);if(!user)throw new Error('示例账号不存在');if(match[2]==='status'){user.status=body.status;user.version++}if(match[2]==='grants'){user.grants=body.operation==='create'?[previewGrant()]:user.grants.filter(g=>g.id!==body.grantId);user.version++}return {user:structuredClone(user)}}
  throw new Error('此操作未包含在静态界面预览中');
}
previewData.me=previewIdentity(previewPath());
previewMarkNavigation();
