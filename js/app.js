/* ══════════════════════════════════════════
   dityaMotor 88 — Kasir Digital v4.0
   app.js — Full Featured
══════════════════════════════════════════ */

/* ── DB KEYS ── */
const DB_KEY = {
  produk:'dm88_produk', cart:'dm88_cart', laporan:'dm88_laporan',
  statistik:'dm88_statistik', riwayat:'dm88_riwayat', pengaturan:'dm88_pengaturan',
  sheets:'dm88_sheetsUrl', pin:'dm88_pin',
  hutang:'dm88_hutang', stokLog:'dm88_stokLog', kasirList:'dm88_kasirList'
};
const dbGet = (k,fb) => { try{ return JSON.parse(localStorage.getItem(k))??fb; }catch{ return fb; }};
const dbSet = (k,v)  => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

let produk          = dbGet(DB_KEY.produk,[]);
let cart            = dbGet(DB_KEY.cart,[]);
let laporan         = dbGet(DB_KEY.laporan,[]);
let statistikProduk = dbGet(DB_KEY.statistik,{});
let riwayat         = dbGet(DB_KEY.riwayat,[]);
let pengaturan      = dbGet(DB_KEY.pengaturan,{
  namaToko:'dityaMotor 88', alamat:'Jl.Sariwangi Selatan, Sariwangi, Parongpong',
  telepon:'0855-2444-0968', footer1:'Barang yang sudah dibeli tidak dapat ditukar.',
  footer2:'Terima kasih sudah berbelanja!', waNumber:''
});
let hutang          = dbGet(DB_KEY.hutang,[]);
let stokLog         = dbGet(DB_KEY.stokLog,[]);
let kasirList       = dbGet(DB_KEY.kasirList,['Admin']);
let sheetsUrl       = localStorage.getItem(DB_KEY.sheets)||'';
let lastTrxData     = null;

window.produk = produk; window.laporan = laporan; window.riwayat = riwayat;
window.statistikProduk = statistikProduk; window.pengaturan = pengaturan;

window.simpanData = function(){
  dbSet(DB_KEY.produk,produk); dbSet(DB_KEY.cart,cart);
  dbSet(DB_KEY.laporan,laporan); dbSet(DB_KEY.statistik,statistikProduk);
  dbSet(DB_KEY.riwayat,riwayat); dbSet(DB_KEY.pengaturan,pengaturan);
  dbSet(DB_KEY.hutang,hutang); dbSet(DB_KEY.stokLog,stokLog);
  dbSet(DB_KEY.kasirList,kasirList);
  if(sheetsUrl) localStorage.setItem(DB_KEY.sheets,sheetsUrl);
  window.produk=produk; window.laporan=laporan; window.riwayat=riwayat;
  window.statistikProduk=statistikProduk; window.pengaturan=pengaturan;
};

/* ── FORMAT ── */
const rupiah    = n => Number(n||0).toLocaleString('id-ID');
const parseRp   = s => { if(typeof s==='number') return s; return parseInt(String(s).replace(/\./g,'').replace(/[^0-9]/g,''))||0; };
const tanggalNama = () => new Date().toLocaleDateString('id-ID').replace(/\//g,'-');
function rpPreview(el,pid){ const n=parseRp(el.value); const p=document.getElementById(pid); if(p) p.innerText=n>0?'Rp '+rupiah(n):''; }

/* ── TOAST ── */
let _toastEl;
function showToast(msg,type='info'){
  if(!_toastEl){ _toastEl=document.createElement('div'); _toastEl.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;pointer-events:none;transition:opacity .3s;font-family:"Plus Jakarta Sans",sans-serif;max-width:90vw;text-align:center'; document.body.appendChild(_toastEl); }
  _toastEl.innerText=msg; _toastEl.style.opacity='1';
  const c={error:'#ef4444',success:'#22c55e',info:'#f5c542'};
  const t={error:'#fff',success:'#fff',info:'#111'};
  _toastEl.style.background=c[type]||c.info; _toastEl.style.color=t[type]||t.info;
  clearTimeout(_toastEl._t); _toastEl._t=setTimeout(()=>{ _toastEl.style.opacity='0'; },2800);
}

/* ══════════════════════════════════════════
   LOGIN PIN
══════════════════════════════════════════ */
let pinBuffer='';
const DEFAULT_PIN='1234';

function initLogin(){
  const screen=document.getElementById('loginScreen');
  const app=document.getElementById('appContent');
  if(sessionStorage.getItem('dm88_unlocked')==='1'){ screen.style.display='none'; app.style.display='block'; return; }
  screen.style.display='flex'; app.style.display='none';
  document.addEventListener('keydown',function onKey(e){
    if(sessionStorage.getItem('dm88_unlocked')==='1'){ document.removeEventListener('keydown',onKey); return; }
    if(e.key>='0'&&e.key<='9') window.pinPress(e.key);
    else if(e.key==='Backspace') window.pinDel();
  });
  const savedPin=localStorage.getItem(DB_KEY.pin)||DEFAULT_PIN;
  window.pinPress=function(val){
    if(pinBuffer.length>=4) return; pinBuffer+=val; updatePinDots();
    if(pinBuffer.length===4){ setTimeout(()=>{
      if(pinBuffer===savedPin){
        sessionStorage.setItem('dm88_unlocked','1');
        screen.style.display='none'; app.style.display='block';
        pinBuffer=''; updatePinDots();
      } else {
        document.querySelectorAll('.pin-dot').forEach(d=>d.classList.add('error'));
        document.getElementById('pinErrorMsg').innerText='PIN salah, coba lagi';
        setTimeout(()=>{ document.querySelectorAll('.pin-dot').forEach(d=>d.classList.remove('error','filled')); document.getElementById('pinErrorMsg').innerText=''; pinBuffer=''; },900);
      }
    },200); }
  };
  window.pinDel=function(){ if(!pinBuffer.length) return; pinBuffer=pinBuffer.slice(0,-1); updatePinDots(); };
}

function updatePinDots(){ document.querySelectorAll('.pin-dot').forEach((d,i)=>d.classList.toggle('filled',i<pinBuffer.length)); }

function gantiPin(){
  Swal.fire({ title:'Ganti PIN', html:`<div style="text-align:left;font-size:13px;color:#8892a4;margin-bottom:8px">PIN lama:</div><input type="password" id="swal-old-pin" class="swal2-input" maxlength="4" placeholder="PIN saat ini" inputmode="numeric"><div style="text-align:left;font-size:13px;color:#8892a4;margin-bottom:8px;margin-top:8px">PIN baru:</div><input type="password" id="swal-new-pin" class="swal2-input" maxlength="4" placeholder="PIN baru (4 angka)" inputmode="numeric"><div style="text-align:left;font-size:13px;color:#8892a4;margin-bottom:8px;margin-top:8px">Konfirmasi PIN:</div><input type="password" id="swal-confirm-pin" class="swal2-input" maxlength="4" placeholder="Ulangi PIN baru" inputmode="numeric">`,
    background:'#171b24',color:'#e8eaf0',confirmButtonText:'Simpan PIN',confirmButtonColor:'#f5c542',showCancelButton:true,cancelButtonText:'Batal',
    preConfirm:()=>{ const op=document.getElementById('swal-old-pin').value,np=document.getElementById('swal-new-pin').value,cp=document.getElementById('swal-confirm-pin').value,sv=localStorage.getItem(DB_KEY.pin)||DEFAULT_PIN; if(op!==sv){Swal.showValidationMessage('PIN lama salah');return false;} if(np.length<4){Swal.showValidationMessage('PIN harus 4 digit');return false;} if(!/^\d{4}$/.test(np)){Swal.showValidationMessage('PIN hanya angka');return false;} if(np!==cp){Swal.showValidationMessage('Konfirmasi tidak cocok');return false;} return np; }
  }).then(r=>{ if(r.isConfirmed){ localStorage.setItem(DB_KEY.pin,r.value); Swal.fire({title:'✅ PIN berhasil diubah!',icon:'success',background:'#171b24',color:'#e8eaf0',confirmButtonColor:'#f5c542'}); } });
}

function logout(){
  Swal.fire({title:'Kunci Aplikasi?',text:'Anda perlu memasukkan PIN kembali.',icon:'question',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Ya, Kunci',confirmButtonColor:'#ef4444',cancelButtonText:'Batal'
  }).then(r=>{ if(r.isConfirmed){ sessionStorage.removeItem('dm88_unlocked'); location.reload(); } });
}

/* ── TABS ── */
function switchTab(panelId,btn){
  const parent=btn.closest('.card');
  parent.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  parent.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  parent.querySelector('#'+panelId).classList.add('active');
  btn.classList.add('active');
  if(panelId==='tab-terlaris') renderTerlaris();
  if(panelId==='tab-stoklog') renderStokLog();
  if(panelId==='tab-hutang') renderHutang();
  if(panelId==='tab-mingguan') renderMingguan();
  if(panelId==='tab-bulanan') renderBulanan();
}

/* ── PENGATURAN ── */
window.terapkanPengaturan=function(){
  document.getElementById('headerNamaToko').innerText=pengaturan.namaToko;
  document.getElementById('headerAlamat').innerText=pengaturan.alamat+'  |  Telp: '+pengaturan.telepon;
};

function bukaModalPengaturan(){
  document.getElementById('setNamaToko').value=pengaturan.namaToko;
  document.getElementById('setAlamat').value=pengaturan.alamat;
  document.getElementById('setTelepon').value=pengaturan.telepon;
  document.getElementById('setFooter1').value=pengaturan.footer1;
  document.getElementById('setFooter2').value=pengaturan.footer2;
  document.getElementById('setWaNumber').value=pengaturan.waNumber||'';
  renderKasirList();
  document.getElementById('modalPengaturan').classList.add('active');
}

function simpanPengaturan(){
  pengaturan.namaToko=document.getElementById('setNamaToko').value.trim()||pengaturan.namaToko;
  pengaturan.alamat  =document.getElementById('setAlamat').value.trim()||pengaturan.alamat;
  pengaturan.telepon =document.getElementById('setTelepon').value.trim()||pengaturan.telepon;
  pengaturan.footer1 =document.getElementById('setFooter1').value.trim()||pengaturan.footer1;
  pengaturan.footer2 =document.getElementById('setFooter2').value.trim()||pengaturan.footer2;
  pengaturan.waNumber=document.getElementById('setWaNumber').value.trim();
  window.terapkanPengaturan(); tutupModal('modalPengaturan'); simpanData();
  showToast('Pengaturan tersimpan ✓','success');
}

/* ── KASIR LIST ── */
function renderKasirList(){
  const el=document.getElementById('kasirListContainer'); if(!el) return;
  el.innerHTML=kasirList.map((k,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="flex:1;font-size:13px">${k}</span><button class="btn btn-danger btn-xs" onclick="hapusKasir(${i})" ${kasirList.length<=1?'disabled':''}>✕</button></div>`).join('');
  // Sync dropdown
  const sel=document.getElementById('namaKasir'); if(!sel) return;
  const cur=sel.value;
  sel.innerHTML=kasirList.map(k=>`<option value="${k}">${k}</option>`).join('');
  if(kasirList.includes(cur)) sel.value=cur;
}

function tambahKasirBaru(){
  const inp=document.getElementById('inputKasirBaru'); if(!inp) return;
  const nama=inp.value.trim(); if(!nama){showToast('Nama kasir kosong','error');return;}
  if(kasirList.includes(nama)){showToast('Kasir sudah ada','error');return;}
  kasirList.push(nama); inp.value=''; renderKasirList(); simpanData();
  showToast('Kasir ditambahkan ✓','success');
}

function hapusKasir(i){
  if(kasirList.length<=1){showToast('Minimal 1 kasir','error');return;}
  kasirList.splice(i,1); renderKasirList(); simpanData();
}

/* ── DASHBOARD ── */
window.updateDashboard=function(){
  const hari=new Date().toLocaleDateString('id-ID');
  const lh=laporan.find(l=>l.tanggal===hari);
  document.getElementById('dashOmzet').innerText='Rp '+rupiah(lh?lh.total:0);
  document.getElementById('dashLaba').innerText='Rp '+rupiah(lh?lh.laba:0);
  document.getElementById('dashTrx').innerText=lh?lh.transaksi:0;
  const kritis=produk.filter(p=>p.stok<=(p.stokMin||3)).length;
  document.getElementById('dashStokKritis').innerText=kritis;
  const hutangBelumLunas=hutang.filter(h=>h.status==='belum').length;
  const dashHutang=document.getElementById('dashHutang');
  if(dashHutang) dashHutang.innerText=hutangBelumLunas;
  updateAlertStok(); renderChart();
};

function updateAlertStok(){
  const habis=produk.filter(p=>p.stok===0);
  const menipis=produk.filter(p=>p.stok>0&&p.stok<=(p.stokMin||3));
  const el=document.getElementById('stokAlert'); let msg='';
  if(habis.length) msg+='⛔ Stok habis: '+habis.map(p=>p.nama).join(', ')+'.  ';
  if(menipis.length) msg+='⚠️ Menipis: '+menipis.map(p=>p.nama+' ('+p.stok+')').join(', ');
  el.innerText=msg; el.style.display=msg?'block':'none';
}

/* ── CHART ── */
let salesChart=null;
function renderChart(){
  const ctx=document.getElementById('salesChartCanvas'); if(!ctx) return;
  const days=[],omzetD=[],labaD=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const lbl=d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
    const key=d.toLocaleDateString('id-ID');
    const entry=laporan.find(l=>l.tanggal===key);
    days.push(lbl); omzetD.push(entry?entry.total:0); labaD.push(entry?(entry.laba||0):0);
  }
  if(salesChart){ salesChart.data.labels=days; salesChart.data.datasets[0].data=omzetD; salesChart.data.datasets[1].data=labaD; salesChart.update(); return; }
  salesChart=new Chart(ctx,{ type:'bar', data:{ labels:days, datasets:[
    {label:'Omzet',data:omzetD,backgroundColor:'rgba(34,197,94,0.6)',borderColor:'#22c55e',borderWidth:1,borderRadius:5},
    {label:'Laba',data:labaD,backgroundColor:'rgba(245,197,66,0.6)',borderColor:'#f5c542',borderWidth:1,borderRadius:5}
  ]}, options:{ responsive:true, maintainAspectRatio:true, plugins:{ legend:{labels:{color:'#8892a4',font:{size:11}}}, tooltip:{callbacks:{label:c=>' Rp '+rupiah(c.raw)}} }, scales:{ x:{ticks:{color:'#8892a4',font:{size:10}},grid:{color:'#2a3045'}}, y:{ticks:{color:'#8892a4',font:{size:10},callback:v=>'Rp '+rupiah(v)},grid:{color:'#2a3045'}} } }});
}

/* ── PRODUK ── */
window.renderProduk=function(){
  const list=document.getElementById('produkList');
  const q=document.getElementById('searchProduk').value.toLowerCase();
  const kat=document.getElementById('filterKategori').value;
  const filtered=produk.filter(p=>p.nama.toLowerCase().includes(q)&&(!kat||p.kategori===kat));
  if(!filtered.length){ list.innerHTML=`<tr><td colspan="4"><div class="empty-state"><div class="icon">📦</div>Tidak ada produk</div></td></tr>`; return; }
  list.innerHTML=filtered.map(item=>{
    const idx=produk.indexOf(item); const low=item.stok<=(item.stokMin||3);
    const stokBadge=low?`<span class="stok-num badge badge-low">${item.stok}</span>`:`<span class="stok-num" style="color:var(--green)">${item.stok}</span>`;
    return `<tr><td><div style="font-weight:600;font-size:13px">${item.nama}</div>${item.kategori?`<span class="badge badge-cat">${item.kategori}</span>`:''}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold)">Rp ${rupiah(item.harga)}</td><td>${stokBadge}</td><td style="white-space:nowrap"><button class="btn btn-primary btn-xs" onclick="tambahCart(${idx})">+</button> <button class="btn btn-ghost btn-xs" onclick="bukaRestock(${idx})">📦</button> <button class="btn btn-ghost btn-xs" onclick="bukaEditProduk(${idx})">✏️</button> <button class="btn btn-danger btn-xs" onclick="hapusProduk(${idx})">🗑</button></td></tr>`;
  }).join('');
  updateAlertStok();
};

function tambahProduk(){
  const nama=document.getElementById('namaProduk').value.trim();
  const kategori=document.getElementById('kategoriProduk').value;
  const hargaModal=parseRp(document.getElementById('hargaModalProduk').value);
  const harga=parseRp(document.getElementById('hargaProduk').value);
  const stok=parseInt(document.getElementById('stokProduk').value)||0;
  const stokMin=parseInt(document.getElementById('stokMinProduk').value)||3;
  if(!nama){showToast('Nama produk wajib diisi','error');return;}
  if(harga<=0){showToast('Harga jual harus > 0','error');return;}
  if(produk.find(p=>p.nama.toLowerCase()===nama.toLowerCase())){showToast('Produk sudah ada','error');return;}
  produk.push({nama,kategori,hargaModal,harga,stok,stokMin});
  ['namaProduk','hargaModalProduk','hargaProduk','stokProduk'].forEach(id=>document.getElementById(id).value='');
  ['prevModal','prevJual'].forEach(id=>document.getElementById(id).innerText='');
  document.getElementById('stokMinProduk').value='3'; document.getElementById('kategoriProduk').value='';
  window.renderProduk(); simpanData(); window.updateDashboard();
  showToast('Produk berhasil ditambahkan ✓','success');
}

function bukaEditProduk(i){
  const p=produk[i];
  document.getElementById('editIndex').value=i;
  document.getElementById('editNama').value=p.nama;
  document.getElementById('editKategori').value=p.kategori||'';
  document.getElementById('editHargaModal').value=rupiah(p.hargaModal||0);
  document.getElementById('editHarga').value=rupiah(p.harga);
  document.getElementById('editStok').value=p.stok;
  document.getElementById('editStokMin').value=p.stokMin||3;
  document.getElementById('editPrevModal').innerText=p.hargaModal?'Rp '+rupiah(p.hargaModal):'';
  document.getElementById('editPrevJual').innerText='Rp '+rupiah(p.harga);
  document.getElementById('editProdukModal').classList.add('active');
}

function simpanEditProduk(){
  const idx=parseInt(document.getElementById('editIndex').value);
  const nama=document.getElementById('editNama').value.trim();
  const kategori=document.getElementById('editKategori').value;
  const hargaModal=parseRp(document.getElementById('editHargaModal').value);
  const harga=parseRp(document.getElementById('editHarga').value);
  const stok=parseInt(document.getElementById('editStok').value)||0;
  const stokMin=parseInt(document.getElementById('editStokMin').value)||3;
  if(!nama||harga<=0){showToast('Data tidak valid','error');return;}
  const stokLama=produk[idx].stok;
  produk[idx]={...produk[idx],nama,kategori,hargaModal,harga,stok,stokMin};
  if(stok!==stokLama) catatStokLog(nama,'edit','Ubah stok manual',stokLama,stok);
  tutupModal('editProdukModal'); window.renderProduk(); window.updateDashboard(); simpanData();
  showToast('Produk diperbarui ✓','success');
}

function hapusProduk(i){
  if(cart.find(c=>c.nama===produk[i].nama)){showToast('Produk masih di keranjang','error');return;}
  Swal.fire({title:`Hapus "${produk[i].nama}"?`,text:'Data produk akan dihapus permanen.',icon:'warning',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Ya, Hapus',confirmButtonColor:'#ef4444',cancelButtonText:'Batal'
  }).then(r=>{ if(r.isConfirmed){ produk.splice(i,1); window.renderProduk(); window.updateDashboard(); simpanData(); showToast('Produk dihapus','success'); } });
}

/* ── RESTOCK ── */
function bukaRestock(i){
  const p=produk[i];
  Swal.fire({
    title:`📦 Restock: ${p.nama}`,
    html:`<div style="text-align:left;color:#8892a4;font-size:12px;margin-bottom:6px">Stok saat ini: <strong style="color:#22c55e">${p.stok}</strong></div>
          <input type="number" id="swal-restock-qty" class="swal2-input" min="1" placeholder="Jumlah tambah stok" style="margin-bottom:8px">
          <input type="text" id="swal-restock-ket" class="swal2-input" placeholder="Keterangan (opsional)">`,
    background:'#171b24',color:'#e8eaf0',confirmButtonText:'Tambah Stok',confirmButtonColor:'#22c55e',showCancelButton:true,cancelButtonText:'Batal',
    preConfirm:()=>{
      const qty=parseInt(document.getElementById('swal-restock-qty').value)||0;
      const ket=document.getElementById('swal-restock-ket').value.trim()||'Restock';
      if(qty<=0){Swal.showValidationMessage('Jumlah harus lebih dari 0');return false;}
      return {qty,ket};
    }
  }).then(r=>{
    if(r.isConfirmed){
      const stokLama=produk[i].stok;
      produk[i].stok+=r.value.qty;
      catatStokLog(p.nama,'masuk',r.value.ket,stokLama,produk[i].stok);
      window.renderProduk(); window.updateDashboard(); simpanData();
      showToast(`✅ Stok +${r.value.qty} berhasil ditambahkan`,'success');
    }
  });
}

/* ── STOK LOG ── */
function catatStokLog(nama,tipe,keterangan,stokLama,stokBaru){
  stokLog.unshift({ waktu:new Date().toLocaleString('id-ID'), nama, tipe, keterangan, stokLama, stokBaru });
  if(stokLog.length>500) stokLog=stokLog.slice(0,500);
  dbSet(DB_KEY.stokLog,stokLog);
}

function renderStokLog(){
  const list=document.getElementById('stokLogList'); if(!list) return;
  const q=document.getElementById('searchStokLog')?.value.toLowerCase()||'';
  let data=stokLog.filter(s=>!q||s.nama.toLowerCase().includes(q));
  if(!data.length){ list.innerHTML=`<tr><td colspan="5"><div class="empty-state"><div class="icon">📋</div>Belum ada riwayat stok</div></td></tr>`; return; }
  list.innerHTML=data.slice(0,100).map(s=>{
    const warna=s.tipe==='masuk'?'var(--green)':s.tipe==='keluar'?'var(--red)':'var(--gold)';
    const ikon=s.tipe==='masuk'?'↑':s.tipe==='keluar'?'↓':'~';
    return `<tr><td style="font-size:11px;color:var(--text2)">${s.waktu}</td><td style="font-weight:600;font-size:13px">${s.nama}</td><td><span style="color:${warna};font-weight:700">${ikon} ${s.tipe}</span></td><td style="font-family:'JetBrains Mono',monospace;font-size:12px">${s.stokLama} → <strong style="color:${warna}">${s.stokBaru}</strong></td><td style="font-size:11px;color:var(--text2)">${s.keterangan||'-'}</td></tr>`;
  }).join('');
}

/* ── PRODUK TERLARIS ── */
function renderTerlaris(){
  const list=document.getElementById('terlarisListContainer'); if(!list) return;
  const sorted=Object.entries(statistikProduk).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!sorted.length){ list.innerHTML=`<div class="empty-state"><div class="icon">🏆</div>Belum ada data penjualan</div>`; return; }
  const max=sorted[0][1]||1;
  list.innerHTML=sorted.map(([nama,qty],i)=>`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600">${i+1}. ${nama}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold)">${qty} terjual</span>
      </div>
      <div style="background:var(--bg3);border-radius:4px;height:8px;overflow:hidden">
        <div style="background:${i===0?'var(--gold)':'var(--green)'};height:100%;width:${(qty/max*100).toFixed(1)}%;border-radius:4px;transition:width .5s"></div>
      </div>
    </div>`).join('');
  renderTerlarisChart(sorted);
}

let terlarisChart=null;
function renderTerlarisChart(sorted){
  const ctx=document.getElementById('terlarisChart'); if(!ctx) return;
  const labels=sorted.map(([n])=>n.length>12?n.slice(0,12)+'…':n);
  const data=sorted.map(([,q])=>q);
  if(terlarisChart){ terlarisChart.data.labels=labels; terlarisChart.data.datasets[0].data=data; terlarisChart.update(); return; }
  terlarisChart=new Chart(ctx,{ type:'bar', data:{ labels, datasets:[{label:'Terjual',data,backgroundColor:'rgba(245,197,66,0.7)',borderColor:'#f5c542',borderWidth:1,borderRadius:5}]}, options:{ indexAxis:'y', responsive:true, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} terjual`}}}, scales:{ x:{ticks:{color:'#8892a4',font:{size:10}},grid:{color:'#2a3045'}}, y:{ticks:{color:'#e8eaf0',font:{size:11}},grid:{color:'#2a3045'}} } }});
}

/* ── LAPORAN MINGGUAN ── */
function renderMingguan(){
  const list=document.getElementById('mingguanList'); if(!list) return;
  // Kelompokkan laporan per minggu (Senin-Minggu)
  const weeks={};
  laporan.forEach(item=>{
    const [d,m,y]=item.tanggal.split('/');
    const dt=new Date(`${y}-${m}-${d}`);
    const day=dt.getDay(); const diff=dt.getDate()-(day||7)+1;
    const senin=new Date(dt); senin.setDate(diff);
    const key=senin.toLocaleDateString('id-ID');
    if(!weeks[key]) weeks[key]={mulai:key,total:0,laba:0,transaksi:0};
    weeks[key].total+=item.total; weeks[key].laba+=item.laba||0; weeks[key].transaksi+=item.transaksi;
  });
  const data=Object.values(weeks).reverse();
  if(!data.length){ list.innerHTML=`<tr><td colspan="4"><div class="empty-state"><div class="icon">📅</div>Belum ada data</div></td></tr>`; return; }
  list.innerHTML=data.map(w=>`<tr><td style="font-size:12px">Minggu ${w.mulai}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--green)">Rp ${rupiah(w.total)}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold)">Rp ${rupiah(w.laba)}</td><td style="font-weight:700">${w.transaksi}</td></tr>`).join('');
}

/* ── LAPORAN BULANAN ── */
function renderBulanan(){
  const list=document.getElementById('bulananList'); if(!list) return;
  const months={};
  laporan.forEach(item=>{
    const [d,m,y]=item.tanggal.split('/');
    const key=`${m}/${y}`;
    if(!months[key]) months[key]={bulan:key,total:0,laba:0,transaksi:0};
    months[key].total+=item.total; months[key].laba+=item.laba||0; months[key].transaksi+=item.transaksi;
  });
  const data=Object.values(months).reverse();
  if(!data.length){ list.innerHTML=`<tr><td colspan="4"><div class="empty-state"><div class="icon">📆</div>Belum ada data</div></td></tr>`; return; }
  list.innerHTML=data.map(b=>`<tr><td style="font-size:12px">Bulan ${b.bulan}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--green)">Rp ${rupiah(b.total)}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold)">Rp ${rupiah(b.laba)}</td><td style="font-weight:700">${b.transaksi}</td></tr>`).join('');
}

/* ── HUTANG PELANGGAN ── */
function bukaModalHutang(){
  document.getElementById('modalHutang').classList.add('active');
  renderHutang();
}

function tambahHutang(){
  const nama=document.getElementById('hutangNama').value.trim();
  const jumlah=parseRp(document.getElementById('hutangJumlah').value);
  const ket=document.getElementById('hutangKet').value.trim();
  if(!nama){showToast('Nama pelanggan wajib diisi','error');return;}
  if(jumlah<=0){showToast('Jumlah hutang harus > 0','error');return;}
  hutang.push({ id:'H'+Date.now(), nama, jumlah, ket, tanggal:new Date().toLocaleDateString('id-ID'), status:'belum' });
  document.getElementById('hutangNama').value='';
  document.getElementById('hutangJumlah').value='';
  document.getElementById('hutangKet').value='';
  document.getElementById('prevHutangJumlah').innerText='';
  renderHutang(); simpanData(); window.updateDashboard();
  showToast('Hutang dicatat ✓','success');
}

function renderHutang(){
  const list=document.getElementById('hutangList'); if(!list) return;
  const filterStatus=document.getElementById('filterHutangStatus')?.value||'';
  const q=document.getElementById('searchHutang')?.value.toLowerCase()||'';
  let data=hutang.filter(h=>(!filterStatus||h.status===filterStatus)&&(!q||h.nama.toLowerCase().includes(q)));
  if(!data.length){ list.innerHTML=`<tr><td colspan="5"><div class="empty-state"><div class="icon">💳</div>Belum ada catatan hutang</div></td></tr>`; return; }
  const totalBelum=hutang.filter(h=>h.status==='belum').reduce((s,h)=>s+h.jumlah,0);
  document.getElementById('totalHutangBelum').innerText='Rp '+rupiah(totalBelum);
  list.innerHTML=data.map((h,i)=>{
    const idx=hutang.indexOf(h);
    return `<tr><td style="font-weight:600;font-size:13px">${h.nama}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--red)">Rp ${rupiah(h.jumlah)}</td><td style="font-size:11px;color:var(--text2)">${h.tanggal}</td><td><span class="badge ${h.status==='lunas'?'badge-ok':'badge-low'}">${h.status==='lunas'?'✓ Lunas':'Belum'}</span></td><td style="white-space:nowrap">${h.status==='belum'?`<button class="btn btn-success btn-xs" onclick="lunasHutang(${idx})">✓ Lunas</button> `:''}<button class="btn btn-danger btn-xs" onclick="hapusHutang(${idx})">🗑</button></td></tr>`;
  }).join('');
}

function lunasHutang(i){
  hutang[i].status='lunas'; hutang[i].tanggalLunas=new Date().toLocaleDateString('id-ID');
  renderHutang(); simpanData(); window.updateDashboard();
  showToast('Hutang ditandai lunas ✓','success');
}

function hapusHutang(i){
  Swal.fire({title:'Hapus catatan hutang ini?',icon:'warning',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Hapus',confirmButtonColor:'#ef4444',cancelButtonText:'Batal'
  }).then(r=>{ if(r.isConfirmed){ hutang.splice(i,1); renderHutang(); simpanData(); window.updateDashboard(); } });
}

/* ── CART ── */
function tambahCart(i){
  if(produk[i].stok<=0){showToast('Stok habis!','error');return;}
  produk[i].stok--;
  const ex=cart.find(c=>c.nama===produk[i].nama);
  if(ex) ex.qty++; else cart.push({nama:produk[i].nama,harga:produk[i].harga,hargaModal:produk[i].hargaModal||0,qty:1});
  window.renderProduk(); renderCart(); simpanData();
}
function kurangiCart(i){
  const item=cart[i],pi=produk.findIndex(p=>p.nama===item.nama);
  if(pi!==-1) produk[pi].stok++;
  if(cart[i].qty>1) cart[i].qty--; else cart.splice(i,1);
  window.renderProduk(); renderCart(); simpanData();
}
function tambahCartDariCart(i){
  const item=cart[i],pi=produk.findIndex(p=>p.nama===item.nama);
  if(pi===-1||produk[pi].stok<=0){showToast('Stok habis!','error');return;}
  produk[pi].stok--; cart[i].qty++; window.renderProduk(); renderCart(); simpanData();
}
function hapusCart(i){
  const item=cart[i],pi=produk.findIndex(p=>p.nama===item.nama);
  if(pi!==-1) produk[pi].stok+=item.qty;
  cart.splice(i,1); window.renderProduk(); renderCart(); simpanData();
}
function kosongkanCart(){
  if(!cart.length) return;
  Swal.fire({title:'Kosongkan keranjang?',icon:'question',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Ya',confirmButtonColor:'#ef4444',cancelButtonText:'Batal'
  }).then(r=>{ if(r.isConfirmed){ cart.forEach(item=>{const pi=produk.findIndex(p=>p.nama===item.nama);if(pi!==-1)produk[pi].stok+=item.qty;}); cart=[]; ['diskonNilai','bayar'].forEach(id=>document.getElementById(id).value=''); document.getElementById('prevBayar').innerText=''; window.renderProduk(); renderCart(); simpanData(); } });
}

function renderCart(){
  const list=document.getElementById('cartList'),empty=document.getElementById('cartEmpty');
  if(!cart.length){ list.innerHTML=''; empty.style.display='block'; document.getElementById('totalSubtotal').innerText='Rp 0'; document.getElementById('totalAkhirDisplay').innerText='Rp 0'; document.getElementById('diskonRow').style.display='none'; return; }
  empty.style.display='none'; let total=0;
  list.innerHTML=cart.map((item,i)=>{ const sub=item.harga*item.qty; total+=sub; return `<tr><td style="font-size:12px;font-weight:600">${item.nama}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text2)">Rp ${rupiah(item.harga)}</td><td><div class="qty-ctrl"><button onclick="kurangiCart(${i})">−</button><span>${item.qty}</span><button onclick="tambahCartDariCart(${i})">+</button></div></td><td style="font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--gold)">Rp ${rupiah(sub)}</td><td><button class="btn btn-danger btn-xs" onclick="hapusCart(${i})">✕</button></td></tr>`; }).join('');
  document.getElementById('totalSubtotal').innerText='Rp '+rupiah(total); hitungDiskon();
}

function hitungDiskon(){
  const total=cart.reduce((s,i)=>s+i.harga*i.qty,0);
  const nilaiRaw=parseRp(document.getElementById('diskonNilai').value);
  const tipe=document.getElementById('diskonTipe').value;
  let diskon=tipe==='persen'?Math.round(total*nilaiRaw/100):nilaiRaw;
  if(diskon>total) diskon=total;
  document.getElementById('totalSubtotal').innerText='Rp '+rupiah(total);
  document.getElementById('totalAkhirDisplay').innerText='Rp '+rupiah(total-diskon);
  if(diskon>0){ document.getElementById('diskonRow').style.display='flex'; document.getElementById('diskonAmt').innerText='- Rp '+rupiah(diskon); }
  else document.getElementById('diskonRow').style.display='none';
}

/* ── CHECKOUT ── */
function checkout(){
  if(!cart.length){showToast('Keranjang masih kosong!','error');return;}
  const total=cart.reduce((s,i)=>s+i.harga*i.qty,0);
  const diskonNilai=parseRp(document.getElementById('diskonNilai').value);
  const diskonTipe=document.getElementById('diskonTipe').value;
  let diskon=diskonTipe==='persen'?Math.round(total*diskonNilai/100):diskonNilai;
  if(diskon>total) diskon=total;
  const totalAkhir=total-diskon;
  const metode=document.getElementById('metodeBayar').value;
  const kasir=document.getElementById('namaKasir').value||'Admin';
  let bayar=parseRp(document.getElementById('bayar').value)||0;
  if(metode==='Tunai'&&bayar<totalAkhir){showToast(`Bayar kurang! Total: Rp ${rupiah(totalAkhir)}`,'error');return;}
  if(metode!=='Tunai') bayar=totalAkhir;
  const kembalian=metode==='Tunai'?bayar-totalAkhir:0;
  const tanggal=new Date().toLocaleDateString('id-ID');
  const waktu=new Date().toLocaleString('id-ID');
  const noTrx='TRX-'+Date.now().toString().slice(-8);
  let laba=cart.reduce((s,item)=>s+(item.harga-(item.hargaModal||0))*item.qty,0)-diskon;
  // Catat stok log keluar
  cart.forEach(item=>{ catatStokLog(item.nama,'keluar',`Terjual (${noTrx})`,item.qty+produk.findIndex(p=>p.nama===item.nama)!==-1?produk.find(p=>p.nama===item.nama)?.stok+item.qty||0:0,produk.find(p=>p.nama===item.nama)?.stok||0); statistikProduk[item.nama]=(statistikProduk[item.nama]||0)+item.qty; });
  const produkTerlaris=Object.keys(statistikProduk).length?Object.keys(statistikProduk).reduce((a,b)=>statistikProduk[a]>statistikProduk[b]?a:b):'-';
  const existing=laporan.find(l=>l.tanggal===tanggal);
  if(existing){existing.total+=totalAkhir;existing.laba+=laba;existing.transaksi+=1;existing.terlaris=produkTerlaris;}
  else laporan.push({tanggal,total:totalAkhir,laba,transaksi:1,terlaris:produkTerlaris});
  const trxData={noTrx,waktu,tanggal,total:totalAkhir,metode,kasir,bayar,kembalian:metode==='Tunai'?kembalian:0,diskon,subtotal:total,items:cart.map(i=>({nama:i.nama,qty:i.qty,harga:i.harga,subtotal:i.harga*i.qty})),detail:cart.map(i=>`${i.nama} x${i.qty}`).join(', ')};
  riwayat.unshift(trxData);
  lastTrxData={action:'transaksi',...trxData,laba,toko:pengaturan.namaToko};
  const struHtml=buildStruk({noTrx,tanggal,waktu,kasir,metode,items:cart,subtotal:total,diskon,totalAkhir,bayar,kembalian});
  document.getElementById('receipt').innerHTML=struHtml; document.getElementById('receipt').style.display='block';
  document.getElementById('btnCetak').style.display='block';
  const syncStatus=document.getElementById('syncStatus'),btnSheets=document.getElementById('btnKirimSheets');
  syncStatus.className='sync-status'; syncStatus.style.display='none';
  btnSheets.style.display='block'; btnSheets.innerText='📤 Kirim ke Google Sheets'; btnSheets.disabled=false;
  if(sheetsUrl) kirimKeSheets();
  const cartSnapshot=[...cart]; cart=[];
  ['diskonNilai','bayar'].forEach(id=>document.getElementById(id).value=''); document.getElementById('prevBayar').innerText='';
  window.renderProduk(); renderCart(); window.renderLaporan(); renderRiwayat(); window.updateDashboard(); simpanData();

  const waNum=pengaturan.waNumber?.replace(/\D/g,'');
  Swal.fire({
    title:'✅ Checkout Berhasil!',
    html:`<div style="font-family:'JetBrains Mono',monospace;font-size:14px;margin:12px 0"><div style="display:flex;justify-content:space-between;margin:4px 0"><span>Total</span><span style="color:#f5c542">Rp ${rupiah(totalAkhir)}</span></div>${metode==='Tunai'?`<div style="display:flex;justify-content:space-between;margin:4px 0"><span>Bayar</span><span>Rp ${rupiah(bayar)}</span></div><div style="display:flex;justify-content:space-between;margin:4px 0"><span style="color:#22c55e;font-weight:700">Kembalian</span><span style="color:#22c55e;font-weight:700">Rp ${rupiah(kembalian)}</span></div>`:''}<div style="display:flex;justify-content:space-between;margin:4px 0"><span>Metode</span><span>${metode}</span></div><div style="display:flex;justify-content:space-between;margin:4px 0"><span>Kasir</span><span>${kasir}</span></div><div style="display:flex;justify-content:space-between;margin:4px 0"><span>No Transaksi</span><span style="font-size:11px">${noTrx}</span></div></div>`,
    icon:'success',background:'#171b24',color:'#e8eaf0',
    confirmButtonText:'🖨 Cetak Nota',confirmButtonColor:'#f5c542',
    showDenyButton:!!waNum,denyButtonText:'📱 Kirim WA',denyButtonColor:'#22c55e',
    showCancelButton:true,cancelButtonText:'Tutup'
  }).then(r=>{
    if(r.isConfirmed) cetakStruklangsung();
    else if(r.isDenied&&waNum) kirimWA(waNum,{noTrx,tanggal,waktu,kasir,metode,items:cartSnapshot,subtotal:total,diskon,totalAkhir,bayar,kembalian});
  });
}

/* ── BUILD STRUK ── */
function buildStruk({noTrx,tanggal,waktu,kasir,metode,items,subtotal,diskon,totalAkhir,bayar,kembalian},ulang=false){
  const W=32; const line='─'.repeat(W); const dline='═'.repeat(W);
  const pad=(l,r,t)=>{ const g=t-l.length-r.length; return l+' '.repeat(Math.max(1,g))+r; };
  const center=(t,w)=>{ const s=Math.max(0,Math.floor((w-t.length)/2)); return ' '.repeat(s)+t; };
  let s='';
  s+=center(pengaturan.namaToko.toUpperCase(),W)+'\n';
  s+=center(pengaturan.alamat,W)+'\n';
  s+=center('Telp: '+pengaturan.telepon,W)+'\n';
  s+=dline+'\n';
  if(ulang) s+=center('*** CETAK ULANG ***',W)+'\n';
  s+=pad('No:',noTrx,W)+'\n'+pad('Tanggal:',tanggal,W)+'\n'+pad('Waktu:',waktu,W)+'\n'+pad('Kasir:',kasir,W)+'\n'+pad('Bayar:',metode,W)+'\n';
  s+=line+'\n'+pad('ITEM','SUBTOTAL',W)+'\n'+line+'\n';
  items.forEach(item=>{ s+=item.nama+'\n'; s+=pad('  '+item.qty+'x'+rupiah(item.harga),'Rp '+rupiah((item.harga||0)*item.qty),W)+'\n'; });
  s+=line+'\n'+pad('Subtotal:','Rp '+rupiah(subtotal),W)+'\n';
  if(diskon>0) s+=pad('Diskon:','- Rp '+rupiah(diskon),W)+'\n';
  s+=dline+'\n'+pad('TOTAL:','Rp '+rupiah(totalAkhir),W)+'\n'+dline+'\n';
  s+=pad(metode+':','Rp '+rupiah(bayar),W)+'\n';
  if(metode==='Tunai') s+=pad('Kembali:','Rp '+rupiah(kembalian),W)+'\n';
  s+=line+'\n'+center(pengaturan.footer1,W)+'\n'+center(pengaturan.footer2,W)+'\n';
  return `<pre style="font-family:'Courier New',monospace;font-size:12px;line-height:1.5;color:#000;white-space:pre;">${s}</pre>`;
}

/* ── KIRIM WA ── */
function kirimWA(waNum,{noTrx,tanggal,waktu,kasir,metode,items,subtotal,diskon,totalAkhir,bayar,kembalian}){
  let msg=`*${pengaturan.namaToko}*\n${pengaturan.alamat}\nTelp: ${pengaturan.telepon}\n`;
  msg+=`${'─'.repeat(28)}\n`;
  msg+=`No: ${noTrx}\nTanggal: ${tanggal}\nWaktu: ${waktu}\nKasir: ${kasir}\n`;
  msg+=`${'─'.repeat(28)}\n`;
  items.forEach(i=>{ msg+=`${i.nama}\n  ${i.qty}x${rupiah(i.harga)} = Rp ${rupiah(i.harga*i.qty)}\n`; });
  msg+=`${'─'.repeat(28)}\n`;
  msg+=`Subtotal: Rp ${rupiah(subtotal)}\n`;
  if(diskon>0) msg+=`Diskon: -Rp ${rupiah(diskon)}\n`;
  msg+=`*TOTAL: Rp ${rupiah(totalAkhir)}*\n`;
  msg+=`${metode}: Rp ${rupiah(bayar)}\n`;
  if(metode==='Tunai') msg+=`Kembali: Rp ${rupiah(kembalian)}\n`;
  msg+=`${'─'.repeat(28)}\n${pengaturan.footer2}`;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,'_blank');
}

/* ── CETAK ── */
function cetakStruklangsung(){
  const html=document.getElementById('receipt').innerHTML; if(!html){showToast('Tidak ada struk','error');return;}
  const pa=document.getElementById('printArea'); pa.innerHTML=html; pa.style.display='block';
  setTimeout(()=>{ window.print(); pa.style.display='none'; },300);
}
function cetakUlang(i){
  const item=riwayat[i]; if(!item) return;
  const items=item.items?.length?item.items:[{nama:item.detail||'-',qty:1,harga:item.total}];
  const html=buildStruk({noTrx:item.noTrx||'-',tanggal:item.tanggal||item.waktu,waktu:item.waktu,kasir:item.kasir||'Admin',metode:item.metode||'Tunai',items,subtotal:item.subtotal||item.total,diskon:item.diskon||0,totalAkhir:item.total,bayar:item.bayar||item.total,kembalian:item.kembalian||0},true);
  const pa=document.getElementById('printArea'); pa.innerHTML=html; pa.style.display='block';
  setTimeout(()=>{ window.print(); pa.style.display='none'; },300);
}

/* ── LAPORAN & RIWAYAT ── */
window.renderLaporan=function(){
  const list=document.getElementById('laporanList');
  const from=document.getElementById('filterLaporanDari')?.value||'';
  const to=document.getElementById('filterLaporanSampai')?.value||'';
  let data=[...laporan].reverse();
  if(from){ const f=new Date(from); data=data.filter(item=>{ const [d,m,y]=item.tanggal.split('/'); return new Date(`${y}-${m}-${d}`)>=f; }); }
  if(to){ const t=new Date(to); data=data.filter(item=>{ const [d,m,y]=item.tanggal.split('/'); return new Date(`${y}-${m}-${d}`)<=t; }); }
  if(!data.length){ list.innerHTML=`<tr><td colspan="5"><div class="empty-state"><div class="icon">📊</div>Belum ada laporan</div></td></tr>`; return; }
  list.innerHTML=data.map(item=>`<tr><td style="font-size:12px">${item.tanggal}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--green)">Rp ${rupiah(item.total)}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold)">Rp ${rupiah(item.laba||0)}</td><td style="font-weight:700">${item.transaksi}</td><td style="font-size:12px;color:var(--text2)">${item.terlaris||'-'}</td></tr>`).join('');
};

function renderRiwayat(){
  const list=document.getElementById('riwayatList');
  const filterMetode=document.getElementById('filterRiwayatMetode')?.value||'';
  const filterCari=document.getElementById('filterRiwayatCari')?.value.toLowerCase()||'';
  let data=[...riwayat];
  if(filterMetode) data=data.filter(i=>i.metode===filterMetode);
  if(filterCari) data=data.filter(i=>(i.detail||'').toLowerCase().includes(filterCari)||(i.noTrx||'').toLowerCase().includes(filterCari));
  if(!data.length){ list.innerHTML=`<tr><td colspan="5"><div class="empty-state"><div class="icon">🧾</div>Belum ada riwayat</div></td></tr>`; return; }
  list.innerHTML=data.map(item=>`<tr><td style="font-size:11px;color:var(--text2)">${item.waktu}</td><td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold)">Rp ${rupiah(item.total)}</td><td><span class="badge badge-metode-${item.metode||'Tunai'}">${item.metode||'Tunai'}</span></td><td style="font-size:11px;color:var(--text2);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.detail||'-'}</td><td><button class="btn btn-ghost btn-xs" onclick="cetakUlang(${riwayat.indexOf(item)})">🖨</button></td></tr>`).join('');
}

/* ── RESET ── */
function resetLaporan(){ Swal.fire({title:'Reset semua laporan?',icon:'warning',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Ya, Reset',confirmButtonColor:'#ef4444',cancelButtonText:'Batal'}).then(r=>{ if(r.isConfirmed){ laporan=[];statistikProduk={};window.renderLaporan();window.updateDashboard();simpanData();showToast('Laporan direset','success'); } }); }
function resetRiwayat(){ Swal.fire({title:'Reset semua riwayat?',icon:'warning',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Ya, Reset',confirmButtonColor:'#ef4444',cancelButtonText:'Batal'}).then(r=>{ if(r.isConfirmed){ riwayat=[];renderRiwayat();simpanData();showToast('Riwayat direset','success'); } }); }

/* ── EXPORT ── */
function exportLaporanTxt(){ if(!laporan.length){showToast('Belum ada laporan','error');return;} let t=`LAPORAN HARIAN ${pengaturan.namaToko}\n${'='.repeat(36)}\n\n`; laporan.forEach(item=>{t+=`Tanggal   : ${item.tanggal}\nOmzet     : Rp ${rupiah(item.total)}\nLaba      : Rp ${rupiah(item.laba||0)}\nTransaksi : ${item.transaksi}\nTerlaris  : ${item.terlaris||'-'}\n${'-'.repeat(36)}\n`;}); unduh(t,`laporan_dityaMotor88_${tanggalNama()}.txt`,'text/plain'); }
function exportLaporanCsv(){ if(!laporan.length){showToast('Belum ada laporan','error');return;} let c='Tanggal,Omzet,Laba,Transaksi,Produk Terlaris\n'; laporan.forEach(item=>{c+=`${item.tanggal},${item.total},${item.laba||0},${item.transaksi},"${item.terlaris||'-'}"\n`;}); unduh(c,`laporan_dityaMotor88_${tanggalNama()}.csv`,'text/csv'); }
function exportExcel(){
  if(!laporan.length&&!riwayat.length){showToast('Belum ada data','error');return;}
  if(typeof XLSX==='undefined'){showToast('Library Excel belum dimuat','error');return;}
  const wb=XLSX.utils.book_new();
  const ld=[['Tanggal','Omzet','Laba','Transaksi','Produk Terlaris']]; laporan.forEach(item=>ld.push([item.tanggal,item.total,item.laba||0,item.transaksi,item.terlaris||'-']));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ld),'Laporan Harian');
  const rd=[['No Transaksi','Waktu','Total','Metode','Kasir','Diskon','Item']]; riwayat.forEach(r=>rd.push([r.noTrx||'-',r.waktu,r.total,r.metode||'-',r.kasir||'-',r.diskon||0,r.detail||'-']));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rd),'Riwayat Transaksi');
  const pd=[['Nama','Kategori','Harga Modal','Harga Jual','Stok','Min. Stok']]; produk.forEach(p=>pd.push([p.nama,p.kategori||'-',p.hargaModal||0,p.harga,p.stok,p.stokMin||3]));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(pd),'Produk');
  const hd=[['Nama','Jumlah','Tanggal','Status','Keterangan']]; hutang.forEach(h=>hd.push([h.nama,h.jumlah,h.tanggal,h.status,h.ket||'-']));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(hd),'Hutang Pelanggan');
  XLSX.writeFile(wb,`dityaMotor88_${tanggalNama()}.xlsx`);
  showToast('✅ Excel berhasil diekspor!','success');
}
function backupData(){ unduh(JSON.stringify({produk,laporan,riwayat,statistikProduk,pengaturan,hutang,stokLog,kasirList},null,2),`backup_dityaMotor88_${tanggalNama()}.json`,'application/json'); }
function restoreBackup(event){
  const file=event.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      Swal.fire({title:'Restore backup?',text:'Akan mengganti semua data saat ini.',icon:'warning',background:'#171b24',color:'#e8eaf0',showCancelButton:true,confirmButtonText:'Ya, Restore',confirmButtonColor:'#f5c542',cancelButtonText:'Batal'
      }).then(r=>{ if(r.isConfirmed){
        if(data.produk) produk=data.produk; if(data.laporan) laporan=data.laporan;
        if(data.riwayat) riwayat=data.riwayat; if(data.statistikProduk) statistikProduk=data.statistikProduk;
        if(data.pengaturan){pengaturan=data.pengaturan;window.terapkanPengaturan();}
        if(data.hutang) hutang=data.hutang; if(data.stokLog) stokLog=data.stokLog;
        if(data.kasirList) kasirList=data.kasirList;
        simpanData(); window.renderProduk(); renderCart(); window.renderLaporan(); renderRiwayat(); window.updateDashboard();
        showToast('Backup berhasil direstore ✓','success');
      }});
    }catch{showToast('File tidak valid','error');}
  };
  reader.readAsText(file); event.target.value='';
}
function unduh(konten,namaFile,tipe){ const blob=new Blob([konten],{type:tipe}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=namaFile; link.click(); }

/* ── MODAL ── */
function tutupModal(id){ document.getElementById(id).classList.remove('active'); }
window.onclick=e=>{ ['modalPengaturan','editProdukModal','modalSheets','modalHutang'].forEach(id=>{ const el=document.getElementById(id); if(e.target===el) el.classList.remove('active'); }); };

/* ── GOOGLE SHEETS ── */
function bukaModalSheets(){ document.getElementById('sheetsUrl').value=sheetsUrl; document.getElementById('sheetsTestStatus').className='sync-status'; document.getElementById('sheetsTestStatus').style.display='none'; document.getElementById('modalSheets').classList.add('active'); }
function simpanSheetsUrl(){ const url=document.getElementById('sheetsUrl').value.trim(); if(url&&!url.startsWith('https://script.google.com')){showToast('URL tidak valid!','error');return;} sheetsUrl=url; localStorage.setItem(DB_KEY.sheets,sheetsUrl); tutupModal('modalSheets'); showToast(sheetsUrl?'✅ URL tersimpan!':'URL dikosongkan','success'); }
function kirimGET(payload){ return new Promise((res,rej)=>{ const url=sheetsUrl+'?data='+encodeURIComponent(JSON.stringify(payload)); const t=setTimeout(()=>res({status:'ok'}),8000); fetch(url,{method:'GET',mode:'no-cors'}).then(()=>{clearTimeout(t);res({status:'ok'});}).catch(err=>{clearTimeout(t);rej(err);}); }); }
async function tesKoneksi(){ const url=document.getElementById('sheetsUrl').value.trim(); if(!url){showToast('Masukkan URL dulu','error');return;} const st=document.getElementById('sheetsTestStatus'); st.className='sync-status loading'; st.innerText='⏳ Mencoba koneksi...'; st.style.display='block'; const saved=sheetsUrl; sheetsUrl=url; try{await kirimGET({action:'ping',toko:pengaturan.namaToko}); st.className='sync-status success'; st.innerText='✅ Koneksi berhasil!';}catch(e){st.className='sync-status error'; st.innerText='❌ Gagal: '+e.message; sheetsUrl=saved;} }
async function kirimKeSheets(){ if(!sheetsUrl){bukaModalSheets();return;} if(!lastTrxData){showToast('Tidak ada data transaksi','error');return;} const st=document.getElementById('syncStatus'),btn=document.getElementById('btnKirimSheets'); st.className='sync-status loading'; st.innerText='⏳ Mengirim...'; st.style.display='block'; btn.disabled=true; try{await kirimGET(lastTrxData); st.className='sync-status success'; st.innerText='✅ Berhasil dikirim!'; btn.innerText='✅ Sudah Terkirim';}catch(e){st.className='sync-status error'; st.innerText='❌ Gagal: '+e.message; btn.disabled=false;} }
async function kirimLaporanKeSheets(){ if(!sheetsUrl){bukaModalSheets();return;} if(!laporan.length){showToast('Belum ada laporan','error');return;} showToast('⏳ Mengirim laporan...','info'); try{await kirimGET({action:'laporan',laporan,toko:pengaturan.namaToko}); showToast('✅ Laporan terkirim!','success');}catch(e){showToast('❌ Gagal: '+e.message,'error');} }

/* ── PWA ── */
let deferredPrompt=null;
function initPWA(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; const b=document.getElementById('pwaInstallBanner'); if(b) b.classList.add('show'); });
  window.addEventListener('appinstalled',()=>{ const b=document.getElementById('pwaInstallBanner'); if(b) b.classList.remove('show'); deferredPrompt=null; showToast('✅ App berhasil diinstall!','success'); });
}
function installPWA(){ if(!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt.userChoice.then(()=>{deferredPrompt=null;}); }
function dismissPWA(){ const b=document.getElementById('pwaInstallBanner'); if(b) b.classList.remove('show'); }

/* ── KEYBOARD SHORTCUTS ── */
function initShortcuts(){
  document.addEventListener('keydown',e=>{
    if(sessionStorage.getItem('dm88_unlocked')!=='1') return;
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA') return;
    if(e.key==='F2') document.getElementById('searchProduk')?.focus();
    if(e.key==='F4') checkout();
    if(e.key==='F6') cetakStruklangsung();
    if(e.key==='Escape'){ ['modalPengaturan','editProdukModal','modalSheets','modalHutang'].forEach(id=>tutupModal(id)); }
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',()=>{
  initLogin(); initPWA(); initShortcuts();
  window.terapkanPengaturan();
  window.renderProduk(); renderCart(); window.renderLaporan(); renderRiwayat(); window.updateDashboard();
  // Sync kasir dropdown
  const sel=document.getElementById('namaKasir');
  if(sel){ sel.innerHTML=kasirList.map(k=>`<option value="${k}">${k}</option>`).join(''); }
});
