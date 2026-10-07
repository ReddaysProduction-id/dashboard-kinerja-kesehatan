(() => {
"use strict";

const AREAS = {
  promkes:"PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT",
  keluarga:"KESEHATAN KELUARGA DAN GIZI MASYARAKAT",
  lingkungan:"KESEHATAN LINGKUNGAN, KESEHATAN KERJA DAN OLAHRAGA"
};

const PROGRAMS = {
  promkes:[
    {id:"pm1",title:"PEMBERDAYAAN MASYARAKAT",items:["Orientasi Posyandu bagi tenaga kesehatan","Pelatihan Kader Posyandu (Siklus Hidup)"]},
    {id:"pm2",title:"PROMOSI KESEHATAN",items:["PEMBUDAYAAN HIDUP SEHAT","EDUKASI PROMOSI DI MEDIA SOSIAL"]},
    {id:"pm3",title:"TUGAS TAMBAHAN",items:["SAKA BAKTI HUSADA","UKS","LITERASI KESEHATAN","PERILAKU HIDUP SEHAT"]}
  ],
  keluarga:[{id:"kl1",title:"KEGIATAN KESEHATAN KELUARGA DAN GIZI MASYARAKAT",items:["Kegiatan kesehatan keluarga","Kegiatan gizi masyarakat"]}],
  lingkungan:[{id:"lk1",title:"KEGIATAN KESEHATAN LINGKUNGAN, KERJA DAN OLAHRAGA",items:["Kesehatan lingkungan","Kesehatan kerja","Kesehatan olahraga"]}]
};

const SEED=[
{area:"promkes",program:"pm1",date:"2026-08-10",title:"Orientasi Posyandu bagi tenaga kesehatan",type:"Pemberdayaan Masyarakat",location:"Teluk Batang",status:"Selesai",doc:true,desc:"Orientasi Posyandu bagi tenaga kesehatan.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm1",date:"2026-08-20",title:"Pelatihan Kader Posyandu (Siklus Hidup)",type:"Pemberdayaan Masyarakat",location:"Sukadana",status:"Selesai",doc:true,desc:"Pelatihan kader Posyandu berbasis siklus hidup.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm2",date:"2026-09-24",title:"Pembudayaan Hidup Sehat",type:"Promosi Kesehatan",location:"Sukadana",status:"Selesai",doc:true,desc:"Kegiatan promosi pembudayaan hidup sehat.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm2",date:"2026-09-25",title:"Edukasi Promosi di Media Sosial",type:"Promosi Kesehatan",location:"Kabupaten Kayong Utara",status:"Selesai",doc:true,desc:"Produksi dan publikasi edukasi kesehatan di media sosial.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm3",date:"2026-09-18",title:"Kegiatan Saka Bakti Husada",type:"Tugas Tambahan",location:"Sukadana",status:"Proses",doc:false,desc:"Kegiatan Saka Bakti Husada.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm3",date:"2026-09-22",title:"Kegiatan UKS",type:"Tugas Tambahan",location:"Sukadana",status:"Selesai",doc:true,desc:"Kegiatan pembinaan UKS.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm3",date:"2026-09-26",title:"Literasi Kesehatan",type:"Tugas Tambahan",location:"Sukadana",status:"Proses",doc:false,desc:"Kegiatan literasi kesehatan.",photo:"",video:"",pdf:""},
{area:"promkes",program:"pm3",date:"2026-09-28",title:"Perilaku Hidup Sehat",type:"Tugas Tambahan",location:"Sukadana",status:"Selesai",doc:true,desc:"Edukasi dan penguatan perilaku hidup sehat.",photo:"",video:"",pdf:""},
{area:"keluarga",program:"kl1",date:"2026-08-18",title:"Pemantauan pelayanan kesehatan ibu dan anak",type:"Kesehatan Keluarga",location:"Sukadana",status:"Selesai",doc:true,desc:"Pemantauan layanan kesehatan ibu dan anak.",photo:"",video:"",pdf:""},
{area:"keluarga",program:"kl1",date:"2026-09-05",title:"Pemantauan kegiatan Aksi Bergizi",type:"Gizi Masyarakat",location:"Sukadana",status:"Proses",doc:false,desc:"Pemantauan pelaksanaan Aksi Bergizi.",photo:"",video:"",pdf:""},
{area:"lingkungan",program:"lk1",date:"2026-09-12",title:"Inspeksi kesehatan lingkungan",type:"Kesehatan Lingkungan",location:"Sukadana",status:"Selesai",doc:true,desc:"Inspeksi kesehatan lingkungan.",photo:"",video:"",pdf:""},
{area:"lingkungan",program:"lk1",date:"2026-09-20",title:"Pembinaan tempat kerja sehat",type:"Kesehatan Kerja",location:"Teluk Batang",status:"Selesai",doc:true,desc:"Pembinaan tempat kerja sehat.",photo:"",video:"",pdf:""}
];

let data;
try { data=JSON.parse(localStorage.getItem("dinkeskb_dashboard_v4")||"null") || SEED; }
catch(e){ data=SEED; }

let currentArea="promkes", currentProgram="all", homeChart=null;

const $=id=>document.getElementById(id);
const pages={home:$("pageHome"),programs:$("pagePrograms"),list:$("pageList")};

function store(){ localStorage.setItem("dinkeskb_dashboard_v4",JSON.stringify(data)); }
function fmt(d){return new Date(d+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});}
function hidePages(){Object.values(pages).forEach(p=>p.classList.add("hidden"));}
function navActive(name){document.querySelectorAll(".nav").forEach(n=>n.classList.remove("active"));const el=document.querySelector(`[data-nav="${name}"]`);if(el)el.classList.add("active");}

function showHome(){
  hidePages(); pages.home.classList.remove("hidden");
  $("pageTitle").textContent="Dashboard Kinerja Kesehatan"; navActive("home"); updateHome();
}
function showArea(a){
  currentArea=a; currentProgram="all";
  if(a==="promkes"){hidePages();pages.programs.classList.remove("hidden");$("pageTitle").textContent=AREAS[a];$("programEyebrow").textContent="01 • "+AREAS[a];renderPrograms();navActive("promkes");}
  else {showList(a,"all");}
}
function showPrograms(){showArea("promkes");}
function renderPrograms(){
  const groups=PROGRAMS[currentArea]||[];
  const grid=document.getElementById("programGrid");
  grid.className="activity-groups";
  grid.innerHTML=groups.map((g,gi)=>{
    const cards=g.items.map((item,ii)=>{
      const existing=data.filter(x=>x.area===currentArea&&x.program===g.id&&
        x.title.toLowerCase()===item.toLowerCase()).length;
      return `<div class="activity-card" data-program="${g.id}" data-item="${ii}">
        <div class="tag">${g.title}</div>
        <h4>${item}</h4>
        <p>${existing} kegiatan/laporan tercatat</p>
        <div class="arrow">→</div>
      </div>`;
    }).join("");
    return `<div class="category-block">
      <div class="category-title"><div class="bar"></div><h3>${g.title}</h3></div>
      <div class="activity-grid">${cards}</div>
    </div>`;
  }).join("");
  grid.querySelectorAll(".activity-card").forEach(card=>{
    card.addEventListener("click",()=>{
      const g=groups.find(x=>x.id===card.dataset.program);
      const item=g.items[Number(card.dataset.item)];
      openActivity(currentArea,g.id,item);
    });
  });
}

function openActivity(areaId,programId,itemTitle){
  currentArea=areaId;
  currentProgram=programId;
  hidePages();
  pages.list.classList.remove("hidden");
  const group=(PROGRAMS[areaId]||[]).find(x=>x.id===programId);
  document.getElementById("pageTitle").textContent=AREAS[areaId];
  document.getElementById("listTitle").textContent=itemTitle;
  document.getElementById("crumb").textContent=" / "+(group?group.title:"")+" / "+itemTitle;
  updateList(itemTitle);
  navActive(areaId);
}

function showList(a,p){
  currentArea=a;currentProgram=p;currentItem="";hidePages();pages.list.classList.remove("hidden");
  const obj=(PROGRAMS[a]||[]).find(x=>x.id===p);
  $("pageTitle").textContent=AREAS[a];$("listTitle").textContent=p==="all"?AREAS[a]:(obj?obj.title:"Daftar Kegiatan");
  $("crumb").textContent=" / "+(obj?obj.title:"Semua Kegiatan");
  updateList();navActive(a==="promkes"?"promkes":a);
}
function updateHome(){
  const total=data.length,done=data.filter(x=>x.status==="Selesai").length,doc=data.filter(x=>x.doc).length;
  $("kTotal").textContent=total;$("kDone").textContent=done;$("kDoc").textContent=total?Math.round(doc/total*100)+"%":"0%";$("kAch").textContent=total?Math.round(done/total*100)+"%":"0%";
  $("countPromkes").textContent=data.filter(x=>x.area==="promkes").length;
  $("countKeluarga").textContent=data.filter(x=>x.area==="keluarga").length;
  $("countLingkungan").textContent=data.filter(x=>x.area==="lingkungan").length;
  const labels=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],vals=labels.map((_,i)=>data.filter(x=>new Date(x.date+"T00:00:00").getMonth()===i).length);
  if(homeChart)homeChart.destroy();
  const canvas=$("homeChart");
  if(window.Chart) homeChart=new Chart(canvas,{type:"bar",data:{labels,datasets:[{data:vals,backgroundColor:"#0a9b95",borderRadius:5}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});
}
let currentItem="";
function filteredData(){
  return data.filter(x=>x.area===currentArea&&
    (currentProgram==="all"||x.program===currentProgram)&&
    (!currentItem||x.title.toLowerCase()===currentItem.toLowerCase()));
}
function updateList(itemTitle=""){
  currentItem=itemTitle||"";
  const a=filteredData(),done=a.filter(x=>x.status==="Selesai").length,proc=a.filter(x=>x.status==="Proses").length,doc=a.filter(x=>x.doc).length;
  $("listTotal").textContent=a.length;$("listDone").textContent=done;$("listProcess").textContent=proc;$("listDoc").textContent=a.length?Math.round(doc/a.length*100)+"%":"0%";renderTable();
}
function renderTable(){
  const q=$("searchInput").value.trim().toLowerCase(),s=$("statusFilter").value;
  const a=filteredData().filter(x=>(!q||`${x.title} ${x.type} ${x.location}`.toLowerCase().includes(q))&&(!s||x.status===s));
  $("tableBody").innerHTML=a.length?a.map(x=>{
    const i=data.indexOf(x),cls=x.status==="Selesai"?"done":x.status==="Proses"?"process":"plan";
    return `<tr><td>${fmt(x.date)}</td><td><b>${x.title}</b></td><td>${x.type}</td><td>${x.location}</td><td><span class="status ${cls}">${x.status}</span></td><td>${x.doc?"✓ Ada":"—"}</td><td><button class="action detail" data-id="${i}">Detail</button><button class="action edit" data-id="${i}">Edit</button><button class="action danger delete" data-id="${i}">Hapus</button></td></tr>`;
  }).join(""):`<tr><td colspan="7" style="text-align:center;padding:30px;color:#8999a3">Data tidak ditemukan.</td></tr>`;
  document.querySelectorAll(".detail").forEach(b=>b.addEventListener("click",()=>view(+b.dataset.id)));
  document.querySelectorAll(".edit").forEach(b=>b.addEventListener("click",()=>openForm(+b.dataset.id)));
  document.querySelectorAll(".delete").forEach(b=>b.addEventListener("click",()=>removeData(+b.dataset.id)));
}

function fillPrograms(area,selected){
  $("fProgram").innerHTML=(PROGRAMS[area]||[]).map(p=>`<option value="${p.id}" ${p.id===selected?"selected":""}>${p.title}</option>`).join("");
}
function openForm(id=null){
  $("formModal").classList.remove("hidden");
  $("formHead").textContent=id===null?"Tambah Kegiatan":"Edit Kegiatan";
  $("editId").value=id===null?"":id;
  if(id!==null){
    const x=data[id];$("fArea").value=x.area;fillPrograms(x.area,x.program);$("fDate").value=x.date;$("fStatus").value=x.status;$("fTitle").value=x.title;$("fType").value=x.type;$("fLocation").value=x.location;$("fDoc").value=String(x.doc);$("fDesc").value=x.desc||"";$("fPhoto").value=x.photo||"";$("fVideo").value=x.video||"";$("fPdf").value=x.pdf||"";
  }else{
    $("activityForm").reset();$("fArea").value=currentArea;fillPrograms(currentArea,currentProgram==="all"?"":currentProgram);$("fDate").value=new Date().toISOString().slice(0,10);
  }
}
function closeForm(){$("formModal").classList.add("hidden");}
function save(e){
  e.preventDefault();
  const id=$("editId").value===""?null:+$("editId").value;
  const x={area:$("fArea").value,program:$("fProgram").value,date:$("fDate").value,status:$("fStatus").value,title:$("fTitle").value,type:$("fType").value,location:$("fLocation").value,doc:$("fDoc").value==="true",desc:$("fDesc").value,photo:$("fPhoto").value,video:$("fVideo").value,pdf:$("fPdf").value};
  if(id===null)data.push(x);else data[id]=x;store();closeForm();currentArea=x.area;currentProgram=x.program;currentItem=x.title;
  if(x.area==="promkes"){hidePages();pages.programs.classList.remove("hidden");$("pageTitle").textContent=AREAS.promkes;$("programEyebrow").textContent="01 • "+AREAS.promkes;renderPrograms();navActive("promkes");}
  else showList(x.area,x.program);
  updateHome();
}
function removeData(i){if(confirm("Hapus kegiatan ini?")){data.splice(i,1);store();updateList();updateHome();if(currentArea==="promkes"&&pages.programs.classList.contains("hidden")===false)renderPrograms();}}
function view(i){
  const x=data[i];$("viewTitle").textContent=x.title;
  $("viewMeta").innerHTML=`<div><span>Tanggal</span><b>${fmt(x.date)}</b></div><div><span>Lokasi</span><b>${x.location}</b></div><div><span>Jenis</span><b>${x.type}</b></div><div><span>Status</span><b>${x.status}</b></div>`;
  $("viewDesc").textContent=x.desc||"Tidak ada keterangan.";
  const links=[];if(x.photo)links.push(`<a href="${x.photo}" target="_blank" rel="noopener">📷 Foto</a>`);if(x.video)links.push(`<a href="${x.video}" target="_blank" rel="noopener">🎬 Video</a>`);if(x.pdf)links.push(`<a href="${x.pdf}" target="_blank" rel="noopener">📄 Laporan PDF</a>`);
  $("viewLinks").innerHTML=links.join("")||"<span style='color:#8999a3'>Belum ada tautan dokumentasi.</span>";
  $("viewModal").classList.remove("hidden");
}

document.querySelectorAll("[data-area]").forEach(el=>el.addEventListener("click",()=>showArea(el.dataset.area)));
document.querySelectorAll("[data-nav]").forEach(el=>el.addEventListener("click",()=>{const n=el.dataset.nav;if(n==="home")showHome();else showArea(n);}));
$("backHome1").addEventListener("click",showHome);
$("backPrograms").addEventListener("click",showPrograms);
$("addBtn").addEventListener("click",()=>openForm());
$("addFromList").addEventListener("click",()=>openForm());
$("printBtn").addEventListener("click",()=>window.print());
$("closeForm").addEventListener("click",closeForm);$("cancelForm").addEventListener("click",closeForm);
$("closeView").addEventListener("click",()=>$("viewModal").classList.add("hidden"));
$("searchInput").addEventListener("input",renderTable);$("statusFilter").addEventListener("change",renderTable);
$("fArea").addEventListener("change",()=>fillPrograms($("fArea").value,""));
$("activityForm").addEventListener("submit",save);

showHome();
})();

// ===== V6: colorize individual activity cards =====
function applyActivityColors() {
  const colors = ['color-blue','color-teal','color-green','color-gold','color-purple','color-red','color-navy','color-orange'];
  const cards = document.querySelectorAll('.activity-card');
  cards.forEach((card, i) => {
    colors[i % colors.length] && card.classList.add(colors[i % colors.length]);
    if (!card.querySelector('.activity-icon')) {
      const icon = document.createElement('div');
      icon.className = 'activity-icon';
      icon.textContent = '✓';
      card.prepend(icon);
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  applyActivityColors();
  const observer = new MutationObserver(() => applyActivityColors());
  const target = document.getElementById('app') || document.body;
  observer.observe(target, {childList:true, subtree:true});
});


/* ===== V7: DATA ORIENTASI POSYANDU ===== */
const POSYANDU_PUSKESMAS = [
  "PUSKESMAS SIDUK",
  "PUSKESMAS SUKADANA",
  "PUSKESMAS TELUK MELANO",
  "PUSKESMAS MATAN JAYA",
  "PUSKESMAS SUNGAI PADUAN",
  "PUSKESMAS TELUK BATANG",
  "PUSKESMAS TELAGA ARUM",
  "PUSKESMAS TANJUNG SATAI",
  "PUSKESMAS DUSUN BESAR",
  "PUSKESMAS PELAPIS",
  "PUSKESMAS PADANG",
  "DINKESKB KAYONG UTARA"
];

const POSYANDU_KEY = "dashboard_posyandu_petugas_v7";

function getPosyanduData() {
  try {
    return JSON.parse(localStorage.getItem(POSYANDU_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function savePosyanduData(data) {
  localStorage.setItem(POSYANDU_KEY, JSON.stringify(data));
}

function openPosyanduTraining() {
  const app = document.getElementById("app") || document.body;
  const data = getPosyanduData();

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT / PEMBERDAYAAN MASYARAKAT</div>
        <h1>ORIENTASI POSYANDU BAGI TENAGA KESEHATAN</h1>
        <p>PILIH PUSKESMAS UNTUK MELIHAT DAN MENGISI DAFTAR PETUGAS YANG SUDAH DILATIH.</p>
      </div>
    </div>
    <div class="posyandu-grid" id="posyanduGrid"></div>
  `;

  const grid = document.getElementById("posyanduGrid");
  POSYANDU_PUSKESMAS.forEach((name, i) => {
    const count = (data[name] || []).length;
    const isDinkes = name === "DINKESKB KAYONG UTARA";
    const card = document.createElement("div");
    card.className = "posyandu-card" + (isDinkes ? " dinkes" : "");
    card.innerHTML = `
      <span class="limit">${isDinkes ? "TIDAK TERBATAS" : "MAKS. 5 ORANG"}</span>
      <div class="p-icon">${isDinkes ? "DK" : String(i+1).padStart(2,"0")}</div>
      <h3>${name}</h3>
      <p>${count} PETUGAS TERDAFTAR</p>
    `;
    card.addEventListener("click", () => openPosyanduPuskesmas(name));
    grid.appendChild(card);
  });
}

function openPosyanduPuskesmas(name) {
  const app = document.getElementById("app") || document.body;
  const data = getPosyanduData();
  const names = data[name] || [];
  const isDinkes = name === "DINKESKB KAYONG UTARA";
  const max = isDinkes ? Infinity : 5;

  app.innerHTML = `
    <div class="page-head">
      <button class="btn posyandu-back" id="backPosyandu">← KEMBALI KE DAFTAR PUSKESMAS</button>
      <div class="breadcrumb">ORIENTASI POSYANDU BAGI TENAGA KESEHATAN / ${name}</div>
      <h1>${name}</h1>
      <p>${isDinkes ? "JUMLAH PETUGAS TIDAK DIBATASI." : "MAKSIMAL 5 PETUGAS YANG DAPAT DITAMBAHKAN."}</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">PETUGAS SUDAH DILATIH</div>
        <div class="kpi-value" id="petugasCount">${names.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">KAPASITAS</div>
        <div class="kpi-value">${isDinkes ? "∞" : max}</div>
      </div>
    </div>

    <div class="petugas-panel">
      <div class="section-head">
        <h2>DAFTAR NAMA PETUGAS</h2>
        <button class="btn btn-primary" id="addPetugas" ${names.length >= max ? "disabled" : ""}>+ TAMBAH PETUGAS</button>
      </div>
      <div class="petugas-list" id="petugasList"></div>
    </div>
  `;

  document.getElementById("backPosyandu").addEventListener("click", openPosyanduTraining);
  renderPetugasList(name);
  document.getElementById("addPetugas").addEventListener("click", () => addPetugas(name));
}

function renderPetugasList(name) {
  const data = getPosyanduData();
  const names = data[name] || [];
  const list = document.getElementById("petugasList");
  if (!list) return;

  if (!names.length) {
    list.innerHTML = `<div class="petugas-empty">BELUM ADA NAMA PETUGAS YANG DITAMBAHKAN.</div>`;
    return;
  }

  list.innerHTML = "";
  names.forEach((person, i) => {
    const row = document.createElement("div");
    row.className = "petugas-row";
    row.innerHTML = `
      <div class="petugas-number">${i+1}</div>
      <div class="petugas-name">${String(person).toUpperCase()}</div>
      <button class="btn" data-remove="${i}">HAPUS</button>
    `;
    row.querySelector("[data-remove]").addEventListener("click", () => removePetugas(name, i));
    list.appendChild(row);
  });
}

function addPetugas(name) {
  const data = getPosyanduData();
  const names = data[name] || [];
  const max = name === "DINKESKB KAYONG UTARA" ? Infinity : 5;

  if (names.length >= max) {
    alert("KUOTA PETUGAS UNTUK PUSKESMAS INI SUDAH MENCAPAI 5 ORANG.");
    return;
  }

  const value = prompt("MASUKKAN NAMA PETUGAS YANG SUDAH DILATIH:");
  if (!value || !value.trim()) return;

  names.push(value.trim().toUpperCase());
  data[name] = names;
  savePosyanduData(data);
  openPosyanduPuskesmas(name);
}

function removePetugas(name, index) {
  if (!confirm("HAPUS NAMA PETUGAS INI DARI DAFTAR?")) return;
  const data = getPosyanduData();
  if (!data[name]) return;
  data[name].splice(index, 1);
  savePosyanduData(data);
  openPosyanduPuskesmas(name);
}

/* Try to route the existing "Orientasi Posyandu..." card to the new drill-down. */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card) return;
  const textContent = (card.textContent || "").toUpperCase();
  if (textContent.includes("ORIENTASI POSYANDU BAGI TENAGA KESEHATAN")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openPosyanduTraining();
  }
}, true);



/* ===== V8: DATA PELATIHAN KADER POSYANDU SIKLUS HIDUP ===== */
const KADER_TARGET = 903;
const KADER_KEY = "dashboard_kader_posyandu_v8";

const KADER_PUSKESMAS = [
  "PUSKESMAS SIDUK",
  "PUSKESMAS SUKADANA",
  "PUSKESMAS TELUK MELANO",
  "PUSKESMAS MATAN JAYA",
  "PUSKESMAS SUNGAI PADUAN",
  "PUSKESMAS TELUK BATANG",
  "PUSKESMAS TELAGA ARUM",
  "PUSKESMAS TANJUNG SATAI",
  "PUSKESMAS DUSUN BESAR",
  "PUSKESMAS PELAPIS",
  "PUSKESMAS PADANG"
];

function getKaderData() {
  try {
    return JSON.parse(localStorage.getItem(KADER_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveKaderData(data) {
  localStorage.setItem(KADER_KEY, JSON.stringify(data));
}

function getTotalKader() {
  const data = getKaderData();
  return KADER_PUSKESMAS.reduce((total, p) => {
    const posyandu = data[p] || {};
    return total + Object.values(posyandu).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  }, 0);
}

function getPuskesmasKaderCount(name) {
  const data = getKaderData();
  const posyandu = data[name] || {};
  return Object.values(posyandu).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
}

function openKaderTraining() {
  const app = document.getElementById("app") || document.body;
  const total = getTotalKader();
  const pct = Math.min((total / KADER_TARGET) * 100, 100);
  const data = getKaderData();

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT / PEMBERDAYAAN MASYARAKAT</div>
        <h1>PELATIHAN KADER POSYANDU (SIKLUS HIDUP)</h1>
        <p>KELOLA POSYANDU DAN KADER YANG SUDAH MENGIKUTI PELATIHAN DI SETIAP PUSKESMAS.</p>
      </div>
    </div>

    <div class="kader-summary">
      <div class="summary-box">
        <div class="summary-label">TARGET KADER DILATIH</div>
        <div class="summary-value">${KADER_TARGET}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">KADER SUDAH DILATIH</div>
        <div class="summary-value" id="kaderTotal">${total}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">BELUM DILATIH</div>
        <div class="summary-value" id="kaderRemaining">${Math.max(KADER_TARGET-total,0)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">PERSENTASE CAPAIAN</div>
        <div class="summary-value" id="kaderPct">${pct.toFixed(1)}%</div>
        <div class="progress-wrap">
          <div class="progress-track"><div class="progress-fill" id="kaderProgress" style="width:${pct}%"></div></div>
          <div class="progress-text">${total} DARI ${KADER_TARGET} KADER</div>
        </div>
      </div>
    </div>

    <h2>DAFTAR PUSKESMAS</h2>
    <div class="kader-puskesmas-grid" id="kaderPuskesmasGrid"></div>
  `;

  const grid = document.getElementById("kaderPuskesmasGrid");
  KADER_PUSKESMAS.forEach((p, i) => {
    const count = getPuskesmasKaderCount(p);
    const posCount = Object.keys(data[p] || {}).length;
    const card = document.createElement("div");
    card.className = "kader-puskesmas-card";
    card.innerHTML = `
      <span class="kader-card-limit">${posCount} POSYANDU</span>
      <h3>${p}</h3>
      <p>JUMLAH KADER TERLATIH</p>
      <div class="kader-count">${count}</div>
    `;
    card.addEventListener("click", () => openKaderPuskesmas(p));
    grid.appendChild(card);
  });
}

function openKaderPuskesmas(puskesmas) {
  const app = document.getElementById("app") || document.body;
  const data = getKaderData();
  const posyandu = data[puskesmas] || {};
  const entries = Object.entries(posyandu);
  const total = getTotalKader();
  const pct = Math.min((total / KADER_TARGET) * 100, 100);

  app.innerHTML = `
    <div class="page-head">
      <button class="btn posyandu-back" id="backKader">← KEMBALI KE DAFTAR PUSKESMAS</button>
      <div class="breadcrumb">PELATIHAN KADER POSYANDU (SIKLUS HIDUP) / ${puskesmas}</div>
      <h1>${puskesmas}</h1>
      <p>TAMBAHKAN NAMA POSYANDU, KEMUDIAN MASUKKAN NAMA KADER YANG SUDAH DILATIH.</p>
    </div>

    <div class="kader-summary">
      <div class="summary-box">
        <div class="summary-label">TARGET KABUPATEN</div>
        <div class="summary-value">${KADER_TARGET}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">TOTAL KADER TERLATIH</div>
        <div class="summary-value">${total}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">KADER DI ${puskesmas.replace("PUSKESMAS ","")}</div>
        <div class="summary-value">${getPuskesmasKaderCount(puskesmas)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">CAPAIAN KABUPATEN</div>
        <div class="summary-value">${pct.toFixed(1)}%</div>
        <div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>
      </div>
    </div>

    <div class="posyandu-toolbar">
      <div>
        <h2>DAFTAR POSYANDU</h2>
        <p>SETIAP POSYANDU DAPAT MEMILIKI DAFTAR KADER MASING-MASING.</p>
      </div>
      <button class="btn btn-primary" id="addPosyandu">+ TAMBAH POSYANDU</button>
    </div>

    <div class="posyandu-list-grid" id="posyanduListGrid"></div>
  `;

  document.getElementById("backKader").addEventListener("click", openKaderTraining);
  document.getElementById("addPosyandu").addEventListener("click", () => addPosyandu(puskesmas));

  const grid = document.getElementById("posyanduListGrid");
  if (!entries.length) {
    grid.innerHTML = `<div class="petugas-empty">BELUM ADA POSYANDU YANG DITAMBAHKAN DI ${puskesmas}.</div>`;
    return;
  }

  entries.forEach(([posName, kader]) => {
    const card = document.createElement("div");
    card.className = "posyandu-item-card";
    card.innerHTML = `
      <h3>${posName}</h3>
      <p>KADER YANG SUDAH DILATIH</p>
      <div class="kader-count">${Array.isArray(kader) ? kader.length : 0}</div>
    `;
    card.addEventListener("click", () => openKaderPosyandu(puskesmas, posName));
    grid.appendChild(card);
  });
}

function addPosyandu(puskesmas) {
  const data = getKaderData();
  data[puskesmas] = data[puskesmas] || {};
  const name = prompt("MASUKKAN NAMA POSYANDU:");
  if (!name || !name.trim()) return;

  const clean = name.trim().toUpperCase();
  if (data[puskesmas][clean]) {
    alert("NAMA POSYANDU TERSEBUT SUDAH ADA.");
    return;
  }

  data[puskesmas][clean] = [];
  saveKaderData(data);
  openKaderPuskesmas(puskesmas);
}

function openKaderPosyandu(puskesmas, posyanduName) {
  const app = document.getElementById("app") || document.body;
  const data = getKaderData();
  data[puskesmas] = data[puskesmas] || {};
  data[puskesmas][posyanduName] = data[puskesmas][posyanduName] || [];
  const kader = data[puskesmas][posyanduName];

  app.innerHTML = `
    <div class="page-head">
      <button class="btn posyandu-back" id="backPos">← KEMBALI KE ${puskesmas}</button>
      <div class="breadcrumb">PELATIHAN KADER POSYANDU / ${puskesmas} / ${posyanduName}</div>
      <h1>${posyanduName}</h1>
      <p>${puskesmas} — DAFTAR KADER YANG SUDAH DILATIH.</p>
    </div>

    <div class="kader-summary">
      <div class="summary-box">
        <div class="summary-label">TARGET KADER KABUPATEN</div>
        <div class="summary-value">${KADER_TARGET}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">KADER POSYANDU INI</div>
        <div class="summary-value">${kader.length}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">TOTAL KABUPATEN</div>
        <div class="summary-value">${getTotalKader()}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">PERSENTASE CAPAIAN</div>
        <div class="summary-value">${Math.min(getTotalKader()/KADER_TARGET*100,100).toFixed(1)}%</div>
      </div>
    </div>

    <div class="posyandu-toolbar">
      <h2>DAFTAR NAMA KADER TERLATIH</h2>
      <button class="btn btn-primary" id="addKader">+ TAMBAH KADER</button>
    </div>

    <table class="kader-table">
      <thead><tr><th>NO.</th><th>NAMA KADER</th><th>AKSI</th></tr></thead>
      <tbody id="kaderTableBody"></tbody>
    </table>
  `;

  document.getElementById("backPos").addEventListener("click", () => openKaderPuskesmas(puskesmas));
  document.getElementById("addKader").addEventListener("click", () => addKader(puskesmas, posyanduName));
  renderKaderTable(puskesmas, posyanduName);
}

function renderKaderTable(puskesmas, posyanduName) {
  const data = getKaderData();
  const kader = ((data[puskesmas] || {})[posyanduName] || []);
  const body = document.getElementById("kaderTableBody");
  if (!body) return;

  if (!kader.length) {
    body.innerHTML = `<tr><td colspan="3">BELUM ADA KADER YANG DITAMBAHKAN.</td></tr>`;
    return;
  }

  body.innerHTML = kader.map((name, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${String(name).toUpperCase()}</td>
      <td><button class="btn" data-remove-kader="${i}">HAPUS</button></td>
    </tr>
  `).join("");

  body.querySelectorAll("[data-remove-kader]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.removeKader);
      removeKader(puskesmas, posyanduName, idx);
    });
  });
}

function addKader(puskesmas, posyanduName) {
  const data = getKaderData();
  data[puskesmas] = data[puskesmas] || {};
  data[puskesmas][posyanduName] = data[puskesmas][posyanduName] || [];

  if (getTotalKader() >= KADER_TARGET) {
    alert("TARGET 903 KADER SUDAH TERCAPAI.");
    return;
  }

  const name = prompt("MASUKKAN NAMA KADER YANG SUDAH DILATIH:");
  if (!name || !name.trim()) return;

  data[puskesmas][posyanduName].push(name.trim().toUpperCase());
  saveKaderData(data);
  openKaderPosyandu(puskesmas, posyanduName);
}

function removeKader(puskesmas, posyanduName, index) {
  if (!confirm("HAPUS KADER INI DARI DAFTAR?")) return;
  const data = getKaderData();
  if (!data[puskesmas] || !data[puskesmas][posyanduName]) return;
  data[puskesmas][posyanduName].splice(index, 1);
  saveKaderData(data);
  openKaderPosyandu(puskesmas, posyanduName);
}

/* Route the existing Pelatihan Kader card into this module. */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card) return;
  const textContent = (card.textContent || "").toUpperCase();
  if (textContent.includes("PELATIHAN KADER POSYANDU")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openKaderTraining();
  }
}, true);



/* ===== V9: PEMBUDAYAAN HIDUP SEHAT ===== */
const HEALTH_ACTIVITIES = [
  "SKRINING KESEHATAN JIWA, EDUKASI PERTOLONGAN PERTAMA LUKA PSIKOLOGIS",
  "AKSI BERGIZI",
  "EDUKASI BERHENTI MEROKOK",
  "POSYANDU AKTIF",
  "CEK KESEHATAN",
  "CPTS",
  "PEMBERIAN VAKSINASI",
  "AKTIVITAS FISIK BERSAMA",
  "ABCDE CEGAH STUNTING"
];

const HEALTH_KEY = "dashboard_pembudayaan_hidup_sehat_v9";

function getHealthData() {
  try {
    const data = JSON.parse(localStorage.getItem(HEALTH_KEY));
    if (data && Array.isArray(data.activities)) return data;
  } catch(e) {}
  return {
    activities: HEALTH_ACTIVITIES.map(name => ({
      name,
      status: "BELUM TERLAKSANA",
      percentage: 0
    }))
  };
}

function saveHealthData(data) {
  localStorage.setItem(HEALTH_KEY, JSON.stringify(data));
}

function healthStats() {
  const data = getHealthData();
  const done = data.activities.filter(x => x.status === "SUDAH TERLAKSANA").length;
  const total = data.activities.length;
  const avg = total ? data.activities.reduce((s,x) => s + Number(x.percentage || 0), 0) / total : 0;
  return { done, total, pending: total-done, avg };
}

function addPageNav(container) {
  const nav = document.createElement("div");
  nav.className = "global-nav";
  nav.innerHTML = `
    <button class="btn" id="navBack">← KEMBALI</button>
    <button class="btn btn-primary" id="navHome">⌂ HALAMAN UTAMA</button>
  `;
  container.prepend(nav);
  const back = nav.querySelector("#navBack");
  const home = nav.querySelector("#navHome");
  if (back) back.addEventListener("click", () => {
    if (typeof openPromkesArea === "function") openPromkesArea();
    else location.reload();
  });
  if (home) home.addEventListener("click", () => {
    location.reload();
  });
}

function openPembudayaanHidupSehat() {
  const app = document.getElementById("app") || document.body;
  const stats = healthStats();

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT / PROMOSI KESEHATAN</div>
        <h1>PEMBUDAYAAN HIDUP SEHAT</h1>
        <p>MONITORING PELAKSANAAN KEGIATAN DAN PERSENTASE CAPAIAN.</p>
      </div>
    </div>

    <div id="healthNav"></div>

    <div class="health-summary">
      <div class="summary-box">
        <div class="summary-label">TOTAL KEGIATAN</div>
        <div class="summary-value">${stats.total}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">SUDAH TERLAKSANA</div>
        <div class="summary-value" id="healthDone">${stats.done}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">RATA-RATA PERSENTASE CAPAIAN</div>
        <div class="summary-value" id="healthAvg">${stats.avg.toFixed(1)}%</div>
      </div>
    </div>

    <div class="health-activity-grid" id="healthActivityGrid"></div>
  `;

  addPageNav(document.getElementById("healthNav"));
  renderHealthActivities();
}

function renderHealthActivities() {
  const grid = document.getElementById("healthActivityGrid");
  if (!grid) return;

  const data = getHealthData();
  const colors = [
    "health-card-blue","health-card-teal","health-card-green",
    "health-card-gold","health-card-purple","health-card-red",
    "health-card-orange","health-card-navy","health-card-blue"
  ];

  grid.innerHTML = "";
  data.activities.forEach((item, i) => {
    const done = item.status === "SUDAH TERLAKSANA";
    const card = document.createElement("div");
    card.className = `health-activity-card ${colors[i % colors.length]}`;
    card.innerHTML = `
      <div class="health-icon">${String(i+1).padStart(2,"0")}</div>
      <h3>${item.name}</h3>
      <div class="health-status ${done ? "done" : "pending"}">${item.status}</div>
      <div class="health-percent">${Number(item.percentage || 0).toFixed(1)}%</div>
    `;
    card.addEventListener("click", () => editHealthActivity(i));
    grid.appendChild(card);
  });

  const stats = healthStats();
  const d = document.getElementById("healthDone");
  const a = document.getElementById("healthAvg");
  if (d) d.textContent = stats.done;
  if (a) a.textContent = stats.avg.toFixed(1) + "%";
}

function editHealthActivity(index) {
  const data = getHealthData();
  const item = data.activities[index];
  if (!item) return;

  const app = document.getElementById("app") || document.body;
  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PEMBUDAYAAN HIDUP SEHAT / ${item.name}</div>
        <h1>${item.name}</h1>
        <p>PERBARUI STATUS DAN PERSENTASE CAPAIAN KEGIATAN.</p>
      </div>
    </div>
    <div id="healthDetailNav"></div>

    <div class="health-detail">
      <h2>STATUS KEGIATAN</h2>
      <label for="healthStatus">STATUS</label>
      <select id="healthStatus">
        <option value="BELUM TERLAKSANA" ${item.status === "BELUM TERLAKSANA" ? "selected" : ""}>BELUM TERLAKSANA</option>
        <option value="SUDAH TERLAKSANA" ${item.status === "SUDAH TERLAKSANA" ? "selected" : ""}>SUDAH TERLAKSANA</option>
      </select>

      <div style="margin-top:18px">
        <label for="healthPercentage">PERSENTASE CAPAIAN (%)</label>
        <input id="healthPercentage" class="health-percent-input" type="number" min="0" max="100" step="0.1" value="${Number(item.percentage || 0)}">
      </div>

      <div class="global-nav" style="margin-top:22px">
        <button class="btn btn-primary" id="saveHealthActivity">SIMPAN</button>
        <button class="btn" id="cancelHealthActivity">BATAL</button>
      </div>
    </div>
  `;

  addPageNav(document.getElementById("healthDetailNav"));

  const status = document.getElementById("healthStatus");
  const pct = document.getElementById("healthPercentage");

  status.addEventListener("change", () => {
    if (status.value === "BELUM TERLAKSANA") pct.value = 0;
    else if (Number(pct.value) === 0) pct.value = 100;
  });

  document.getElementById("saveHealthActivity").addEventListener("click", () => {
    const value = Math.max(0, Math.min(100, Number(pct.value) || 0));
    item.status = status.value;
    item.percentage = status.value === "BELUM TERLAKSANA" ? 0 : value;
    saveHealthData(data);
    openPembudayaanHidupSehat();
  });

  document.getElementById("cancelHealthActivity").addEventListener("click", openPembudayaanHidupSehat);
}

/* Route the existing PEMBUDAYAAN HIDUP SEHAT card into the dedicated module. */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card) return;
  const textContent = (card.textContent || "").toUpperCase();
  if (textContent.includes("PEMBUDAYAAN HIDUP SEHAT")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openPembudayaanHidupSehat();
  }
}, true);


/* V10 navigation safety net: add HOME/BACK controls to dynamically rendered pages that lack them. */
function ensureGlobalNavigation() {
  const app = document.getElementById("app");
  if (!app) return;
  const headings = app.querySelectorAll("h1");
  if (!headings.length) return;
  if (app.querySelector(".global-nav")) return;
  const navHost = document.createElement("div");
  navHost.className = "global-nav";
  navHost.innerHTML = `
    <button class="btn" id="safeBack">← KEMBALI</button>
    <button class="btn btn-primary" id="safeHome">⌂ HALAMAN UTAMA</button>
  `;
  const first = app.firstElementChild;
  if (first) app.insertBefore(navHost, first);
  document.getElementById("safeBack")?.addEventListener("click", () => location.reload());
  document.getElementById("safeHome")?.addEventListener("click", () => location.reload());
}

document.addEventListener("DOMContentLoaded", ensureGlobalNavigation);


/* ===== V10: EDUKASI PROMOSI DI MEDIA SOSIAL ===== */
const MEDIA_TYPES = [
  {key:"POSTINGAN KEGIATAN", icon:"PK", cls:"media-blue"},
  {key:"FLAYER EDUKASI", icon:"FE", cls:"media-teal"},
  {key:"VIDEO", icon:"VD", cls:"media-red"},
  {key:"SPANDUK", icon:"SD", cls:"media-gold"}
];

const MEDIA_MONTHS = [
  "JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI",
  "JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"
];

const MEDIA_KEY = "dashboard_media_sosial_2026_v10";

function getMediaData() {
  try {
    const saved = JSON.parse(localStorage.getItem(MEDIA_KEY));
    if (saved && saved.year === 2026 && saved.data) return saved;
  } catch(e) {}
  const data = {};
  MEDIA_TYPES.forEach(t => {
    data[t.key] = MEDIA_MONTHS.map(() => 0);
  });
  return {year:2026, data};
}

function saveMediaData(data) {
  localStorage.setItem(MEDIA_KEY, JSON.stringify(data));
}

function mediaTotal(typeKey) {
  const d = getMediaData().data[typeKey] || [];
  return d.reduce((a,b) => a + Number(b || 0), 0);
}

function mediaGrandTotal() {
  return MEDIA_TYPES.reduce((sum,t) => sum + mediaTotal(t.key), 0);
}

function openMediaSocial() {
  const app = document.getElementById("app") || document.body;
  const data = getMediaData();

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT / PROMOSI KESEHATAN</div>
        <h1>EDUKASI PROMOSI DI MEDIA SOSIAL</h1>
        <p>REKAPITULASI PRODUK DAN PUBLIKASI MEDIA PROMOSI KESEHATAN TAHUN 2026.</p>
      </div>
    </div>
    <div id="mediaNav"></div>

    <div class="media-summary">
      ${MEDIA_TYPES.map(t => `
        <div class="summary-box">
          <div class="summary-label">${t.key}</div>
          <div class="summary-value" id="sum_${t.icon}">${mediaTotal(t.key)}</div>
        </div>
      `).join("")}
      <div class="summary-box">
        <div class="summary-label">TOTAL SEMUA MEDIA</div>
        <div class="summary-value" id="sum_total">${mediaGrandTotal()}</div>
      </div>
    </div>

    <div class="media-type-grid">
      ${MEDIA_TYPES.map(t => `
        <div class="media-type-card ${t.cls}" data-media-type="${t.key}">
          <div class="media-type-icon">${t.icon}</div>
          <h3>${t.key}</h3>
          <div class="media-type-count">${mediaTotal(t.key)}</div>
        </div>
      `).join("")}
    </div>

    <div class="media-chart">
      <h2>REKAPITULASI BULANAN JANUARI–DESEMBER 2026</h2>
      <div class="media-table-wrap">
        <table class="media-table">
          <thead>
            <tr>
              <th>JENIS MEDIA</th>
              ${MEDIA_MONTHS.map(m => `<th>${m.substring(0,3)}</th>`).join("")}
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody id="mediaTableBody"></tbody>
        </table>
      </div>
    </div>

    <div class="media-chart">
      <h2>GRAFIK TOTAL PUBLIKASI PER BULAN</h2>
      <div class="media-bars" id="mediaBars"></div>
    </div>
  `;

  addUniversalNavigation("mediaNav", "PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT");
  renderMediaTable();
  renderMediaBars();

  app.querySelectorAll("[data-media-type]").forEach(card => {
    card.addEventListener("click", () => openMediaEditor(card.dataset.mediaType));
  });
}

function renderMediaTable() {
  const tbody = document.getElementById("mediaTableBody");
  if (!tbody) return;
  const data = getMediaData();

  tbody.innerHTML = MEDIA_TYPES.map(t => {
    const arr = data.data[t.key] || MEDIA_MONTHS.map(() => 0);
    return `<tr>
      <td><strong>${t.key}</strong></td>
      ${arr.map(v => `<td>${Number(v || 0)}</td>`).join("")}
      <td><strong>${arr.reduce((a,b)=>a+Number(b||0),0)}</strong></td>
    </tr>`;
  }).join("") + `<tr>
    <td><strong>TOTAL PER BULAN</strong></td>
    ${MEDIA_MONTHS.map((_,i) => {
      const n = MEDIA_TYPES.reduce((s,t)=>s+Number((data.data[t.key]||[])[i]||0),0);
      return `<td><strong>${n}</strong></td>`;
    }).join("")}
    <td><strong>${mediaGrandTotal()}</strong></td>
  </tr>`;
}

function renderMediaBars() {
  const box = document.getElementById("mediaBars");
  if (!box) return;
  const data = getMediaData();
  const totals = MEDIA_MONTHS.map((_,i) =>
    MEDIA_TYPES.reduce((s,t)=>s+Number((data.data[t.key]||[])[i]||0),0)
  );
  const max = Math.max(...totals, 1);
  box.innerHTML = totals.map((v,i) => `
    <div class="media-bar-col">
      <div class="media-bar-value">${v}</div>
      <div class="media-bar" style="height:${Math.max((v/max)*160,3)}px"></div>
      <div class="media-bar-label">${MEDIA_MONTHS[i].substring(0,3)}</div>
    </div>
  `).join("");
}

function openMediaEditor(typeKey) {
  const app = document.getElementById("app") || document.body;
  const data = getMediaData();
  const arr = data.data[typeKey] || MEDIA_MONTHS.map(() => 0);
  const type = MEDIA_TYPES.find(t => t.key === typeKey);

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">EDUKASI PROMOSI DI MEDIA SOSIAL / ${typeKey}</div>
        <h1>${typeKey}</h1>
        <p>MASUKKAN JUMLAH PUBLIKASI/PRODUK YANG DIHASILKAN SETIAP BULAN TAHUN 2026.</p>
      </div>
    </div>
    <div id="mediaEditNav"></div>

    <div class="health-detail">
      <h2>DATA BULANAN 2026</h2>
      <div class="media-input-grid">
        ${MEDIA_MONTHS.map((m,i)=>`
          <div class="media-month-card">
            <label>${m}</label>
            <input type="number" min="0" step="1" id="media_${i}" value="${Number(arr[i]||0)}">
          </div>
        `).join("")}
      </div>

      <div class="global-nav" style="margin-top:24px">
        <button class="btn btn-primary" id="saveMedia">SIMPAN DATA</button>
        <button class="btn" id="cancelMedia">BATAL</button>
      </div>
    </div>
  `;

  addUniversalNavigation("mediaEditNav", "EDUKASI PROMOSI DI MEDIA SOSIAL");

  document.getElementById("saveMedia").addEventListener("click", () => {
    data.data[typeKey] = MEDIA_MONTHS.map((_,i) => Math.max(0, parseInt(document.getElementById(`media_${i}`).value || "0",10)));
    saveMediaData(data);
    openMediaSocial();
  });
  document.getElementById("cancelMedia").addEventListener("click", openMediaSocial);
}

/* Universal navigation helper */
function addUniversalNavigation(hostId, backTarget) {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.className = "global-nav";
  host.innerHTML = `
    <button class="btn" id="universalBack">← KEMBALI</button>
    <button class="btn btn-primary" id="universalHome">⌂ HALAMAN UTAMA</button>
  `;
  host.querySelector("#universalBack").addEventListener("click", () => {
    // The safest route is browser history where available; otherwise reload.
    if (history.length > 1) history.back();
    else location.reload();
  });
  host.querySelector("#universalHome").addEventListener("click", () => location.reload());
}

/* Route the existing EDUKASI PROMOSI DI MEDIA SOSIAL card into the dedicated module. */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card) return;
  const textContent = (card.textContent || "").toUpperCase();
  if (textContent.includes("EDUKASI PROMOSI DI MEDIA SOSIAL")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openMediaSocial();
  }
}, true);

/*
 * V10 NAVIGATION SAFETY:
 * Existing legacy pages are also checked after each DOM update.
 * If a page has meaningful content but no navigation controls, inject both
 * KEMBALI and HALAMAN UTAMA buttons at the top.
 */
function ensureNavigationEveryPage() {
  const app = document.getElementById("app");
  if (!app) return;
  if (!app.children.length) return;
  if (app.querySelector(".global-nav")) return;

  const h1 = app.querySelector("h1");
  const buttons = app.querySelectorAll("button");
  if (!h1 && !buttons.length) return;

  const nav = document.createElement("div");
  nav.className = "global-nav";
  nav.innerHTML = `
    <button class="btn" id="fallbackBack">← KEMBALI</button>
    <button class="btn btn-primary" id="fallbackHome">⌂ HALAMAN UTAMA</button>
  `;

  const first = app.firstElementChild;
  if (first) app.insertBefore(nav, first);
  else app.appendChild(nav);

  nav.querySelector("#fallbackBack").addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.reload();
  });
  nav.querySelector("#fallbackHome").addEventListener("click", () => location.reload());
}

document.addEventListener("DOMContentLoaded", ensureNavigationEveryPage);



/* ===== V12: AUDITED + STABLE PELATIHAN KADER POSYANDU =====
   Data model:
   data[PUSKESMAS][POSYANDU] = [{name:"...", level:"PURWA|MADYA|UTAMA"}]
*/

const KADER_LEVELS_V12 = ["PURWA","MADYA","UTAMA"];
const POSYANDU_ILP_KEY_V13 = "dashboard_posyandu_ilp_v13";

function getPosyanduIlpDataV13() {
  try { return JSON.parse(localStorage.getItem(POSYANDU_ILP_KEY_V13)) || {}; }
  catch(e) { return {}; }
}

function savePosyanduIlpDataV13(data) {
  localStorage.setItem(POSYANDU_ILP_KEY_V13, JSON.stringify(data));
}

function getPosyanduIlpStatusV13(puskesmas, posyanduName) {
  const d = getPosyanduIlpDataV13();
  return d?.[puskesmas]?.[posyanduName] === "SUDAH" ? "SUDAH" : "BELUM";
}

function setPosyanduIlpStatusV13(puskesmas, posyanduName, status) {
  const d = getPosyanduIlpDataV13();
  d[puskesmas] = d[puskesmas] || {};
  d[puskesmas][posyanduName] = status === "SUDAH" ? "SUDAH" : "BELUM";
  savePosyanduIlpDataV13(d);
}

function renamePosyanduIlpStatusV13(puskesmas, oldName, newName) {
  if (oldName === newName) return;
  const d = getPosyanduIlpDataV13();
  d[puskesmas] = d[puskesmas] || {};
  if (Object.prototype.hasOwnProperty.call(d[puskesmas], oldName)) {
    d[puskesmas][newName] = d[puskesmas][oldName];
    delete d[puskesmas][oldName];
  }
  savePosyanduIlpDataV13(d);
}

function deletePosyanduIlpStatusV13(puskesmas, posyanduName) {
  const d = getPosyanduIlpDataV13();
  if (d[puskesmas]) {
    delete d[puskesmas][posyanduName];
    savePosyanduIlpDataV13(d);
  }
}

function posyanduIlpRecapV13() {
  const d = normalizeKaderDataV12();
  const ilp = getPosyanduIlpDataV13();
  let total = 0, sudah = 0;
  const perPuskesmas = {};
  KADER_PUSKESMAS.forEach(p => {
    const names = Object.keys(d[p] || {});
    const n = names.filter(name => ilp?.[p]?.[name] === "SUDAH").length;
    total += names.length;
    sudah += n;
    perPuskesmas[p] = { total:names.length, sudah:n, belum:Math.max(names.length-n,0) };
  });
  return { total, sudah, belum:Math.max(total-sudah,0), perPuskesmas };
}

function normalizeKaderDataV12() {
  let data = {};
  try { data = getKaderData() || {}; } catch(e) { data = {}; }

  KADER_PUSKESMAS.forEach(p => {
    if (!data[p] || typeof data[p] !== "object" || Array.isArray(data[p])) data[p] = {};
    Object.keys(data[p]).forEach(pos => {
      if (!Array.isArray(data[p][pos])) data[p][pos] = [];
      data[p][pos] = data[p][pos].map(k => {
        if (typeof k === "string") return {name:k.toUpperCase(), level:"PURWA"};
        return {
          name:String(k?.name || "").toUpperCase(),
          level:KADER_LEVELS_V12.includes(k?.level) ? k.level : "PURWA"
        };
      }).filter(k => k.name);
    });
  });
  saveKaderData(data);
  return data;
}

function saveKaderDataV12(data) {
  saveKaderData(data);
}

function kaderCountsV12() {
  const d = normalizeKaderDataV12();
  const c = {PURWA:0,MADYA:0,UTAMA:0};
  KADER_PUSKESMAS.forEach(p => {
    Object.values(d[p] || {}).forEach(arr => (arr || []).forEach(k => {
      c[KADER_LEVELS_V12.includes(k.level) ? k.level : "PURWA"]++;
    }));
  });
  return c;
}

function totalKaderV12() {
  const c = kaderCountsV12();
  return c.PURWA + c.MADYA + c.UTAMA;
}

function puskesmasKaderCountV12(puskesmas) {
  const d = normalizeKaderDataV12();
  return Object.values(d[puskesmas] || {}).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0);
}

function safeTextV12(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

/* ---------- LEVEL 1: KADER DASHBOARD ---------- */
function openKaderTraining() {
  const app = document.getElementById("app") || document.body;
  const d = normalizeKaderDataV12();
  const c = kaderCountsV12();
  const total = totalKaderV12();
  const pct = Math.min(total / KADER_TARGET * 100, 100);
  const ilp = posyanduIlpRecapV13();

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PROMOSI KESEHATAN DAN PEMBERDAYAAN MASYARAKAT / PEMBERDAYAAN MASYARAKAT</div>
        <h1>PELATIHAN KADER POSYANDU (SIKLUS HIDUP)</h1>
        <p>REKAPITULASI KADER TERLATIH BERDASARKAN TINGKATAN DAN PUSKESMAS.</p>
      </div>
    </div>
    <div id="kaderNavV12"></div>

    <div class="kader-summary">
      <div class="summary-box"><div class="summary-label">TARGET KADER DILATIH</div><div class="summary-value">${KADER_TARGET}</div></div>
      <div class="summary-box"><div class="summary-label">TOTAL KADER TERLATIH</div><div class="summary-value">${total}</div></div>
      <div class="summary-box"><div class="summary-label">PERSENTASE CAPAIAN</div><div class="summary-value">${pct.toFixed(1)}%</div><div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div></div>
      <div class="summary-box"><div class="summary-label">BELUM TERLATIH</div><div class="summary-value">${Math.max(KADER_TARGET-total,0)}</div></div>
    </div>

    <div class="ilp-summary-section">
      <div class="section-head">
        <div><h2>REKAPAN POSYANDU ILP</h2><p>STATUS INTEGRASI LAYANAN PRIMER (ILP) PADA POSYANDU YANG SUDAH DICATAT.</p></div>
      </div>
      <div class="kader-summary ilp-summary-grid">
        <div class="summary-box ilp-total"><div class="summary-label">TOTAL POSYANDU</div><div class="summary-value">${ilp.total}</div></div>
        <div class="summary-box ilp-sudah"><div class="summary-label">POSYANDU ILP SUDAH</div><div class="summary-value">${ilp.sudah}</div></div>
        <div class="summary-box ilp-belum"><div class="summary-label">POSYANDU ILP BELUM</div><div class="summary-value">${ilp.belum}</div></div>
        <div class="summary-box"><div class="summary-label">PERSENTASE ILP</div><div class="summary-value">${ilp.total ? (ilp.sudah/ilp.total*100).toFixed(1) : "0.0"}%</div><div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${ilp.total ? ilp.sudah/ilp.total*100 : 0}%"></div></div></div></div>
      </div>
      <div class="ilp-recap-table-wrap">
        <table class="kader-table ilp-recap-table">
          <thead><tr><th>NO.</th><th>PUSKESMAS</th><th>TOTAL POSYANDU</th><th>ILP SUDAH</th><th>ILP BELUM</th><th>CAPAIAN ILP</th></tr></thead>
          <tbody>
            ${KADER_PUSKESMAS.map((p,i)=>{ const r=ilp.perPuskesmas[p]; return `<tr><td>${i+1}</td><td><b>${safeTextV12(p)}</b></td><td>${r.total}</td><td><span class="ilp-badge sudah">${r.sudah}</span></td><td><span class="ilp-badge belum">${r.belum}</span></td><td>${r.total ? (r.sudah/r.total*100).toFixed(1) : "0.0"}%</td></tr>`; }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="kader-level-summary">
      ${KADER_LEVELS_V12.map(level => `
        <div class="kader-level-card level-${level.toLowerCase()}">
          <div class="level-label">${level}</div>
          <div class="level-value">${c[level]}</div>
          <div class="level-desc">KADER TINGKAT ${level}</div>
          <div class="level-bar"><div style="width:${total ? c[level]/total*100 : 0}%"></div></div>
        </div>
      `).join("")}
    </div>

    <h2>DAFTAR PUSKESMAS</h2>
    <div class="kader-puskesmas-grid" id="kaderPuskesmasGridV12"></div>
  `;

  addUniversalNavigation("kaderNavV12","PEMBERDAYAAN MASYARAKAT");

  const grid = document.getElementById("kaderPuskesmasGridV12");
  KADER_PUSKESMAS.forEach(p => {
    const card = document.createElement("div");
    card.className = "kader-puskesmas-card";
    card.innerHTML = `
      <span class="kader-card-limit">${Object.keys(d[p] || {}).length} POSYANDU</span>
      <h3>${safeTextV12(p)}</h3>
      <p>JUMLAH KADER TERLATIH</p>
      <div class="kader-count">${puskesmasKaderCountV12(p)}</div>
    `;
    card.addEventListener("click", () => openKaderPuskesmas(p));
    grid.appendChild(card);
  });
}

/* ---------- LEVEL 2: PUSKESMAS / POSYANDU ---------- */
function openKaderPuskesmas(puskesmas) {
  const app = document.getElementById("app") || document.body;
  const d = normalizeKaderDataV12();
  const posyandu = d[puskesmas] || {};

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PELATIHAN KADER POSYANDU (SIKLUS HIDUP) / ${safeTextV12(puskesmas)}</div>
        <h1>${safeTextV12(puskesmas)}</h1>
        <p>KELOLA NAMA POSYANDU DAN DATA KADER TERLATIH.</p>
      </div>
    </div>
    <div id="puskesmasNavV12"></div>

    <div class="section-head">
      <div>
        <h2>DAFTAR POSYANDU</h2>
        <p>SETIAP POSYANDU DAPAT DITAMBAH, DIEDIT, DAN DIHAPUS. STATUS ILP DAPAT DIUBAH KAPAN SAJA.</p>
      </div>
      <button class="btn btn-primary" id="addPosyanduV12">+ TAMBAH POSYANDU</button>
    </div>

    <div class="posyandu-list-grid" id="posyanduGridV12"></div>
  `;

  addUniversalNavigation("puskesmasNavV12","PELATIHAN KADER POSYANDU");
  document.getElementById("addPosyanduV12").addEventListener("click", () => showPosyanduFormV12(puskesmas));

  const grid = document.getElementById("posyanduGridV12");
  const entries = Object.entries(posyandu);

  if (!entries.length) {
    grid.innerHTML = `<div class="empty-state">BELUM ADA POSYANDU. SILAKAN KLIK TAMBAH POSYANDU.</div>`;
    return;
  }

  entries.forEach(([name, kader]) => {
    const card = document.createElement("div");
    card.className = "posyandu-item-card";
    const ilpStatus = getPosyanduIlpStatusV13(puskesmas, name);
    card.innerHTML = `
      <div class="posyandu-ilp-status ${ilpStatus === "SUDAH" ? "sudah" : "belum"}">POSYANDU ILP: ${ilpStatus}</div>
      <h3>${safeTextV12(name)}</h3>
      <p>KADER TERLATIH</p>
      <div class="kader-count">${kader.length}</div>
      <div class="posyandu-actions">
        <button class="btn btn-edit" data-action="edit">EDIT</button>
        <button class="btn btn-danger" data-action="delete">HAPUS</button>
        <button class="btn" data-action="open">BUKA KADER</button>
      </div>
    `;
    card.querySelector('[data-action="open"]').addEventListener("click", e => {
      e.stopPropagation();
      openKaderPosyandu(puskesmas, name);
    });
    card.querySelector('[data-action="edit"]').addEventListener("click", e => {
      e.stopPropagation();
      showPosyanduFormV12(puskesmas, name);
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", e => {
      e.stopPropagation();
      deletePosyanduV12(puskesmas, name);
    });
    card.addEventListener("click", () => openKaderPosyandu(puskesmas, name));
    grid.appendChild(card);
  });
}

function showPosyanduFormV12(puskesmas, oldName = null) {
  const app = document.getElementById("app") || document.body;
  const title = oldName ? "EDIT NAMA POSYANDU" : "TAMBAH POSYANDU";

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PELATIHAN KADER POSYANDU / ${safeTextV12(puskesmas)}</div>
        <h1>${title}</h1>
        <p>${oldName ? "UBAH NAMA POSYANDU TANPA MENGHAPUS DATA KADER." : "TAMBAHKAN POSYANDU BARU."}</p>
      </div>
    </div>
    <div id="posFormNavV12"></div>
    <div class="crud-form">
      <div class="form-group">
        <label>NAMA POSYANDU</label>
        <input id="posyanduNameV12" type="text" value="${safeTextV12(oldName || "")}" placeholder="CONTOH: POSYANDU MELATI">
      </div>
      <div class="form-group">
        <label>STATUS POSYANDU ILP</label>
        <div class="ilp-choice-grid">
          <label class="ilp-choice">
            <input type="radio" name="posyanduIlpV13" value="SUDAH" ${getPosyanduIlpStatusV13(puskesmas, oldName || "") === "SUDAH" ? "checked" : ""}>
            <span>SUDAH ILP</span>
          </label>
          <label class="ilp-choice">
            <input type="radio" name="posyanduIlpV13" value="BELUM" ${getPosyanduIlpStatusV13(puskesmas, oldName || "") !== "SUDAH" ? "checked" : ""}>
            <span>BELUM ILP</span>
          </label>
        </div>
      </div>
      <div class="global-nav">
        <button class="btn btn-primary" id="savePosyanduV12">SIMPAN</button>
        <button class="btn" id="cancelPosyanduV12">BATAL</button>
      </div>
    </div>
  `;

  addUniversalNavigation("posFormNavV12",puskesmas);

  document.getElementById("savePosyanduV12").addEventListener("click", () => {
    const input = document.getElementById("posyanduNameV12");
    const newName = input.value.trim().toUpperCase();
    if (!newName) {
      alert("NAMA POSYANDU WAJIB DIISI.");
      input.focus();
      return;
    }

    const d = normalizeKaderDataV12();
    d[puskesmas] = d[puskesmas] || {};

    const ilpStatus = document.querySelector('input[name="posyanduIlpV13"]:checked')?.value || "BELUM";

    if (!oldName) {
      if (d[puskesmas][newName]) {
        alert("NAMA POSYANDU TERSEBUT SUDAH ADA.");
        return;
      }
      d[puskesmas][newName] = [];
      setPosyanduIlpStatusV13(puskesmas, newName, ilpStatus);
    } else {
      if (newName !== oldName && d[puskesmas][newName]) {
        alert("NAMA POSYANDU TERSEBUT SUDAH DIGUNAKAN.");
        return;
      }
      if (newName !== oldName) {
        d[puskesmas][newName] = d[puskesmas][oldName] || [];
        delete d[puskesmas][oldName];
        renamePosyanduIlpStatusV13(puskesmas, oldName, newName);
      }
      setPosyanduIlpStatusV13(puskesmas, newName, ilpStatus);
    }

    saveKaderDataV12(d);
    openKaderPuskesmas(puskesmas);
  });

  document.getElementById("cancelPosyanduV12").addEventListener("click", () => openKaderPuskesmas(puskesmas));
}

function deletePosyanduV12(puskesmas, name) {
  const d = normalizeKaderDataV12();
  const count = (d[puskesmas]?.[name] || []).length;
  const msg = count
    ? `POSYANDU ${name} MEMILIKI ${count} KADER. HAPUS POSYANDU BESERTA DATA KADER DI DALAMNYA?`
    : `HAPUS POSYANDU ${name}?`;

  if (!confirm(msg)) return;

  delete d[puskesmas][name];
  deletePosyanduIlpStatusV13(puskesmas, name);
  saveKaderDataV12(d);
  openKaderPuskesmas(puskesmas);
}

/* ---------- LEVEL 3: KADER POSYANDU ---------- */
function openKaderPosyandu(puskesmas, posyanduName) {
  const app = document.getElementById("app") || document.body;
  const d = normalizeKaderDataV12();
  d[puskesmas] = d[puskesmas] || {};
  d[puskesmas][posyanduName] = d[puskesmas][posyanduName] || [];
  const kader = d[puskesmas][posyanduName];

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PELATIHAN KADER POSYANDU / ${safeTextV12(puskesmas)} / ${safeTextV12(posyanduName)}</div>
        <h1>${safeTextV12(posyanduName)}</h1>
        <p>DAFTAR NAMA KADER TERLATIH DAN TINGKATANNYA.</p>
      </div>
    </div>
    <div id="kaderListNavV12"></div>

    <div class="section-head">
      <div>
        <h2>DAFTAR NAMA KADER TERLATIH</h2>
        <p>TINGKATAN: PURWA, MADYA, DAN UTAMA.</p>
      </div>
      <button class="btn btn-primary" id="addKaderV12">+ TAMBAH KADER</button>
    </div>

    <div class="kader-level-summary">
      ${KADER_LEVELS_V12.map(level => {
        const n = kader.filter(k => k.level === level).length;
        return `<div class="kader-level-card level-${level.toLowerCase()}">
          <div class="level-label">${level}</div>
          <div class="level-value">${n}</div>
          <div class="level-desc">KADER ${level}</div>
        </div>`;
      }).join("")}
    </div>

    <table class="kader-table">
      <thead><tr><th>NO.</th><th>NAMA KADER</th><th>TINGKATAN</th><th>AKSI</th></tr></thead>
      <tbody id="kaderTableV12"></tbody>
    </table>
  `;

  addUniversalNavigation("kaderListNavV12",puskesmas);
  document.getElementById("addKaderV12").addEventListener("click", () => showKaderFormV12(puskesmas, posyanduName));

  const tbody = document.getElementById("kaderTableV12");
  if (!kader.length) {
    tbody.innerHTML = `<tr><td colspan="4">BELUM ADA KADER. KLIK TAMBAH KADER UNTUK MEMASUKKAN DATA.</td></tr>`;
    return;
  }

  kader.forEach((k, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i+1}</td>
      <td class="name-cell">${safeTextV12(k.name)}</td>
      <td><span class="level-badge ${k.level.toLowerCase()}">${k.level}</span></td>
      <td>
        <button class="btn btn-edit" data-edit>EDIT</button>
        <button class="btn btn-danger" data-delete>HAPUS</button>
      </td>
    `;
    row.querySelector("[data-edit]").addEventListener("click", () => showKaderFormV12(puskesmas,posyanduName,i));
    row.querySelector("[data-delete]").addEventListener("click", () => deleteKaderV12(puskesmas,posyanduName,i));
    tbody.appendChild(row);
  });
}

function showKaderFormV12(puskesmas, posyanduName, index = null) {
  const app = document.getElementById("app") || document.body;
  const d = normalizeKaderDataV12();
  const current = index === null ? {name:"",level:"PURWA"} : d[puskesmas][posyanduName][index];
  const title = index === null ? "TAMBAH KADER TERLATIH" : "EDIT DATA KADER";

  app.innerHTML = `
    <div class="page-head">
      <div>
        <div class="breadcrumb">PELATIHAN KADER POSYANDU / ${safeTextV12(puskesmas)} / ${safeTextV12(posyanduName)}</div>
        <h1>${title}</h1>
      </div>
    </div>
    <div id="kaderFormNavV12"></div>
    <div class="crud-form">
      <div class="form-group">
        <label>NAMA KADER</label>
        <input id="kaderNameV12" type="text" value="${safeTextV12(current.name)}" placeholder="MASUKKAN NAMA KADER">
      </div>
      <div class="form-group">
        <label>TINGKATAN KADER</label>
        <div class="kader-level-select">
          ${KADER_LEVELS_V12.map(level => {
            const style = level==="PURWA"
              ? "--cc:#1769aa;--bb:#e5f2ff"
              : level==="MADYA"
              ? "--cc:#a96f00;--bb:#fff3d7"
              : "--cc:#7254a8;--bb:#f0e8ff";
            return `<div class="level-choice" style="${style}">
              <input type="radio" name="kaderLevelV12" value="${level}" ${current.level===level?"checked":""}>
              <label>${level}</label>
            </div>`;
          }).join("")}
        </div>
      </div>
      <div class="global-nav">
        <button class="btn btn-primary" id="saveKaderV12">SIMPAN</button>
        <button class="btn" id="cancelKaderV12">BATAL</button>
      </div>
    </div>
  `;

  addUniversalNavigation("kaderFormNavV12",puskesmas);

  document.getElementById("saveKaderV12").addEventListener("click", () => {
    const name = document.getElementById("kaderNameV12").value.trim().toUpperCase();
    const level = document.querySelector('input[name="kaderLevelV12"]:checked')?.value || "PURWA";

    if (!name) {
      alert("NAMA KADER WAJIB DIISI.");
      return;
    }

    const target = d[puskesmas][posyanduName];
    if (index === null) {
      if (totalKaderV12() >= KADER_TARGET) {
        alert("TARGET 903 KADER SUDAH TERCAPAI.");
        return;
      }
      target.push({name,level});
    } else {
      target[index] = {name,level};
    }

    saveKaderDataV12(d);
    openKaderPosyandu(puskesmas,posyanduName);
  });

  document.getElementById("cancelKaderV12").addEventListener("click", () => openKaderPosyandu(puskesmas,posyanduName));
}

function deleteKaderV12(puskesmas,posyanduName,index) {
  const d = normalizeKaderDataV12();
  const kader = d[puskesmas][posyanduName][index];
  if (!kader) return;
  if (!confirm(`HAPUS KADER ${kader.name}?`)) return;

  d[puskesmas][posyanduName].splice(index,1);
  saveKaderDataV12(d);
  openKaderPosyandu(puskesmas,posyanduName);
}

/* Rebind the card routing specifically to the stable V12 module. */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card) return;
  const text = (card.textContent || "").toUpperCase();
  if (text.includes("PELATIHAN KADER POSYANDU")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    // Jika mode online aktif, gunakan modul Supabase, bukan modul localStorage lama.
    if (document.body.classList.contains("online-ready") &&
        window.DINKESKB_SUPABASE &&
        typeof window.openKaderTraining === "function") {
      window.openKaderTraining();
    } else {
      openKaderTraining();
    }
  }
}, true);
