(() => {
  const SESSION_KEY="fudan-planner-sync-session-v1",META_KEY="fudan-planner-sync-meta-v1",config=globalThis.SYNC_CONFIG||{};
  const state={configured:Boolean(config.url&&config.publishableKey),session:null,remote:null,ready:false,busy:false,timer:null};
  const el=id=>document.querySelector(`#${id}`);
  const setMessage=(text,error=false)=>{el("syncMessage").textContent=text||"";setIndicator(error?"error":state.busy?"busy":state.ready?"ready":"",error?"同步异常":state.busy?"同步中":state.ready?"已同步":"云同步");};
  const setIndicator=(cls,text)=>{el("syncDot").className=`sync-dot ${cls}`;el("syncButtonText").textContent=text;};
  const getMeta=()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||"{}");}catch{return{};}};
  const setMeta=value=>localStorage.setItem(META_KEY,JSON.stringify({...getMeta(),...value}));
  const saveSession=session=>{state.session=session;if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));else localStorage.removeItem(SESSION_KEY);};
  const loadSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||"null");}catch{return null;}};
  async function request(path,{method="GET",body,auth=true,extraHeaders={}}={}){
    const headers={apikey:config.publishableKey,"Content-Type":"application/json",...extraHeaders};
    if(auth){await refreshIfNeeded();if(state.session?.access_token)headers.Authorization=`Bearer ${state.session.access_token}`;}
    const response=await fetch(`${config.url}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();let result=null;try{result=text?JSON.parse(text):null;}catch{result=text;}
    if(!response.ok)throw new Error(result?.msg||result?.message||result?.error_description||result?.error||`请求失败 ${response.status}`);return result;
  }
  async function refreshIfNeeded(){
    if(!state.session?.refresh_token||Number(state.session.expiresAt||0)>Date.now()+60000)return;
    const result=await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{apikey:config.publishableKey,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:state.session.refresh_token})});
    const payload=await result.json();if(!result.ok)throw new Error(payload.error_description||"登录已过期");saveSession(normalizeSession(payload));
  }
  const normalizeSession=payload=>({access_token:payload.access_token,refresh_token:payload.refresh_token,expiresAt:Date.now()+Number(payload.expires_in||3600)*1000,user:payload.user});
  async function fetchRemote(){const rows=await request(`/rest/v1/planner_sync?select=payload,updated_at&user_id=eq.${encodeURIComponent(state.session.user.id)}`);state.remote=rows?.[0]||null;return state.remote;}
  async function push(){
    if(!state.configured||!state.session||!state.ready||state.busy)return;state.busy=true;setMessage("正在上传本机进度……");
    try{const updatedAt=new Date().toISOString(),rows=await request("/rest/v1/planner_sync?on_conflict=user_id",{method:"POST",body:[{user_id:state.session.user.id,payload:data,updated_at:updatedAt}],extraHeaders:{Prefer:"resolution=merge-duplicates,return=representation"}});state.remote=rows?.[0]||{updated_at:updatedAt};setMeta({lastRemoteAt:state.remote.updated_at});setMessage(`已同步：${new Date(state.remote.updated_at).toLocaleString()}`);renderSync();}
    catch(error){setMessage(error.message,true);}finally{state.busy=false;renderSync();}
  }
  async function pull(skipConfirm=false){
    if(!state.session)return;if(!skipConfirm&&!confirm("用云端数据覆盖本机当前计划？建议先导出备份。"))return;state.busy=true;setMessage("正在下载云端进度……");
    try{const remote=await fetchRemote();if(!remote)throw new Error("云端还没有计划数据");globalThis.cloudSyncApplying=true;data=normalizeData(remote.payload);localStorage.setItem(STORAGE_KEY,JSON.stringify(data));setMeta({lastRemoteAt:remote.updated_at});state.ready=true;render();setMessage(`已下载：${new Date(remote.updated_at).toLocaleString()}`);}
    catch(error){setMessage(error.message,true);}finally{globalThis.cloudSyncApplying=false;state.busy=false;renderSync();}
  }
  async function establish(){
    state.busy=true;setMessage("正在检查云端……");
    try{const remote=await fetchRemote(),meta=getMeta();if(!remote){state.ready=true;renderSync();await push();return;}if(!data.updatedAt){state.ready=true;await pull(true);return;}if(meta.lastRemoteAt===remote.updated_at){state.ready=true;}else{state.ready=false;}setMessage(state.ready?`已连接：${new Date(remote.updated_at).toLocaleString()}`:"检测到本机和云端都有数据，请选择保留哪一份。");}
    catch(error){setMessage(error.message,true);}finally{state.busy=false;renderSync();}
  }
  async function signup(){
    const email=el("syncEmail").value.trim(),password=el("syncPassword").value;if(!email||password.length<8){setMessage("请输入邮箱和至少8位密码。",true);return;}state.busy=true;setMessage("正在创建同步账号……");
    try{const payload=await request("/auth/v1/signup",{method:"POST",body:{email,password},auth:false});el("syncPassword").value="";if(payload.access_token){saveSession(normalizeSession(payload));await establish();}else setMessage("注册成功。请先到邮箱点击确认链接，然后回来登录。");}
    catch(error){setMessage(error.message,true);}finally{state.busy=false;renderSync();}
  }
  async function login(){
    const email=el("syncEmail").value.trim(),password=el("syncPassword").value;if(!email||!password){setMessage("请输入邮箱和密码。",true);return;}state.busy=true;setMessage("正在登录……");
    try{const payload=await request("/auth/v1/token?grant_type=password",{method:"POST",body:{email,password},auth:false});saveSession(normalizeSession(payload));el("syncPassword").value="";await establish();}
    catch(error){setMessage(error.message,true);}finally{state.busy=false;renderSync();}
  }
  async function logout(){try{await request("/auth/v1/logout",{method:"POST"});}catch{}saveSession(null);state.remote=null;state.ready=false;setMessage("已退出同步账号。");renderSync();}
  function renderSync(){
    el("syncUnavailable").hidden=state.configured;el("syncSignedOut").hidden=!state.configured||Boolean(state.session);el("syncSignedIn").hidden=!state.session;
    if(state.session){el("syncAccountEmail").textContent=state.session.user?.email||"同步账号";el("syncConflict").hidden=state.ready;el("syncReady").hidden=!state.ready;if(state.ready){el("syncLastTime").textContent=state.remote?.updated_at?`云端更新时间：${new Date(state.remote.updated_at).toLocaleString()}`:"等待首次上传";}}
    setIndicator(state.busy?"busy":state.ready?"ready":"",state.busy?"同步中":state.ready?"已同步":"云同步");
  }
  function schedulePush(){if(!state.ready||!state.session||globalThis.cloudSyncApplying)return;clearTimeout(state.timer);state.timer=setTimeout(push,1800);}
  async function init(){
    el("syncBtn").onclick=()=>{renderSync();el("syncDialog").showModal();};el("closeSyncDialog").onclick=()=>el("syncDialog").close();el("syncSignupBtn").onclick=signup;el("syncLoginBtn").onclick=login;el("syncLogoutBtn").onclick=logout;
    el("syncPullBtn").onclick=()=>pull(false);el("syncPushBtn").onclick=async()=>{state.ready=true;renderSync();await push();};el("syncManualPullBtn").onclick=()=>pull(false);el("syncManualPushBtn").onclick=push;
    renderSync();if(!state.configured){setMessage("云端项目尚未配置。");return;}state.session=loadSession();if(state.session){try{await refreshIfNeeded();const user=await request("/auth/v1/user");state.session.user=user;saveSession(state.session);await establish();}catch(error){saveSession(null);setMessage(`需要重新登录：${error.message}`,true);renderSync();}}
    addEventListener("online",()=>{if(state.ready)schedulePush();});
  }
  globalThis.cloudSync={schedulePush,push,pull,state};init();
})();
