/* V14 ONLINE - Supabase Authentication + cloud Posyandu/Kader/ILP */
(() => {
  const CFG = window.SUPABASE_CONFIG || {};
  if (!CFG.url || !CFG.anonKey) return;
  if (!window.supabase) return;
  const sb = window.supabase.createClient(CFG.url, CFG.anonKey);
  window.DINKESKB_SUPABASE = sb;

  const PS = ["PUSKESMAS SIDUK","PUSKESMAS SUKADANA","PUSKESMAS TELUK MELANO","PUSKESMAS MATAN JAYA","PUSKESMAS SUNGAI PADUAN","PUSKESMAS TELUK BATANG","PUSKESMAS TELAGA ARUM","PUSKESMAS TANJUNG SATAI","PUSKESMAS DUSUN BESAR","PUSKESMAS PELAPIS","PUSKESMAS PADANG"];
  const TARGET = 903;
  let cloud = {ps: [], pos: [], kader: []};
  let profile = null;

  async function loadProfile(user){
    const {data,error}=await sb.from('profiles').select('*').eq('id',user.id).single();
    if(error) throw error;
    profile=data;
    return data;
  }

  function esc(s){ return String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function injectAuth(){
    if(document.getElementById('onlineAuth')) return;
    const el=document.createElement('div'); el.id='onlineAuth'; el.className='online-auth';
    el.innerHTML=`<div class="online-auth-card"><div class="online-logo">DK</div><div class="online-kicker">DINKESKB KAYONG UTARA</div><h1>LOGIN DASHBOARD</h1><p>Masuk untuk mengakses dashboard kinerja kesehatan.</p><form id="onlineLogin"><label>EMAIL<input id="onlineEmail" type="email" autocomplete="username" required placeholder="email@contoh.com"></label><label>PASSWORD<input id="onlinePassword" type="password" autocomplete="current-password" required placeholder="Password"></label><button class="btn primary" type="submit">MASUK</button><div id="onlineMsg" class="online-msg"></div></form></div>`;
    document.body.appendChild(el);
    document.getElementById('onlineLogin').addEventListener('submit', async e=>{
      e.preventDefault();
      const msg=document.getElementById('onlineMsg'); msg.textContent='MEMPROSES...';
      const {error}=await sb.auth.signInWithPassword({email:document.getElementById('onlineEmail').value.trim(),password:document.getElementById('onlinePassword').value});
      if(error) msg.textContent='LOGIN GAGAL: '+error.message; else msg.textContent='BERHASIL. MEMUAT DASHBOARD...';
    });
  }
  function showApp(user){
    const auth=document.getElementById('onlineAuth'); if(auth) auth.classList.add('hidden');
    document.body.classList.add('online-ready');
    let badge=document.getElementById('onlineUserBadge');
    if(!badge){ badge=document.createElement('div'); badge.id='onlineUserBadge'; badge.className='online-user-badge'; document.body.appendChild(badge); }
    badge.innerHTML=`<span>${esc(profile?.full_name || user.email)} • ${esc(profile?.role || 'VIEWER')}</span><button id="onlineLogout">KELUAR</button>`;
    document.getElementById('onlineLogout').onclick=()=>sb.auth.signOut();
  }
  function showLogin(){ injectAuth(); const a=document.getElementById('onlineAuth'); a.classList.remove('hidden'); document.body.classList.remove('online-ready'); const b=document.getElementById('onlineUserBadge'); if(b)b.remove(); }

  async function loadCloud(){
    const [p,po,k]=await Promise.all([
      sb.from('puskesmas').select('*').order('name'),
      sb.from('posyandu').select('*, puskesmas(name)').order('name'),
      sb.from('kader').select('*, posyandu(name,puskesmas_id)').order('name')
    ]);
    const err=p.error||po.error||k.error;
    if(err){ throw err; }
    cloud={ps:p.data||[],pos:po.data||[],kader:k.data||[]};
    return cloud;
  }
  async function psId(name){
    const row=cloud.ps.find(x=>x.name===name); return row?.id || (await sb.from('puskesmas').select('id').eq('name',name).single()).data?.id;
  }
  async function posRow(puskesmas,name){
    const id=await psId(puskesmas); if(!id) throw new Error('PUSKESMAS TIDAK DITEMUKAN');
    return cloud.pos.find(x=>x.puskesmas_id===id && x.name===name);
  }
  function posData(puskesmas){ const id=cloud.ps.find(x=>x.name===puskesmas)?.id; return cloud.pos.filter(x=>x.puskesmas_id===id); }
  function kaderData(posId){ return cloud.kader.filter(x=>x.posyandu_id===posId); }

  window.openKaderTraining = async function(){
    const page=document.getElementById('app')||document.body;
    try { await loadCloud(); } catch(e){ alert('DATABASE BELUM SIAP. Jalankan supabase-schema-v14.sql di Supabase SQL Editor terlebih dahulu.\n\n'+e.message); return; }
    const total=cloud.kader.length, pct=Math.min(100,total/TARGET*100), ilpYes=cloud.pos.filter(x=>x.ilp_status==='SUDAH').length, ilpNo=cloud.pos.length-ilpYes;
    const levels={PURWA:0,MADYA:0,UTAMA:0}; cloud.kader.forEach(k=>levels[k.level]=(levels[k.level]||0)+1);
    page.innerHTML=`<div class="page-head"><div><div class="breadcrumb">PEMBERDAYAAN MASYARAKAT / PELATIHAN KADER POSYANDU</div><h1>PELATIHAN KADER POSYANDU (SIKLUS HIDUP)</h1><p>DATABASE ONLINE • TARGET ${TARGET} KADER</p></div></div><div id="onlineKaderNav"></div><div class="online-recap-grid"><div><small>TOTAL KADER</small><b>${total}</b><span>TARGET ${TARGET} • ${pct.toFixed(1)}%</span></div><div class="lvl-purwa"><small>PURWA</small><b>${levels.PURWA}</b></div><div class="lvl-madya"><small>MADYA</small><b>${levels.MADYA}</b></div><div class="lvl-utama"><small>UTAMA</small><b>${levels.UTAMA}</b></div><div class="ilp-good"><small>POSYANDU ILP SUDAH</small><b>${ilpYes}</b></div><div class="ilp-warn"><small>POSYANDU ILP BELUM</small><b>${ilpNo}</b></div><div><small>TOTAL POSYANDU</small><b>${cloud.pos.length}</b></div></div><div class="puskesmas-grid" id="onlinePsGrid"></div>`;
    if(typeof addUniversalNavigation==='function') addUniversalNavigation('onlineKaderNav');
    const grid=document.getElementById('onlinePsGrid');
    (cloud.ps.length?cloud.ps:PS.map(name=>({name}))).forEach(p=>{
      const c=document.createElement('div'); c.className='puskesmas-card'; const count=posData(p.name).reduce((s,pos)=>s+kaderData(pos.id).length,0); const pc=posData(p.name).length; const ilp=posData(p.name).filter(x=>x.ilp_status==='SUDAH').length;
      c.innerHTML=`<div class="pc-code">${esc(p.name.replace('PUSKESMAS ',''))}</div><h3>${esc(p.name)}</h3><p>${pc} POSYANDU • ${ilp} ILP • ${count} KADER</p><button class="btn primary">BUKA</button>`; c.querySelector('button').onclick=()=>window.openKaderPuskesmas(p.name); grid.appendChild(c);
    });
  };

  window.openKaderPuskesmas = async function(puskesmas){
    await loadCloud(); const list=posData(puskesmas); const page=document.getElementById('app')||document.body;
    page.innerHTML=`<div class="page-head"><div><div class="breadcrumb">PELATIHAN KADER POSYANDU / ${esc(puskesmas)}</div><h1>${esc(puskesmas)}</h1></div></div><div id="onlinePsNav"></div><div class="posyandu-toolbar"><button class="btn primary" id="cloudAddPos">＋ TAMBAH POSYANDU</button><span>${list.length} POSYANDU • ${list.filter(x=>x.ilp_status==='SUDAH').length} ILP</span></div><div class="posyandu-list-grid" id="cloudPosGrid"></div>`;
    if(typeof addUniversalNavigation==='function') addUniversalNavigation('onlinePsNav',puskesmas);
    const grid=document.getElementById('cloudPosGrid');
    list.forEach(pos=>{ const card=document.createElement('div'); card.className='posyandu-item-card'; const n=kaderData(pos.id).length; card.innerHTML=`<div class="posyandu-ilp-status ${pos.ilp_status==='SUDAH'?'sudah':'belum'}">POSYANDU ILP: ${pos.ilp_status}</div><h3>${esc(pos.name)}</h3><p>${n} KADER TERLATIH</p><div class="posyandu-actions"><button class="btn primary" data-open>BUKA</button><button class="btn light" data-edit>EDIT</button><button class="btn danger" data-delete>HAPUS</button></div>`; card.querySelector('[data-open]').onclick=()=>window.openKaderPosyandu(puskesmas,pos.name); card.querySelector('[data-edit]').onclick=()=>cloudEditPos(puskesmas,pos); card.querySelector('[data-delete]').onclick=()=>cloudDeletePos(puskesmas,pos); grid.appendChild(card); });
    document.getElementById('cloudAddPos').onclick=()=>cloudEditPos(puskesmas,null);
  };

  async function cloudEditPos(puskesmas,pos){
    const page=document.getElementById('app')||document.body;
    const current=pos||{name:'',ilp_status:'BELUM'};
    const selected = current.ilp_status === 'SUDAH' ? 'SUDAH' : 'BELUM';

    page.innerHTML=`
      <div class="page-head">
        <div>
          <div class="breadcrumb">PELATIHAN KADER POSYANDU / ${esc(puskesmas)}</div>
          <h1>${pos?'EDIT POSYANDU':'TAMBAH POSYANDU'}</h1>
        </div>
      </div>
      <div id="cloudPosFormNav"></div>
      <div class="crud-form">
        <div class="form-group">
          <label>NAMA POSYANDU</label>
          <input id="cloudPosName" value="${esc(current.name)}" placeholder="NAMA POSYANDU">
        </div>

        <div class="form-group">
          <label>STATUS POSYANDU ILP</label>
          <div id="cloudIlpPicker" style="display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));gap:16px;margin-top:12px;">
            <button type="button" data-ilp="SUDAH"
              style="appearance:none;width:100%;min-height:64px;padding:14px 20px;border:3px solid ${selected==='SUDAH'?'#079696':'#d2dde4'};border-radius:14px;background:${selected==='SUDAH'?'#e8f8f8':'#ffffff'};color:${selected==='SUDAH'?'#067878':'#263746'};font-size:15px;font-weight:900;cursor:pointer;box-shadow:${selected==='SUDAH'?'0 0 0 4px rgba(7,150,150,.12)':'none'};">
              ✓ &nbsp; SUDAH ILP
            </button>
            <button type="button" data-ilp="BELUM"
              style="appearance:none;width:100%;min-height:64px;padding:14px 20px;border:3px solid ${selected==='BELUM'?'#079696':'#d2dde4'};border-radius:14px;background:${selected==='BELUM'?'#e8f8f8':'#ffffff'};color:${selected==='BELUM'?'#067878':'#263746'};font-size:15px;font-weight:900;cursor:pointer;box-shadow:${selected==='BELUM'?'0 0 0 4px rgba(7,150,150,.12)':'none'};">
              ○ &nbsp; BELUM ILP
            </button>
          </div>
          <input type="hidden" id="cloudIlpValue" value="${selected}">
        </div>

        <div class="global-nav">
          <button class="btn btn-primary" id="cloudSavePos">SIMPAN</button>
          <button class="btn" id="cloudCancelPos">BATAL</button>
        </div>
      </div>`;

    if(typeof addUniversalNavigation==='function') addUniversalNavigation('cloudPosFormNav',puskesmas);

    const picker=document.getElementById('cloudIlpPicker');
    const value=document.getElementById('cloudIlpValue');

    function paintILP(status){
      value.value=status;
      picker.querySelectorAll('[data-ilp]').forEach(btn=>{
        const active=btn.dataset.ilp===status;
        btn.style.borderColor=active?'#079696':'#d2dde4';
        btn.style.background=active?'#e8f8f8':'#ffffff';
        btn.style.color=active?'#067878':'#263746';
        btn.style.boxShadow=active?'0 0 0 4px rgba(7,150,150,.12)':'none';
        btn.innerHTML=active
          ? (status==='SUDAH'?'✓ &nbsp; SUDAH ILP':'✓ &nbsp; BELUM ILP')
          : (status==='SUDAH'?'○ &nbsp; SUDAH ILP':'○ &nbsp; BELUM ILP');
      });
    }

    picker.querySelectorAll('[data-ilp]').forEach(btn=>{
      btn.addEventListener('click',()=>paintILP(btn.dataset.ilp));
    });

    document.getElementById('cloudSavePos').onclick=async()=>{
      const name=document.getElementById('cloudPosName').value.trim().toUpperCase();
      const ilp=document.getElementById('cloudIlpValue').value;
      if(!name){alert('NAMA POSYANDU WAJIB DIISI.');return;}
      try{
        const pid=await psId(puskesmas);
        let q;
        if(pos) q=await sb.from('posyandu').update({name,ilp_status:ilp,updated_at:new Date().toISOString()}).eq('id',pos.id);
        else q=await sb.from('posyandu').insert({puskesmas_id:pid,name,ilp_status:ilp});
        if(q.error) throw q.error;
        await window.openKaderPuskesmas(puskesmas);
      }catch(e){alert('GAGAL MENYIMPAN: '+e.message);}
    };

    document.getElementById('cloudCancelPos').onclick=()=>window.openKaderPuskesmas(puskesmas);
  }
  async function cloudDeletePos(puskesmas,pos){ if(!confirm(`HAPUS POSYANDU ${pos.name}? DATA KADER DI DALAMNYA JUGA AKAN DIHAPUS.`))return; const {error}=await sb.from('posyandu').delete().eq('id',pos.id); if(error)alert('GAGAL MENGHAPUS: '+error.message); else window.openKaderPuskesmas(puskesmas); }

  window.openKaderPosyandu = async function(puskesmas,posName){
    await loadCloud(); const pos=await posRow(puskesmas,posName); if(!pos){alert('POSYANDU TIDAK DITEMUKAN.');return;} const kader=kaderData(pos.id); const page=document.getElementById('app')||document.body;
    page.innerHTML=`<div class="page-head"><div><div class="breadcrumb">PELATIHAN KADER POSYANDU / ${esc(puskesmas)} / ${esc(pos.name)}</div><h1>${esc(pos.name)}</h1><p>STATUS POSYANDU ILP: <b>${pos.ilp_status}</b></p></div></div><div id="cloudKaderNav"></div><div class="posyandu-toolbar"><button class="btn primary" id="cloudAddKader">＋ TAMBAH KADER</button><span>${kader.length} KADER TERLATIH</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>NO</th><th>NAMA KADER</th><th>TINGKATAN</th><th>AKSI</th></tr></thead><tbody id="cloudKaderBody"></tbody></table></div>`;
    if(typeof addUniversalNavigation==='function') addUniversalNavigation('cloudKaderNav',puskesmas);
    const body=document.getElementById('cloudKaderBody'); kader.forEach((k,i)=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${i+1}</td><td>${esc(k.name)}</td><td><span class="level-badge ${k.level.toLowerCase()}">${esc(k.level)}</span></td><td><button class="btn light" data-edit>EDIT</button> <button class="btn danger" data-delete>HAPUS</button></td>`; tr.querySelector('[data-edit]').onclick=()=>cloudEditKader(puskesmas,pos,k); tr.querySelector('[data-delete]').onclick=()=>cloudDeleteKader(puskesmas,pos,k); body.appendChild(tr); });
    document.getElementById('cloudAddKader').onclick=()=>cloudEditKader(puskesmas,pos,null);
  };
  async function cloudEditKader(puskesmas,pos,k){ const page=document.getElementById('app')||document.body; const cur=k||{name:'',level:'PURWA'}; page.innerHTML=`<div class="page-head"><div><div class="breadcrumb">PELATIHAN KADER POSYANDU / ${esc(puskesmas)} / ${esc(pos.name)}</div><h1>${k?'EDIT DATA KADER':'TAMBAH KADER TERLATIH'}</h1></div></div><div id="cloudKaderFormNav"></div><div class="crud-form"><div class="form-group"><label>NAMA KADER</label><input id="cloudKaderName" value="${esc(cur.name)}"></div><div class="form-group"><label>TINGKATAN KADER</label><div class="kader-level-select">${['PURWA','MADYA','UTAMA'].map(x=>`<label class="level-choice"><input type="radio" name="cloudLevel" value="${x}" ${cur.level===x?'checked':''}> ${x}</label>`).join('')}</div></div><div class="global-nav"><button class="btn btn-primary" id="cloudSaveKader">SIMPAN</button><button class="btn" id="cloudCancelKader">BATAL</button></div></div>`; if(typeof addUniversalNavigation==='function')addUniversalNavigation('cloudKaderFormNav',puskesmas); document.getElementById('cloudSaveKader').onclick=async()=>{const name=document.getElementById('cloudKaderName').value.trim().toUpperCase();const level=document.querySelector('input[name="cloudLevel"]:checked').value;if(!name){alert('NAMA KADER WAJIB DIISI.');return;}try{let q;if(k)q=await sb.from('kader').update({name,level,updated_at:new Date().toISOString()}).eq('id',k.id);else{const total=(await sb.from('kader').select('id',{count:'exact',head:true})).count||0;if(total>=TARGET){alert('TARGET 903 KADER SUDAH TERCAPAI.');return;}q=await sb.from('kader').insert({posyandu_id:pos.id,name,level});}if(q.error)throw q.error;await window.openKaderPosyandu(puskesmas,pos.name);}catch(e){alert('GAGAL MENYIMPAN: '+e.message);}};document.getElementById('cloudCancelKader').onclick=()=>window.openKaderPosyandu(puskesmas,pos.name); }
  async function cloudDeleteKader(puskesmas,pos,k){if(!confirm(`HAPUS KADER ${k.name}?`))return;const {error}=await sb.from('kader').delete().eq('id',k.id);if(error)alert('GAGAL MENGHAPUS: '+error.message);else window.openKaderPosyandu(puskesmas,pos.name);}

  async function boot(user){
    try {
      await loadProfile(user);
      showApp(user);
      await loadCloud();
    } catch(e) {
      console.error(e);
      await sb.auth.signOut();
      injectAuth();
      const msg=document.getElementById('onlineMsg');
      if(msg) msg.textContent='AKUN BELUM MEMILIKI PROFIL ADMIN. HUBUNGI ADMIN DINKESKB.';
    }
  }
  sb.auth.onAuthStateChange((event,session)=>{ if(session?.user) boot(session.user); else showLogin(); });
  sb.auth.getSession().then(({data})=>{ if(data.session) boot(data.session.user); else showLogin(); });
})();
