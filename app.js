const STORAGE_KEY = "fudan2027-study-planner-v1";
const REVIEW_OFFSETS = [0, 1, 3, 7, 14, 30, 60, 90];
const todayISO = () => new Date().toLocaleDateString("sv-SE");
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const phases = [
  { minDay:0, maxDay:13, name:"零基础启动 · 建立习惯", focus:["现汉教材先理解；全稿客观题与简答题双轨推进", "前两周从6小时逐步升到7小时", "不做整套模考；每天8个客观点+1道简答骨架"] },
  { minDay:14, maxDay:69, name:"第一轮 · 完整理解", focus:["现汉客观题第一轮+简答题持续输出", "英语从长难句进入2010年起逐篇真题", "文化小题与大题并行；第4周加入政治"] },
  { minDay:70, maxDay:111, name:"第二轮 · 背诵真题", focus:["354按专题二轮并使用丸子全稿抽背", "445完成第一次完整背诵", "按真题分析建立主观题母题库"] },
  { minDay:112, maxDay:999, name:"套卷 · 限时输出", focus:["每周完整354、445各一套", "建立60道445母题", "英语整套与政治错题二刷"] },
  { minDay:999, maxDay:9999, name:"冲刺 · 稳定得分", focus:["每周专业课各两套", "只回真题、错题和主资料", "英语近三年模拟，政治肖八肖四"] }
];

const diagnosticPlans = {
  "2026-06-23":[["354","2021年354限时诊断","09:00",2.5,"不查书，保留原始答卷"],["354","诊断卷错题归因","13:30",1.5,"标注不会/记错/写不出"],["英语","2022英语一四篇阅读诊断","19:00",2,"限时完成并记录正确数"],["复盘","建立错题表和任务板","21:10",.75,"录入前三类错误"]],
  "2026-06-24":[["445","2021年445限时诊断","09:00",2.5,"不查书，完整手写"],["445","四模块归因","13:30",1.5,"引论/心理/文化/跨文化"],["英语","阅读诊断逐题复盘","19:00",2,"写出每个错误选项错因"],["生活","完成负债现金流表","21:10",.75,"本金/月供/生活费/现金"]],
  "2026-06-25":[["354","语音概说与语音单位","09:00",2,"合书画一页框架"],["445","引论：学科性质、任务与发展","13:30",2,"闭卷复述核心概念"],["英语","精读诊断阅读第1篇","19:00",1.75,"拆长难句并复盘选项"],["复盘","与大哥完成边界沟通","21:10",.75,"记录约定，不争论"]],
  "2026-06-26":[["354","声母与韵母","09:00",2,"完成章节练习"],["445","引论：语言学与教育学基础","13:30",2,"整理理论—教学对应"],["445","程版文化第一章","16:20",1,"芝士条闭卷回忆"],["英语","精读诊断阅读第2—3篇","19:00",1.75,"逐句翻译关键段"]],
  "2026-06-27":[["354","声调、音节结构与音变","09:00",2,"完成语音专项题"],["445","引论：心理学与文化学基础","13:30",2,"闭卷写框架"],["354","王力古汉语基础","16:20",.5,"20分钟+翻译2句"],["英语","精读诊断阅读第4篇","19:00",1.75,"归纳错题类型"],["复盘","当日白纸复述","21:10",.75,"完成2道主观题"]],
  "2026-06-28":[["354","语音章测试","09:00",2,"正确率≥75%"],["445","引论前两章闭卷框架","13:30",2,"无提示完成"],["445","文化第一章填空","16:20",1,"错题进入文化卡"],["英语","本周阅读错题回炉","19:00",1.5,"重做不看答案"],["复盘","周总结","21:00",.75,"写三项改进"]],
  "2026-06-29":[["354","语音专题小卷","09:00",1.5,"限时并订正"],["445","本周知识回顾","10:45",1.25,"口述+白纸框架"],["英语","单词与阅读周复盘","14:00",1,"清空本周错词"],["复盘","制定下周任务","15:15",.5,"只排可交付任务"]]
};

const foundation354 = ["语音与音系", "汉字与文字", "词汇与词义", "实词、虚词与短语", "单句与句法分析", "复句、病句与修辞", "词语辨析、偏误与201例", "古代汉语与综合回炉"];
const foundation445 = ["引论：学科与理论基础", "引论：二语习得与学习者", "引论：教学法与总体设计", "引论：教材、课堂与测试", "教育心理：发展、理论与动机", "教育心理：知识、迁移与策略", "跨文化与文化传播", "综合回炉与主观题"];
const zero354 = [
  "现汉绪论：课程地图与基本概念","语音性质与语音单位","声母：发音部位与发音方法","韵母：结构、分类与四呼","声调：调值、调类与标调","音节结构与拼写规则","音变：变调、轻声与儿化","语音章综合测试",
  "汉字性质、特点与作用","汉字结构：笔画、部件、偏旁、部首","造字法与汉字形体演变","笔顺、字形与书写规范","汉字整理与标准化","汉字教学易错点与章节测试","词汇单位：语素、词、固定短语","构词法：单纯词与合成词",
  "词义性质与构成","义项、义素与语义场","同义词辨析的标准与步骤","反义词、多义词与上下位词","现代汉语词汇系统与熟语","词汇章综合测试","词类划分标准与兼类","名词、动词、形容词辨析",
  "数词、量词、代词、副词","介词、连词、助词与语气词","短语结构类型","复杂短语层次分析","词类与短语综合测试","句法成分概览","主谓宾定状补的判定","单句句型与句类",
  "单句成分分析训练","歧义类型与消歧方法","特殊句式：把、被、连谓、兼语","句法章综合测试","复句类型与关联标记","多重复句层次分析","病句类型与修改","修辞格识别与表达效果",
  "标点与语用基础","语境、预设与会话含义","词语辨析专项输出","偏误分析：分类、原因与修改","古代汉语词义与常用虚词","词类活用与特殊句式","古文标点与翻译训练","354一轮综合诊断与错题地图"
];
const zero445 = [
  "国际中文教育考试地图与资料主线","学科性质、研究对象与任务","学科发展与基本术语","语言学基础及教学对应","教育学基础及教学原则","心理学基础及学习机制","文化学基础与文化教学","学科基础闭卷框架测试",
  "第二语言习得基本概念","第一语言习得与二语习得差异","对比分析假说","偏误分析理论","中介语理论","输入、输出与互动假说","年龄、母语与环境因素","动机、认知风格与学习策略",
  "二语习得专题闭卷测试","教学法流派总览","语法翻译法与直接法","听说法与视听法","认知法与交际法","任务型、内容型教学法","教学法比较与选择依据","总体设计：性质、原则与程序",
  "课程类型与教学大纲","需求分析与培养目标","教材类型、编写与评估","课堂教学基本原则","课堂组织与教师行为","语音、词汇、语法教学","听说读写技能教学","语言测试：效度、信度与题型",
  "教案与课堂活动设计","教育心理：发展理论","行为主义、认知与建构学习理论","学习动机与归因","知识学习与概念教学","技能形成与练习","学习迁移","学习策略与元认知",
  "教育心理专题测试","跨文化交际基本概念","文化定势、偏见与民族中心主义","文化休克与跨文化适应","言语与非言语交际","跨文化交际策略","案例分析答题结构","445一轮综合诊断与主观题地图"
];
const zeroCulture = ["中国地理与行政区划","民族、语言与传统节日","史前与先秦","秦汉","魏晋南北朝","隋唐","宋元","明清","近现代史线索","儒家","道家与道教","佛教中国化","古代教育与科举","政治制度","经济与科技","文学发展线索","书法绘画","音乐戏曲","建筑园林","饮食服饰","礼仪与民俗","中外文化交流","文化精神关键词","文化第一轮综合回顾"];
const zeroEnglish = ["句子成分与五大基本句型","名词、代词与主谓一致","时态、语态与情态动词","非谓语动词基础","定语从句","名词性从句","状语从句","比较、倒装、强调与省略","长难句：找主干","长难句：处理从句","长难句：处理非谓语","长难句综合拆分"];
const weekdayNames = ["日","一","二","三","四","五","六"];

let data = loadData();
let selectedDate = data.lastDate || todayISO();
let filter = "all";
let lastRollSnapshot = null;

function loadData(){
  const base = { schemaVersion:5, days:{}, reviewUnits:[], settings:{studyStartDate:todayISO(),dailyTarget:8, weeklyTarget:50, examDate:"2026-12-19", theme:"light", autoRollover:true,morningStart:"08:30",afternoonStart:"13:30",eveningStart:"19:00",breakMinutes:20}, lastDate:todayISO(), lastAutoRollDate:todayISO() };
  try { return normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),base); } catch { return base; }
}
function normalizeData(saved,base={ schemaVersion:5, days:{}, reviewUnits:[], settings:{studyStartDate:todayISO(),dailyTarget:8, weeklyTarget:50, examDate:"2026-12-19", theme:"light", autoRollover:true,morningStart:"08:30",afternoonStart:"13:30",eveningStart:"19:00",breakMinutes:20}, lastDate:todayISO(), lastAutoRollDate:todayISO() }){
  const oldVersion=Number(saved.schemaVersion||0),legacy=Object.keys(saved||{}).length&&oldVersion<3, merged=Object.assign({},base,saved); merged.settings=Object.assign({},base.settings,saved.settings||{}); merged.days=merged.days||{}; merged.reviewUnits=merged.reviewUnits||[]; merged.lastAutoRollDate=merged.lastAutoRollDate||todayISO(); merged.schemaVersion=5;if(legacy)merged.needsPipelineMigration=true;if(Object.keys(saved||{}).length&&oldVersion<4)merged.needsZeroReset=true;if(Object.keys(saved||{}).length&&oldVersion<5)merged.needsMaterialReset=true;return merged;
}
function saveData(){ data.lastDate = selectedDate;if(!globalThis.cloudSyncApplying)data.updatedAt=new Date().toISOString();localStorage.setItem(STORAGE_KEY, JSON.stringify(data));flashSaved();if(!globalThis.cloudSyncApplying)globalThis.cloudSync?.schedulePush?.(); }
function daysFromStart(date){return Math.floor((new Date(`${date}T12:00:00`)-new Date(`${data.settings.studyStartDate||todayISO()}T12:00:00`))/86400000);}
function phaseFor(date){const remain=Math.ceil((new Date(`${data.settings.examDate}T12:00:00`)-new Date(`${date}T12:00:00`))/86400000);if(remain<=35)return phases[4];const elapsed=Math.max(0,daysFromStart(date));return phases.find(p=>elapsed>=p.minDay&&elapsed<=p.maxDay)||phases[3];}
function priorityFor(subject){ return subject==="354"||subject==="445"?3:subject==="文化"||subject==="英语"||subject==="政治"?2:1; }
function toTask(row){ return { id:uid(), subject:row[0], title:row[1], time:row[2], hours:Number(row[3]), deliverable:row[4] || "", priority:priorityFor(row[0]), locked:false, done:false }; }
function minutesOf(time){const [h,m]=String(time||"08:30").split(":").map(Number);return h*60+m;}
function timeOf(minutes){const n=((minutes%1440)+1440)%1440;return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;}
function reflowTasks(tasks){
  const starts=[data.settings.morningStart||"08:30",data.settings.afternoonStart||"13:30",data.settings.eveningStart||"19:00"],n=tasks.length,breakMin=Number(data.settings.breakMinutes||20),groups=n>=6?[0,0,...Array(n-4).fill(1),2,2]:n>=4?[0,...Array(n-2).fill(1),2]:Array(n).fill(0),cursor=starts.map(minutesOf);
  tasks.forEach((task,i)=>{if(task.locked)return;const g=groups[i]??2;task.time=timeOf(cursor[g]);cursor[g]+=Math.round(Number(task.hours)*60)+breakMin;});return tasks;
}
function scheduled(rows){return reflowTasks(rows.map(toTask));}
function studyIndexFor(date){let cursor=new Date(`${data.settings.studyStartDate||todayISO()}T12:00:00`),target=new Date(`${date}T12:00:00`),count=0;if(target<=cursor)return 0;while(cursor<target){if(cursor.getDay()!==0)count++;cursor.setDate(cursor.getDate()+1);}return count;}
function capacityForDate(date){const elapsed=daysFromStart(date);if(elapsed<7)return Math.min(6,data.settings.dailyTarget);if(elapsed<14)return Math.min(7,data.settings.dailyTarget);return data.settings.dailyTarget;}
function weeklyTargetForDate(date){const elapsed=daysFromStart(date);if(elapsed<7)return Math.min(40,data.settings.weeklyTarget);if(elapsed<14)return Math.min(45,data.settings.weeklyTarget);return data.settings.weeklyTarget;}

function defaultTasks(date){
  const d = new Date(`${date}T12:00:00`), dow = d.getDay(), phase = phaseFor(date);
  if(daysFromStart(date)<0)return scheduled([["准备","零基础计划尚未开始","",.25,`计划将在 ${data.settings.studyStartDate} 自动开始；可在目标设置中修改`]]);
  const rawIdx=studyIndexFor(date);
  if(rawIdx<zero354.length){
    const idx=Math.min(zero354.length-1,rawIdx),week=Math.floor(idx/6);
    if(dow===0)return scheduled([["354",`第${week+1}周现汉闭卷框架+错题重做`,"",1.25,"不看答案，先画框架再重做"],["445",`第${week+1}周引论闭卷复述`,"",1.25,"口述框架并手写1道简答"],["文化","本周文化填空错题回炉","",.5,"只做标记错题"],["英语","本周单词+长难句/阅读回炉","",1.25,"错词清零，重做错题不看答案"],["复盘","统计有效时长并排下周","",.5,"只保留真正完成不了的调整"]]);
    const early=idx<6,second=idx<12,h445=early?1.75:2,hEnglish=early?1:second?1.25:1.5,culture=zeroCulture[idx%zeroCulture.length],politics=idx>=18,english=idx<zeroEnglish.length?zeroEnglish[idx]:(()=>{const k=idx-zeroEnglish.length,year=2010+(Math.floor(k/4)%11),passage=k%4+1;return `${year}英语一阅读第${passage}篇精读`;})(),objectiveCount=idx<24?8:idx<36?12:15,subjectiveCount=idx<12?1:idx<24?2:3,subjectiveHours=idx<12?.5:.75;
    const objectiveTitle=idx<36?`全稿客观题：同章${objectiveCount}项`:`全稿客观题二轮：错题${objectiveCount}项`;
    const rows=[["英语",`词汇：新词50个 + 间隔复习旧词`,"",.5,"新词只认核心义；旧词按软件到期量清零"],["354",`教材理解：${zero354[idx]}`,"",.75,"黄廖教材/系统课程为主，一只鱼笔记查漏；合书画结构，不抄原文"],["354",objectiveTitle,"",.5,"只用全稿PDF第16—149页；先遮答案口答，再核对并标记不会/模糊"],["354",`全稿简答题：同章${subjectiveCount}题`,"",subjectiveHours,idx<12?"只列定义—要点—例子三级骨架；使用PDF第150—261页":"限时手写；每点先观点再解释/举例，核对后压缩成答题骨架"],["445",zero445[idx],"",h445,"丸子引论主线60分→一只鱼引论/现外教/教心只补缺口→合书口述并手写1道简答"],["文化",`文化要略：${culture}`,"",.5,idx%2===0?"小题：5道填空；大题：列1题的背景—表现—影响/当代价值提纲":"小题：5道填空；闭卷复述昨日文化大题提纲"]];
    if(idx>=6)rows.push(["354","古代汉语：断句与常用词","",.25,"文选朗读5分钟；断句/标点1小段；积累2个实词或虚词"]);
    if(politics)rows.push(["政治","政治基础/强化：当天章节","",.75,"听课只记框架，完成肖1000对应题并订正"]);
    rows.push(["英语",english,"",hEnglish,idx<12?"拆出主干、从句和非谓语；精翻2句":"先限时18分钟，再逐题定位并解释干扰项"],["复盘","当日闭卷回忆 + 到期背诵","",.5,"354和445各口述5分钟，按不会/模糊/会了评级"]);
    return scheduled(rows);
  }
  if (dow === 0) return scheduled([["354","本周354错题重做","",1.25,"不看答案独立完成"],["445","本周445闭卷复述","",1.25,"写出知识框架"],["英语","单词与阅读周复盘","",1,"清空本周错词"],["复盘","统计周有效时长并排下周","",.5,"只保留高价值任务"]]);
  const start = new Date(`${data.settings.studyStartDate||todayISO()}T12:00:00`);
  const week = Math.max(0, Math.floor((d - start) / 604800000));
  const t354 = foundation354[Math.min(foundation354.length-1, week)];
  const t445 = foundation445[Math.min(foundation445.length-1, week)];
  const englishDay=Math.max(0,Math.floor((d-start)/86400000)), englishYear=2010+(Math.floor(englishDay/2)%11), englishPart=englishDay%2?3:1;
  const politics = studyIndexFor(date)>=18;
  if (phase.name.startsWith("第二轮")) return scheduled([["英语","单词复习","",.5,"清空当日复习量"],["354",`客观题二轮：${foundation354[week%foundation354.length]}`,"",.75,"全稿客观错题+章节测试，必须达到85%"],["354",`主观题二轮：${foundation354[week%foundation354.length]}`,"",1.25,"2—3题限时手写，按观点—解释—例子自评"],["445",`第一次完整背诵：${foundation445[week%foundation445.length]}`,"",2,"闭卷写2道主观题；文化另保留小题复现"],["政治","强化课与肖1000","",1,"完成对应章节并订正"],["英语","真题阅读/翻译专项","",1.75,"逐题写错因"],["复盘","完成今日到期背诵+真题映射","",.75,"按不会/模糊/会了评级"]]);
  if (phase.name.startsWith("套卷")) return scheduled([["英语","单词与作文表达","",.5,"复习+5句输出"],["354",dow%2 ? "354限时套卷/专题卷" : "354错题与答案校订","",2.25,"按答题纸手写"],["445",dow%2 ? "445母题限时输出" : "445套卷与复盘","",2.25,"至少4道主观题"],["政治","选择题错题二刷+时政","",1,"正确率统计"],["英语","整套/阅读+作文","",1.75,"限时并复盘"],["复盘","完成今日到期背诵+错题回炉","",.5,"次日先重做"]]);
  if (phase.name.startsWith("冲刺")) return scheduled([["英语","单词与作文表达回顾","",.5,"只复习旧内容"],["354","套卷或高频错题","",2.25,"限时手写"],["445","套卷或主观母题快背","",2.25,"闭卷输出"],["政治","肖八/肖四与时政","",1.25,"选择题订正"],["英语","近年真题模拟/复盘","",1.5,"保持手感"],["复盘","完成今日到期背诵+薄弱点清零","",.5,"不新增资料"]]);
  return scheduled([["英语","单词复习","",.5,"清空当日复习量"],["354",`${t354}：客观错题与应用题`,"",.75,"全稿客观题二刷+章节测试，正确率达到85%"],["354",`${t354}：简答题完整输出`,"",1.25,"全稿简答3—4题：先口述，再限时手写1题"],["445",`${t445}：理解+闭卷复述`,"",2,"输出2道主观题"],[politics?"政治":"445",politics?"强化课+肖1000":"中国文化：小题+大题","",1,politics?"完成对应章节并订正":"10道小题+1道文化大题骨架"],["英语",`${englishYear}英语一阅读第${englishPart}—${englishPart+1}篇`,"",1.75,"先限时18分钟/篇，再逐句定位，写清错因"],["复盘","完成今日到期背诵+错题入表","",.75,"按不会/模糊/会了评级"]]);
}

function dayData(date){
  if (!data.days[date]) data.days[date] = { tasks:defaultTasks(date), note:data.preservedNotes?.[date]||"" };
  data.days[date].tasks=(data.days[date].tasks||[]).map(t=>({...t,priority:Number(t.priority||priorityFor(t.subject)),locked:Boolean(t.locked),originDate:t.originDate||date}));
  return data.days[date];
}
function formatDate(date){ const d = new Date(`${date}T12:00:00`); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · 周${weekdayNames[d.getDay()]}`; }
function esc(s=""){ return s.replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }

function render(){
  const day = dayData(selectedDate), phase = phaseFor(selectedDate);
  document.querySelector("#datePicker").value = selectedDate;
  document.querySelector("#dateLabel").textContent = formatDate(selectedDate);
  document.querySelector("#phaseBadge").textContent = phase.name;
  document.querySelector("#focusTitle").textContent = phase.name;
  document.querySelector("#focusList").innerHTML = phase.focus.map(x=>`<li>${esc(x)}</li>`).join("");
  document.querySelector("#dailyNote").value = day.note || "";
  renderTasks(); renderMetrics(); renderWeek(); renderReviews(); renderRolloverNotice(); renderQueue(); updateInstallCard();
  document.body.classList.toggle("dark", data.settings.theme === "dark");
}

function renderTasks(){
  const tasks = dayData(selectedDate).tasks.filter(t => filter === "all" || (filter === "done" ? t.done : !t.done));
  const el = document.querySelector("#taskList");
  if (!tasks.length){ el.innerHTML = '<div class="empty-state">这里暂时没有任务。可以添加一项明确、可交付的任务。</div>'; return; }
  el.innerHTML = tasks.map(t=>{const resources=resourcesForTask(t);return `<div class="task-item priority-${t.priority||2} ${t.done?"done":""} ${t.locked?"locked":""}" data-id="${t.id}">
    <label class="check-wrap"><input type="checkbox" ${t.done?"checked":""} aria-label="完成 ${esc(t.title)}"></label>
    <input class="task-time-input" type="time" value="${esc(t.time)}" aria-label="修改 ${esc(t.title)} 的开始时间" title="可直接修改开始时间">
    <div><div><span class="subject-pill">${esc(t.subject)}</span></div><div class="task-title">${esc(t.title)}</div><div class="task-deliverable">${esc(t.deliverable)}</div>${t.rollCount?`<span class="roll-badge">↪ 原定 ${esc(t.originDate||t.rolledFrom)} · 已顺延 ${t.rollCount} 次</span>`:""}</div>
    <span class="task-hours">${Number(t.hours).toFixed(t.hours%1?2:0)}h</span>
    <div class="task-actions">${t.subject==="文化"?'<button class="mini-button resource-link open-culture" title="打开文化背诵库">文化库</button>':""}${resources.map(r=>`<a class="mini-button resource-link" href="${r.href}" target="_blank" title="${esc(r.title||r.label)}">${esc(r.label)}</a>`).join("")}<button class="mini-button remember" title="加入间隔背诵">◎</button><button class="mini-button lock" title="${t.locked?"取消锁定":"锁定在这一天"}">${t.locked?"◆":"◇"}</button><button class="mini-button defer" title="仅将此任务顺延一天并平衡后续">→</button><button class="mini-button edit" title="编辑">✎</button><button class="mini-button remove" title="删除">×</button></div>
  </div>`}).join("");
}

function resourcesForTask(task){
  const localAllowed=typeof location==="undefined"||location.protocol==="file:"||location.hostname==="localhost"||location.hostname==="127.0.0.1";
  if(task.subject==="英语"){
    if(task.title.includes("词汇")||task.title.includes("单词")) return [];
    if(task.title.includes("2022")) return [{label:"在线题",href:"https://news.koolearn.com/20211226/1251849.html"}];
    if(!localAllowed)return [];
    if(task.title.includes("作文")) return [{label:"作文",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/一只鱼的资料pay/英语作文/")}];
    if(task.title.includes("2020")) return [{label:"题卷",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/英语/英语一真题/01_题卷/2020年考研英语一真题.pdf")}];
    if(/201\d/.test(task.title)) return [{label:"题卷",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/英语/英语一真题/01_题卷/2010-2019年考研英语一真题集.pdf")},{label:"解析",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/英语/英语一真题/02_答案解析/")}];
    return [{label:"英语资料",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/英语/英语一真题/")}];
  }
  if(!localAllowed)return [];
  if(task.subject==="354") return [
    {label:"理解笔记",title:"一只鱼现汉笔记（第一次理解）",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/一只鱼的资料pay/专一/现汉/笔记/现汉笔记（修改学姐的）.docx")},
    {label:"丸子全稿",title:"客观题PDF16—149页；简答题PDF150—261页",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/丸子/黄廖现汉全稿【11.6版前95页已检查】(1).pdf")},
    {label:"章节测试",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/丸子/黄廖现代汉语测试.pdf")}
  ];
  if(task.subject==="445"&&!task.title.includes("文化")) return [
    {label:"丸子引论",title:"61页主线版本",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/丸子/引论 （我用的这个）.pdf")},
    {label:"一只鱼补充",title:"只用于查漏，不逐字背",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/一只鱼的资料pay/专二/教引/引论 （我用的这个）.docx")},
    {label:"真题分析",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/一只鱼的资料pay/真题分析/汉语国际教育基础真题分析 (2).pdf")}
  ];
  if(task.subject==="445"||task.subject==="文化") return [
    {label:"程版要略",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/丸子/程版要略芝士条块（发送版）.pdf")},
    {label:"填空题",href:encodeURI("file:///C:/Users/Administrator/Desktop/汉教/丸子/《中国文化要略》第五版填空题.pdf")}
  ];
  return [];
}

function renderRolloverNotice(){
  const day=dayData(selectedDate), carried=day.tasks.filter(t=>t.rollCount&&!t.done), planned=sum(day.tasks.map(t=>t.hours)), over=Math.max(0,planned-capacityForDate(selectedDate)), el=document.querySelector("#rolloverNotice");
  const messages=[];
  if(day.leave) messages.push("这一天已标记为请假日，未完成任务已经顺延。");
  if(carried.length) messages.push(`今天有 <strong>${carried.length}</strong> 项前序任务，旧任务优先完成。`);
  if(over>0) messages.push(`当前计划超过日目标 <strong>${fmt(over)} 小时</strong>；做不完可用任务右侧 → 继续顺延。`);
  el.hidden=!messages.length; el.innerHTML=messages.join(" ");
}

function snapshotRoll(){ lastRollSnapshot=JSON.stringify(data.days); document.querySelector("#undoRollBtn").disabled=false; }
function moveTaskForwardRaw(fromDate,taskId){
  const from=dayData(fromDate), index=from.tasks.findIndex(t=>t.id===taskId); if(index<0)return false;
  const [task]=from.tasks.splice(index,1), toDate=addDays(fromDate,1), to=dayData(toDate);
  to.tasks.push({...task,done:false,originDate:task.originDate||fromDate,rolledFrom:fromDate,rollCount:(task.rollCount||0)+1,scheduledDate:toDate});
  to.tasks.sort((a,b)=>a.time.localeCompare(b.time)); return true;
}
function displacementCandidates(date){
  return dayData(date).tasks.filter(t=>!t.done&&!t.locked).sort((a,b)=>{
    const origin=(b.originDate||date).localeCompare(a.originDate||date); if(origin)return origin;
    const priority=Number(a.priority||2)-Number(b.priority||2); if(priority)return priority;
    return b.time.localeCompare(a.time);
  });
}
function rebalanceFrom(startDate,maxDays=240){
  let date=startDate,moved=0,unresolved=0,lastDate=startDate;
  for(let guard=0;guard<maxDays;guard++){
    const day=dayData(date),capacity=capacityForDate(date); let planned=sum(day.tasks.map(t=>t.hours)), localGuard=0;
    while(planned>capacity+.001&&localGuard++<100){
      const candidate=displacementCandidates(date)[0];
      if(!candidate){unresolved=planned-capacity;break;}
      moveTaskForwardRaw(date,candidate.id); moved++; planned=sum(day.tasks.map(t=>t.hours)); lastDate=addDays(date,1);
    }
    if(unresolved>0)break;
    const next=addDays(date,1), nextPlanned=sum(dayData(next).tasks.map(t=>t.hours));
    if(nextPlanned<=capacityForDate(next)+.001)break;
    date=next;
  }
  data.pipelineLastDate=lastDate; return {moved,unresolved,lastDate};
}
function moveTaskForward(fromDate,taskId,withSnapshot=true){
  if(withSnapshot)snapshotRoll();
  if(!moveTaskForwardRaw(fromDate,taskId))return false;
  rebalanceFrom(addDays(fromDate,1)); return true;
}
function rollOpenTasks(fromDate,reason="顺延"){
  const ids=dayData(fromDate).tasks.filter(t=>!t.done).map(t=>t.id); if(!ids.length)return 0;
  snapshotRoll(); ids.forEach(id=>moveTaskForwardRaw(fromDate,id)); rebalanceFrom(addDays(fromDate,1));
  dayData(fromDate).rollReason=reason;dayData(fromDate).rolledAt=new Date().toISOString(); return ids.length;
}
function autoRolloverToToday(){
  if(!data.settings.autoRollover){data.lastAutoRollDate=todayISO();return;}
  let cursor=data.lastAutoRollDate||todayISO(), changed=false, advanced=cursor<todayISO();
  while(cursor<todayISO()){
    if(data.days[cursor]) changed=rollOpenTasks(cursor,"自动滚动")>0||changed;
    cursor=addDays(cursor,1);
  }
  data.lastAutoRollDate=todayISO(); if(changed||advanced)localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function migratePipelineIfNeeded(){
  if(!data.needsPipelineMigration)return;
  const overloaded=Object.keys(data.days).sort().find(date=>date>=todayISO()&&sum(dayData(date).tasks.map(t=>t.hours))>capacityForDate(date)+.001);
  if(overloaded)rebalanceFrom(overloaded);
  delete data.needsPipelineMigration;localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function resetZeroPlanIfNeeded(){
  if(!data.needsZeroReset)return;
  data.preservedNotes=data.preservedNotes||{};Object.keys(data.days).filter(date=>date>="2026-06-22").forEach(date=>{if(data.days[date]?.note)data.preservedNotes[date]=data.days[date].note;delete data.days[date];});
  delete data.pipelineLastDate;delete data.needsZeroReset;delete data.needsPipelineMigration;data.lastAutoRollDate=todayISO();localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function resetMaterialPlanIfNeeded(){
  if(!data.needsMaterialReset)return;
  data.preservedNotes=data.preservedNotes||{};
  Object.keys(data.days).filter(date=>date>=todayISO()).forEach(date=>{
    const day=data.days[date],hasCompleted=(day?.tasks||[]).some(t=>t.done);
    if(hasCompleted)return;
    if(day?.note)data.preservedNotes[date]=day.note;
    delete data.days[date];
  });
  delete data.needsMaterialReset;delete data.pipelineLastDate;data.lastAutoRollDate=todayISO();localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function renderQueue(){
  let html="",overDays=0,carried=0,total=0;
  for(let i=0;i<7;i++){
    const date=addDays(selectedDate,i),tasks=dayData(date).tasks,hours=sum(tasks.map(t=>t.hours)),capacity=capacityForDate(date),rolls=tasks.filter(t=>t.rollCount&&!t.done).length,pct=Math.min(100,hours/capacity*100),cls=hours>capacity+.001?"over":hours>capacity*.9?"warn":"";
    if(hours>capacity+.001)overDays++;carried+=rolls;total+=hours;
    html+=`<div class="queue-row"><span>${date.slice(5)}${i===0?" · 今":""}</span><div class="queue-track"><div class="queue-fill ${cls}" style="width:${pct}%"></div></div><span class="queue-hours">${fmt(hours)}h</span></div>`;
  }
  document.querySelector("#queueList").innerHTML=html;
  document.querySelector("#queueSummary").innerHTML=`<span>7天 ${fmt(total)}h</span><span>顺延 ${carried}项 · 超载 ${overDays}天</span>`;
}
function setMinimumDay(date){
  const day=dayData(date),open=day.tasks.filter(t=>!t.done).sort((a,b)=>Number(b.priority||2)-Number(a.priority||2)||(a.originDate||date).localeCompare(b.originDate||date)||a.time.localeCompare(b.time));
  let kept=sum(day.tasks.filter(t=>t.done).map(t=>t.hours));const move=[];for(const task of open){if(kept+Number(task.hours)<=3.5||(kept===0&&move.length===0))kept+=Number(task.hours);else move.push(task.id);}
  if(!move.length)return 0;snapshotRoll();move.forEach(id=>moveTaskForwardRaw(date,id));rebalanceFrom(addDays(date,1));day.minimumDay=true;return move.length;
}

function renderMetrics(){
  const tasks = dayData(selectedDate).tasks, planned = sum(tasks.map(t=>t.hours)), completed = sum(tasks.filter(t=>t.done).map(t=>t.hours));
  const pct = planned ? Math.round(completed/planned*100) : 0;
  document.querySelector("#plannedHours").textContent = fmt(planned);
  document.querySelector("#completedHours").textContent = fmt(completed);
  document.querySelector("#progressPercent").textContent = `${pct}%`;
  document.querySelector("#progressRing").style.setProperty("--progress", `${pct*3.6}deg`);
  document.querySelector("#progressMessage").textContent = pct===100 ? "今天收工。真正的复利来自按时结束。" : pct>=60 ? "已经过半，守住节奏，不临时加戏。" : "先完成第一块，状态会跟上来。";
  const capacity=capacityForDate(selectedDate);document.querySelector("#dailyTargetLabel").textContent = capacity===data.settings.dailyTarget?`${capacity} 小时`:`当前 ${capacity}h · 最终 ${data.settings.dailyTarget}h`;
  document.querySelector("#countdownDays").textContent = Math.max(0, Math.ceil((new Date(data.settings.examDate)-new Date(`${selectedDate}T00:00:00`))/86400000));
  document.querySelector("#streakDays").textContent = streakEnding(selectedDate);
}

function renderWeek(){
  const d = new Date(`${selectedDate}T12:00:00`), offset = d.getDay()===0?6:d.getDay()-1, monday = new Date(d); monday.setDate(d.getDate()-offset);
  let total=0, html="";
  for(let i=0;i<7;i++){ const x=new Date(monday); x.setDate(monday.getDate()+i); const iso=x.toLocaleDateString("sv-SE"), tasks=data.days[iso]?.tasks||[], hours=sum(tasks.filter(t=>t.done).map(t=>t.hours)); total+=hours; const pct=Math.min(100,hours/capacityForDate(iso)*100); html+=`<div class="day-bar"><span>${fmt(hours)}h</span><div class="bar-track"><div class="bar-fill" style="height:${pct}%"></div></div><b>周${weekdayNames[x.getDay()]}</b></div>`; }
  document.querySelector("#weekBars").innerHTML=html; document.querySelector("#weekHours").textContent=`${fmt(total)} / ${weeklyTargetForDate(selectedDate)}h`;
}
function addDays(date,days){ const d=new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return d.toLocaleDateString("sv-SE"); }
function addReviewUnit(subject,title,answer=[]){
  const existing=data.reviewUnits.find(u=>!u.mastered&&u.subject===subject&&u.title===title);
  if(existing){ existing.dueDate=selectedDate; existing.mastered=false;if(answer?.length)existing.answer=answer; }
  else data.reviewUnits.push({id:uid(),subject,title,answer,createdDate:selectedDate,dueDate:selectedDate,stage:0,mastered:false,history:[]});
  saveData(); renderReviews();
}
function dueReviews(){ return data.reviewUnits.filter(u=>!u.mastered&&u.dueDate<=selectedDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)); }
function renderReviews(){
  const due=dueReviews(), active=data.reviewUnits.filter(u=>!u.mastered).length, mastered=data.reviewUnits.filter(u=>u.mastered).length;
  document.querySelector("#reviewSummary").innerHTML=`<span>今日到期 <strong>${due.length}</strong></span><span>进行中 ${active} · 已掌握 ${mastered}</span>`;
  const el=document.querySelector("#reviewList");
  if(!due.length){el.innerHTML='<div class="review-empty">今天没有到期单元。<br>学完一个小节后，点任务右侧的 ◎ 加入背诵。</div>';return;}
  el.innerHTML=due.map(u=>`<div class="review-item" data-review-id="${u.id}"><div class="review-item-top"><div><span class="subject-pill">${esc(u.subject)}</span><div class="review-title">${esc(u.title)}</div></div><div class="review-meta">第 ${Math.min(u.stage+1,REVIEW_OFFSETS.length)} / ${REVIEW_OFFSETS.length} 次 <button class="review-delete" title="删除">×</button></div></div>${u.answer?.length?`<details class="culture-answer"><summary>完成回忆后查看答题骨架</summary><ol>${u.answer.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></details>`:""}<div class="review-rating"><button class="rating-button again" data-rating="again">不会</button><button class="rating-button hard" data-rating="hard">模糊</button><button class="rating-button good" data-rating="good">会了</button></div></div>`).join("");
}
const cultureUnits=globalThis.CULTURE_UNITS||[];
function initCultureDeck(){
  const chapters=[...new Set(cultureUnits.map(x=>x.chapter))];document.querySelector("#cultureChapter").innerHTML='<option value="all">全部专题</option>'+chapters.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");renderCultureDeck();
}
function renderCultureDeck(){
  const q=(document.querySelector("#cultureSearch").value||"").trim().toLowerCase(),chapter=document.querySelector("#cultureChapter").value||"all",list=cultureUnits.filter(u=>(chapter==="all"||u.chapter===chapter)&&(!q||`${u.title} ${u.question} ${u.keywords.join(" ")}`.toLowerCase().includes(q)));
  document.querySelector("#cultureCount").textContent=`${list.length} / ${cultureUnits.length} 个单元`;
  document.querySelector("#cultureList").innerHTML=list.map((u,i)=>`<article class="culture-unit" data-culture-title="${esc(u.title)}"><div class="culture-unit-head"><div><span class="subject-pill">${esc(u.chapter)}</span><h3>${esc(u.title)}</h3></div><span class="culture-source">${esc(u.source)}</span></div><div class="culture-keywords">${u.keywords.map(k=>`<span>${esc(k)}</span>`).join("")}</div><p class="culture-question">${esc(u.question)}</p><div class="culture-answer" hidden><ol>${u.answer.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div><div class="culture-actions"><button class="ghost-button culture-reveal">显示答题骨架</button><button class="primary-button culture-add">加入间隔背诵</button></div></article>`).join("")||'<div class="empty-state">没有匹配的文化单元。</div>';
}
function updateInstallCard(){
  const card=document.querySelector("#installCard");card.hidden=Boolean(data.settings.hideInstallCard);const secure=typeof location!=="undefined"&&(location.protocol==="https:"||location.hostname==="localhost"),standalone=typeof matchMedia!=="undefined"&&matchMedia("(display-mode: standalone)").matches;document.querySelector("#installStatus").textContent=standalone?"已作为主屏幕应用运行。":secure?"已经具备安装条件：请使用 Safari 的分享菜单。":"当前是电脑本地版，发布到 HTTPS 后即可安装。";
}
function rateReview(unit,rating){
  unit.history.push({date:selectedDate,rating,stage:unit.stage});
  if(rating==="again"){unit.stage=Math.max(0,unit.stage-1);unit.dueDate=addDays(selectedDate,1);}
  else if(rating==="hard"){unit.dueDate=addDays(selectedDate,1);}
  else {unit.stage+=1;if(unit.stage>=REVIEW_OFFSETS.length){unit.mastered=true;unit.dueDate="9999-12-31";}else{const gap=REVIEW_OFFSETS[unit.stage]-REVIEW_OFFSETS[unit.stage-1];unit.dueDate=addDays(selectedDate,Math.max(1,gap));}}
  saveData(); renderReviews();
}
function streakEnding(date){ let count=0, d=new Date(`${date}T12:00:00`); for(let i=0;i<365;i++){ const iso=d.toLocaleDateString("sv-SE"), tasks=data.days[iso]?.tasks||[], planned=sum(tasks.map(t=>t.hours)), hours=sum(tasks.filter(t=>t.done).map(t=>t.hours)), target=Math.min(capacityForDate(iso),planned); if(target>0&&hours>=target) count++; else break; d.setDate(d.getDate()-1); } return count; }
function sum(arr){ return arr.reduce((a,b)=>a+Number(b||0),0); } function fmt(n){ return Number(n.toFixed(2)).toString(); }
function flashSaved(){ const el=document.querySelector("#saveStatus"); el.textContent="已自动保存"; el.animate([{opacity:.3},{opacity:1}],{duration:300}); }
function changeDate(delta){ const d=new Date(`${selectedDate}T12:00:00`); d.setDate(d.getDate()+delta); selectedDate=d.toLocaleDateString("sv-SE"); saveData(); render(); }

function openTaskDialog(task){
  document.querySelector("#dialogTitle").textContent=task?"编辑任务":"添加任务";
  document.querySelector("#editTaskId").value=task?.id||""; document.querySelector("#taskSubject").value=task?.subject||"354"; document.querySelector("#taskTitle").value=task?.title||""; document.querySelector("#taskTime").value=task?.time||"09:00"; document.querySelector("#taskHours").value=task?.hours||1; document.querySelector("#taskDeliverable").value=task?.deliverable||""; document.querySelector("#taskPriority").value=String(task?.priority||3);
  document.querySelector("#taskDialog").showModal();
}

document.querySelector("#prevDay").onclick=()=>changeDate(-1); document.querySelector("#nextDay").onclick=()=>changeDate(1); document.querySelector("#todayBtn").onclick=()=>{selectedDate=todayISO();saveData();render();};
document.querySelector("#datePicker").onchange=e=>{selectedDate=e.target.value;saveData();render();};
document.querySelector("#taskFilter").onchange=e=>{filter=e.target.value;renderTasks();};
document.querySelector("#addTaskBtn").onclick=()=>openTaskDialog();
document.querySelector("#closeTaskDialog").onclick=()=>document.querySelector("#taskDialog").close(); document.querySelector("#cancelTaskBtn").onclick=()=>document.querySelector("#taskDialog").close();
document.querySelector("#taskList").onclick=e=>{ const item=e.target.closest(".task-item"); if(!item)return; const tasks=dayData(selectedDate).tasks, task=tasks.find(t=>t.id===item.dataset.id); if(e.target.matches("input[type=checkbox]")){task.done=e.target.checked;saveData();render();} if(e.target.closest(".open-culture")){renderCultureDeck();document.querySelector("#cultureDialog").showModal();} if(e.target.closest(".remember"))addReviewUnit(task.subject,task.title); if(e.target.closest(".lock")){task.locked=!task.locked;saveData();render();} if(e.target.closest(".defer")){moveTaskForward(selectedDate,task.id);saveData();render();} if(e.target.closest(".edit"))openTaskDialog(task); if(e.target.closest(".remove")){dayData(selectedDate).tasks=tasks.filter(t=>t.id!==task.id);saveData();render();} };
document.querySelector("#taskList").onchange=e=>{if(!e.target.matches(".task-time-input"))return;const item=e.target.closest(".task-item"),task=dayData(selectedDate).tasks.find(t=>t.id===item.dataset.id);task.time=e.target.value;task.customTime=true;saveData();render();};
document.querySelector("#taskForm").onsubmit=e=>{ e.preventDefault(); const id=document.querySelector("#editTaskId").value, tasks=dayData(selectedDate).tasks, old=tasks.find(t=>t.id===id), next={...(old||{}),id:id||uid(),subject:document.querySelector("#taskSubject").value,title:document.querySelector("#taskTitle").value.trim(),time:document.querySelector("#taskTime").value,hours:Number(document.querySelector("#taskHours").value),deliverable:document.querySelector("#taskDeliverable").value.trim(),priority:Number(document.querySelector("#taskPriority").value),originDate:old?.originDate||selectedDate,locked:old?.locked||false,done:old?.done||false}; const idx=tasks.findIndex(t=>t.id===id); if(idx>=0)tasks[idx]=next; else tasks.push(next); tasks.sort((a,b)=>a.time.localeCompare(b.time)); document.querySelector("#taskDialog").close(); saveData(); render(); };
document.querySelector("#dailyNote").oninput=e=>{dayData(selectedDate).note=e.target.value;saveData();};
document.querySelector("#addReviewBtn").onclick=()=>document.querySelector("#reviewDialog").showModal(); document.querySelector("#closeReviewDialog").onclick=()=>document.querySelector("#reviewDialog").close(); document.querySelector("#cancelReviewBtn").onclick=()=>document.querySelector("#reviewDialog").close();
document.querySelector("#reviewForm").onsubmit=e=>{e.preventDefault();addReviewUnit(document.querySelector("#reviewSubject").value,document.querySelector("#reviewTitle").value.trim());document.querySelector("#reviewTitle").value="";document.querySelector("#reviewDialog").close();};
document.querySelector("#reviewList").onclick=e=>{const item=e.target.closest(".review-item");if(!item)return;const unit=data.reviewUnits.find(u=>u.id===item.dataset.reviewId);if(e.target.closest(".review-delete")){data.reviewUnits=data.reviewUnits.filter(u=>u.id!==unit.id);saveData();renderReviews();return;}const rating=e.target.dataset.rating;if(rating)rateReview(unit,rating);};
document.querySelector("#cultureDeckBtn").onclick=()=>{renderCultureDeck();document.querySelector("#cultureDialog").showModal();};document.querySelector("#closeCultureDialog").onclick=()=>document.querySelector("#cultureDialog").close();
document.querySelector("#cultureSearch").oninput=renderCultureDeck;document.querySelector("#cultureChapter").onchange=renderCultureDeck;
document.querySelector("#cultureList").onclick=e=>{const card=e.target.closest(".culture-unit");if(!card)return;const unit=cultureUnits.find(u=>u.title===card.dataset.cultureTitle);if(e.target.closest(".culture-reveal")){const answer=card.querySelector(".culture-answer"),button=e.target.closest(".culture-reveal");answer.hidden=!answer.hidden;button.textContent=answer.hidden?"显示答题骨架":"隐藏答题骨架";}if(e.target.closest(".culture-add")){addReviewUnit("文化",`${unit.title}｜${unit.question}`,unit.answer);e.target.closest(".culture-add").textContent="已加入今天";}};
document.querySelector("#hideInstallBtn").onclick=()=>{data.settings.hideInstallCard=true;saveData();render();};
document.querySelector("#resetDayBtn").onclick=()=>{if(confirm("恢复当天默认计划？当天自定义任务和完成状态会被替换。")){data.days[selectedDate]={tasks:defaultTasks(selectedDate),note:""};saveData();render();}};
document.querySelector("#rolloverBtn").onclick=()=>{const count=rollOpenTasks(selectedDate,"手动滚动");if(!count){alert("当天没有未完成任务。");return;}saveData();render();};
document.querySelector("#leaveBtn").onclick=()=>{const current=dayData(selectedDate);current.leave=true;const count=rollOpenTasks(selectedDate,"请假");current.note=`【请假】${current.note||""}`.trim();saveData();render();alert(count?`已标记请假，并将 ${count} 项未完成任务顺延到明天。`:"已标记请假；当天没有需要顺延的任务。");};
document.querySelector("#minimumDayBtn").onclick=()=>{const count=setMinimumDay(selectedDate);if(!count){alert("当天任务已经不超过保底容量，无需压缩。");return;}saveData();render();};
document.querySelector("#reflowDayBtn").onclick=()=>{reflowTasks(dayData(selectedDate).tasks);dayData(selectedDate).tasks.forEach(t=>t.customTime=false);saveData();render();};
document.querySelector("#rebalanceBtn").onclick=()=>{snapshotRoll();const result=rebalanceFrom(selectedDate);saveData();render();if(result.unresolved>0)alert("存在已完成或锁定任务造成的超载，请取消锁定或调整时长。");};
document.querySelector("#undoRollBtn").onclick=()=>{if(!lastRollSnapshot)return;data.days=JSON.parse(lastRollSnapshot);lastRollSnapshot=null;document.querySelector("#undoRollBtn").disabled=true;saveData();render();};
document.querySelector("#themeToggle").onclick=()=>{data.settings.theme=data.settings.theme==="dark"?"light":"dark";saveData();render();};
document.querySelector("#settingsBtn").onclick=()=>{document.querySelector("#studyStartDateInput").value=data.settings.studyStartDate||todayISO();document.querySelector("#dailyTargetInput").value=data.settings.dailyTarget;document.querySelector("#weeklyTargetInput").value=data.settings.weeklyTarget;document.querySelector("#examDateInput").value=data.settings.examDate;document.querySelector("#morningStartInput").value=data.settings.morningStart;document.querySelector("#afternoonStartInput").value=data.settings.afternoonStart;document.querySelector("#eveningStartInput").value=data.settings.eveningStart;document.querySelector("#breakMinutesInput").value=data.settings.breakMinutes;document.querySelector("#autoRolloverInput").checked=data.settings.autoRollover!==false;document.querySelector("#settingsDialog").showModal();};
document.querySelector("#closeSettingsDialog").onclick=()=>document.querySelector("#settingsDialog").close(); document.querySelector("#cancelSettingsBtn").onclick=()=>document.querySelector("#settingsDialog").close();
document.querySelector("#settingsForm").onsubmit=e=>{e.preventDefault();const previousStart=data.settings.studyStartDate;data.settings.studyStartDate=document.querySelector("#studyStartDateInput").value||todayISO();data.settings.dailyTarget=Number(document.querySelector("#dailyTargetInput").value);data.settings.weeklyTarget=Number(document.querySelector("#weeklyTargetInput").value);data.settings.examDate=document.querySelector("#examDateInput").value;data.settings.morningStart=document.querySelector("#morningStartInput").value||"08:30";data.settings.afternoonStart=document.querySelector("#afternoonStartInput").value||"13:30";data.settings.eveningStart=document.querySelector("#eveningStartInput").value||"19:00";data.settings.breakMinutes=Number(document.querySelector("#breakMinutesInput").value||20);data.settings.autoRollover=document.querySelector("#autoRolloverInput").checked;data.lastAutoRollDate=todayISO();if(previousStart!==data.settings.studyStartDate){Object.keys(data.days).filter(date=>date>=todayISO()&&!(data.days[date]?.tasks||[]).some(t=>t.done)).forEach(date=>delete data.days[date]);selectedDate=data.settings.studyStartDate;}document.querySelector("#settingsDialog").close();saveData();render();};
document.querySelector("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`复旦备考计划-${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href);};
document.querySelector("#importInput").onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{data=normalizeData(JSON.parse(reader.result));saveData();render();}catch{alert("备份文件无法识别。");}};reader.readAsText(file);};

resetZeroPlanIfNeeded();
resetMaterialPlanIfNeeded();
autoRolloverToToday();
migratePipelineIfNeeded();
initCultureDeck();
render();
if(typeof navigator!=="undefined"&&"serviceWorker" in navigator&&typeof location!=="undefined"&&location.protocol!=="file:")navigator.serviceWorker.register("./sw.js").catch(()=>{});
