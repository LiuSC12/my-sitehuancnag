(function(){
var canvas=document.getElementById('bgCanvas');
if(!canvas) return;
var ctx=canvas.getContext('2d');
var W=0,H=0,DPR=1,t=0;
var bamboos=[],smokeParticles=[],smokeSources=[],dusts=[];
var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function makeBamboo(x,side,idx){
  var baseY=H+20,topY=H*(0.28+Math.random()*0.16);
  var segCount=7+Math.floor(Math.random()*3),segH=(baseY-topY)/segCount,leaves=[];
  var lc=12+Math.floor(Math.random()*8);
  for(var i=0;i<lc;i++){leaves.push({segIdx:2+Math.floor(Math.random()*(segCount-1)),side:Math.random()<0.55?side:-side,len:26+Math.random()*42,ang:(Math.random()-0.5)*0.9,phase:Math.random()*Math.PI*2,size:0.55+Math.random()*0.7,drop:Math.random()*10-5});}
  return{x:x,side:side,baseY:baseY,segCount:segCount,segH:segH,leaves:leaves,phase:Math.random()*Math.PI*2,speed:0.00045+Math.random()*0.00035,sway:3+idx*0.6+Math.random()*2};
}
function buildBamboo(){bamboos=[];var w=W||1200,c=(w<600)?2:3;
  for(var i=0;i<c;i++){bamboos.push(makeBamboo(-10+i*46+Math.random()*14,1,i));}
  for(var j=0;j<c;j++){bamboos.push(makeBamboo(w+10-j*46-Math.random()*14,-1,j));}}
function buildSmoke(){var w=W||1200,h=H||800;smokeSources=[{x:w*0.14,y:h+6},{x:w*0.5,y:h+6},{x:w*0.86,y:h+6}];smokeParticles=[];}
function buildDusts(){var w=W||1200,h=H||800;dusts=[];var n=Math.max(14,Math.min(26,Math.floor(w/60)));
  for(var i=0;i<n;i++){dusts.push({x:Math.random()*w,y:Math.random()*h,r:0.4+Math.random()*1.1,vx:(Math.random()-0.5)*0.05,vy:-0.03-Math.random()*0.07,phase:Math.random()*Math.PI*2,alpha:0.06+Math.random()*0.12,drift:0.1+Math.random()*0.25});}}
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=canvas.clientWidth||window.innerWidth;H=canvas.clientHeight||window.innerHeight;canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);buildBamboo();buildSmoke();buildDusts();}
function drawBamboo(){for(var bi=0;bi<bamboos.length;bi++){var b=bamboos[bi];var gs=Math.sin(t*b.speed+b.phase)*b.sway;var pts=[];
  for(var i=0;i<=b.segCount;i++){var p=i/b.segCount;var curve=p*p*(0.6+p*0.6);var lean=(b.side>0?-1:1)*curve*14;pts.push({x:b.x+lean+gs*curve,y:b.baseY-i*b.segH});}
  ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
  for(var k=1;k<pts.length;k++){var prev=pts[k-1],cur=pts[k];var mx=(prev.x+cur.x)/2,my=(prev.y+cur.y)/2;ctx.quadraticCurveTo(prev.x,prev.y,mx,my);}
  ctx.strokeStyle='rgba(78,96,58,0.085)';ctx.lineWidth=1.7;ctx.lineCap='round';ctx.stroke();
  ctx.lineWidth=0.75;ctx.strokeStyle='rgba(78,96,58,0.06)';
  for(var s=1;s<pts.length-1;s++){var pt=pts[s];var nx=b.side>0?-1:1;ctx.beginPath();ctx.moveTo(pt.x-nx*4,pt.y+1);ctx.lineTo(pt.x+nx*4,pt.y-1);ctx.stroke();}
  for(var li=0;li<b.leaves.length;li++){var lf=b.leaves[li];var base=pts[lf.segIdx];if(!base) continue;
    var ls=Math.sin(t*b.speed*1.7+lf.phase)*7;var dir=lf.side;var angle=(dir>0?-0.55:Math.PI+0.55)+lf.ang*0.55;var len=lf.len*lf.size;
    var tipX=base.x+Math.cos(angle)*len+ls+gs*0.4;var tipY=base.y+Math.sin(angle)*len*0.55-len*0.35+lf.drop;
    var midX=(base.x+tipX)/2+Math.sin(angle+1.4)*len*0.18;var midY=(base.y+tipY)/2+Math.cos(angle+1.4)*len*0.14;
    ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.quadraticCurveTo(midX,midY,tipX,tipY);ctx.quadraticCurveTo(midX,midY,base.x,base.y);
    ctx.fillStyle='rgba(78,102,58,0.055)';ctx.fill();ctx.strokeStyle='rgba(78,102,58,0.075)';ctx.lineWidth=0.55;ctx.stroke();}}}
function updateSmoke(){for(var si=0;si<smokeSources.length;si++){var s=smokeSources[si];if(Math.random()<0.14&&smokeParticles.length<140){smokeParticles.push({x:s.x+(Math.random()-0.5)*8,y:s.y,vx:(Math.random()-0.5)*0.14,vy:-0.28-Math.random()*0.32,r:1.8+Math.random()*3.2,life:1,decay:0.0024+Math.random()*0.0032,phase:Math.random()*Math.PI*2,swirl:0.25+Math.random()*0.55});}}
  for(var i=smokeParticles.length-1;i>=0;i--){var p=smokeParticles[i];p.y+=p.vy;p.x+=p.vx+Math.sin(t*0.0009+p.phase)*p.swirl*0.32;p.life-=p.decay;p.r+=0.16;if(p.life<=0||p.y<-60){smokeParticles.splice(i,1);}}}
function drawSmoke(){for(var i=0;i<smokeParticles.length;i++){var p=smokeParticles[i];var a=p.life*0.055;var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,'rgba(186,164,120,'+a+')');g.addColorStop(0.55,'rgba(186,164,120,'+(a*0.5)+')');g.addColorStop(1,'rgba(186,164,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}}
function updateDusts(){for(var i=0;i<dusts.length;i++){var p=dusts[i];p.x+=p.vx+Math.sin(t*0.0007+p.phase)*p.drift*0.5;p.y+=p.vy;if(p.y<-10){p.y=H+10;p.x=Math.random()*W;}if(p.x<-12)p.x=W+12;if(p.x>W+12)p.x=-12;}}
function drawDusts(){for(var i=0;i<dusts.length;i++){var p=dusts[i];var a=p.alpha*(0.55+0.45*Math.sin(t*0.0018+p.phase));ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(196,172,118,'+a+')';ctx.fill();}}
function loop(){t++;ctx.clearRect(0,0,W,H);drawBamboo();updateSmoke();drawSmoke();updateDusts();drawDusts();requestAnimationFrame(loop);}
resize();window.addEventListener('resize',resize);
if(reduceMotion){ctx.clearRect(0,0,W,H);drawBamboo();drawSmoke();drawDusts();}else{requestAnimationFrame(loop);}
})();

var LS_ITEMS='wenwan_items_v1';
var LS_MSGS='wenwan_messages_v1';
var LS_FAV='wenwan_fav_v1';
var LS_WANTS='wenwan_wants_v1';
var LS_COMMENTS='wenwan_comments_v1';
var LS_HISTORY='wenwan_history_v1';
var LS_POSTS='wenwan_posts_v1';
var LS_POST_LIKES='wenwan_post_likes_v1';
var LS_POST_CMTS='wenwan_post_cmts_v1';
var LS_USER='wenwan_user_v1';
var LS_SIGNIN='wenwan_signin_v1';
var LS_NOTIF='wenwan_notif_v1';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function $(s){return document.querySelector(s);}
function $all(s){return document.querySelectorAll(s);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var toastTimer;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show');},2200);}
function ph(text,hue){
  var svg="<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl("+hue+",20%,91%)'/><stop offset='1' stop-color='hsl("+hue+",24%,75%)'/></linearGradient></defs><rect width='900' height='900' fill='url(%23g)'/><rect x='42' y='42' width='816' height='816' fill='none' stroke='rgba(255,255,255,.5)' stroke-width='1.5'/><text x='450' y='478' font-family='sans-serif' font-size='56' fill='rgba(72,58,42,.5)' text-anchor='middle' letter-spacing='6'>"+text+"</text></svg>";
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg).replace(/#/g,'%23');
}
function nowTime(){var d=new Date();var h=d.getHours(),m=d.getMinutes();return (h<10?'0':'')+h+':'+(m<10?'0':'')+m;}
function parsePrice(p){var n=String(p||'').replace(/[^\d.]/g,'');var v=parseFloat(n);return isNaN(v)?-1:v;}
function dateOf(ts){var d=new Date(ts||Date.now());var m=d.getMonth()+1,day=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(day<10?'0':'')+day;}
function fmtDate(s){var p=String(s).split('-');if(p.length<3)return s;return p[0]+'.'+(+p[1])+'.'+(+p[2]);}
function timeAgo(ts){var s=(Date.now()-ts)/1000;if(s<60)return '刚刚';if(s<3600)return Math.floor(s/60)+'分钟前';if(s<86400)return Math.floor(s/3600)+'小时前';if(s<2592000)return Math.floor(s/86400)+'天前';return fmtDate(dateOf(ts));}
function pad2(n){return n<10?'0'+n:''+n;}
function todayKey(){var d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}

var DEFAULT_ITEMS=[
  {id:'a1',name:'和田玉籽料 · 平安无事牌',category:'玉器',era:'清',material:'和田玉',size:'5.2 × 3.6 × 1.0 cm',price:'议价',status:'可交流',desc:'籽料细腻油润，毛孔自然，留皮巧雕。背面素面无事，寓意平安顺遂。手感温润，适合把玩佩戴。',images:[ph('无事牌',34)],createdAt:Date.now()-86400000*6,views:128,saleMode:'fixed',certNo:'SH-2026-0912',certOrg:'馆主自鉴 · 附出具依据',certNote:'玉质细度、毛孔形态、雕工风格均符合清中期特征。',certImages:[ph('证书',34)]},
  {id:'a2',name:'老蜜蜡 · 鸡油黄圆珠',category:'珠串',era:'明清',material:'蜜蜡',size:'直径 1.8 cm ｜ 重 21.6 g',price:'¥ 8,800',status:'可交流',desc:'色泽鸡油黄，蜡质浓郁，云纹自然流淌。孔道老到，包浆温润。',images:[ph('蜜蜡珠',38)],createdAt:Date.now()-86400000*5,views:256,saleMode:'auction',auctionEnd:Date.now()+86400000*2,bids:[{user:'匿名藏友',price:8200,time:Date.now()-3600000},{user:'老周',price:8500,time:Date.now()-1800000}],certNo:'SH-2026-0911',certOrg:'馆主自鉴 · 附出具依据',certNote:'孔道内部氧化层自然，孔壁有螺旋痕，符合老蜡特征。',certImages:[ph('证书',38)]},
  {id:'a3',name:'小叶紫檀 · 金星手串',category:'木作',era:'当代',material:'小叶紫檀',size:'2.0 cm × 12 颗',price:'¥ 3,200',status:'已结缘',desc:'印度老料，密度极高，满金星。棕眼细密，牛毛纹明显。',images:[ph('紫檀串',18)],createdAt:Date.now()-86400000*4,views:89,saleMode:'fixed',certNo:'—',certOrg:'当代作品 · 料质自鉴',certNote:'',certImages:[]},
  {id:'a4',name:'竹雕 · 松下问童子笔筒',category:'竹刻',era:'民国',material:'竹',size:'高 14.5 cm ｜ 径 10 cm',price:'自藏',status:'自藏',desc:'嘉定风格竹刻，刀法深峻。松针细密，人物神态生动。',images:[ph('竹笔筒',28)],createdAt:Date.now()-86400000*3,views:342,saleMode:'fixed',certNo:'SH-2026-0910',certOrg:'馆主自鉴 · 附出具依据',certNote:'刀口深峻，皮壳自然，符合民国嘉定风格。',certImages:[ph('证书',28)]},
  {id:'a5',name:'南红玛瑙 · 柿子红戒面',category:'玉石',era:'当代',material:'南红玛瑙',size:'1.6 × 1.2 cm',price:'¥ 1,680',status:'可交流',desc:'保山杨柳料，柿子红满色满肉，胶质感强。',images:[ph('南红戒面',8)],createdAt:Date.now()-86400000*2,views:167,saleMode:'fixed',certNo:'SH-2026-0909',certOrg:'馆主自鉴 · 附出具依据',certNote:'满色满肉，胶质感强，无裂。保山杨柳料典型特征。',certImages:[ph('证书',8)]},
  {id:'a6',name:'铜鎏金 · 瑞兽镇纸',category:'杂项',era:'明',material:'铜鎏金',size:'8.5 × 5.2 × 4.0 cm',price:'议价',status:'可交流',desc:'瑞兽伏卧，神态威猛。鎏金大部分留存，铜质精良。',images:[ph('鎏金镇纸',44)],createdAt:Date.now()-86400000,views:512,saleMode:'fixed',certNo:'SH-2026-0908',certOrg:'馆主自鉴 · 附出具依据',certNote:'铜质精良，鎏金留存自然，磨损过渡符合年代特征。',certImages:[ph('证书',44)]}
];

var RECORD_POOL=[
  {title:'和田玉籽料无事牌换出，换回一只清中老银香囊',tag:'换出',tagCls:'out',dealPrice:'补差 ¥800',text:'牌子在我手上待了快两年。老周磨了半个多月，最后拿一只清中老银香囊来换，我补了八百。东西现在搁案头，越看越顺眼。'},
  {title:'鸡油黄蜜蜡圆珠没换成，先留着',tag:'留馆',tagCls:'keep',dealPrice:'—',text:'本来想换一串老南红，对方上手一搓说孔道是后打的。回来自己拿放大镜看了半宿，确实新孔。这趟没换成，但把坑提前踩出来了。'},
  {title:'小叶紫檀 2.0 手串，换给了一个学生',tag:'换出',tagCls:'out',dealPrice:'换黄杨木尺',text:'一个学考古的学生攒了半年生活费，还差七百。最后没要钱，让他拿他姥爷留下的一把旧黄杨木尺来换。'},
  {title:'竹雕松下问童子笔筒换进，拿老铜香炉换的',tag:'换进',tagCls:'in',dealPrice:'换老铜香炉',text:'刀口是嘉定那边的路子，松针细密。磨了三回才松口，条件是我那只明代老铜香炉。'},
  {title:'南红戒面换出一对，换回老银耳钉',tag:'换出',tagCls:'out',dealPrice:'换民国银耳钉',text:'一对戒面，颜色正，没裂。做首饰的姐姐看上，拿一对民国掐丝缠枝莲的老银耳钉来换。'},
  {title:'鎏金瑞兽镇纸，自留，不换了',tag:'留馆',tagCls:'keep',dealPrice:'—',text:'挂出去之后五六个人来问，外地一个老板出价比我心里数还多两千。犹豫两天，没卖。'},
  {title:'年前一次大换，三件换一件',tag:'换出',tagCls:'out',dealPrice:'三换一 · 换和田玉小佛',text:'拿一串菩提、一个老铜墨盒、一只青花小碟，去跟老赵换那只和田玉小佛。去了三趟才点头。'},
  {title:'老铜墨盒换了一方小砚，双方都没补钱',tag:'换进',tagCls:'in',dealPrice:'不补差价',text:'对方是教书的老师，给他父亲找一方砚台配着用。我手里正好有方小端砚，一直没怎么用。'},
  {title:'清代玉扳指换出，换回一只建盏',tag:'换出',tagCls:'out',dealPrice:'补差 ¥1200',text:'扳指是和田青白玉，内径 2.1cm，带天然石纹。对方是位茶人，手里有一只柴烧建盏。'},
  {title:'黄杨木雕达摩立像，没换成，留着继续盘',tag:'留馆',tagCls:'keep',dealPrice:'—',text:'想换一件老瓷片挂件，问了三个人都没谈拢。达摩高 12cm，底款模糊，包浆确实一般。'},
  {title:'一条老山檀手串换了一方英石',tag:'换进',tagCls:'in',dealPrice:'不补差价',text:'山檀油性足，奶香明显，2.0cm 15 颗。对方是玩石的，手里一方英石山峰形，配红木座。'},
  {title:'老蜜蜡珠换出，对方拿了一串老南红',tag:'换出',tagCls:'out',dealPrice:'补差 ¥2000',text:'21.6g 鸡油黄单珠，换对方一串老南红 108 颗。补了两千，各回各家。'},
  {title:'一块和田青花籽料，没换成，改天再看',tag:'留馆',tagCls:'keep',dealPrice:'—',text:'青花聚墨，黑白分明，但有一道浅裂。对方开价太高，留着吧，好东西不急着出手。'},
  {title:'明代小铜香炉换进，拿两件杂项凑的',tag:'换进',tagCls:'in',dealPrice:'两换一',text:'香炉三足双耳，皮壳深褐，底款宣德年制但看着是明末仿。搁案头焚香正好。'},
  {title:'老竹刻臂搁换出，换回一枚老印章',tag:'换出',tagCls:'out',dealPrice:'不补差价',text:'臂搁是民国竹刻，刻的是兰草，长 22cm。对方有一枚青田石印章，边款清中期。'},
  {title:'一只老银香囊换出，换回一件小玉佛',tag:'换出',tagCls:'out',dealPrice:'补差 ¥600',text:'香囊是清中的，缠枝莲纹，鎏金还在。对方有一件和田玉小佛，高 3cm，白度不错。'},
  {title:'一块灵璧石没换成，太沉搬不动',tag:'留馆',tagCls:'keep',dealPrice:'—',text:'想拿它换一件老竹刻，对方看了照片也愿意。问题是石头三十多斤，来回搬太费劲。'},
  {title:'两枚古钱换了一件老铜镇纸',tag:'换进',tagCls:'in',dealPrice:'两换一',text:'一枚大观通宝，一枚康熙通宝，品相都还行。对方有一件铜镇纸，刻的是兰亭序。'}
];

var COMMENT_POOL=[
  {name:'老周 · 北京',text:'值了，那东西我媳妇一眼相中。好好收着。'},
  {name:'白露 · 上海',text:'城南那家茶馆吧？老板养橘猫那家，我也常去。'},
  {name:'老赵 · 天津',text:'补那点钱不亏，不好碰的东西。'},
  {name:'石头 · 成都',text:'你们换藏还带卡尺？太专业了。'},
  {name:'老李 · 西安',text:'孔道最容易吃药，我前年栽过一回。'},
  {name:'阿岩 · 广州',text:'能当面说清楚的都是实在人。'},
  {name:'木鱼 · 苏州',text:'做生意归做生意，人情归人情。'},
  {name:'老孙 · 杭州',text:'清末民初的东西，搁案头压纸正好。'},
  {name:'小满 · 长沙',text:'这种换法我服，比一口价卖出去有意思多了。'},
  {name:'云姐 · 广州',text:'谢谢割爱，东西已经镶好了。'},
  {name:'老木 · 沈阳',text:'老物件最难拍，等阴天试试。'},
  {name:'小陈 · 郑州',text:'谢谢叔！东西我天天戴着。'},
  {name:'老刘 · 武汉',text:'玩老件就是玩个心态，急不得。'},
  {name:'阿明 · 福州',text:'这种料现在市面上不多了。'},
  {name:'老金 · 济南',text:'照片看不太清细节，改天发高清的。'},
  {name:'小林 · 厦门',text:'收藏柜里都快塞不下了吧哈哈。'},
  {name:'老陶 · 无锡',text:'交个朋友比什么都强。'},
  {name:'梅子 · 重庆',text:'看你们换藏跟看小说一样。'},
  {name:'老高 · 青岛',text:'磨三回才点头，这耐心我是真服。'},
  {name:'小赵 · 天津',text:'这价格补得不亏。'},
  {name:'老吴 · 宁波',text:'多年以后回头看都是故事。'},
  {name:'大刘 · 哈尔滨',text:'看你们交流真是长见识。'},
  {name:'阿杰 · 深圳',text:'文玩这东西，喜欢就值。'},
  {name:'老徐 · 合肥',text:'这画面太有感觉了。'},
  {name:'小雨 · 苏州',text:'下次去北京去你们那儿坐坐。'},
  {name:'老陈 · 泉州',text:'玩老物件还得看讲究人。'},
  {name:'小林 · 珠海',text:'老件新件各玩各的。'},
  {name:'老杜 · 洛阳',text:'以藏换藏的老规矩越来越少见了。'},
  {name:'阿华 · 佛山',text:'能看明白东西的人不多。'},
  {name:'老尹 · 扬州',text:'你这眼光一看就是玩了多年的。'},
  {name:'小徐 · 常州',text:'什么时候我也能收到这样的东西。'},
  {name:'老郑 · 石家庄',text:'文玩无贵贱，人心有高低。'},
  {name:'阿强 · 东莞',text:'东西流动起来才有意思。'},
  {name:'老蒋 · 苏州',text:'老件新件不重要，东西对就好。'}
];

function seededRand(seed){var x=Math.sin(seed*9301+49297)*233280;return x-Math.floor(x);}

function buildRecords(){
  var today=new Date();today.setHours(0,0,0,0);
  var list=[],lastIdx=-1;
  for(var i=0;i<30;i++){
    var d=new Date(today.getTime()-i*86400000);
    var seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    var idx=Math.floor(seededRand(seed)*RECORD_POOL.length);
    if(idx===lastIdx&&RECORD_POOL.length>1) idx=(idx+1)%RECORD_POOL.length;
    lastIdx=idx;
    var tpl=RECORD_POOL[idx];
    var cCount=2+Math.floor(seededRand(seed+1)*4);
    var comments=[],used={};
    for(var j=0;j<cCount;j++){
      var ci=Math.floor(seededRand(seed+100+j)*COMMENT_POOL.length);
      if(used[ci]) continue;used[ci]=1;
      var c=COMMENT_POOL[ci];
      var h=9+Math.floor(seededRand(seed+200+j)*13);
      var m=Math.floor(seededRand(seed+300+j)*60);
      comments.push({name:c.name,text:c.text,date:pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+' '+pad2(h)+':'+pad2(m)});
    }
    list.push({date:d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()),title:tpl.title,tag:tpl.tag,tagCls:tpl.tagCls,dealPrice:tpl.dealPrice,text:tpl.text,comments:comments});
  }
  return list;
}
var RECORDS=buildRecords();

var DEFAULT_ARTICLES=[
  {id:'ar1',cat:'鉴 定',title:'老蜜蜡的孔道，藏着最多坑',summary:'看蜡质、看颜色是一方面，真正容易翻车的是孔道。老孔道什么样？孔壁有氧化层、螺旋痕、两头喇叭口自然过渡。',content:'老蜜蜡孔道的判断，主要看三点：\n\n一、孔壁的氧化层。老件经过几十年上百年的佩戴盘玩，孔道内壁会形成一层自然的氧化层，颜色从内到外有过渡，不是突然断裂。\n\n二、钻孔痕迹。老工钻孔多用解玉砂加慢速钻，孔壁能看到细微的螺旋痕，且孔道有自然的喇叭口过渡。现代高速钻则会留下均匀的同心圆纹路。\n\n三、两端过渡。老蜜蜡的孔道两端会因为长期穿绳摩擦而自然变大，形成不对称的喇叭形，边缘圆润。新打的孔边缘锋利，孔道过于规整。\n\n最后提醒：孔道做旧的手法很多，抹油、熏烟、加热都有人用。看得多、上手多，自然就有感觉了。'},
  {id:'ar2',cat:'材 质',title:'小叶紫檀的金星，到底是什么',summary:'金星不是金属，是紫檀木导管中的矿物质沉积。真金星与木材浑然一体，用手摸不到突起，透光看有金属光泽。',content:'金星的形成，是紫檀木在生长过程中，土壤中的矿物质通过导管向上输送时，逐渐沉积在导管内壁。经过长期氧化和木料干燥，就变成了金黄色颗粒。\n\n真金星和假金星的区别：\n\n真金星：颗粒自然分布，大小不一，颜色为金黄或黄白色，与木材紧密结合。用放大镜看，颗粒在导管中呈填充状。盘玩久了会越来越亮。\n\n假金星：多为铜粉或金粉加胶填入棕眼中。颜色过于均匀耀眼，摸起来有轻微突起，用指甲轻抠能感觉到胶感。盘玩后容易脱落。\n\n选购提醒：金星不是越多越好。密度和分布自然才是关键。'},
  {id:'ar3',cat:'年 代',title:'竹刻断代，先看刀口再看皮壳',summary:'明代竹刻刀法深峻、气韵生动；清代繁缛精细；民国以后渐趋平实。皮壳枣红温润是老件的标志。',content:'竹刻断代，主要有几个观察点：\n\n一、刀口。明代嘉定竹刻刀法深峻，讲究薄地阳文，层次分明。清代竹刻更加繁缛精细。民国以后竹刻趋于平实。\n\n二、皮壳。老竹刻经过长期把玩，皮壳呈枣红色或深琥珀色，温润有光泽。颜色自然过渡，凸起处颜色略浅，凹陷处颜色略深。如果整件作品颜色完全一致，要警惕做旧。\n\n三、竹丝纹理。老竹料经过多年干燥，竹丝纹理清晰顺直。新料则显得生硬，水分大。\n\n四、款识。竹刻名家多有款识，但款识最容易造假。不能只看款，要结合刀工和皮壳综合判断。'},
  {id:'ar4',cat:'交 易',title:'换藏如何保护自己：四条铁律',summary:'视频验货必须互拍；差价走担保；收到三天内确认；保留所有聊天记录。做到这四条，绝大多数纠纷都能避免。',content:'换藏不像买东西，双方都承担风险。以下四条铁律，能保护你的绝大部分权益：\n\n一、视频验货必须互拍。发货前，双方都要拍一段完整的实物视频，包括尺寸、重量、瑕疵位、细节特写。\n\n二、差价走担保。如果一方需要补差价，尽量通过担保交易或第三方平台走账，不要直接转账。\n\n三、收到三天内确认。收到货物后，三天内完成验收。有问题立刻提出，没问题及时确认。\n\n四、保留所有记录。从洽谈到确认，所有聊天记录、视频、图片都要保留。真出了问题，这些就是证据。'}
];

var CHAT_WELCOME='您好，我是拾光藏馆的客服小拾。\n\n馆里现在有玉器、珠串、木作、竹刻、杂项，除标注「自藏」的几件，其余都参与换藏。\n\n您想先了解哪方面？点下面的常见问题也行。';

var CHAT_QA=[
  {q:'换藏怎么走？',k:['换','交换','互换','置换','对换','易物'],a:'换藏一般六步：\n\n① 您把想换的藏品和手上的东西说清楚，双方先确认意向；\n② 互拍实物视频，尺寸、重量、瑕疵位都要拍到；\n③ 差价走担保或第三方托管；\n④ 各自包好发出，顺丰保价，运费各付各的；\n⑤ 收到三天内确认，没问题就算结；\n⑥ 记入换藏记录，双方留底。'},
  {q:'东西保真吗？',k:['真','假','保真','鉴定','真假','开门','对不对','老不老'],a:'每件都是实物实拍，尺寸、重量、瑕疵都写在详情里，不修图也不隐瞒。\n\n老件会写年代判断依据：竹刻看刀口和皮壳，玉器看毛孔和包浆，铜器看锈色层次。\n\n每件藏品的详情页都有「鉴定信息」区块，写明鉴定机构和依据。支持视频验货。'},
  {q:'怎么发货包装？',k:['发','寄','快递','物流','包装','运费','顺丰','邮寄'],a:'包装分三类：\n\n· 玉器珠串：软布 → 气泡膜 → 锦盒 → 外箱，四层\n· 木作竹刻：加防潮袋，接口处泡沫棉固定\n· 铜器杂项：突出部位单独衬垫\n\n一律顺丰保价，当天出单号。换藏的话运费各付各的。'},
  {q:'价格能谈吗？',k:['价','便宜','少点','优惠','贵','议价','多少','打折'],a:'标价是参考价，能聊。\n\n空间看东西本身，也看爽快程度。您直接报个数，能出我就出，出不了我会说明原因，不来回拉锯。\n\n议价别在公开评论区，走下方留言或者私下说更合适。'},
  {q:'竞拍怎么出价？',k:['竞','拍','出价','拍卖','举牌','加价'],a:'带「竞拍」标识的藏品，详情页会显示当前最高价、出价记录和倒计时。\n\n出价规则：每次加价不低于100元，出价后不能撤回。倒计时结束，最高价者得。'},
  {q:'想找特定东西',k:['找','想要','有没有','求','收','寻觅','蹲'],a:'您现在看到的是馆里现存的，柜子后面还有一批没上架。\n\n您把想要的品类、材质、大概预算说清楚，我帮您留意，碰到了第一时间通知。\n\n也可以在上方搜索框直接输材质；或者在「换藏意向」里写一条。'},
  {q:'怎么联系你们？',k:['留言','联系','微信','电话','怎么买','下单','支付','付款'],a:'两种方式：\n\n① 页面最下方有「留个联系」，填称呼 + 微信或电话，这个最快，我一般当天回；\n② 藏品详情页里也有留言框，针对具体某件问更方便。\n\n晚上回复可能慢一点，看到一定回。'},
  {q:'自藏那几件出吗？',k:['自藏','不卖','不出','镇馆'],a:'标「自藏」的是留着自己玩的，暂时不换也不出。\n\n不过凡事有例外，您要是手上有对路的东西，可以聊聊。'},
  {q:'收藏怎么用？',k:['收藏','关注','心','星星','收藏夹'],a:'藏品卡片右上角有个心形按钮，点一下就能收藏。\n\n收藏之后，右上角「我的收藏」会显示数量。\n\n工具栏里的排序也可以选「只看收藏」。收藏存在本地浏览器里，换设备不同步。'},
  {q:'怎么担保交易？',k:['担保','托管','安全','被骗','骗','纠纷'],a:'换藏如果不放心，可以走担保流程：\n\n① 双方确认换藏意向，确定差价；\n② 差价部分通过担保平台或第三方托管；\n③ 双方各自发货，保留物流单号；\n④ 收到货确认无误，担保放款；\n⑤ 有问题立刻提出，走平台仲裁。'}
];

var CHAT_FALLBACK='这个我得想想，您可以换个说法，或者点下面的常见问题。\n\n也可以直接拉到页面最下方的「留个联系」，填个微信或电话，我看到会尽快回您。';

var items=load(LS_ITEMS,null);
if(!items||!items.length){items=DEFAULT_ITEMS;save(LS_ITEMS,items);}
items.forEach(function(it){
  if(!it.views) it.views=0;
  if(!it.saleMode) it.saleMode='fixed';
  if(it.saleMode==='auction'&&!it.bids) it.bids=[];
  if(it.certImages===undefined) it.certImages=[];
});
save(LS_ITEMS,items);

var WANT_CHIPS=['玉器','翡翠','珠串','木作','竹刻','陶瓷','奇石','杂项'];
var WANT_KEYS={'玉器':['玉器','玉石','和田玉','南红','玛瑙'],'翡翠':['翡翠'],'珠串':['珠串','手串','珠子','蜜蜡','菩提'],'木作':['木作','紫檀','黄花梨','木雕','黄杨'],'竹刻':['竹刻','竹雕','竹'],'陶瓷':['陶瓷','瓷','建盏','陶'],'奇石':['奇石','太湖石','英石','灵璧','玛瑙'],'杂项':['杂项','铜','银','香炉','墨盒','镇纸']};
var DEFAULT_WANTS=[
  {id:'w1',name:'阿岩 · 广州',have:'建盏 陶瓷茶盏一只',want:['木作','竹刻'],verified:true,note:'柴烧的，口径 9cm，有一道窑变流釉，无冲线。想换一件老竹刻或者紫檀小件，差价可以补。',createdAt:Date.now()-86400000*3},
  {id:'w2',name:'小满 · 长沙',have:'翡翠 平安扣一枚',want:['玉器','奇石'],verified:true,note:'糯冰种飘花，直径 4cm，无裂。想换和田玉小件，或者一块有意思的英石。',createdAt:Date.now()-86400000*2},
  {id:'w3',name:'老木 · 沈阳',have:'黄杨木 雕达摩立像',want:['陶瓷','杂项'],verified:false,note:'高 12cm，底款模糊，包浆一般。想换一件老瓷片做的挂件。',createdAt:Date.now()-86400000},
  {id:'w4',name:'石头 · 成都',have:'长江石 山水纹一方',want:['竹刻','珠串'],verified:true,note:'20×14cm，天然纹理，配了红木座。想换手串或者竹刻臂搁。',createdAt:Date.now()-3600000*5}
];
var wants=load(LS_WANTS,null);
if(!Array.isArray(wants)){wants=DEFAULT_WANTS.slice();save(LS_WANTS,wants);}
wants.forEach(function(w){if(w.verified===undefined) w.verified=false;});

var USER=load(LS_USER,{name:'',avatar:''});
if(!USER.name){
  var randNames=['拾光常客','静心藏客','听雨轩主','半山月','竹石居','清赏斋','墨韵堂','青玉案','一叶舟','林泉客'];
  USER.name=randNames[Math.floor(Math.random()*randNames.length)];
  save(LS_USER,USER);
}

var SIGNIN=load(LS_SIGNIN,{lastDate:'',points:0,streak:0,totalDays:0});
if(!SIGNIN.points) SIGNIN.points=0;
if(!SIGNIN.streak) SIGNIN.streak=0;
if(!SIGNIN.totalDays) SIGNIN.totalDays=0;

var postTags=['晒宝','换藏','求鉴','心得'];
var selectedPostTags=[];

var DEFAULT_POSTS=[
  {id:'p1',user:'老周 · 北京',tag:'晒宝',content:'刚收的一只清中老银香囊，缠枝莲纹，鎏金还在，越看越喜欢。',createdAt:Date.now()-3600000*2,likes:8},
  {id:'p2',user:'小满 · 长沙',tag:'求鉴',content:'这块和田玉小件，大家帮看看是不是清中的？拿在手里挺压手。',createdAt:Date.now()-3600000*5,likes:5},
  {id:'p3',user:'阿岩 · 广州',tag:'换藏',content:'手里有一只柴烧建盏，想换一件老竹刻或者紫檀小件，差价可补。',createdAt:Date.now()-86400000,likes:12},
  {id:'p4',user:'老木 · 沈阳',tag:'心得',content:'玩了五年老件，最大的体会是：看得多不如上手多，上手多不如花钱多。',createdAt:Date.now()-86400000*2,likes:26},
  {id:'p5',user:'石头 · 成都',tag:'晒宝',content:'新配的红木座，长江石山水纹一方，越摆越有味道。',createdAt:Date.now()-86400000*3,likes:15},
  {id:'p6',user:'白露 · 上海',tag:'心得',content:'老件皮壳一看二摸三透光，急不得。行里话叫看老不看新，看工不看料。',createdAt:Date.now()-86400000*4,likes:19}
];

var posts=load(LS_POSTS,null);
if(!Array.isArray(posts)){posts=DEFAULT_POSTS.slice();save(LS_POSTS,posts);}
posts.forEach(function(p){
  if(!p.likes) p.likes=0;
  if(!p.imgs) p.imgs=[];
  if(!p.ref) p.ref=null;
});
save(LS_POSTS,posts);

var postLikes=load(LS_POST_LIKES,[]);
if(!Array.isArray(postLikes)) postLikes=[];
var postCmts=load(LS_POST_CMTS,{});
if(typeof postCmts!=='object'||!postCmts) postCmts={};

var curCat='全部',curKw='',curSort='default';
var curPostFilter='all';
var advFilter={min:'',max:'',era:[],status:[]};
var favs=load(LS_FAV,[]);
if(!Array.isArray(favs)) favs=[];
var IMGS={};
var curDetailId=null;
var visibleList=[];
var selectedWantChips=[];
var historyIds=load(LS_HISTORY,[]);
if(!Array.isArray(historyIds)) historyIds=[];
var pendingPostImgs=[];

function statusInfo(s){
  if(s==='已结缘')return{cls:'traded',text:'已结缘'};
  if(s==='自藏')return{cls:'kept',text:'自藏'};
  return{cls:'available',text:'可交流'};
}
function isFav(id){return favs.indexOf(id)>-1;}
function toggleFav(id){
  var i=favs.indexOf(id);
  if(i>-1){favs.splice(i,1);}else{favs.unshift(id);}
  save(LS_FAV,favs);updateFavUI();renderGrid();
  var df=$('#detailFavBtn');
  if(df){
    df.classList.toggle('on',isFav(id));
    var svg=df.querySelector('svg');
    if(svg) svg.setAttribute('fill',isFav(id)?'currentColor':'none');
  }
}
function updateFavUI(){$('#favCount').textContent=favs.length;$('#favBtn').classList.toggle('on',favs.length>0);}

function renderCats(){
  var set={},cats=['全部'];
  items.forEach(function(i){if(i.category&&!set[i.category]){set[i.category]=1;cats.push(i.category);}});
  $('#cats').innerHTML=cats.map(function(c){
    return '<button class="cat'+(c===curCat?' active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
  }).join('');
}
function renderAdvChips(){
  var eras={},statuses={};
  items.forEach(function(i){if(i.era) eras[i.era]=1;if(i.status) statuses[i.status]=1;});
  $('#advEra').innerHTML=Object.keys(eras).map(function(e){
    return '<button class="adv-chip'+(advFilter.era.indexOf(e)>-1?' on':'')+'" data-adv-era="'+esc(e)+'">'+esc(e)+'</button>';
  }).join('');
  $('#advStatus').innerHTML=Object.keys(statuses).map(function(s){
    return '<button class="adv-chip'+(advFilter.status.indexOf(s)>-1?' on':'')+'" data-adv-status="'+esc(s)+'">'+esc(s)+'</button>';
  }).join('');
}
function filtered(){
  var arr=items.filter(function(i){
    var okc=(curCat==='全部'||i.category===curCat);
    var kw=curKw.trim().toLowerCase();
    var hay=(i.name+' '+(i.desc||'')+' '+(i.material||'')+' '+(i.era||'')+' '+(i.category||'')).toLowerCase();
    var okk=(!kw||hay.indexOf(kw)>-1);
    var okf=(curSort!=='favOnly')||isFav(i.id);
    var okMin=true,okMax=true;
    if(advFilter.min!==''){var p=parsePrice(i.price);okMin=(p>=+advFilter.min);}
    if(advFilter.max!==''){var p2=parsePrice(i.price);okMax=(p2>=0&&p2<=+advFilter.max);}
    var okEra=(!advFilter.era.length||advFilter.era.indexOf(i.era)>-1);
    var okSt=(!advFilter.status.length||advFilter.status.indexOf(i.status)>-1);
    return okc&&okk&&okf&&okMin&&okMax&&okEra&&okSt;
  });
  if(curSort==='new'){arr=arr.slice().sort(function(a,b){return (b.createdAt||0)-(a.createdAt||0);});}
  else if(curSort==='priceAsc'){arr=arr.slice().sort(function(a,b){var pa=parsePrice(a.price),pb=parsePrice(b.price);if(pa<0)pa=Infinity;if(pb<0)pb=Infinity;return pa-pb;});}
  else if(curSort==='priceDesc'){arr=arr.slice().sort(function(a,b){var pa=parsePrice(a.price),pb=parsePrice(b.price);if(pa<0)pa=-1;if(pb<0)pb=-1;return pb-pa;});}
  else if(curSort==='hot'){arr=arr.slice().sort(function(a,b){return (b.views||0)-(a.views||0);});}
  return arr;
}
function cardHTML(it){
  var img=(it.images&&it.images[0])||ph('藏',30);
  var st=statusInfo(it.status);
  var meta=[it.era,it.material,it.size].filter(Boolean).join(' · ');
  var favCls=isFav(it.id)?' on':'';
  var badge='';
  if(it.saleMode==='auction') badge='<span class="card-badge auction">竞拍</span>';
  else if((it.views||0)>300) badge='<span class="card-badge hot">热藏</span>';
  return '<article class="card" data-id="'+it.id+'">'+badge+
    '<button class="card-fav'+favCls+'" data-fav="'+it.id+'"><svg viewBox="0 0 24 24" fill="'+(isFav(it.id)?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>'+
    '<div class="card-img"><img src="'+esc(img)+'" alt="'+esc(it.name)+'" loading="lazy"></div>'+
    '<span class="card-views"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'+(it.views||0)+'</span>'+
    '<div class="card-body"><div class="card-top"><span class="tag '+st.cls+'">'+st.text+'</span><span class="card-cat">'+esc(it.category||'')+'</span></div>'+
    '<h3 class="card-name">'+esc(it.name)+'</h3>'+
    '<p class="card-meta">'+esc(meta)+'</p>'+
    '<div class="card-foot"><span class="card-price">'+esc(it.price||'面议')+'</span><span class="card-more">查看详情 →</span></div></div></article>';
}
function renderGrid(){
  var list=filtered();
  visibleList=list;
  $('#grid').innerHTML=list.map(cardHTML).join('');
  $('#empty').hidden=list.length>0;
  $('#count').textContent=items.length;
  if(!list.length){
    if(curSort==='favOnly'&&favs.length===0){$('#emptyText').textContent='还 没 有 收 藏';$('#emptyReset').hidden=true;}
    else{$('#emptyText').textContent='暂 无 藏 品';$('#emptyReset').hidden=false;}
  }
}
function renderRecords(){
  $('#recList').innerHTML=RECORDS.map(function(r,ri){
    var cmts='';
    if(r.comments&&r.comments.length){
      var show=r.comments.slice(0,2);
      var hidden=r.comments.slice(2);
      var cmtsHtml=show.map(function(c){
        return '<div class="cmt"><span class="cmt-who">'+esc(c.name)+'</span><div class="cmt-main"><p>'+esc(c.text)+'</p><span class="cmt-time">'+esc(c.date)+'</span></div></div>';
      }).join('');
      var hiddenHtml=hidden.length?'<div class="cmt-more-wrap" id="cmtw_'+ri+'" style="display:none">'+hidden.map(function(c){
        return '<div class="cmt"><span class="cmt-who">'+esc(c.name)+'</span><div class="cmt-main"><p>'+esc(c.text)+'</p><span class="cmt-time">'+esc(c.date)+'</span></div></div>';
      }).join('')+'</div>':'';
      var moreBtn=hidden.length?'<button class="cmt-more" data-cmt-more="cmtw_'+ri+'" data-total="'+hidden.length+'">展开 '+hidden.length+' 条评论 ▾</button>':'';
      cmts='<div class="cmts">'+cmtsHtml+hiddenHtml+moreBtn+'</div>';
    }else{cmts='<div class="cmts"><p class="cmt-none">暂无留言</p></div>';}
    var pr=r.dealPrice?'<div class="rec-price">成交：'+esc(r.dealPrice)+'</div>':'';
    return '<div class="rec"><div class="rec-head"><span class="rec-date">'+esc(fmtDate(r.date))+'</span><span class="rec-tag '+esc(r.tagCls||'out')+'">'+esc(r.tag||'')+'</span><h4 class="rec-title">'+esc(r.title)+'</h4></div>'+
      '<p class="rec-text">'+esc(r.text)+'</p>'+pr+cmts+'</div>';
  }).join('');
}
function renderArticles(){
  $('#articleList').innerHTML=DEFAULT_ARTICLES.map(function(a){
    return '<div class="article" data-article="'+esc(a.id)+'"><div class="article-cat">'+esc(a.cat)+'</div><h4>'+esc(a.title)+'</h4><p>'+esc(a.summary)+'</p><div class="article-more">阅读全文 →</div></div>';
  }).join('');
}
function openArticle(id){
  var a=null;
  for(var i=0;i<DEFAULT_ARTICLES.length;i++){if(DEFAULT_ARTICLES[i].id===id){a=DEFAULT_ARTICLES[i];break;}}
  if(!a) return;
  $('#articleContent').innerHTML='<div class="article-cat" style="margin-bottom:14px">'+esc(a.cat)+'</div>'+
    '<h2 style="font-size:24px;font-weight:700;line-height:1.5;margin-bottom:20px">'+esc(a.title)+'</h2>'+
    '<div style="width:56px;height:3px;background:var(--gold);border-radius:2px;margin-bottom:24px"></div>'+
    '<div style="font-size:14px;color:var(--ink2);line-height:2.1;white-space:pre-wrap">'+esc(a.content)+'</div>';
  $('#articleModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function renderWantChips(){
  $('#wantChips').innerHTML=WANT_CHIPS.map(function(c){
    return '<button type="button" class="wf-chip'+(selectedWantChips.indexOf(c)>-1?' on':'')+'" data-chip="'+esc(c)+'">'+esc(c)+'</button>';
  }).join('');
}
function matchItemsFor(wantList){
  var keys=[];
  (wantList||[]).forEach(function(t){var ks=WANT_KEYS[t]||[t];ks.forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});
  if(!keys.length) return [];
  return items.filter(function(it){
    var hay=(it.category||'')+' '+(it.material||'')+' '+(it.name||'')+' '+(it.desc||'')+' '+(it.era||'');
    for(var i=0;i<keys.length;i++){if(hay.indexOf(keys[i])>-1) return true;}
    return false;
  });
}
function creditBadge(w){
  if(w.verified) return '<span class="credit-badge verified">✓ 已承诺</span>';
  return '<span class="credit-badge new">首次发布</span>';
}
function wantHTML(w){
  var ms=matchItemsFor(w.want);
  var targets=(w.want||[]).map(function(c){return '<span class="want-target">'+esc(c)+'</span>';}).join('');
  var matchHtml;
  if(ms.length){
    var chips=ms.slice(0,4).map(function(it){
      var nm=it.name.length>11?it.name.slice(0,11)+'…':it.name;
      return '<button type="button" class="match-chip" data-match="'+it.id+'" title="'+esc(it.name)+'">'+esc(nm)+'</button>';
    }).join('');
    if(ms.length>4){chips+='<span class="want-match-txt">等 '+ms.length+' 件</span>';}
    matchHtml='<div class="want-match"><span class="want-match-txt">馆内对路 '+ms.length+' 件：</span>'+chips+'</div>';
  }else{matchHtml='<div class="want-match"><span class="match-none">馆内暂无对路的，帮您留意着</span></div>';}
  return '<div class="want-item"><div class="want-head"><span class="want-who" data-user="'+esc(w.name)+'">'+esc(w.name||'藏友')+' '+creditBadge(w)+'</span><span class="want-date">'+esc(fmtDate(dateOf(w.createdAt)))+'</span><button type="button" class="want-del" data-del="'+esc(w.id)+'">×</button></div>'+
    '<div class="want-flow"><span class="want-have">'+esc(w.have||'')+'</span><span class="want-arrow">⇄</span><span class="want-targets">'+targets+'</span></div>'+
    (w.note?'<p class="want-note">'+esc(w.note)+'</p>':'')+matchHtml+'</div>';
}
function renderWants(){
  var list=wants.slice().sort(function(a,b){return (b.createdAt||0)-(a.createdAt||0);});
  if(!list.length){$('#wantList').innerHTML='<div class="want-empty"><div class="empty-mark">◍</div><p>还 没 有 意 向</p></div>';return;}
  $('#wantList').innerHTML=list.map(wantHTML).join('');
}
function catToWant(c){
  c=String(c||'');
  if(WANT_CHIPS.indexOf(c)>-1) return c;
  if(c.indexOf('玉')>-1) return '玉器';
  if(c.indexOf('竹')>-1||c.indexOf('木')>-1) return '木作';
  if(c.indexOf('珠')>-1||c.indexOf('串')>-1) return '珠串';
  if(c.indexOf('瓷')>-1||c.indexOf('陶')>-1) return '陶瓷';
  if(c.indexOf('石')>-1) return '奇石';
  return '杂项';
}
function focusItem(id){
  curCat='全部';curKw='';curSort='default';
  $('#search').value='';$('#sortSel').value='default';
  renderCats();renderGrid();
  var card=document.querySelector('.card[data-id="'+id+'"]');
  if(!card) return;
  var y=card.getBoundingClientRect().top+window.scrollY-110;
  window.scrollTo({top:y,behavior:'smooth'});
  card.classList.add('flash');
  setTimeout(function(){card.classList.remove('flash');},3200);
}
function pushHistory(id){
  historyIds=historyIds.filter(function(x){return x!==id;});
  historyIds.unshift(id);
  if(historyIds.length>12) historyIds=historyIds.slice(0,12);
  save(LS_HISTORY,historyIds);
  renderHistory();
}
function renderHistory(){
  var list=historyIds.map(function(id){
    for(var i=0;i<items.length;i++){if(items[i].id===id) return items[i];}
    return null;
  }).filter(Boolean);
  if(!list.length){$('#historySection').hidden=true;return;}
  $('#historySection').hidden=false;
  $('#historyList').innerHTML=list.map(function(it){
    var img=(it.images&&it.images[0])||ph('藏',30);
    return '<div class="history-item" data-id="'+it.id+'"><img src="'+esc(img)+'" loading="lazy"><p>'+esc(it.name)+'</p></div>';
  }).join('');
}
function getComments(itemId){var all=load(LS_COMMENTS,{});return all[itemId]||[];}
function addComment(itemId,name,text){
  var all=load(LS_COMMENTS,{});
  if(!all[itemId]) all[itemId]=[];
  all[itemId].unshift({name:name,text:text,createdAt:Date.now()});
  save(LS_COMMENTS,all);
}
function addBid(itemId,user,price){
  for(var i=0;i<items.length;i++){
    if(items[i].id===itemId){
      if(!items[i].bids) items[i].bids=[];
      items[i].bids.unshift({user:user,price:price,createdAt:Date.now()});
      break;
    }
  }
  save(LS_ITEMS,items);
}
function pushNotif(text,icon){
  var list=load(LS_NOTIF,[]);
  if(!Array.isArray(list)) list=[];
  list.unshift({text:text,icon:icon||'💬',createdAt:Date.now(),read:false});
  if(list.length>30) list=list.slice(0,30);
  save(LS_NOTIF,list);
  updateNotifDot();
}
function updateNotifDot(){
  var list=load(LS_NOTIF,[]);
  if(!Array.isArray(list)) list=[];
  var unread=list.filter(function(n){return !n.read;}).length;
  $('#notifDot').hidden=(unread===0);
}

function openDetail(id){
  var it=null;
  for(var i=0;i<items.length;i++){if(items[i].id===id){it=items[i];break;}}
  if(!it) return;
  curDetailId=id;
  it.views=(it.views||0)+1;
  save(LS_ITEMS,items);
  pushHistory(id);
  var imgs=(it.images&&it.images.length)?it.images:[ph('藏',30)];
  IMGS[id]=imgs;
  var st=statusInfo(it.status);
  var isF=isFav(it.id);
  var spec='';
  function sp(k,v){if(v) spec+='<div><dt>'+k+'</dt><dd>'+esc(v)+'</dd></div>';}
  sp('年 代',it.era);sp('材 质',it.material);sp('尺 寸',it.size);sp('类 别',it.category);
  var thumbs=imgs.length>1 ? '<div class="thumbs">'+imgs.map(function(u,i){
      return '<div class="thumb'+(i===0?' active':'')+'" data-i="'+i+'" data-id="'+id+'"><img src="'+esc(u)+'" loading="lazy"></div>';
    }).join('')+'</div>' : '';
  var certHtml='';
  if(it.certNo&&it.certNo!=='—'){
    var certImgs=(it.certImages||[]).map(function(u){return '<img src="'+esc(u)+'" loading="lazy">';}).join('');
    certHtml='<div class="cert-box"><h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>鉴 定 信 息</h5>'+
      '<div class="cert-info"><div><dt>证书编号</dt><dd>'+esc(it.certNo)+'</dd></div><div><dt>鉴定机构</dt><dd>'+esc(it.certOrg||'—')+'</dd></div></div>'+
      (it.certNote?'<div style="font-size:12.5px;color:var(--ink2);line-height:1.85;margin-top:8px">'+esc(it.certNote)+'</div>':'')+
      (certImgs?'<div class="cert-imgs">'+certImgs+'</div>':'')+'</div>';
  }
  var auctionHtml='';
  if(it.saleMode==='auction'&&it.status==='可交流'){
    var bids=it.bids||[];
    var cur=0;bids.forEach(function(b){if(b.price>cur) cur=b.price;});
    var bidRows=bids.slice(0,10).map(function(b){
      return '<div class="bid-row"><span>'+esc(b.user||'藏友')+' · '+timeAgo(b.createdAt||b.time)+'</span><b>¥ '+b.price+'</b></div>';
    }).join('');
    auctionHtml='<div class="auction-box"><div class="auction-head"><h5>🔥 竞 拍 中</h5><span class="auction-timer" data-end="'+(it.auctionEnd||Date.now()+86400000*3)+'">—</span></div>'+
      '<div class="auction-current">当前最高价 <b>¥ '+cur+'</b>（'+bids.length+' 次出价）</div>'+
      (bidRows?'<div class="bids-list">'+bidRows+'</div>':'<div class="bids-list" style="color:var(--ink3)">暂无出价，做第一个吧</div>')+
      '<form class="bid-form" id="bidForm"><input type="number" name="price" placeholder="出价金额" min="'+(cur+100)+'" required><button type="submit">出 价</button></form></div>';
  }
  var priceRefHtml='';
  var refs=RECORDS.filter(function(r){return r.tagCls==='out';}).slice(0,3);
  if(refs.length){
    priceRefHtml='<div class="price-ref"><h5>📊 同类历史成交参考</h5>'+
      refs.map(function(r){return '<div class="pr-row"><span>'+esc(r.title)+'</span><b>'+esc(r.dealPrice||'—')+'</b></div>';}).join('')+'</div>';
  }
  var cmts=getComments(id);
  var cmtList=cmts.length ? cmts.map(function(c){
    return '<div class="cmt-card"><div class="cmt-ava">'+esc((c.name||'藏')[0])+'</div><div class="cmt-body"><div class="cmt-name">'+esc(c.name)+'</div><div class="cmt-text">'+esc(c.text)+'</div><div class="cmt-meta">'+timeAgo(c.createdAt)+'</div></div></div>';
  }).join('') : '<div style="font-size:13px;color:#a89e8d;padding:12px 0">还没有评论，来说两句</div>';
  $('#detail').innerHTML=
    '<div class="detail-gallery"><div class="detail-main" id="detailMain"><img id="mainImg" src="'+esc(imgs[0])+'" alt="'+esc(it.name)+'"><span class="zoom-hint">点击放大</span></div>'+thumbs+'</div>'+
    '<div class="detail-info">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px">'+
        '<div class="detail-cat" style="margin-bottom:0">'+esc(it.category||'藏品')+'</div>'+
        '<button class="card-fav'+(isF?' on':'')+'" id="detailFavBtn" data-fav="'+it.id+'" style="position:static;width:34px;height:34px"><svg viewBox="0 0 24 24" fill="'+(isF?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>'+
      '</div>'+
      '<h3 style="margin-top:12px">'+esc(it.name)+'</h3>'+
      '<div class="detail-rule"></div>'+
      '<div class="spec">'+spec+'</div>'+
      '<div class="detail-desc">'+esc(it.desc||'暂无描述')+'</div>'+
      certHtml+auctionHtml+
      '<div class="detail-price"><b>'+esc(it.price||'面议')+'</b><span>'+st.text+'</span></div>'+
      priceRefHtml+
      '<button type="button" class="trade-btn" data-trade="'+it.id+'">用 我 手 里 的 换 这 件</button>'+
      '<button type="button" class="share-btn" data-share="'+it.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>分 享 给 藏 友</button>'+
      '<div class="comments-title">藏 友 评 论 <small>'+cmts.length+' 条</small></div>'+
      '<div class="cmt-list">'+cmtList+'</div>'+
      '<form class="cmt-form" id="cmtForm"><input name="name" placeholder="您的称呼" required maxlength="20"><textarea name="text" placeholder="说点什么…" required maxlength="200"></textarea><button type="submit">发表评论</button></form>'+
      '<div class="inquire-title">留 言 咨 询</div>'+
      '<form class="inquire" id="inquireForm"><input name="name" placeholder="您的称呼" required maxlength="20"><input name="contact" placeholder="微信 / 电话" required maxlength="40"><select name="type"><option>咨询</option><option>购买</option><option>交换</option></select><input name="message" placeholder="想说的话…" maxlength="200"><button type="submit">提 交 留 言</button></form>'+
    '</div>';
  var bidForm=$('#bidForm');
  if(bidForm){
    bidForm.addEventListener('submit',function(e){
      e.preventDefault();
      var p=+bidForm.price.value;
      var cur=0;(it.bids||[]).forEach(function(b){if(b.price>cur) cur=b.price;});
      if(p<cur+100){toast('出价需高于当前最高价100元以上');return;}
      addBid(it.id,'匿名藏友',p);
      toast('出价成功：¥ '+p);
      openDetail(it.id);
    });
  }
  $('#cmtForm').addEventListener('submit',function(e){
    e.preventDefault();
    var f=e.target;
    var nm=f.name.value.trim(),tx=f.text.value.trim();
    if(!nm||!tx){toast('请填写称呼和评论');return;}
    addComment(it.id,nm,tx);
    toast('评论已发表');
    openDetail(it.id);
  });
  $('#inquireForm').addEventListener('submit',function(e){
    e.preventDefault();
    var f=e.target;
    var msg={id:uid(),name:f.name.value.trim(),contact:f.contact.value.trim(),type:f.type.value,message:f.message.value.trim(),itemId:it.id,itemName:it.name,read:false,createdAt:Date.now()};
    if(!msg.name||!msg.contact){toast('请填写称呼与联系方式');return;}
    var msgs=load(LS_MSGS,[]);msgs.unshift(msg);save(LS_MSGS,msgs);
    pushNotif('新留言 · '+msg.name+' 对《'+it.name+'》留言','📩');
    f.reset();toast('已收到您的留言，我会尽快联系您');
  });
  $('#detailMain').addEventListener('click',function(){openLightbox(imgs[0]);});
  startAuctionTimer();
  updateDetailNav();
  $('#modal').classList.add('open');
  document.body.style.overflow='hidden';
}

var auctionTimer=null;
function startAuctionTimer(){
  if(auctionTimer) clearInterval(auctionTimer);
  var el=document.querySelector('.auction-timer');
  if(!el) return;
  var end=+el.getAttribute('data-end');
  function tick(){
    var d=end-Date.now();
    if(d<=0){el.textContent='已结束';return;}
    var h=Math.floor(d/3600000),m=Math.floor(d%3600000/60000),s=Math.floor(d%60000/1000);
    el.textContent=pad2(h)+':'+pad2(m)+':'+pad2(s);
  }
  tick();
  auctionTimer=setInterval(tick,1000);
}
function updateDetailNav(){
  var idx=-1;
  for(var i=0;i<visibleList.length;i++){if(visibleList[i].id===curDetailId){idx=i;break;}}
  $('#detailPrev').style.opacity=(idx>0)?'1':'0.35';
  $('#detailNext').style.opacity=(idx>-1&&idx<visibleList.length-1)?'1':'0.35';
}
function navDetail(dir){
  var idx=-1;
  for(var i=0;i<visibleList.length;i++){if(visibleList[i].id===curDetailId){idx=i;break;}}
  if(idx<0) return;
  var nid=idx+dir;
  if(nid<0||nid>=visibleList.length) return;
  openDetail(visibleList[nid].id);
  $('#modal').scrollTop=0;
}
function closeModal(){$('#modal').classList.remove('open');document.body.style.overflow='';curDetailId=null;if(auctionTimer)clearInterval(auctionTimer);}
function openLightbox(src){$('#lightboxImg').src=src;$('#lightbox').classList.add('open');}
function closeLightbox(){$('#lightbox').classList.remove('open');}

function shareItem(id){
  var it=null;
  for(var i=0;i<items.length;i++){if(items[i].id===id){it=items[i];break;}}
  if(!it) return;
  var url=location.href.split('#')[0]+'?item='+id;
  var text='拾光藏馆 · '+it.name+' · '+it.price;
  if(navigator.share){
    navigator.share({title:'拾光藏馆',text:text,url:url}).catch(function(){});
    return;
  }
  var tmp=document.createElement('textarea');
  tmp.value=text+'\n'+url;
  document.body.appendChild(tmp);
  tmp.select();
  try{document.execCommand('copy');toast('链接已复制，快分享给藏友');}
  catch(e){prompt('复制以下链接分享：',url);}
  document.body.removeChild(tmp);
}

function isLiked(postId){return postLikes.indexOf(postId)>-1;}
function toggleLike(postId){
  var i=postLikes.indexOf(postId);
  if(i>-1){postLikes.splice(i,1);}else{postLikes.unshift(postId);}
  save(LS_POST_LIKES,postLikes);
  for(var k=0;k<posts.length;k++){
    if(posts[k].id===postId){
      posts[k].likes=(posts[k].likes||0)+(i>-1?-1:1);
      if(posts[k].likes<0) posts[k].likes=0;
      break;
    }
  }
  save(LS_POSTS,posts);
  renderPosts();
}
function postCmtsOf(id){return postCmts[id]||[];}
function addPostCmt(id,name,text){
  if(!postCmts[id]) postCmts[id]=[];
  postCmts[id].push({name:name,text:text,createdAt:Date.now()});
  save(LS_POST_CMTS,postCmts);
  pushNotif('新评论 · '+name+' 评论了动态','💬');
}
function renderPosts(){
  var list=posts.slice();
  if(curPostFilter==='hot'){
    list=list.sort(function(a,b){return (b.likes||0)-(a.likes||0);});
  }else if(curPostFilter!=='all'){
    list=list.filter(function(p){return p.tag===({'exchange':'换藏','show':'晒宝','ask':'求鉴','hot':'最热'}[curPostFilter]||'');});
  }else{
    list=list.sort(function(a,b){return (b.createdAt||0)-(a.createdAt||0);});
  }
  if(!list.length){
    $('#postList').innerHTML='<div class="want-empty"><div class="empty-mark">◍</div><p>还 没 有 动 态</p></div>';
    return;
  }
  $('#postList').innerHTML=list.map(function(p){
    var liked=isLiked(p.id)?' on':'';
    var imgsHtml=(p.imgs||[]).map(function(u){return '<img src="'+esc(u)+'" data-lightbox="'+esc(u)+'" loading="lazy">';}).join('');
    var refHtml='';
    if(p.ref){
      var rit=null;
      for(var r=0;r<items.length;r++){if(items[r].id===p.ref){rit=items[r];break;}}
      if(rit) refHtml='<div class="post-ref" data-ref="'+esc(rit.id)+'"><img src="'+esc((rit.images&&rit.images[0])||ph('藏',30))+'"><div><b>关联藏品：</b>'+esc(rit.name)+' · '+esc(rit.price)+'</div></div>';
    }
    var cmts=postCmtsOf(p.id);
    var cmtsHtml='';
    if(cmts.length){
      var first=cmts[0];
      cmtsHtml='<div class="post-cmts"><div class="post-cmt"><b>'+esc(first.name)+'：</b><p>'+esc(first.text)+'</p></div>';
      if(cmts.length>1){
        cmtsHtml+='<button class="post-cmt-more" data-open-post="'+p.id+'">查看全部 '+cmts.length+' 条评论 ▾</button>';
      }
      cmtsHtml+='</div>';
    }
    return '<article class="post" data-pid="'+p.id+'">'+
      '<div class="post-head">'+
        '<div class="post-ava" data-user="'+esc(p.user)+'">'+esc((p.user||'藏')[0])+'</div>'+
        '<div class="post-info"><div class="post-name"><span class="n" data-user="'+esc(p.user)+'">'+esc(p.user)+'</span></div>'+
        '<div class="post-meta">'+timeAgo(p.createdAt)+' · <span class="post-tag">'+esc(p.tag)+'</span></div></div>'+
      '</div>'+
      '<div class="post-body">'+esc(p.content)+'</div>'+
      (imgsHtml?'<div class="post-imgs">'+imgsHtml+'</div>':'')+
      refHtml+
      '<div class="post-foot">'+
        '<button class="post-act'+liked+'" data-like="'+p.id+'"><svg viewBox="0 0 24 24" fill="'+(liked?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>'+(p.likes||0)+'</span></button>'+
        '<button class="post-act" data-cmt-toggle="'+p.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>'+cmts.length+'</span></button>'+
        '<button class="post-act" data-share-post="'+p.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span>分享</span></button>'+
      '</div>'+
      cmtsHtml+
      '<form class="post-cmt-form" data-cmt-form="'+p.id+'" style="display:none"><input placeholder="说点什么…" maxlength="120"><button type="submit">发 送</button></form>'+
    '</article>';
  }).join('');
}
function openPost(id){
  var p=null;
  for(var i=0;i<posts.length;i++){if(posts[i].id===id){p=posts[i];break;}}
  if(!p) return;
  var cmts=postCmtsOf(id);
  var imgsHtml=(p.imgs||[]).map(function(u){return '<img src="'+esc(u)+'" style="width:100%;border-radius:6px;margin-bottom:10px" data-lightbox="'+esc(u)+'" loading="lazy">';}).join('');
  var cmtsHtml=cmts.length ? cmts.map(function(c){
    return '<div class="cmt-card"><div class="cmt-ava">'+esc((c.name||'藏')[0])+'</div><div class="cmt-body"><div class="cmt-name">'+esc(c.name)+'</div><div class="cmt-text">'+esc(c.text)+'</div><div class="cmt-meta">'+timeAgo(c.createdAt)+'</div></div></div>';
  }).join('') : '<div style="font-size:13px;color:#a89e8d;padding:12px 0">还没有评论</div>';
  $('#postDetail').innerHTML='<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">'+
    '<div class="post-ava" style="width:48px;height:48px;flex:0 0 48px;font-size:18px">'+esc((p.user||'藏')[0])+'</div>'+
    '<div><div style="font-size:15px;font-weight:600">'+esc(p.user)+'</div><div style="font-size:12px;color:#a89e8d;margin-top:2px">'+timeAgo(p.createdAt)+' · '+esc(p.tag)+'</div></div></div>'+
    '<div style="font-size:14.5px;line-height:2;color:var(--ink2);white-space:pre-wrap;margin-bottom:14px">'+esc(p.content)+'</div>'+
    imgsHtml+
    '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line2);font-size:13px;color:var(--ink3)">👍 '+(p.likes||0)+' 次点赞</div>'+
    '<div class="comments-title">评 论 <small>'+cmts.length+' 条</small></div>'+
    '<div class="cmt-list">'+cmtsHtml+'</div>'+
    '<form class="cmt-form" id="postModalCmtForm"><input name="name" placeholder="您的称呼" value="'+esc(USER.name)+'" required maxlength="20"><textarea name="text" placeholder="说点什么…" required maxlength="200"></textarea><button type="submit">发表评论</button></form>';
  $('#postDetail').querySelector('#postModalCmtForm').addEventListener('submit',function(e){
    e.preventDefault();
    var f=e.target;
    var nm=f.name.value.trim(),tx=f.text.value.trim();
    if(!nm||!tx){toast('请填写称呼和评论');return;}
    addPostCmt(p.id,nm,tx);
    toast('评论已发表');
    openPost(p.id);
  });
  $('#postModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function renderCircleSide(){
  var rankUsers=['老周 · 北京','白露 · 上海','老赵 · 天津','石头 · 成都','小满 · 长沙','阿岩 · 广州'];
  $('#rankList').innerHTML=rankUsers.map(function(name,i){
    return '<div class="rank-item" data-user="'+esc(name)+'"><div class="rank-num'+(i<3?' top'+(i+1):'')+'">'+(i+1)+'</div><div class="rank-ava">'+esc(name[0])+'</div><div class="rank-info"><div class="rank-name">'+esc(name)+'</div><div class="rank-meta">'+(10-i)+' 条动态 · '+(20-i*2)+' 次换藏</div></div></div>';
  }).join('');
  var topics=[
    {t:'#老蜜蜡孔道鉴定',c:28},{t:'#和田玉籽料交流',c:22},{t:'#竹刻断代心得',c:16},
    {t:'#换藏避坑指南',c:14},{t:'#铜器皮壳辨识',c:9},{t:'#以藏换藏故事',c:32}
  ];
  $('#topicList').innerHTML=topics.map(function(x){
    return '<div class="topic-item"><span>'+esc(x.t)+'</span><span>'+x.c+'</span></div>';
  }).join('');
  var recUsers=['半山月 · 北京','听雨轩主 · 南京','林泉客 · 杭州','一叶舟 · 苏州','青玉案 · 上海'];
  $('#recommendList').innerHTML=recUsers.map(function(name){
    return '<div class="rec-item" data-user="'+esc(name)+'"><div class="rec-ava">'+esc(name[0])+'</div><div class="rec-info"><div class="rec-name">'+esc(name)+'</div><div class="rec-meta">'+Math.floor(Math.random()*20+3)+' 件在馆</div></div></div>';
  }).join('');
}
function openProfile(name){
  var userWants=wants.filter(function(w){return w.name===name;});
  var userPosts=posts.filter(function(p){return p.user===name;});
  var verified=userWants.some(function(w){return w.verified;});
  var badge=verified?'<span class="credit-badge verified">✓ 已承诺</span>':'<span class="credit-badge new">首次发布</span>';
  var wantsHtml=userWants.map(function(w){
    return '<div class="profile-item"><b>'+esc(w.have)+'</b> ⇄ '+esc((w.want||[]).join('、'))+(w.note?'<br><span style="color:var(--ink3);font-size:12.5px">'+esc(w.note)+'</span>':'')+'</div>';
  }).join('') || '<div class="profile-empty">暂 无 发 布</div>';
  var postsHtml=userPosts.map(function(p){
    return '<div class="profile-item">'+esc(p.content)+'<br><span style="color:#a89e8d;font-size:11.5px">'+timeAgo(p.createdAt)+' · '+esc(p.tag)+'</span></div>';
  }).join('') || '<div class="profile-empty">暂 无 动 态</div>';
  $('#profileContent').innerHTML=
    '<div class="profile-head"><div class="profile-ava">'+esc((name||'藏')[0])+'</div><div class="profile-info"><h3>'+esc(name||'藏友')+'</h3><div class="badges">'+badge+'</div></div></div>'+
    '<div class="profile-stats"><div><div class="n">'+userWants.length+'</div><div class="l">发布意向</div></div><div><div class="n">'+userPosts.length+'</div><div class="l">发布动态</div></div><div><div class="n">'+userWants.filter(function(w){return w.verified;}).length+'</div><div class="l">已承诺</div></div></div>'+
    '<div class="profile-tabs"><button class="pt-tab on" data-pt="wants">意 向</button><button class="pt-tab" data-pt="posts">动 态</button></div>'+
    '<div class="profile-body" id="profileBody">'+wantsHtml+'</div>';
  var tabFn=function(type){$('#profileBody').innerHTML=(type==='wants'?wantsHtml:postsHtml);};
  $('#profileContent').querySelectorAll('.pt-tab').forEach(function(b){
    b.addEventListener('click',function(){
      $('#profileContent').querySelectorAll('.pt-tab').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
      tabFn(b.getAttribute('data-pt'));
    });
  });
  $('#profileModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeProfile(){$('#profileModal').classList.remove('open');document.body.style.overflow='';}

function openMe(){
  var meWants=wants.filter(function(w){return w.name===USER.name;});
  var mePosts=posts.filter(function(p){return p.user===USER.name;});
  var meLikes=postLikes.length;
  var meFavs=favs.length;
  $('#meContent').innerHTML='<div class="profile-head"><div class="profile-ava">'+esc(USER.name[0]||'藏')+'</div><div class="profile-info"><h3>'+esc(USER.name)+'</h3><div class="badges"><span class="credit-badge verified">📅 连续签到 '+SIGNIN.streak+' 天</span><span class="credit-badge new">⭐ '+SIGNIN.points+' 积分</span></div></div></div>'+
    '<div class="profile-stats"><div><div class="n">'+mePosts.length+'</div><div class="l">动态</div></div><div><div class="n">'+meWants.length+'</div><div class="l">意向</div></div><div><div class="n">'+meLikes+'</div><div class="l">点赞</div></div><div><div class="n">'+meFavs+'</div><div class="l">收藏</div></div><div><div class="n">'+SIGNIN.totalDays+'</div><div class="l">累计签到</div></div></div>'+
    '<div class="profile-body" style="max-height:none"><h4>账 号 设 置</h4>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap"><input id="meNameInput" value="'+esc(USER.name)+'" style="flex:1;padding:10px 13px;border:1px solid var(--line);border-radius:4px;font-family:inherit;font-size:13.5px"><button id="meNameBtn" style="padding:10px 22px;background:var(--ink);color:#f6f1e6;border:none;border-radius:4px;font-size:13px;font-weight:600">保存</button></div>'+
    '<div style="margin-top:18px;font-size:13px;color:var(--ink3);line-height:1.9">收藏、点赞、浏览历史等都存储在本地浏览器中。<br>清理浏览器数据会一并清空。</div></div>';
  $('#meNameBtn').onclick=function(){
    var n=$('#meNameInput').value.trim();
    if(!n){toast('名称不能为空');return;}
    USER.name=n;save(LS_USER,USER);
    updateMeUI();
    toast('已保存');
    openMe();
  };
  $('#meModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeMe(){$('#meModal').classList.remove('open');document.body.style.overflow='';}
function updateMeUI(){
  $('#meAva').textContent=(USER.name||'藏')[0];
  $('#meName').textContent=USER.name||'藏 友';
  $('#pcAva').textContent=(USER.name||'藏')[0];
}

function openNotif(){
  var list=load(LS_NOTIF,[]);
  if(!Array.isArray(list)) list=[];
  var html='';
  if(!list.length){
    html='<div class="notif-empty">暂 无 消 息</div>';
  }else{
    list.forEach(function(n){n.read=true;});
    save(LS_NOTIF,list);
    updateNotifDot();
    html=list.map(function(n){
      return '<div class="notif-item"><div class="notif-ico">'+esc(n.icon||'💬')+'</div><div class="notif-body"><p>'+esc(n.text)+'</p><time>'+timeAgo(n.createdAt)+'</time></div></div>';
    }).join('');
  }
  $('#notifContent').innerHTML='<h3 style="font-size:17px;letter-spacing:.2em;font-weight:700;margin-bottom:18px">消 息 通 知</h3>'+html;
  $('#notifModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeNotif(){$('#notifModal').classList.remove('open');document.body.style.overflow='';}

function updateSigninUI(){
  $('#myPoints').textContent=SIGNIN.points;
  $('#myStreak').textContent=SIGNIN.streak;
  var today=todayKey();
  if(SIGNIN.lastDate===today){
    $('#signinBtn').textContent='已 签 到';
    $('#signinBtn').classList.add('done');
    $('#signinTip').textContent='今日已签到，明天再来 +5 积分';
  }else{
    $('#signinBtn').textContent='签 到';
    $('#signinBtn').classList.remove('done');
    $('#signinTip').textContent='签到领积分，积分可换藏品咨询优先权';
  }
}
function doSignin(){
  var today=todayKey();
  if(SIGNIN.lastDate===today){toast('今天已经签到过了');return;}
  var y=new Date(Date.now()-86400000);
  var yKey=y.getFullYear()+'-'+pad2(y.getMonth()+1)+'-'+pad2(y.getDate());
  if(SIGNIN.lastDate===yKey) SIGNIN.streak+=1;
  else SIGNIN.streak=1;
  SIGNIN.totalDays=(SIGNIN.totalDays||0)+1;
  var gain=5+Math.min(SIGNIN.streak,10);
  SIGNIN.points+=gain;
  SIGNIN.lastDate=today;
  save(LS_SIGNIN,SIGNIN);
  updateSigninUI();
  pushNotif('签到成功 · 获得 '+gain+' 积分','📅');
  toast('签到成功 +'+gain+' 积分');
}

function renderPostTags(){
  $('#pcTags').innerHTML=postTags.map(function(t){
    return '<button class="pc-tag'+(selectedPostTags.indexOf(t)>-1?' on':'')+'" data-post-tag="'+esc(t)+'">'+esc(t)+'</button>';
  }).join('');
}

var chatMsgs=[],chatOpened=false,chatTyping=false;
function renderChat(){
  var box=$('#chatBody');
  var html=chatMsgs.map(function(m){
    if(m.who==='me'){return '<div class="msg me"><div class="msg-wrap"><div class="msg-txt">'+esc(m.text)+'</div><span class="msg-time">'+esc(m.time||'')+'</span></div></div>';}
    return '<div class="msg bot"><div class="msg-ava">拾</div><div class="msg-wrap"><div class="msg-txt">'+esc(m.text)+'</div><span class="msg-time">'+esc(m.time||'')+'</span></div></div>';
  }).join('');
  if(chatTyping){html+='<div class="typing"><div class="msg-ava">拾</div><div class="typing-bubble"><i></i><i></i><i></i></div></div>';}
  box.innerHTML=html;box.scrollTop=box.scrollHeight;
}
function pushMsg(who,text){chatMsgs.push({who:who,text:text,time:nowTime()});renderChat();}
function matchReply(q){
  var s=String(q).toLowerCase();
  for(var i=0;i<CHAT_QA.length;i++){var kws=CHAT_QA[i].k;for(var j=0;j<kws.length;j++){if(s.indexOf(kws[j])>-1) return CHAT_QA[i].a;}}
  return CHAT_FALLBACK;
}
function sendUser(text){
  text=String(text||'').trim();
  if(!text) return;
  pushMsg('me',text);
  if(chatTyping) return;
  chatTyping=true;renderChat();
  setTimeout(function(){chatTyping=false;pushMsg('bot',matchReply(text));},620);
}
function openChat(){
  $('#chatPanel').classList.add('open');
  $('#chatFab').style.display='none';
  var dot=document.querySelector('.chat-dot');if(dot) dot.style.display='none';
  if(!chatOpened){
    chatOpened=true;
    setTimeout(function(){pushMsg('bot',CHAT_WELCOME);},260);
    setTimeout(function(){pushMsg('bot','另外提醒一句：页面中间有「换藏意向」，写清楚手里有什么、想换什么，比在这儿等更快。');},1350);
  }
  setTimeout(function(){$('#chatInput').focus();},320);
}
function closeChat(){$('#chatPanel').classList.remove('open');$('#chatFab').style.display='';}

function updateDiff(){
  var mv=+$('#wantMyVal').value,tv=+$('#wantTargetVal').value;
  var box=$('#diffBox');
  if(mv&&tv&&selectedWantChips.length){
    var diff=tv-mv;
    if(diff>0){box.textContent='参考差价：您可能需要补约 ¥ '+diff;}
    else if(diff<0){box.textContent='参考差价：对方可能需要补约 ¥ '+Math.abs(diff);}
    else{box.textContent='参考差价：等值交换，无需补差';}
    box.classList.add('show');
  }else{box.classList.remove('show');}
}

document.addEventListener('click',function(e){
  var t=e.target;
  if(t.hasAttribute&&t.hasAttribute('data-close')){closeModal();return;}
  if(t.hasAttribute&&t.hasAttribute('data-close-post')){$('#postModal').classList.remove('open');document.body.style.overflow='';return;}
  if(t.hasAttribute&&t.hasAttribute('data-close-profile')){closeProfile();return;}
  if(t.hasAttribute&&t.hasAttribute('data-close-me')){closeMe();return;}
  if(t.hasAttribute&&t.hasAttribute('data-close-notif')){closeNotif();return;}
  if(t.hasAttribute&&t.hasAttribute('data-close-article')){$('#articleModal').classList.remove('open');document.body.style.overflow='';return;}

  var lb=t.closest?t.closest('[data-lightbox]'):null;
  if(lb){e.preventDefault();openLightbox(lb.getAttribute('data-lightbox'));return;}

  var shareBtn=t.closest?t.closest('[data-share]'):null;
  if(shareBtn){e.preventDefault();e.stopPropagation();shareItem(shareBtn.getAttribute('data-share'));return;}

  var sharePost=t.closest?t.closest('[data-share-post]'):null;
  if(sharePost){
    e.preventDefault();
    var spid=sharePost.getAttribute('data-share-post');
    var sp=null;
    for(var i=0;i<posts.length;i++){if(posts[i].id===spid){sp=posts[i];break;}}
    if(!sp) return;
    var url=location.href.split('#')[0]+'?post='+spid;
    if(navigator.share){navigator.share({title:'拾光藏馆',text:sp.content,url:url}).catch(function(){});return;}
    var tmp=document.createElement('textarea');
    tmp.value=sp.content+'\n'+url;
    document.body.appendChild(tmp);tmp.select();
    try{document.execCommand('copy');toast('已复制分享链接');}catch(err){prompt('复制链接：',url);}
    document.body.removeChild(tmp);
    return;
  }

  var likeBtn=t.closest?t.closest('[data-like]'):null;
  if(likeBtn){e.preventDefault();toggleLike(likeBtn.getAttribute('data-like'));return;}

  var cmtToggle=t.closest?t.closest('[data-cmt-toggle]'):null;
  if(cmtToggle){
    e.preventDefault();
    var pid=cmtToggle.getAttribute('data-cmt-toggle');
    var form=document.querySelector('[data-cmt-form="'+pid+'"]');
    if(form) form.style.display=(form.style.display==='none'||!form.style.display)?'flex':'none';
    return;
  }

  var refBtn=t.closest?t.closest('[data-ref]'):null;
  if(refBtn){e.preventDefault();openDetail(refBtn.getAttribute('data-ref'));return;}

  var tradeBtn=t.closest?t.closest('[data-trade]'):null;
  if(tradeBtn){
    e.preventDefault();e.stopPropagation();
    var tid=tradeBtn.getAttribute('data-trade');
    var tit=null;
    for(var ti=0;ti<items.length;ti++){if(items[ti].id===tid){tit=items[ti];break;}}
    closeModal();
    var wc=catToWant(tit?tit.category:'');
    selectedWantChips=[wc];renderWantChips();
    setTimeout(function(){
      var sec=$('#wants');if(sec) window.scrollTo({top:sec.offsetTop-70,behavior:'smooth'});
      var f=$('#wantForm');if(f){f.classList.add('flash');setTimeout(function(){f.classList.remove('flash');},3200);}
      var hi=$('#wantHave');if(hi) hi.focus();
    },260);
    toast('已预选「'+wc+'」，填上你手里的东西就能发布');
    return;
  }

  var delBtn=t.closest?t.closest('.want-del'):null;
  if(delBtn){
    e.preventDefault();
    var wid=delBtn.getAttribute('data-del');
    wants=wants.filter(function(w){return w.id!==wid;});
    save(LS_WANTS,wants);renderWants();toast('已删除该意向');
    return;
  }

  var userEl=t.closest?t.closest('[data-user]'):null;
  if(userEl){e.preventDefault();openProfile(userEl.getAttribute('data-user'));return;}

  var matchBtn=t.closest?t.closest('[data-match]'):null;
  if(matchBtn){e.preventDefault();focusItem(matchBtn.getAttribute('data-match'));return;}

  var chip=t.closest?t.closest('.wf-chip'):null;
  if(chip){
    e.preventDefault();
    var cname=chip.getAttribute('data-chip');
    var ci=selectedWantChips.indexOf(cname);
    if(ci>-1) selectedWantChips.splice(ci,1);else selectedWantChips.push(cname);
    renderWantChips();updateDiff();
    return;
  }

  var postTagEl=t.closest?t.closest('[data-post-tag]'):null;
  if(postTagEl){
    e.preventDefault();
    var pt=postTagEl.getAttribute('data-post-tag');
    var pti=selectedPostTags.indexOf(pt);
    if(pti>-1) selectedPostTags.splice(pti,1);else selectedPostTags.push(pt);
    renderPostTags();
    return;
  }

  var pfBtn=t.closest?t.closest('.pf-btn'):null;
  if(pfBtn){
    $all('.pf-btn').forEach(function(x){x.classList.remove('on');});
    pfBtn.classList.add('on');
    curPostFilter=pfBtn.getAttribute('data-pf');
    renderPosts();
    return;
  }

  var favBtn=t.closest?t.closest('[data-fav]'):null;
  if(favBtn){e.stopPropagation();var fid=favBtn.getAttribute('data-fav');toggleFav(fid);toast(isFav(fid)?'已加入收藏':'已取消收藏');return;}

  var cat=t.closest?t.closest('.cat'):null;
  if(cat){curCat=cat.getAttribute('data-cat');renderCats();renderGrid();return;}

  var th=t.closest?t.closest('.thumb'):null;
  if(th){
    var id=th.getAttribute('data-id'),i=+th.getAttribute('data-i');
    var arr=IMGS[id]||[];
    if(arr[i]){$('#mainImg').src=arr[i];}
    var sibs=th.parentNode.children;
    for(var k=0;k<sibs.length;k++) sibs[k].classList.remove('active');
    th.classList.add('active');
    return;
  }

  var advEra=t.closest?t.closest('[data-adv-era]'):null;
  if(advEra){
    var ev=advEra.getAttribute('data-adv-era');
    var ei=advFilter.era.indexOf(ev);
    if(ei>-1) advFilter.era.splice(ei,1);else advFilter.era.push(ev);
    renderAdvChips();renderGrid();return;
  }
  var advSt=t.closest?t.closest('[data-adv-status]'):null;
  if(advSt){
    var sv=advSt.getAttribute('data-adv-status');
    var si=advFilter.status.indexOf(sv);
    if(si>-1) advFilter.status.splice(si,1);else advFilter.status.push(sv);
    renderAdvChips();renderGrid();return;
  }

  var cmtMore=t.closest?t.closest('[data-cmt-more]'):null;
  if(cmtMore){
    e.preventDefault();
    var wrap=document.getElementById(cmtMore.getAttribute('data-cmt-more'));
    if(wrap){
      var total=cmtMore.getAttribute('data-total');
      if(wrap.style.display==='none'){
        wrap.style.display='';
        cmtMore.textContent='收起评论 ▴';
      }else{
        wrap.style.display='none';
        cmtMore.textContent='展开 '+total+' 条评论 ▾';
      }
    }
    return;
  }

  var openPostBtn=t.closest?t.closest('[data-open-post]'):null;
  if(openPostBtn){e.preventDefault();openPost(openPostBtn.getAttribute('data-open-post'));return;}

  var qb=t.closest?t.closest('#chatQuick button'):null;
  if(qb){sendUser(qb.textContent);return;}

  var art=t.closest?t.closest('[data-article]'):null;
  if(art){openArticle(art.getAttribute('data-article'));return;}

  var hi=t.closest?t.closest('.history-item'):null;
  if(hi){openDetail(hi.getAttribute('data-id'));return;}

  var cardEl=t.closest?t.closest('.card'):null;
  if(cardEl){openDetail(cardEl.getAttribute('data-id'));return;}
});

document.addEventListener('submit',function(e){
  var f=e.target;
  if(f.matches&&f.matches('.post-cmt-form')){
    e.preventDefault();
    var pid=f.getAttribute('data-cmt-form');
    var inp=f.querySelector('input');
    var text=inp.value.trim();
    if(!text){toast('请填写评论');return;}
    addPostCmt(pid,USER.name,text);
    inp.value='';
    renderPosts();
    toast('评论已发表');
  }
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if($('#lightbox').classList.contains('open')){closeLightbox();return;}
    if($('#modal').classList.contains('open')){closeModal();return;}
    if($('#postModal').classList.contains('open')){$('#postModal').classList.remove('open');document.body.style.overflow='';return;}
    if($('#profileModal').classList.contains('open')){closeProfile();return;}
    if($('#meModal').classList.contains('open')){closeMe();return;}
    if($('#notifModal').classList.contains('open')){closeNotif();return;}
    if($('#articleModal').classList.contains('open')){$('#articleModal').classList.remove('open');document.body.style.overflow='';return;}
    closeChat();
  }
  if($('#modal').classList.contains('open')){
    if(e.key==='ArrowLeft') navDetail(-1);
    if(e.key==='ArrowRight') navDetail(1);
  }
});

$('#search').addEventListener('input',function(e){curKw=e.target.value;renderGrid();});
$('#sortSel').addEventListener('change',function(e){curSort=e.target.value;renderGrid();});
$('#advBtn').addEventListener('click',function(){
  var p=$('#advPanel');p.classList.toggle('open');
  this.classList.toggle('on',p.classList.contains('open'));
});
$('#advMin').addEventListener('input',function(e){advFilter.min=e.target.value;renderGrid();});
$('#advMax').addEventListener('input',function(e){advFilter.max=e.target.value;renderGrid();});
$('#advClear').addEventListener('click',function(){
  advFilter={min:'',max:'',era:[],status:[]};
  $('#advMin').value='';$('#advMax').value='';
  renderAdvChips();renderGrid();
});
$('#emptyReset').addEventListener('click',function(){
  curCat='全部';curKw='';curSort='default';
  advFilter={min:'',max:'',era:[],status:[]};
  $('#search').value='';$('#sortSel').value='default';
  $('#advMin').value='';$('#advMax').value='';
  renderCats();renderAdvChips();renderGrid();
});
$('#favBtn').addEventListener('click',function(){
  if(favs.length===0){toast('还没有收藏，点藏品右上角的心形试试');return;}
  curSort='favOnly';curCat='全部';curKw='';
  $('#search').value='';$('#sortSel').value='favOnly';
  renderCats();renderGrid();
  var el=$('#collection');if(el) window.scrollTo({top:el.offsetTop-70,behavior:'smooth'});
});
$('#detailPrev').addEventListener('click',function(e){e.stopPropagation();navDetail(-1);});
$('#detailNext').addEventListener('click',function(e){e.stopPropagation();navDetail(1);});
$('#lightboxClose').addEventListener('click',closeLightbox);
$('#lightbox').addEventListener('click',function(e){if(e.target===this) closeLightbox();});
$('#notifBtn').addEventListener('click',openNotif);
$('#meBtn').addEventListener('click',openMe);
$('#signinBtn').addEventListener('click',doSignin);

$('#clearHistory').addEventListener('click',function(){
  historyIds=[];save(LS_HISTORY,historyIds);renderHistory();toast('已清空浏览历史');
});

$('#wantMyVal').addEventListener('input',updateDiff);
$('#wantTargetVal').addEventListener('input',updateDiff);

$('#pcImgBtn').addEventListener('click',function(){$('#pcImgInput').click();});
$('#pcImgInput').addEventListener('change',function(e){
  var f=e.target.files[0];
  if(!f) return;
  var reader=new FileReader();
  reader.onload=function(ev){
    pendingPostImgs.push(ev.target.result);
    renderPendingImgs();
  };
  reader.readAsDataURL(f);
  e.target.value='';
});
function renderPendingImgs(){
  $('#pcImgPreview').innerHTML=pendingPostImgs.map(function(u,i){
    return '<img src="'+esc(u)+'" data-rm-img="'+i+'">';
  }).join('');
}
document.addEventListener('click',function(e){
  var t=e.target;
  var rm=t.closest?t.closest('[data-rm-img]'):null;
  if(rm){
    var i=+rm.getAttribute('data-rm-img');
    pendingPostImgs.splice(i,1);
    renderPendingImgs();
  }
});

$('#pcPublish').addEventListener('click',function(){
  var text=$('#pcInput').value.trim();
  if(!text&&!pendingPostImgs.length){toast('说点什么或加张图吧');return;}
  var tag=selectedPostTags[0]||'晒宝';
  var p={id:uid(),user:USER.name,tag:tag,content:text,imgs:pendingPostImgs.slice(),createdAt:Date.now(),likes:0};
  posts.unshift(p);
  save(LS_POSTS,posts);
  $('#pcInput').value='';
  pendingPostImgs=[];
  selectedPostTags=[];
  renderPendingImgs();
  renderPostTags();
  renderPosts();
  toast('已发布');
});

$('#contactForm').addEventListener('submit',function(e){
  e.preventDefault();
  var f=e.target;
  var msg={id:uid(),name:f.name.value.trim(),contact:f.contact.value.trim(),type:f.type.value,message:f.message.value.trim(),itemId:'',itemName:'（通用留言）',read:false,createdAt:Date.now()};
  if(!msg.name||!msg.contact){toast('请填写称呼与联系方式');return;}
  var msgs=load(LS_MSGS,[]);msgs.unshift(msg);save(LS_MSGS,msgs);
  pushNotif('新留言 · '+msg.name+'（通用留言）','📩');
  f.reset();toast('已收到，感谢您的留言');
});

$('#wantForm').addEventListener('submit',function(e){
  e.preventDefault();
  var f=e.target;
  var name=f.name.value.trim();
  var contact=f.contact.value.trim();
  var have=f.have.value.trim();
  var note=f.note.value.trim();
  var myVal=f.myVal.value;
  var targetVal=f.targetVal.value;
  if(!name||!contact){toast('请填写称呼和联系方式');return;}
  if(!have){toast('请填写「我手里的」是什么');return;}
  if(!selectedWantChips.length){toast('请至少选一项想换的类别');return;}
  if(!$('#wantVerify').checked){toast('请勾选承诺框');return;}
  var w={id:uid(),name:name,contact:contact,have:have,want:selectedWantChips.slice(),note:note,myVal:myVal,targetVal:targetVal,verified:true,createdAt:Date.now()};
  wants.unshift(w);save(LS_WANTS,wants);
  var msgs=load(LS_MSGS,[]);
  msgs.unshift({id:uid(),name:name,contact:contact,type:'交换',message:'【换藏意向】我有：'+have+' ｜ 想换：'+selectedWantChips.join('、')+(myVal?' ｜ 我的估值：'+myVal:'')+(targetVal?' ｜ 目标估值：'+targetVal:'')+(note?(' ｜ '+note):''),itemId:'',itemName:'（换藏意向）',read:false,createdAt:Date.now()});
  save(LS_MSGS,msgs);
  pushNotif('新意向 · '+name+' 发布了换藏意向','✏️');
  f.reset();
  selectedWantChips=[];
  renderWantChips();
  renderWants();
  updateDiff();
  toast('意向已发布，有对路的我会联系您');
});

$('#chatFab').addEventListener('click',openChat);
$('#chatClose').addEventListener('click',closeChat);
$('#chatQuickLabel').addEventListener('click',function(){$('#chatQuickWrap').classList.toggle('open');});
$('#chatSend').addEventListener('click',function(){var inp=$('#chatInput');sendUser(inp.value);inp.value='';});
$('#chatInput').addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();sendUser(this.value);this.value='';}
});

var backTop=$('#backTop');
window.addEventListener('scroll',function(){
  if(window.scrollY>420) backTop.classList.add('show');
  else backTop.classList.remove('show');
});
backTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

$('#chatQuick').innerHTML=CHAT_QA.map(function(qa){return '<button type="button">'+esc(qa.q)+'</button>';}).join('');

$('#year').textContent=new Date().getFullYear();
updateFavUI();
renderCats();
renderAdvChips();
renderGrid();
renderRecords();
renderArticles();
renderWantChips();
renderWants();
renderHistory();
renderPostTags();
renderPosts();
renderCircleSide();
updateMeUI();
updateSigninUI();
updateNotifDot();

if(posts.length) pushNotif('欢迎回来，'+USER.name+'。圈里今天有新动态。','👋');