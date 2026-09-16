
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const TYPE_LABELS = {
  preventiva: 'Manutenção Preventiva',
  corretiva: 'Manutenção Corretiva',
  visita: 'Visita Técnica'
};

const preventiveGroups = [
  {title:'Movimento de elevação', items:[
    'Gancho: verificar gancho, polias, desgastes, funcionamento e lubrificação, quando necessária.',
    'Cabo de aço: verificar desgaste, dobras, ruptura de arames/cordões, oxidação, fixação e deformações.',
    'Tambor: verificar ranhuras, fixação do cabo, guia do cabo e mola.',
    'Ventilador: verificar fixação, integridade e folga no eixo.',
    'Freio: verificar estado e suavidade de funcionamento dos componentes mecânicos.',
    'Motor: verificar fiação, conexões e isolamento, quando aplicável.',
    'Redutor: realizar verificação auditiva e visual.',
    'Redutor: verificar nível e condição do óleo ou graxa.'
  ]},
  {title:'Direção do carro', items:[
    'Ventilador: verificar fixação e folga no eixo.',
    'Freio: verificar estado e suavidade de funcionamento dos componentes mecânicos.',
    'Disco de freio: verificar estado e espessura.',
    'Motor: verificar fiação, conexões e isolamento, quando aplicável.',
    'Redutor: realizar verificação auditiva e visual.',
    'Roda livre: verificar desgaste.',
    'Roda motriz/acionada: verificar desgaste.'
  ]},
  {title:'Translação da ponte – lado do barramento', items:[
    'Ventilador: verificar fixação e folga no eixo.',
    'Freio: verificar estado e suavidade de funcionamento dos componentes mecânicos.',
    'Disco de freio: verificar estado e espessura.',
    'Motor: verificar fiação, conexões e isolamento, quando aplicável.',
    'Redutor: realizar verificação auditiva e visual.',
    'Redutor: verificar nível e condição do óleo ou graxa.',
    'Roda livre: verificar desgaste.',
    'Roda motriz/acionada: verificar desgaste.'
  ]},
  {title:'Translação da ponte – lado oposto ao barramento', items:[
    'Ventilador: verificar fixação e folga no eixo.',
    'Freio: verificar estado e suavidade de funcionamento dos componentes mecânicos.',
    'Disco de freio: verificar estado e espessura.',
    'Motor: verificar fiação, conexões e isolamento, quando aplicável.',
    'Redutor: realizar verificação auditiva e visual.',
    'Redutor: verificar nível e condição do óleo ou graxa.',
    'Roda livre: verificar desgaste.',
    'Roda motriz/acionada: verificar desgaste.'
  ]},
  {title:'Dispositivos de segurança', items:[
    'Limitador de carga.','Fim de curso de segurança da elevação.','Fim de curso da elevação.',
    'Fim de curso da direção.','Fim de curso de translação da ponte.',
    'Sensor anticolisão da translação da ponte.','Aviso luminoso.','Aviso sonoro.',
    'Trava de segurança.','Batente mecânico da direção.','Batente mecânico da ponte.','Batente mecânico do festoon.'
  ]},
  {title:'Acessos e sinalização', items:[
    'Acesso à ponte.','Escada marinheiro do pórtico, quando aplicável.','Passadiço da ponte.',
    'Linha de vida.','Indicação da capacidade nominal do equipamento.'
  ]},
  {title:'Aparelhagem elétrica e comandos', items:[
    'Botoeira: verificar funcionamento de todos os movimentos.',
    'Botoeira: verificar estado da carcaça, tampa e setas de orientação.',
    'Quadro elétrico: verificar condição geral, fixações e componentes.',
    'Instalação elétrica: verificar cabos, conexões, prensa-cabos e integridade geral.',
    'Rádio controle: verificar funcionamento de todos os movimentos, quando aplicável.',
    'Rádio controle: verificar estado da carcaça, tampa e identificações.'
  ]},
  {title:'Estrutura', items:[
    'Verificar fixação das vigas nas cabeceiras.','Verificar trilho da direção do carro.',
    'Verificar caminho de rolamento da ponte.','Realizar inspeção visual das soldas principais.',
    'Verificar suspensão e fixação da talha.'
  ]},
  {title:'Abastecimento de força', items:[
    'Verificar estado do suporte arrastador.','Verificar estado dos perfis.','Verificar estado dos troles.',
    'Verificar estado dos cabos do festoon.','Verificar estado dos barramentos – inspeção visual.',
    'Verificar coletor do barramento.','Verificar juntas de dilatação.','Verificar suportes.',
    'Verificar alinhamento – inspeção visual.'
  ]},
  {title:'Testes funcionais', items:[
    'Movimentos de elevação / descida.','Translação do carro / equipamento.','Freios e fins de curso.',
    'Comandos / botoeira / rádio controle.','Ruídos, vibrações e aquecimento anormal.',
    'Teste operacional sem carga / com carga, quando aplicável.'
  ]}
];

const correctiveGroups = [
  {title:'Atividades executadas', items:[
    'Inspeção inicial e confirmação do defeito informado.',
    'Diagnóstico da falha.',
    'Execução do reparo / ajuste.',
    'Teste funcional após o serviço.'
  ]}
];

const visitGroups = [
  {title:'Levantamentos realizados', items:[
    'Inspeção visual do equipamento.',
    'Levantamento das condições operacionais.',
    'Registro das necessidades informadas pelo cliente.',
    'Definição de recomendações / próximos passos.'
  ]}
];

let current = null;
let photos = [];

const REGISTRY_KEY='matekservice_registry_v1';

function loadRegistry(){
  try{
    const data=JSON.parse(localStorage.getItem(REGISTRY_KEY)||'{"clients":[]}');
    if(!Array.isArray(data.clients)) data.clients=[];
    data.clients.forEach(c=>{ if(!Array.isArray(c.equipments)) c.equipments=[]; });
    return data;
  }catch(e){ return {clients:[]}; }
}
function saveRegistry(data){
  localStorage.setItem(REGISTRY_KEY,JSON.stringify(data));
}
function registryUid(prefix='R'){return prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,6)}
function getRegistryClient(id){return loadRegistry().clients.find(c=>c.id===id)}
function normalize(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}



function autoReportPrefix(name){
  const clean=String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').trim();
  const first=(clean.split(/\s+/)[0]||'CLI').replace(/[^A-Z0-9]/g,'');
  return (first.slice(0,3)||'CLI').padEnd(3,'X');
}
function ensureAutomaticReportNumber(){
  if(!current || current.fields?.os) return current?.fields?.os||'';
  const clientId=current.registryClientId||selectedRegistryClientId;
  if(!clientId) return '';
  const reg=loadRegistry();
  const c=reg.clients.find(x=>x.id===clientId);
  if(!c) return '';
  c.reportPrefix=c.reportPrefix||autoReportPrefix(c.name);
  const prefix=c.reportPrefix;
  const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  let max=Number(c.reportSequence||0);
  const re=new RegExp('^'+prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'-(\\d+)$');
  for(const s of all){
    if((s.registryClientId||'')!==clientId) continue;
    const m=String(s.fields?.os||'').match(re);
    if(m) max=Math.max(max,Number(m[1])||0);
  }
  const next=max+1;
  c.reportSequence=next;
  current.fields.os=`${prefix}-${String(next).padStart(4,'0')}`;
  saveRegistry(reg);
  const osInput=document.querySelector('[name="os"]');
  if(osInput) osInput.value=current.fields.os;
  return current.fields.os;
}

function upsertCurrentIntoRegistry(){
  if(!current) return;
  const f=current.fields||{};
  const clientName=(f.cliente||'').trim();
  if(!clientName) return;

  const reg=loadRegistry();
  let c=reg.clients.find(x=>x.id===selectedRegistryClientId) ||
        reg.clients.find(x=>normalize(x.name)===normalize(clientName));

  if(!c){
    c={id:registryUid('C'),name:clientName,contact:'',phone:'',sector:'',reportRecipient:'',reportRole:'',reportEmail:'',notes:'',equipments:[]};
    reg.clients.push(c);
  }

  c.name=clientName;
  c.contact=f.contato||c.contact||'';
  c.phone=f.telefoneEmail||c.phone||'';
  c.sector=f.setor||c.sector||'';
  c.reportRecipient=f.relatorioResponsavel||c.reportRecipient||'';
  c.reportRole=f.relatorioCargo||c.reportRole||'';
  c.reportEmail=f.relatorioEmail||c.reportEmail||'';

  selectedRegistryClientId=c.id;
  current.registryClientId=c.id;

  const eqName=(f.equipamento||'').trim();
  const tag=(f.tag||'').trim();
  if(eqName||tag){
    let e=c.equipments.find(x=>x.id===selectedRegistryEquipmentId) ||
          c.equipments.find(x=>(tag&&normalize(x.tag)===normalize(tag)) ||
            (!tag&&eqName&&normalize(x.name)===normalize(eqName)));
    if(!e){
      e={id:registryUid('E'),name:'',tag:'',manufacturer:'',model:'',capacity:'',location:''};
      c.equipments.push(e);
    }
    Object.assign(e,{
      name:eqName||e.name||'',
      tag:tag||e.tag||'',
      manufacturer:f.fabricante||e.manufacturer||'',
      model:f.modelo||e.model||'',
      capacity:f.capacidade||e.capacity||'',
      location:f.localInstalacao||e.location||''
    });
    selectedRegistryEquipmentId=e.id;
    current.registryEquipmentId=e.id;
  }

  saveRegistry(reg);
}

function repairAndImportRegistry(){
  const reg=loadRegistry();
  const merged=[];
  // 1) Une cadastros duplicados pelo nome, preservando equipamentos.
  for(const c of reg.clients){
    const key=normalize(c.name);
    let target=merged.find(x=>normalize(x.name)===key && key);
    if(!target){ target={...c,equipments:[...(c.equipments||[])]}; merged.push(target); continue; }
    target.contact=target.contact||c.contact||'';
    target.phone=target.phone||c.phone||'';
    target.sector=target.sector||c.sector||'';
    target.notes=target.notes||c.notes||'';
    for(const e of (c.equipments||[])){
      const ek=normalize(e.tag)||normalize([e.name,e.model,e.location].join('|'));
      if(!target.equipments.some(x=>(normalize(x.tag)||normalize([x.name,x.model,x.location].join('|')))===ek)){
        target.equipments.push(e);
      }
    }
  }
  reg.clients=merged;

  // 2) Importa automaticamente clientes/equipamentos já existentes nos atendimentos salvos.
  const services=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  for(const s of services){
    const f=s.fields||{}, clientName=(f.cliente||'').trim();
    if(!clientName) continue;
    let c=reg.clients.find(x=>normalize(x.name)===normalize(clientName));
    if(!c){
      c={id:registryUid('C'),name:clientName,contact:f.contato||'',phone:f.telefoneEmail||'',sector:f.setor||'',notes:'',equipments:[]};
      reg.clients.push(c);
    }else{
      c.contact=c.contact||f.contato||'';
      c.phone=c.phone||f.telefoneEmail||'';
      c.sector=c.sector||f.setor||'';
    }
    const eqName=(f.equipamento||'').trim(), tag=(f.tag||'').trim();
    if(eqName||tag){
      let e=c.equipments.find(x=>(tag&&normalize(x.tag)===normalize(tag)) || (!tag&&normalize(x.name)===normalize(eqName)));
      if(!e){
        e={id:registryUid('E'),name:eqName,tag,manufacturer:f.fabricante||'',model:f.modelo||'',capacity:f.capacidade||'',location:f.localInstalacao||''};
        c.equipments.push(e);
      }
    }
    // Vincula o atendimento ao cadastro importado para o histórico futuro.
    if(!s.registryClientId) s.registryClientId=c.id;
    if(!s.registryEquipmentId && (eqName||tag)){
      const e=c.equipments.find(x=>(tag&&normalize(x.tag)===normalize(tag)) || (!tag&&normalize(x.name)===normalize(eqName)));
      if(e) s.registryEquipmentId=e.id;
    }
  }
  saveRegistry(reg);
  localStorage.setItem('matekservice_services',JSON.stringify(services));
}

let selectedRegistryClientId='';
let selectedRegistryEquipmentId='';

function uid(){ return 'MS-' + Date.now() + '-' + Math.random().toString(36).slice(2,7); }

function cloneGroups(source){
  return source.map(g => ({
    id: uid(), title:g.title, visible:true, standard:true,
    items:g.items.map(t => ({id:uid(), text:t, visible:true, status:'', obs:'', itemPhotos:[], standard:true}))
  }));
}

function newService(type, clientId='', equipmentId=''){
  current = {
    id:uid(), type, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    fields:{ data:new Date().toISOString().slice(0,10), tecnico:'Mauricio Ribeiro' },
    groups: cloneGroups(type==='preventiva'?preventiveGroups:type==='corretiva'?correctiveGroups:visitGroups)
  };
  photos=[];
  selectedRegistryClientId=clientId||'';
  selectedRegistryEquipmentId=equipmentId||'';

  if(clientId){
    const c=getRegistryClient(clientId);
    if(c){
      Object.assign(current.fields,{
        cliente:c.name||'',
        contato:c.contact||'',
        telefoneEmail:c.phone||'',
        setor:c.sector||'',
        relatorioResponsavel:c.reportRecipient||'',
        relatorioCargo:c.reportRole||'',
        relatorioEmail:c.reportEmail||''
      });
      current.registryClientId=c.id;
      if(equipmentId){
        const e=(c.equipments||[]).find(x=>x.id===equipmentId);
        if(e){
          Object.assign(current.fields,{
            equipamento:e.name||'',
            tag:e.tag||'',
            fabricante:e.manufacturer||'',
            modelo:e.model||'',
            capacidade:e.capacity||'',
            localInstalacao:e.location||''
          });
          current.registryEquipmentId=e.id;
        }
      }
    }
  }
  openForm();
}

function openForm(){
  current.signatures=current.signatures||{technician:'',client:''};
  $('#homeScreen').classList.remove('active');
  $('#registryScreen')?.classList.remove('active');
  $('#reportScreen').classList.remove('active');
  $('#formScreen').classList.add('active');
  $('#formTitle').textContent = TYPE_LABELS[current.type];
  buildSpecificFields();
  populateForm();
  renderGroups();
  renderPhotos();
  renderFormRegistrySelectors();
  $('#statusBadge').textContent='Rascunho';
  window.scrollTo(0,0);
}

function buildSpecificFields(){
  const host = $('#specificFields');
  const ac=current.actionContext;
  const actionOriginHtml=ac?`<div class="card action-origin-context"><div class="section-header"><div><h3>Origem deste atendimento</h3><p class="muted">Atendimento iniciado a partir de uma ação pendente.</p></div><span class="action-status-badge">AÇÃO</span></div><p><b>${escapeHtml(ac.groupTitle||'Atendimento')}:</b> ${escapeHtml(ac.description||'')}</p>${ac.originObs?`<p><b>Observação de origem:</b> ${escapeHtml(ac.originObs)}</p>`:''}<p class="muted"><b>Relatório/OS de origem:</b> ${escapeHtml(ac.sourceOS||ac.sourceReference||'Registro interno')} ${ac.dueDate?' • <b>Programação:</b> '+formatDate(ac.dueDate):''}</p><div class="row gap action-origin-buttons"><button type="button" class="btn success small" id="completeLinkedActionBtn">Salvar atendimento e concluir ação</button><span class="muted">Use após executar o serviço e registrar o resultado.</span></div></div>`:'';
  if(current.type==='corretiva'){
    host.innerHTML = actionOriginHtml + `
    <div class="card">
      <h3>3. Manutenção corretiva</h3>
      <label>Defeito / solicitação informada pelo cliente<textarea name="defeitoInformado" rows="3"></textarea></label>
      <label>Diagnóstico e condição encontrada<textarea name="diagnostico" rows="4"></textarea></label>
      <label>Causa identificada<textarea name="causa" rows="3"></textarea></label>
      <label>Serviços executados<textarea name="servicosExecutados" rows="4"></textarea></label>
      <label>Peças / materiais utilizados<textarea name="pecas" rows="3"></textarea></label>
      <label>Resultado dos testes<textarea name="resultadoTestes" rows="3"></textarea></label>
    </div>`;
  } else if(current.type==='visita'){
    host.innerHTML = actionOriginHtml + `
    <div class="card">
      <h3>3. Visita técnica</h3>
      <label>Motivo da chamada / solicitação do cliente<textarea name="motivo" rows="3"></textarea></label>
      <label>Diagnóstico e condição encontrada<textarea name="diagnostico" rows="4"></textarea></label>
      <label>Levantamentos / atividades realizadas<textarea name="levantamentos" rows="4"></textarea></label>
    </div>`;
  } else {
    host.innerHTML = actionOriginHtml + `
    <div class="card">
      <h3>3. Manutenção preventiva</h3>
      <label>Motivo / observação inicial<textarea name="motivo" rows="3" placeholder="Ex.: manutenção preventiva periódica"></textarea></label>
    </div>`;
  }
  const completeBtn=host.querySelector('#completeLinkedActionBtn');
  if(completeBtn) completeBtn.onclick=completeLinkedActionFromCurrent;
}

function populateForm(){
  const form = $('#serviceForm');
  [...form.elements].forEach(el=>{
    if(!el.name) return;
    el.value = current.fields[el.name] ?? (el.name==='tecnico'?'Mauricio Ribeiro':'');
  });
}

$('#serviceForm').addEventListener('input', e=>{
  if(e.target.name){
    current.fields[e.target.name]=e.target.value;
    current.updatedAt=new Date().toISOString();
  }
});

function renderGroups(){
  const host=$('#groups');
  host.innerHTML='';
  current.groups.forEach(group=>{
    const wrap=document.createElement('div');
    wrap.className='group';
    wrap.dataset.groupId=group.id;
    wrap.innerHTML=`
      <div class="group-header">
        <div class="group-title-row">
          <div class="group-title">${escapeHtml(group.title)}</div>
          <div class="status-legend"><b>OK:</b> Conforme <span>|</span> <b>N/A:</b> Não aplicável <span>|</span> <b>NR:</b> Necessita reparo <span>|</span> <b>CS:</b> Componente substituído</div>
        </div>
        <div class="group-controls">
          <label class="include-group"><input type="checkbox" class="group-toggle" ${group.visible?'checked':''}> Incluir este grupo no relatório</label>
          <button type="button" class="icon-btn edit-group-btn">Editar título</button>
          <button type="button" class="icon-btn add-item-btn">+ Item</button>
          ${group.standard ? '' : '<button type="button" class="icon-btn danger remove-group-btn">Remover grupo</button>'}
        </div>
      </div>
      <div class="group-items"></div>`;
    host.appendChild(wrap);
    const itemsHost=wrap.querySelector('.group-items');
    group.items.forEach(item=>itemsHost.appendChild(itemRow(item,group)));
  });
}

function itemRow(item, group){
  const row=document.createElement('div');
  row.className='item-row'+(item.visible?'':' hidden-item');
  row.dataset.itemId=item.id;
  row.innerHTML=`
    <textarea class="item-desc" rows="2">${escapeHtml(item.text)}</textarea>
    ${['OK','N/A','NR','CS'].map(s=>`<div class="status-cell"><label>${s}</label><input type="radio" name="st-${item.id}" value="${s}" ${item.status===s?'checked':''}></div>`).join('')}
    <textarea class="obs" rows="2" placeholder="Observação">${escapeHtml(item.obs||'')}</textarea>
    <div class="item-actions">
      <button type="button" class="icon-btn photo-item-btn ${item.status==='NR' && !(item.itemPhotos||[]).length ? 'photo-suggest' : ''}">📷 Foto${(item.itemPhotos||[]).length ? ' ('+(item.itemPhotos||[]).length+')' : ''}</button>
      <button type="button" class="icon-btn toggle-item-btn">${item.visible?'Não incluir':'Incluir'}</button>
      ${item.standard ? '' : '<button type="button" class="icon-btn danger remove-item-btn">Excluir</button>'}
    </div>
    ${(item.itemPhotos||[]).length ? `<div class="item-photo-strip">${(item.itemPhotos||[]).map((p,k)=>`<div class="item-photo-thumb"><img src="${p.dataUrl}"><button type="button" class="remove-item-photo" data-photo-index="${k}">×</button></div>`).join('')}</div>` : ''}`;
  return row;
}

$('#groups').addEventListener('input', e=>{
  const groupEl=e.target.closest('.group'); if(!groupEl) return;
  const group=current.groups.find(g=>g.id===groupEl.dataset.groupId); if(!group) return;
  const row=e.target.closest('.item-row');
  if(row){
    const item=group.items.find(i=>i.id===row.dataset.itemId);
    if(e.target.classList.contains('item-desc')) item.text=e.target.value;
    if(e.target.classList.contains('obs')) item.obs=e.target.value;
    if(e.target.type==='radio'){ item.status=e.target.value; setTimeout(renderGroups,0); }
  }
});

$('#groups').addEventListener('change', e=>{
  if(e.target.classList.contains('group-toggle')){
    const groupEl=e.target.closest('.group');
    const group=current.groups.find(g=>g.id===groupEl.dataset.groupId);
    group.visible=e.target.checked;
  }
});

$('#groups').addEventListener('click', e=>{
  const groupEl=e.target.closest('.group'); if(!groupEl) return;
  const group=current.groups.find(g=>g.id===groupEl.dataset.groupId);
  const row=e.target.closest('.item-row');
  const item=row ? group.items.find(i=>i.id===row.dataset.itemId) : null;

  if(item && e.target.classList.contains('photo-item-btn')){
    chooseItemPhoto(item);
    return;
  }
  if(item && e.target.classList.contains('remove-item-photo')){
    const idx=Number(e.target.dataset.photoIndex);
    item.itemPhotos=(item.itemPhotos||[]).filter((_,i)=>i!==idx);
    renderGroups();
    return;
  }
  if(e.target.classList.contains('edit-group-btn')){
    const novo = prompt('Título do grupo:', group.title);
    if(novo !== null && novo.trim()){
      group.title = novo.trim();
      renderGroups();
    }
  }
  if(e.target.classList.contains('add-item-btn')){
    group.items.push({id:uid(),text:'Nova atividade',visible:true,status:'',obs:'',itemPhotos:[],standard:false}); renderGroups();
  }
  if(e.target.classList.contains('remove-group-btn')){
    if(confirm('Remover este grupo somente deste atendimento?')){
      current.groups=current.groups.filter(g=>g.id!==group.id); renderGroups();
    }
  }
  if(item && e.target.classList.contains('toggle-item-btn')){
    item.visible=!item.visible; renderGroups();
  }
  if(item && e.target.classList.contains('remove-item-btn')){
    if(confirm('Excluir este item somente deste atendimento?')){
      group.items=group.items.filter(i=>i.id!==item.id); renderGroups();
    }
  }
});

$('#addGroupBtn').onclick=()=>{ current.groups.push({id:uid(),title:'Novo grupo',visible:true,standard:false,items:[]}); renderGroups(); };
$('#selectAllBtn').onclick=()=>{ current.groups.forEach(g=>{g.visible=true;g.items.forEach(i=>i.visible=true)}); renderGroups(); };

$$('.type-btn').forEach(btn=>btn.onclick=()=>newService(btn.dataset.type));
$('#backHome').onclick=()=>{ showHome(); };
$('#backForm').onclick=()=>openForm();


const ACTIONS_KEY='matekservice_actions_v1';
function loadActions(){ try{return JSON.parse(localStorage.getItem(ACTIONS_KEY)||'[]')}catch(e){return []} }
function saveActions(a){ localStorage.setItem(ACTIONS_KEY,JSON.stringify(a)); }

function syncActionsFromCurrent(){
  if(!current) return;
  let actions=loadActions();
  const clientId=selectedRegistryClientId||current.registryClientId||'';
  const equipmentId=selectedRegistryEquipmentId||current.registryEquipmentId||'';
  const client=current.fields?.cliente||'Cliente não informado';
  const equipment=(current.fields?.tag?current.fields.tag+' — ':'')+(current.fields?.equipamento||'Equipamento não informado');
  current.groups.filter(g=>g.visible).forEach(g=>g.items.filter(i=>i.visible && i.status==='NR').forEach(i=>{
    const key=current.id+'::'+i.id;
    let a=actions.find(x=>x.sourceKey===key);
    if(!a){
      a={id:uid(),sourceKey:key,serviceId:current.id,itemId:i.id,groupTitle:g.title,clientId,equipmentId,
         client,equipment,os:current.fields?.os||'',sourceReference:(current.fields?.os||('REG-'+String(current.id).slice(-6).toUpperCase())),sourceDate:current.fields?.data||'',
         description:i.text||'Item necessita reparo',originObs:i.obs||'',priority:'Média',status:'Pendente',
         dueDate:'',responsible:'',notes:'',executionServiceId:'',executionDate:'',executionNotes:'',completionEvidence:'',createdAt:new Date().toISOString(),completedAt:''};
      actions.unshift(a);
    }else{
      a.groupTitle=g.title; a.client=client; a.equipment=equipment; a.os=current.fields?.os||''; a.sourceReference=current.fields?.os||a.sourceReference||('REG-'+String(current.id).slice(-6).toUpperCase());
      a.sourceDate=current.fields?.data||''; a.description=i.text||a.description; a.originObs=i.obs||'';
      a.clientId=clientId; a.equipmentId=equipmentId;
    }
  }));
  saveActions(actions);
}

function renderActionCenter(){
  let old=document.querySelector('#actionCenterCard'); if(old) old.remove();
  const savedCard=document.querySelector('#savedList')?.closest('.card');
  if(!savedCard) return;
  const actions=loadActions();
  const active=actions.filter(a=>!['Concluída','Cancelada'].includes(a.status));
  const overdue=active.filter(a=>a.dueDate && a.dueDate < new Date().toISOString().slice(0,10));
  const card=document.createElement('div');
  card.id='actionCenterCard'; card.className='card action-center-card';
  card.innerHTML=`<div class="section-header"><div><h2>Ações pendentes e programação</h2>
    <p class="muted">Ações originadas nos relatórios e itens NR dos atendimentos.</p></div>
    <button type="button" id="openActionsBtn" class="btn primary small">Abrir plano de ações</button></div>
    <div class="action-summary">
      <div><strong>${active.length}</strong><span>Em aberto</span></div>
      <div><strong>${actions.filter(a=>a.status==='Programada').length}</strong><span>Programadas</span></div>
      <div><strong>${overdue.length}</strong><span>Vencidas</span></div>
      <div><strong>${actions.filter(a=>a.status==='Concluída').length}</strong><span>Concluídas</span></div>
    </div>`;
  savedCard.parentNode.insertBefore(card,savedCard);
  card.querySelector('#openActionsBtn').onclick=showActionManager;
}

function showActionManager(focusActionId=''){
  const actions=loadActions();
  const overlay=document.createElement('div'); overlay.className='equipment-card-overlay action-manager-overlay';
  const order={Pendente:1,Programada:2,'Em execução':3,Concluída:4,Cancelada:5};
  actions.sort((a,b)=>(order[a.status]||9)-(order[b.status]||9)||String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
  const clients=[...new Set(actions.map(a=>a.client).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  overlay.innerHTML=`<div class="equipment-card-modal action-manager-modal">
    <div class="equipment-card-top"><div><span class="eyebrow">Matekservice A1.0 Oficial</span><h2>Plano de Ações</h2>
    <span class="muted">Pendências originadas nos atendimentos técnicos, com prioridade, programação, execução e conclusão.</span></div>
    <button type="button" class="equipment-card-close">×</button></div>
    <div class="action-control-panel">
      <input id="actionSearch" placeholder="Filtrar por cliente, equipamento, ação ou responsável">
      <select id="actionClient"><option value="">Todos os clientes</option>${clients.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select>
      <select id="actionPriority"><option value="">Todas as prioridades</option>${['Crítica','Alta','Média','Baixa'].map(x=>`<option>${x}</option>`).join('')}</select>
      <select id="actionStatus"><option value="">Todos os status</option>${['Pendente','Programada','Em execução','Concluída','Cancelada'].map(x=>`<option>${x}</option>`).join('')}</select>
      <select id="actionPeriod"><option value="">Todos os prazos</option><option value="Vencidas">Vencidas</option><option value="Hoje">Hoje</option><option value="Próximos 7 dias">Próximos 7 dias</option><option value="Futuras">Futuras</option><option value="Sem data">Sem data</option></select>
    </div>
    <div class="action-filter-summary" id="actionFilterSummary"></div>
    <div class="action-list" id="actionList"></div>
  </div>`;
  document.body.appendChild(overlay);
  const close=()=>{overlay.remove();renderActionCenter();renderAgendaSummary();};
  overlay.querySelector('.equipment-card-close').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  const wire=()=>{
    overlay.querySelectorAll('.action-save').forEach(btn=>btn.onclick=()=>{
      const box=btn.closest('.action-card'); let list=loadActions(); let a=list.find(x=>x.id===box.dataset.id); if(!a)return;
      a.priority=box.querySelector('.action-priority').value; a.status=box.querySelector('.action-status').value;
      a.dueDate=box.querySelector('.action-due').value; a.responsible=box.querySelector('.action-responsible').value;
      a.notes=box.querySelector('.action-notes').value;
      if(a.status==='Concluída'&&!a.completedAt)a.completedAt=new Date().toISOString(); if(a.status!=='Concluída')a.completedAt='';
      saveActions(list); btn.textContent='Salvo ✓'; setTimeout(()=>btn.textContent='Salvar ação',1000);
    });
    overlay.querySelectorAll('.action-start-execution').forEach(btn=>btn.onclick=()=>{ overlay.remove(); chooseExecutionType(btn.dataset.action); });
    overlay.querySelectorAll('.action-complete').forEach(btn=>btn.onclick=()=>{ finalizeActionFromCard(btn.closest('.action-card')); overlay.remove(); showActionManager(); });
    overlay.querySelectorAll('.action-reset-pending').forEach(btn=>btn.onclick=()=>{
      const box=btn.closest('.action-card');
      let list=loadActions(), a=list.find(x=>x.id===box.dataset.id); if(!a)return;
      if(!confirm('Retornar esta ação de "Em execução" para "Pendente"? Use somente quando o atendimento tiver sido aberto por engano ou abandonado sem execução.')) return;
      a.status='Pendente';
      a.executionDate='';
      a.executionServiceId='';
      a.resolutionServiceId='';
      saveActions(list);
      overlay.remove(); showActionManager(a.id);
    });
    overlay.querySelectorAll('.action-open-service').forEach(btn=>btn.onclick=async()=>{
      const list=JSON.parse(localStorage.getItem('matekservice_services')||'[]'); const sv=list.find(x=>x.id===btn.dataset.service); if(!sv)return;
      overlay.remove(); current=sv; selectedRegistryClientId=sv.registryClientId||''; selectedRegistryEquipmentId=sv.registryEquipmentId||'';
      const loaded=await loadPhotosFromDB(sv.id); photos=loaded.general||[]; const itemMap=loaded.items||{};
      current.groups.forEach(g=>g.items.forEach(i=>i.itemPhotos=itemMap[i.id]||[])); openForm();
    });
  };
  const apply=()=>{
    const q=overlay.querySelector('#actionSearch').value.trim().toLowerCase(), c=overlay.querySelector('#actionClient').value;
    const p=overlay.querySelector('#actionPriority').value, st=overlay.querySelector('#actionStatus').value, per=overlay.querySelector('#actionPeriod').value;
    const filtered=actions.filter(a=>(!c||a.client===c)&&(!p||a.priority===p)&&(!st||a.status===st)&&(!per||agendaBucket(a)===per)&&(!q||[a.client,a.equipment,a.responsible,a.description,a.groupTitle,a.os].join(' ').toLowerCase().includes(q)));
    overlay.querySelector('#actionFilterSummary').innerHTML=`<b>${filtered.length}</b> ação(ões) exibida(s) • <b>${filtered.filter(a=>!['Concluída','Cancelada'].includes(a.status)).length}</b> em aberto • <b>${filtered.filter(a=>a.dueDate&&agendaDayDiff(a.dueDate)<0&&!['Concluída','Cancelada'].includes(a.status)).length}</b> vencida(s)`;
    overlay.querySelector('#actionList').innerHTML=filtered.length?filtered.map(a=>actionCardHtml(a)).join(''):'<div class="no-data">Nenhuma ação encontrada com estes filtros.</div>';
    wire();
  };
  ['#actionSearch','#actionClient','#actionPriority','#actionStatus','#actionPeriod'].forEach(sel=>{const el=overlay.querySelector(sel); el.oninput=apply; el.onchange=apply;});
  apply();
  if(focusActionId)setTimeout(()=>{const el=overlay.querySelector(`.action-card[data-id="${focusActionId}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});},100);
}
function chooseExecutionType(actionId){
  const actions=loadActions(), a=actions.find(x=>x.id===actionId); if(!a)return;
  const overlay=document.createElement('div'); overlay.className='equipment-card-overlay execution-type-overlay';
  overlay.innerHTML=`<div class="equipment-card-modal execution-type-modal">
    <div class="equipment-card-top"><div><span class="eyebrow">Matekservice A1.0 Oficial</span><h2>Iniciar atendimento da ação</h2>
    <span class="muted">Escolha o tipo de atendimento que será executado. Para reparos e itens NR, Manutenção Corretiva é a opção recomendada.</span></div>
    <button type="button" class="equipment-card-close">×</button></div>
    <div class="execution-origin-box"><b>${escapeHtml(a.client)}</b> • ${escapeHtml(a.equipment)}<br>
      <span><b>Origem:</b> ${escapeHtml(a.groupTitle||'Atendimento')} • ${escapeHtml(a.description||'')}</span>
      ${a.os?`<small>Relatório/OS de origem: ${escapeHtml(a.os)}</small>`:''}
      ${a.originObs?`<small>Observação: ${escapeHtml(a.originObs)}</small>`:''}
    </div>
    <div class="execution-type-grid">
      <button class="execution-type-btn recommended" data-type="corretiva"><b>Manutenção Corretiva</b><span>Recomendada para reparo, falha ou item NR</span></button>
      <button class="execution-type-btn" data-type="preventiva"><b>Manutenção Preventiva</b><span>Inspeção ou atividade preventiva programada</span></button>
      <button class="execution-type-btn" data-type="visita"><b>Visita Técnica</b><span>Levantamento, diagnóstico ou verificação</span></button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  const close=()=>overlay.remove();
  overlay.querySelector('.equipment-card-close').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelectorAll('.execution-type-btn').forEach(btn=>btn.onclick=()=>{const type=btn.dataset.type; close(); createExecutionFromAction(actionId,type);});
}
function createExecutionFromAction(actionId,type='corretiva'){
  const actions=loadActions(), a=actions.find(x=>x.id===actionId); if(!a)return;
  // Abrir o formulário NÃO altera a ação. O status muda para "Em execução"
  // somente quando o atendimento for efetivamente salvo.
  let clientId=a.clientId||'', equipmentId=a.equipmentId||'';
  const reg=loadRegistry();
  let c=reg.clients.find(x=>x.id===clientId) || reg.clients.find(x=>normalize(x.name)===normalize(a.client||''));
  if(c){
    clientId=c.id;
    let e=(c.equipments||[]).find(x=>x.id===equipmentId);
    if(!e){
      const eqText=normalize(a.equipment||'');
      e=(c.equipments||[]).find(x=>normalize(x.tag)===eqText || normalize(x.name)===eqText || eqText.includes(normalize(x.tag||'__SEM_TAG__')) || eqText.includes(normalize(x.name||'__SEM_NOME__')));
    }
    if(e) equipmentId=e.id;
  }
  newService(type,clientId,equipmentId);
  const executionDate=new Date().toISOString().slice(0,10);
  current.fields.data=executionDate;
  const sourceRef=a.os||a.sourceReference||('REG-'+String(a.serviceId||a.id||'').slice(-6).toUpperCase());
  const origem=`Ação originada no relatório/OS ${sourceRef}: ${a.description||''}`;
  if(type==='corretiva'){
    current.fields.defeitoInformado=origem;
    current.fields.diagnostico=a.originObs||'';
  }else if(type==='preventiva'){
    current.fields.motivo=origem+(a.originObs?`\nObservação de origem: ${a.originObs}`:'');
  }else{
    current.fields.motivo=origem;
    current.fields.diagnostico=a.originObs||'';
  }
  current.linkedActionId=a.id;
  current.registryClientId=clientId||current.registryClientId||'';
  current.registryEquipmentId=equipmentId||current.registryEquipmentId||'';
  selectedRegistryClientId=current.registryClientId||selectedRegistryClientId||'';
  selectedRegistryEquipmentId=current.registryEquipmentId||selectedRegistryEquipmentId||'';
  current.actionContext={actionId:a.id,sourceServiceId:a.serviceId||'',sourceOS:a.os||sourceRef,sourceReference:sourceRef,groupTitle:a.groupTitle||'',description:a.description||'',originObs:a.originObs||'',priority:a.priority||'',dueDate:a.dueDate||'',clientId:clientId,equipmentId:equipmentId};
  // Não gravamos executionServiceId/status aqui: se o usuário abandonar o formulário,
  // a ação permanece exatamente como estava.
  openForm(); populateForm();
}
function completeLinkedActionFromCurrent(){
  if(!current?.linkedActionId) return;
  const result=(current.fields?.resultadoTestes||current.fields?.servicosExecutados||current.fields?.levantamentos||current.fields?.recomendacoes||'').trim();
  if(!confirm('Salvar este atendimento e concluir a ação vinculada? O vínculo com o relatório de execução será mantido no histórico do equipamento.')) return;
  // Reforça o vínculo com o mesmo cliente/equipamento da ação antes de salvar.
  let preActions=loadActions(), preAction=preActions.find(x=>x.id===current.linkedActionId);
  if(preAction){
    const ac=current.actionContext||{};
    const cid=ac.clientId||preAction.clientId||current.registryClientId||'';
    const eid=ac.equipmentId||preAction.equipmentId||current.registryEquipmentId||'';
    if(cid){ selectedRegistryClientId=cid; current.registryClientId=cid; }
    if(eid){ selectedRegistryEquipmentId=eid; current.registryEquipmentId=eid; }
  }
  saveCurrent();
  let actions=loadActions(), a=actions.find(x=>x.id===current.linkedActionId); if(!a)return;
  a.status='Concluída';
  a.executionServiceId=current.id;
  a.resolutionServiceId=current.id;
  a.resolutionOS=current.fields?.os||('REG-'+String(current.id).slice(-6).toUpperCase());
  a.resolutionDate=current.fields?.data||new Date().toISOString().slice(0,10);
  a.executionNotes=result||a.executionNotes||'Atendimento de execução concluído.';
  a.completedAt=new Date().toISOString();
  saveActions(actions);
  current.actionClosedAt=a.completedAt;
  current.actionResolutionOS=a.resolutionOS;
  const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  const idx=all.findIndex(x=>x.id===current.id); if(idx>=0){all[idx]=JSON.parse(JSON.stringify(current)); localStorage.setItem('matekservice_services',JSON.stringify(all));}
  const btn=document.querySelector('#completeLinkedActionBtn'); if(btn){btn.disabled=true;btn.textContent='Ação concluída ✓';}
  alert('Ação concluída e vinculada a este atendimento. O registro permanecerá no histórico do equipamento.');
}

function finalizeActionFromCard(box){
  let actions=loadActions(), a=actions.find(x=>x.id===box.dataset.id); if(!a)return;
  a.priority=box.querySelector('.action-priority').value;
  a.dueDate=box.querySelector('.action-due').value;
  a.responsible=box.querySelector('.action-responsible').value;
  a.notes=box.querySelector('.action-notes').value;
  a.executionNotes=box.querySelector('.action-execution-notes')?.value||a.executionNotes||'';
  a.status='Concluída'; a.completedAt=new Date().toISOString(); saveActions(actions);
}
function actionCardHtml(a){
  const due=a.dueDate?formatDate(a.dueDate):'Sem prazo';
  const execLink=a.executionServiceId?`<button type="button" class="btn secondary small action-open-service" data-service="${a.executionServiceId}">Abrir atendimento de execução</button>`:'';
  return `<div class="action-card ${a.status==='Concluída'?'done':''}" data-id="${a.id}">
    <div class="action-card-head"><div><strong>${escapeHtml(a.client)}</strong><span>${escapeHtml(a.equipment)}</span></div>
      <span class="action-status-badge">${escapeHtml(a.status)}</span></div>
    <div class="action-origin"><b>Origem:</b> ${escapeHtml(a.groupTitle||'Atendimento')} • ${escapeHtml(a.description)} ${a.os?'• OS '+escapeHtml(a.os):''}</div>
    ${a.originObs?`<div class="muted"><b>Observação do atendimento:</b> ${escapeHtml(a.originObs)}</div>`:''}
    <div class="action-edit-grid">
      <label>Prioridade<select class="action-priority">${['Baixa','Média','Alta','Crítica'].map(x=>`<option ${a.priority===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label>Status<select class="action-status">${['Pendente','Programada','Em execução','Concluída','Cancelada'].map(x=>`<option ${a.status===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label>Data programada<input class="action-due" type="date" value="${a.dueDate||''}"></label>
      <label>Responsável<input class="action-responsible" value="${escapeHtml(a.responsible||'')}" placeholder="Nome / equipe"></label>
    </div>
    <label>Programação / observações<textarea class="action-notes" rows="2">${escapeHtml(a.notes||'')}</textarea></label>
    ${(a.status==='Em execução'||a.status==='Concluída'||a.executionServiceId)?`<label>Registro da execução / conclusão<textarea class="action-execution-notes" rows="2" placeholder="Descreva o que foi executado e o resultado obtido.">${escapeHtml(a.executionNotes||'')}</textarea></label>`:''}
    <div class="row gap action-buttons">
      <button type="button" class="btn primary small action-save">Salvar ação</button>
      <button type="button" class="btn secondary small action-open-service" data-service="${a.serviceId}">Relatório de origem</button>
      ${!a.executionServiceId && !['Concluída','Cancelada'].includes(a.status)?`<button type="button" class="btn primary small action-start-execution" data-action="${a.id}">Iniciar atendimento da ação</button>`:''}
      ${execLink}
      ${a.status==='Em execução'?`<button type="button" class="btn secondary small action-reset-pending">Retornar para Pendente</button>`:''}
      ${a.status!=='Concluída'&&a.status!=='Cancelada'?`<button type="button" class="btn success small action-complete">Concluir ação</button>`:''}
    </div>
    <div class="muted action-meta">Prazo: ${due}${a.executionDate?' • Execução iniciada em '+formatDate(a.executionDate):''}${a.completedAt?' • Concluída em '+formatDate(a.completedAt.slice(0,10)):''}${a.resolutionOS?' • Relatório de execução: '+escapeHtml(a.resolutionOS):''}</div>${a.status==='Concluída'&&a.executionNotes?`<div class="action-resolution"><b>Resultado / conclusão:</b> ${escapeHtml(a.executionNotes)}</div>`:''}
  </div>`;
}


function agendaDateISO(){ return new Date().toISOString().slice(0,10); }
function agendaDayDiff(dateStr){
  if(!dateStr)return 999999;
  const a=new Date(agendaDateISO()+'T00:00:00'), b=new Date(dateStr+'T00:00:00');
  return Math.round((b-a)/86400000);
}
function agendaBucket(a){
  if(!a.dueDate)return 'Sem data';
  const d=agendaDayDiff(a.dueDate);
  if(d<0)return 'Vencidas';
  if(d===0)return 'Hoje';
  if(d<=7)return 'Próximos 7 dias';
  return 'Futuras';
}
function renderAgendaSummary(){
  let old=document.querySelector('#agendaCard'); if(old)old.remove();
  const actionCard=document.querySelector('#actionCenterCard');
  if(!actionCard)return;
  const actions=loadActions().filter(a=>!['Concluída','Cancelada'].includes(a.status));
  const scheduled=actions.filter(a=>a.dueDate);
  const overdue=scheduled.filter(a=>agendaDayDiff(a.dueDate)<0);
  const today=scheduled.filter(a=>agendaDayDiff(a.dueDate)===0);
  const next7=scheduled.filter(a=>{const d=agendaDayDiff(a.dueDate);return d>0&&d<=7});
  const card=document.createElement('div'); card.id='agendaCard'; card.className='card agenda-card';
  card.innerHTML=`<div class="section-header"><div><h2>Agenda de Serviços</h2>
    <p class="muted">Programação gerada pelas ações com data definida.</p></div>
    <button type="button" class="btn primary small" id="openAgendaBtn">Abrir agenda</button></div>
    <div class="action-summary agenda-summary">
      <div><strong>${overdue.length}</strong><span>Vencidas</span></div>
      <div><strong>${today.length}</strong><span>Hoje</span></div>
      <div><strong>${next7.length}</strong><span>Próximos 7 dias</span></div>
      <div><strong>${scheduled.length}</strong><span>Programadas</span></div>
    </div>`;
  actionCard.parentNode.insertBefore(card,actionCard.nextSibling);
  card.querySelector('#openAgendaBtn').onclick=showAgenda;
}
function showAgenda(){
  const overlay=document.createElement('div'); overlay.className='equipment-card-overlay';
  let actions=loadActions().filter(a=>!['Concluída','Cancelada'].includes(a.status));
  actions.sort((a,b)=>String(a.dueDate||'9999-99-99').localeCompare(String(b.dueDate||'9999-99-99'))||
    ({Crítica:0,Alta:1,Média:2,Baixa:3}[a.priority]??9)-({Crítica:0,Alta:1,Média:2,Baixa:3}[b.priority]??9));
  const groups=['Vencidas','Hoje','Próximos 7 dias','Futuras','Sem data'];
  overlay.innerHTML=`<div class="equipment-card-modal agenda-modal">
    <div class="equipment-card-top"><div><span class="eyebrow">Matekservice A1.0 Oficial</span><h2>Agenda / Programação de Serviços</h2>
    <span class="muted">O que executar, onde, para quando e com quem.</span></div>
    <button type="button" class="equipment-card-close">×</button></div>
    <div class="agenda-filters">
      <input id="agendaSearch" placeholder="Filtrar por cliente, equipamento ou responsável">
      <select id="agendaPriority"><option value="">Todas as prioridades</option>${['Crítica','Alta','Média','Baixa'].map(x=>`<option>${x}</option>`).join('')}</select>
    </div>
    <div id="agendaBody">${agendaGroupsHtml(actions,groups)}</div>
  </div>`;
  document.body.appendChild(overlay);
  const close=()=>{overlay.remove();renderActionCenter();renderAgendaSummary();};
  overlay.querySelector('.equipment-card-close').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  const apply=()=>{
    const q=overlay.querySelector('#agendaSearch').value.trim().toLowerCase();
    const p=overlay.querySelector('#agendaPriority').value;
    const filtered=actions.filter(a=>(!p||a.priority===p)&&(!q||[a.client,a.equipment,a.responsible,a.description].join(' ').toLowerCase().includes(q)));
    overlay.querySelector('#agendaBody').innerHTML=agendaGroupsHtml(filtered,groups); wireAgendaButtons(overlay);
  };
  overlay.querySelector('#agendaSearch').oninput=apply; overlay.querySelector('#agendaPriority').onchange=apply;
  wireAgendaButtons(overlay);
}
function agendaGroupsHtml(actions,groups){
  return groups.map(g=>{
    const arr=actions.filter(a=>agendaBucket(a)===g);
    return `<section class="agenda-section ${arr.length?'':'agenda-empty-section'}"><h3>${g} <span>${arr.length}</span></h3>
      ${arr.length?arr.map(agendaRowHtml).join(''):`<div class="agenda-empty">Nenhum serviço nesta categoria.</div>`}</section>`;
  }).join('');
}
function agendaRowHtml(a){
  const overdue=a.dueDate&&agendaDayDiff(a.dueDate)<0;
  return `<div class="agenda-row ${overdue?'agenda-overdue':''}">
    <div class="agenda-date"><strong>${a.dueDate?formatDate(a.dueDate):'—'}</strong><span>${escapeHtml(a.priority||'Média')}</span></div>
    <div class="agenda-main"><strong>${escapeHtml(a.client)}</strong><span>${escapeHtml(a.equipment)}</span>
      <small>${escapeHtml(a.description||'Ação programada')}${a.responsible?' • Resp.: '+escapeHtml(a.responsible):''}</small></div>
    <div class="agenda-state">${escapeHtml(a.status)}</div>
    <button type="button" class="btn secondary small agenda-open-action" data-action="${a.id}">Abrir ação</button>
  </div>`;
}
function wireAgendaButtons(root){
  root.querySelectorAll('.agenda-open-action').forEach(btn=>btn.onclick=()=>{
    root.remove(); showActionManager(btn.dataset.action);
  });
}


function dashboardServiceClientId(s){
  return s.registryClientId||'';
}
function dashboardClientData(clientId){
  const reg=loadRegistry(), c=reg.clients.find(x=>x.id===clientId);
  const services=JSON.parse(localStorage.getItem('matekservice_services')||'[]').filter(s=>dashboardServiceClientId(s)===clientId || (!dashboardServiceClientId(s)&&normalize(s.fields?.cliente||'')===normalize(c?.name||'')));
  const actions=loadActions().filter(a=>a.clientId===clientId || (!a.clientId&&normalize(a.client||'')===normalize(c?.name||'')));
  return {client:c,services,actions,equipments:c?.equipments||[]};
}
function dashboardStats(clientId=''){
  const reg=loadRegistry();
  let services=JSON.parse(localStorage.getItem('matekservice_services')||'[]'), actions=loadActions();
  let equipments=reg.clients.reduce((n,c)=>n+(c.equipments?.length||0),0), clients=reg.clients.length;
  if(clientId){
    const d=dashboardClientData(clientId); services=d.services;actions=d.actions;equipments=d.equipments.length;clients=1;
  }
  const active=actions.filter(a=>!['Concluída','Cancelada'].includes(a.status));
  return {clients,equipments,services,actions,active,
    overdue:active.filter(a=>a.dueDate&&agendaDayDiff(a.dueDate)<0),
    scheduled:active.filter(a=>a.dueDate),
    completed:actions.filter(a=>a.status==='Concluída')};
}
function showDashboard(clientId=''){
  const reg=loadRegistry(), stats=dashboardStats(clientId);
  const selected=clientId?reg.clients.find(c=>c.id===clientId):null;
  const overlay=document.createElement('div');overlay.className='equipment-card-overlay';
  overlay.innerHTML=`<div class="equipment-card-modal dashboard-modal">
    <div class="equipment-card-top"><div><span class="eyebrow">Matekservice A1.0 Oficial</span>
      <h2>${selected?'Painel Individual do Cliente':'Painel Geral Matek'}</h2>
      <span class="muted">${selected?escapeHtml(selected.name):'Visão consolidada dos clientes, equipamentos, atendimentos e ações.'}</span></div>
      <button type="button" class="equipment-card-close">×</button></div>
    <div class="dashboard-selector"><label>Visualizar por cliente
      <select id="dashboardClient"><option value="">Todos os clientes — Painel Geral</option>
      ${reg.clients.map(c=>`<option value="${c.id}" ${clientId===c.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></label></div>
    <div class="dashboard-kpis">
      <div><strong>${stats.clients}</strong><span>Clientes</span></div>
      <div><strong>${stats.equipments}</strong><span>Equipamentos</span></div>
      <div><strong>${stats.services.length}</strong><span>Atendimentos</span></div>
      <div class="attention"><strong>${stats.active.length}</strong><span>Ações em aberto</span></div>
      <div class="${stats.overdue.length?'danger':''}"><strong>${stats.overdue.length}</strong><span>Ações vencidas</span></div>
      <div><strong>${stats.scheduled.length}</strong><span>Programadas</span></div>
    </div>
    ${selected?dashboardClientHtml(selected,stats):dashboardGeneralHtml(reg,stats)}
  </div>`;
  document.body.appendChild(overlay);
  const close=()=>overlay.remove();
  overlay.querySelector('.equipment-card-close').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelector('#dashboardClient').onchange=e=>{overlay.remove();showDashboard(e.target.value);};
  overlay.querySelectorAll('.dash-open-client').forEach(b=>b.onclick=()=>{overlay.remove();showDashboard(b.dataset.client);});
  overlay.querySelectorAll('.dash-open-equipment').forEach(b=>b.onclick=()=>{overlay.remove();showEquipmentCard(b.dataset.client,b.dataset.equipment);});
  overlay.querySelectorAll('.dash-actions').forEach(b=>b.onclick=()=>{overlay.remove();showActionManager();});
  overlay.querySelectorAll('.dash-agenda').forEach(b=>b.onclick=()=>{overlay.remove();showAgenda();});
}
function dashboardGeneralHtml(reg,stats){
  const rows=reg.clients.map(c=>{
    const d=dashboardClientData(c.id), active=d.actions.filter(a=>!['Concluída','Cancelada'].includes(a.status));
    const overdue=active.filter(a=>a.dueDate&&agendaDayDiff(a.dueDate)<0);
    return `<div class="dashboard-client-row">
      <div><strong>${escapeHtml(c.name)}</strong><small>${d.equipments.length} equipamento(s) • ${d.services.length} atendimento(s)</small></div>
      <div><b>${active.length}</b><small>Ações abertas</small></div>
      <div class="${overdue.length?'dash-danger':''}"><b>${overdue.length}</b><small>Vencidas</small></div>
      <button class="btn secondary small dash-open-client" data-client="${c.id}">Ver cliente</button></div>`;
  }).join('');
  return `<div class="dashboard-section"><div class="dashboard-section-head"><h3>Situação por cliente</h3>
    <div class="row gap"><button class="btn secondary small dash-actions">Ações</button><button class="btn secondary small dash-agenda">Agenda</button></div></div>
    ${rows||'<div class="no-data">Nenhum cliente cadastrado.</div>'}</div>
    <div class="dashboard-section"><div class="dashboard-section-head"><h3>Próximas ações e serviços</h3><button class="btn secondary small dash-agenda">Abrir agenda</button></div>
      ${dashboardUpcomingHtml(stats.active)}
    </div>`;
}
function dashboardUpcomingHtml(actions){
  const priorityOrder={Crítica:0,Alta:1,Média:2,Baixa:3};
  const list=[...actions].sort((a,b)=>String(a.dueDate||'9999-99-99').localeCompare(String(b.dueDate||'9999-99-99'))||(priorityOrder[a.priority]??9)-(priorityOrder[b.priority]??9)).slice(0,8);
  if(!list.length)return '<div class="no-data">Nenhuma ação em aberto.</div>';
  return list.map(a=>`<div class="dashboard-upcoming-row ${a.dueDate&&agendaDayDiff(a.dueDate)<0?'danger':''}"><div><b>${a.dueDate?formatDate(a.dueDate):'Sem data'}</b><small>${escapeHtml(a.priority||'Média')}</small></div><div><strong>${escapeHtml(a.client)}</strong><small>${escapeHtml(a.equipment)}</small></div><div><strong>${escapeHtml(a.description||'Ação pendente')}</strong><small>${escapeHtml(a.responsible?'Responsável: '+a.responsible:a.status||'Pendente')}</small></div></div>`).join('');
}
function dashboardClientHtml(c,stats){
  const d=dashboardClientData(c.id);
  const active=d.actions.filter(a=>!['Concluída','Cancelada'].includes(a.status));
  const overdue=active.filter(a=>a.dueDate&&agendaDayDiff(a.dueDate)<0);
  const scheduled=active.filter(a=>a.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const recent=[...d.services].sort((a,b)=>String(b.fields?.data||'').localeCompare(String(a.fields?.data||''))).slice(0,5);
  const eqRows=d.equipments.map(eq=>{
    const eqServices=d.services.filter(s=>(s.registryEquipmentId||'')===eq.id || (eq.tag&&normalize(s.fields?.tag||'')===normalize(eq.tag)));
    const eqActions=d.actions.filter(a=>(a.equipmentId||'')===eq.id || (eq.tag&&String(a.equipment||'').toLowerCase().includes(String(eq.tag).toLowerCase())));
    const open=eqActions.filter(a=>!['Concluída','Cancelada'].includes(a.status));
    const eqOverdue=open.filter(a=>a.dueDate&&agendaDayDiff(a.dueDate)<0);
    const last=[...eqServices].sort((a,b)=>String(b.fields?.data||'').localeCompare(String(a.fields?.data||'')))[0];
    const next=open.filter(a=>a.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];
    let condition='Sem pendências';
    if(eqOverdue.length)condition='Atenção — ação vencida';
    else if(open.length)condition='Com pendência';
    return `<div class="client-equipment-card ${eqOverdue.length?'client-eq-danger':open.length?'client-eq-attention':''}">
      <div class="client-eq-title"><strong>${escapeHtml(eq.tag||eq.name||'Equipamento')}</strong><span>${escapeHtml(eq.name||'')}</span></div>
      <div><small>Situação</small><b>${condition}</b></div>
      <div><small>Último atendimento</small><b>${last?.fields?.data?formatDate(last.fields.data):'Sem registro'}</b></div>
      <div><small>Próxima programação</small><b>${next?.dueDate?formatDate(next.dueDate):'Sem data'}</b></div>
      <div><small>Pendências</small><b>${open.length}</b></div>
      <button class="btn secondary small dash-open-equipment" data-client="${c.id}" data-equipment="${eq.id}">Abrir ficha</button>
    </div>`;
  }).join('');
  return `<div class="client-panel-header">
      <div><span class="eyebrow">Painel Individual do Cliente</span><h3>${escapeHtml(c.name)}</h3>
      <span class="muted">Acompanhamento dos equipamentos, atendimentos, pendências e programação deste cliente.</span></div>
      <div class="row gap"><button class="btn secondary small dash-actions">Ações</button><button class="btn secondary small dash-agenda">Agenda</button></div>
    </div>
    <div class="client-health">
      <div><strong>${d.equipments.length}</strong><span>Equipamentos</span></div>
      <div><strong>${d.services.length}</strong><span>Atendimentos</span></div>
      <div class="attention"><strong>${active.length}</strong><span>Pendências abertas</span></div>
      <div class="${overdue.length?'danger':''}"><strong>${overdue.length}</strong><span>Vencidas</span></div>
      <div><strong>${scheduled.length}</strong><span>Programadas</span></div>
    </div>
    <div class="dashboard-section"><h3>Situação dos equipamentos</h3>
      ${eqRows||'<div class="no-data">Nenhum equipamento cadastrado para este cliente.</div>'}</div>
    <div class="client-two-cols">
      <div class="dashboard-section"><h3>Próximas ações programadas</h3>
        ${scheduled.length?scheduled.slice(0,5).map(a=>`<div class="client-timeline-row"><b>${formatDate(a.dueDate)}</b><div><strong>${escapeHtml(a.equipment)}</strong><small>${escapeHtml(a.description)}</small></div><span>${escapeHtml(a.priority||'Média')}</span></div>`).join(''):'<div class="no-data">Nenhuma ação com data programada.</div>'}
      </div>
      <div class="dashboard-section"><h3>Atendimentos recentes</h3>
        ${recent.length?recent.map(s=>`<div class="client-timeline-row"><b>${s.fields?.data?formatDate(s.fields.data):'—'}</b><div><strong>${escapeHtml(TYPE_LABELS[s.type]||s.type||'Atendimento')}</strong><small>${escapeHtml((s.fields?.tag?s.fields.tag+' — ':'')+(s.fields?.equipamento||''))}${s.fields?.os?' • OS '+escapeHtml(s.fields.os):''}</small></div></div>`).join(''):'<div class="no-data">Nenhum atendimento salvo.</div>'}
      </div>
    </div>`;
}
function wireMainNavigation(){
  const d=document.querySelector('#navDashboard');
  const c=document.querySelector('#navClients'), a=document.querySelector('#navActions'), g=document.querySelector('#navAgenda');
  if(d)d.onclick=()=>showDashboard();
  if(c)c.onclick=()=>{showHome();setTimeout(()=>document.querySelector('#savedList')?.scrollIntoView({behavior:'smooth',block:'start'}),80);};
  if(a)a.onclick=()=>showActionManager();
  if(g)g.onclick=()=>showAgenda();
}
function showHome(){
  $('#formScreen').classList.remove('active');
  $('#registryScreen')?.classList.remove('active');
  $('#reportScreen').classList.remove('active');
  $('#homeScreen').classList.add('active');
  renderSaved();
  renderRegistrySummary();
  renderActionCenter();
  renderAgendaSummary();
  wireMainNavigation();
  window.scrollTo(0,0);
}

function saveCurrent(){
  upsertCurrentIntoRegistry();
  if(!current) return;
  ensureAutomaticReportNumber();
  current.updatedAt=new Date().toISOString();
  current.registryClientId=selectedRegistryClientId||'';
  current.registryEquipmentId=selectedRegistryEquipmentId||'';
  const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  const idx=all.findIndex(x=>x.id===current.id);
  const copy=JSON.parse(JSON.stringify(current));
  copy.groups.forEach(g=>g.items.forEach(i=>{
    i.itemPhotos=(i.itemPhotos||[]).map(p=>({id:p.id,caption:p.caption||''}));
  }));
  copy.photosMeta=photos.map(p=>({id:p.id,caption:p.caption}));
  if(idx>=0) all[idx]=copy; else all.unshift(copy);
  localStorage.setItem('matekservice_services',JSON.stringify(all));
  syncActionsFromCurrent();
  if(current.linkedActionId){
    let acts=loadActions(), act=acts.find(x=>x.id===current.linkedActionId);
    if(act){ act.executionServiceId=current.id; act.executionDate=act.executionDate||new Date().toISOString().slice(0,10); if(act.status==='Pendente'||act.status==='Programada')act.status='Em execução'; saveActions(acts); }
  }
  renderFormRegistrySelectors();
  renderRegistrySummary();
  const itemPhotoMap={};
  current.groups.forEach(g=>g.items.forEach(i=>{ if((i.itemPhotos||[]).length) itemPhotoMap[i.id]=i.itemPhotos; }));
  savePhotosToDB(current.id,photos,itemPhotoMap).then(()=>{
    $('#statusBadge').textContent='Salvo';
    setTimeout(()=>$('#statusBadge').textContent='Rascunho',1600);
  }).catch(err=>{
    console.error(err);
    $('#statusBadge').textContent='Erro nas fotos';
    alert('O atendimento foi salvo, mas houve falha ao armazenar as fotos neste navegador. Exporte um backup e tente novamente antes de encerrar o atendimento.');
  });
}

$('#saveBtn').onclick=saveCurrent;
$('#refreshSaved').onclick=renderSaved;

let homeSelectedClientId='';


function equipmentServiceHistory(clientId,equipmentId){
  const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  const c=getRegistryClient(clientId);
  const e=c?.equipments?.find(x=>x.id===equipmentId);
  if(!c||!e) return [];
  return all.filter(s=>
    s.registryEquipmentId===equipmentId ||
    (s.registryClientId===clientId && !s.registryEquipmentId &&
      ((e.tag && normalize(s.fields?.tag)===normalize(e.tag)) ||
       (!e.tag && normalize(s.fields?.equipamento)===normalize(e.name))))
  ).sort((a,b)=>String(b.fields?.data||b.updatedAt||'').localeCompare(String(a.fields?.data||a.updatedAt||'')));
}

function showEquipmentCard(clientId,equipmentId){
  const reg=loadRegistry(), c=reg.clients.find(x=>x.id===clientId);
  if(!c)return;
  const eq=(c.equipments||[]).find(x=>x.id===equipmentId);
  if(!eq)return;
  const services=equipmentServiceHistory(clientId,equipmentId).sort((a,b)=>String(b.fields?.data||'').localeCompare(String(a.fields?.data||'')));
  const actions=loadActions().filter(a=>(a.equipmentId||'')===equipmentId || (eq.tag&&String(a.equipment||'').toLowerCase().includes(String(eq.tag).toLowerCase())));
  const open=actions.filter(a=>!['Concluída','Cancelada'].includes(a.status));
  const overdue=open.filter(a=>a.dueDate&&agendaDayDiff(a.dueDate)<0);
  const completed=actions.filter(a=>a.status==='Concluída');
  const scheduled=open.filter(a=>a.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const dossierType = s => {
    const raw=String(s?.type||'').trim().toLowerCase();
    const label=String(TYPE_LABELS[s?.type]||'').trim().toLowerCase();
    const text=(raw+' '+label).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(text.includes('prevent')) return 'preventive';
    if(text.includes('corret')) return 'corrective';
    if(text.includes('visita') || text.includes('visit')) return 'visit';
    return raw;
  };
  const preventive=services.filter(s=>dossierType(s)==='preventive').length;
  const corrective=services.filter(s=>dossierType(s)==='corrective').length;
  const visits=services.filter(s=>dossierType(s)==='visit').length;
  const last=services[0];

  const overlay=document.createElement('div');
  overlay.className='equipment-card-overlay';
  overlay.innerHTML=`<div class="equipment-card-modal equipment-dossier-modal">
    <div class="equipment-card-top"><div><span class="eyebrow">Matekservice A1.0 Oficial • Prontuário do Equipamento</span>
      <h2>${escapeHtml(eq.tag||eq.name||'Equipamento')}</h2>
      <span class="muted">${escapeHtml(c.name)}${eq.name?' • '+escapeHtml(eq.name):''}</span></div>
      <button type="button" class="equipment-card-close">×</button></div>

    <div class="dossier-status ${overdue.length?'danger':open.length?'attention':'ok'}">
      <strong>${overdue.length?'ATENÇÃO — AÇÃO VENCIDA':open.length?'EQUIPAMENTO COM PENDÊNCIA':'SEM PENDÊNCIAS EM ABERTO'}</strong>
      <span>${open.length} ação(ões) em aberto${scheduled[0]?.dueDate?' • próxima programação '+formatDate(scheduled[0].dueDate):''}</span>
    </div>

    <div class="dossier-data-grid">
      <div><small>TAG / Patrimônio</small><b>${escapeHtml(eq.tag||'Não informado')}</b></div>
      <div><small>Equipamento</small><b>${escapeHtml(eq.name||'Não informado')}</b></div>
      <div><small>Fabricante / Marca</small><b>${escapeHtml(eq.manufacturer||eq.fabricante||'Não informado')}</b></div>
      <div><small>Modelo</small><b>${escapeHtml(eq.model||eq.modelo||'Não informado')}</b></div>
      <div><small>Capacidade nominal</small><b>${escapeHtml(eq.capacity||eq.capacidade||'Não informado')}</b></div>
      <div><small>Local de instalação</small><b>${escapeHtml(eq.location||eq.local||'Não informado')}</b></div>
    </div>

    <div class="dossier-kpis">
      <div><strong>${services.length}</strong><span>Atendimentos</span></div>
      <div><strong>${preventive}</strong><span>Preventivas</span></div>
      <div><strong>${corrective}</strong><span>Corretivas</span></div>
      <div><strong>${visits}</strong><span>Visitas técnicas</span></div>
      <div class="${open.length?'attention':''}"><strong>${open.length}</strong><span>Pendências</span></div>
      <div><strong>${completed.length}</strong><span>Ações concluídas</span></div>
    </div>

    <div class="dossier-actions-bar">
      <button class="btn primary small dossier-new" data-type="preventive">+ Preventiva</button>
      <button class="btn primary small dossier-new" data-type="corrective">+ Corretiva</button>
      <button class="btn secondary small dossier-new" data-type="visit">+ Visita técnica</button>
    </div>

    <div class="dossier-two-cols">
      <section class="dashboard-section"><h3>Pendências e próximas programações</h3>
        ${open.length?open.map(a=>`<div class="dossier-action-row ${a.dueDate&&agendaDayDiff(a.dueDate)<0?'danger':''}">
          <div><strong>${escapeHtml(a.description||'Ação')}</strong><small>${escapeHtml(a.status)} • ${escapeHtml(a.priority||'Média')}</small></div>
          <div><small>Programação</small><b>${a.dueDate?formatDate(a.dueDate):'Sem data'}</b></div>
          <button class="btn secondary small dossier-open-action" data-action="${a.id}">Abrir ação</button></div>`).join(''):'<div class="no-data">Nenhuma pendência em aberto.</div>'}
      </section>
      <section class="dashboard-section"><h3>Resumo técnico</h3>
        <div class="dossier-summary-line"><span>Último atendimento</span><b>${last?.fields?.data?formatDate(last.fields.data):'Sem registro'}</b></div>
        <div class="dossier-summary-line"><span>Tipo do último atendimento</span><b>${last?escapeHtml(TYPE_LABELS[last.type]||last.type):'—'}</b></div>
        <div class="dossier-summary-line"><span>Próxima programação</span><b>${scheduled[0]?.dueDate?formatDate(scheduled[0].dueDate):'Sem data'}</b></div>
        <div class="dossier-summary-line"><span>Ações vencidas</span><b>${overdue.length}</b></div>
      </section>
    </div>

    <section class="dashboard-section"><h3>Histórico técnico do equipamento</h3>
      ${services.length?services.map(s=>`<div class="dossier-history-row">
        <div><b>${s.fields?.data?formatDate(s.fields.data):'—'}</b><small>${escapeHtml(TYPE_LABELS[s.type]||s.type||'Atendimento')}</small></div>
        <div><strong>${escapeHtml(s.fields?.os?'OS '+s.fields.os:'Sem OS')}</strong><small>${escapeHtml(s.fields?.contato||'')}</small></div>
        <div><small>Condição final</small><b>${escapeHtml(s.fields?.condicaoFinal||s.fields?.condicao||'Consultar relatório')}</b></div>
        <button class="btn secondary small dossier-open-service" data-service="${s.id}">Abrir relatório</button>
      </div>`).join(''):'<div class="no-data">Nenhum atendimento registrado para este equipamento.</div>'}
    </section>

    ${completed.length?`<section class="dashboard-section"><h3>Ações concluídas</h3>
      ${completed.slice(0,8).map(a=>`<div class="dossier-completed-row"><div><strong>${escapeHtml(a.description||'Ação concluída')}</strong><small>${a.completedAt?'Concluída em '+formatDate(a.completedAt.slice(0,10)):'Concluída'}${a.resolutionOS?' • Relatório '+escapeHtml(a.resolutionOS):''}</small>${a.executionNotes?`<small>Resultado: ${escapeHtml(a.executionNotes)}</small>`:''}</div><span>✓</span></div>`).join('')}
    </section>`:''}
  </div>`;

  document.body.appendChild(overlay);
  const close=()=>overlay.remove();
  overlay.querySelector('.equipment-card-close').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelectorAll('.dossier-new').forEach(b=>b.onclick=()=>{overlay.remove();newService(b.dataset.type,clientId,equipmentId);});
  overlay.querySelectorAll('.dossier-open-action').forEach(b=>b.onclick=()=>{overlay.remove();showActionManager();setTimeout(()=>document.querySelector(`.action-card[data-id="${b.dataset.action}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),100);});
  overlay.querySelectorAll('.dossier-open-service').forEach(b=>b.onclick=async()=>{
    const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]'), s=all.find(x=>x.id===b.dataset.service); if(!s)return;
    overlay.remove(); current=s; selectedRegistryClientId=s.registryClientId||clientId; selectedRegistryEquipmentId=s.registryEquipmentId||equipmentId;
    const loaded=await loadPhotosFromDB(s.id); photos=loaded.general||[]; const itemMap=loaded.items||{};
    current.groups.forEach(g=>g.items.forEach(i=>i.itemPhotos=itemMap[i.id]||[])); openForm();
  });
}

function renderSaved(){
  const host=$('#savedList');
  if(!host) return;

  const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  const reg=loadRegistry();

  // Base principal: clientes cadastrados. Isso faz cada cliente aparecer uma única vez,
  // mesmo que tenha muitos relatórios ou ainda nenhum atendimento.
  const clients=reg.clients.map(c=>({
    id:c.id,
    name:c.name||'Cliente sem nome',
    equipments:c.equipments||[],
    services:all.filter(s=>s.registryClientId===c.id ||
      (!s.registryClientId && normalize(s.fields?.cliente)===normalize(c.name)))
  }));

  // Segurança para atendimentos antigos/orfãos que ainda não estejam no cadastro.
  const knownNames=new Set(clients.map(c=>normalize(c.name)));
  for(const s of all){
    const name=(s.fields?.cliente||'Cliente não informado').trim()||'Cliente não informado';
    if(!knownNames.has(normalize(name))){
      clients.push({id:'legacy:'+normalize(name),name,equipments:[],services:all.filter(x=>normalize(x.fields?.cliente)===normalize(name))});
      knownNames.add(normalize(name));
    }
  }

  clients.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));

  if(!clients.length){
    host.innerHTML='<div class="no-data">Nenhum cliente ou atendimento cadastrado.</div>';
    return;
  }

  host.innerHTML=clients.map((c,idx)=>{
    const sorted=[...c.services].sort((a,b)=>String(b.fields?.data||b.updatedAt||'').localeCompare(String(a.fields?.data||a.updatedAt||'')));
    const latest=sorted[0];
    const open=homeSelectedClientId===c.id;
    const equipmentOptions=(c.equipments||[]).map(e=>`<option value="${e.id}">${escapeHtml((e.tag?e.tag+' — ':'')+(e.name||'Equipamento'))}</option>`).join('');
    const eqSummary=(c.equipments||[]).length
      ? `<div class="client-equipment-chips">${c.equipments.map(e=>`<button type="button" class="equipment-chip-open" data-client="${c.id}" data-equipment="${e.id}" title="Abrir ficha do equipamento">${escapeHtml((e.tag?e.tag+' — ':'')+(e.name||'Equipamento'))}</button>`).join('')}</div>`
      : '<div class="no-data compact">Nenhum equipamento cadastrado para este cliente.</div>';

    return `<div class="saved-client-group ${open?'selected-client':''}" data-client-card="${c.id}">
      <button type="button" class="saved-client-header ${open?'open':''}" data-client-id="${c.id}">
        <div>
          <strong>${escapeHtml(c.name)}</strong>
          <span>${c.equipments.length} equipamento(s) • ${sorted.length} atendimento(s)</span>
        </div>
        <div class="saved-client-latest">
          <span>${latest?'Último: '+formatDate(latest.fields?.data):'Sem atendimentos'}</span>
          <span class="chevron">▼</span>
        </div>
      </button>

      <div class="saved-client-services ${open?'':'hidden'}" data-client-services="${c.id}">
        <div class="client-action-panel">
          <div>
            <strong>Cliente selecionado</strong>
            <span>Escolha um equipamento (opcional) e o tipo de novo atendimento.</span>
          </div>
          <label class="client-equipment-select">Equipamento
            <select data-home-equipment="${c.id}">
              <option value="">— Sem equipamento definido —</option>
              ${equipmentOptions}
            </select>
          </label>
          <div class="client-new-actions">
            <button type="button" class="btn primary small client-new-service" data-type="preventiva" data-client="${c.id}">+ Preventiva</button>
            <button type="button" class="btn primary small client-new-service" data-type="corretiva" data-client="${c.id}">+ Corretiva</button>
            <button type="button" class="btn primary small client-new-service" data-type="visita" data-client="${c.id}">+ Visita técnica</button>
          </div>
        </div>

        <div class="client-section">
          <h4>Equipamentos cadastrados</h4>
          ${eqSummary}
        </div>

        <div class="client-section">
          <h4>Histórico de atendimentos</h4>
          ${sorted.length ? sorted.map(s=>`<div class="saved-row grouped-service-row">
            <div>
              <strong>${TYPE_LABELS[s.type]}</strong>
              <span>${escapeHtml((s.fields?.tag?s.fields.tag+' — ':'')+(s.fields?.equipamento||'Equipamento não informado'))} | ${formatDate(s.fields?.data)} | ${escapeHtml(s.fields?.os||'Sem OS')}</span>
            </div>
            <div class="row gap">
              <button class="btn secondary small open-saved" data-id="${s.id}">Abrir</button>
              <button class="btn secondary small delete-saved" data-id="${s.id}">Excluir</button>
            </div>
          </div>`).join('') : '<div class="no-data compact">Este cliente ainda não possui atendimentos salvos.</div>'}
        </div>
      </div>
    </div>`;
  }).join('');

  // Cliente fechado por padrão. Ao clicar, seleciona e abre somente aquele cliente.
  host.querySelectorAll('.saved-client-header').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.clientId;
      homeSelectedClientId=(homeSelectedClientId===id)?'':id;
      renderSaved();
    });
  });

  // Ficha individual do equipamento.
  host.querySelectorAll('.equipment-chip-open').forEach(btn=>{
    btn.addEventListener('click',()=>showEquipmentCard(btn.dataset.client,btn.dataset.equipment));
  });

  // Novo atendimento já preenchido com cliente + equipamento escolhido.
  host.querySelectorAll('.client-new-service').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const clientId=btn.dataset.client;
      if(clientId.startsWith('legacy:')){
        alert('Este é um atendimento antigo ainda sem vínculo de cadastro. Use “Gerenciar cadastros” para associá-lo a um cliente.');
        return;
      }
      const select=host.querySelector(`[data-home-equipment="${clientId}"]`);
      const equipmentId=select?.value||'';
      newService(btn.dataset.type,clientId,equipmentId);
    });
  });

  host.querySelectorAll('.open-saved').forEach(b=>b.onclick=async()=>{
    const s=all.find(x=>x.id===b.dataset.id); if(!s)return;
    current=s;
    selectedRegistryClientId=s.registryClientId||'';
    selectedRegistryEquipmentId=s.registryEquipmentId||'';
    const loaded=await loadPhotosFromDB(s.id);
    photos=loaded.general||[];
    const itemMap=loaded.items||{};
    current.groups.forEach(g=>g.items.forEach(i=>{ i.itemPhotos=itemMap[i.id]||[]; }));
    openForm();
  });

  host.querySelectorAll('.delete-saved').forEach(b=>b.onclick=()=>{
    if(!confirm('Excluir este atendimento salvo?')) return;
    const next=all.filter(x=>x.id!==b.dataset.id);
    localStorage.setItem('matekservice_services',JSON.stringify(next));
    deletePhotosFromDB(b.dataset.id);
    renderSaved(); renderRegistrySummary();
  });
}function chooseItemPhoto(item){
  const input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  input.setAttribute('capture','environment');
  input.onchange=async()=>{
    const file=input.files && input.files[0];
    if(!file) return;
    const dataUrl=await fileToDataURL(file);
    item.itemPhotos=item.itemPhotos||[];
    item.itemPhotos.push({id:uid(),dataUrl,caption:''});
    renderGroups();
  };
  input.click();
}

$('#photoInput').addEventListener('change', async e=>{
  for(const file of e.target.files){
    const dataUrl=await fileToDataURL(file);
    photos.push({id:uid(),dataUrl,caption:''});
  }
  e.target.value='';
  renderPhotos();
});

function renderPhotos(){
  const host=$('#photoGallery'); host.innerHTML='';
  if(!photos.length){host.innerHTML='<div class="no-data">Nenhuma foto adicionada.</div>';return}
  photos.forEach(p=>{
    const c=document.createElement('div'); c.className='photo-card';
    c.innerHTML=`<img src="${p.dataUrl}" alt="Evidência"><div class="photo-caption"><input value="${escapeHtml(p.caption||'')}" placeholder="Legenda da foto"></div><div class="photo-actions"><button type="button" class="icon-btn danger">Excluir</button></div>`;
    c.querySelector('input').oninput=e=>p.caption=e.target.value;
    c.querySelector('button').onclick=()=>{photos=photos.filter(x=>x.id!==p.id);renderPhotos()};
    host.appendChild(c);
  });
}

$('#previewBtn').onclick=()=>{
  buildReport();
  $('#formScreen').classList.remove('active');
  $('#registryScreen')?.classList.remove('active');
  $('#reportScreen').classList.add('active');
  window.scrollTo(0,0);
};
$('#printBtn').onclick=()=>window.print();

function buildReport(){
  const f=current.fields;
  if(!f.dataEmissao) f.dataEmissao=new Date().toISOString().slice(0,10);
  const visibleGroups=current.groups.filter(g=>g.visible).map(g=>({...g,items:g.items.filter(i=>i.visible)})).filter(g=>g.items.length);
  const report=$('#report');
  report.innerHTML=`
  <div class="report-header">
    <img class="report-logo" src="assets/matek_logo.png" alt="Matek">
    <div><h1>${TYPE_LABELS[current.type].toUpperCase()}</h1><p>Manutenção, inspeção e assistência técnica em equipamentos de elevação de cargas</p></div>
  </div>
  ${section('1. IDENTIFICAÇÃO DA VISITA', infoTable([
    ['Cliente',f.cliente,'Data da execução',formatDate(f.data),'Nº do relatório',f.os],
    ['Data de emissão',formatDate(f.dataEmissao),'Contato',f.contato,'Telefone / e-mail',f.telefoneEmail],
    ['Setor / local',f.setor,'Chegada',f.chegada,'Saída',f.saida],
    ['Tempo total',f.tempoTotal,'','', '', '']
  ]))}
  ${section('2. IDENTIFICAÇÃO DO EQUIPAMENTO', infoTable([
    ['Equipamento',f.equipamento,'TAG / patrimônio',f.tag,'Fabricante / marca',f.fabricante],
    ['Modelo',f.modelo,'Capacidade nominal',f.capacidade,'Local de instalação',f.localInstalacao]
  ]))}
  ${current.actionContext?section('RASTREABILIDADE DA AÇÃO', textTable([
    ['Origem da ação',(current.actionContext.groupTitle||'Atendimento')+' — '+(current.actionContext.description||'')],
    ['Relatório/OS de origem',current.actionContext.sourceOS||current.actionContext.sourceReference||'Registro interno'],
    ['Ação vinculada',current.linkedActionId||''],
    ['Situação',current.actionClosedAt?'Concluída por este atendimento':'Em execução']
  ])):''}
  ${specificReport()}
  ${visibleGroups.map((g,idx)=>section(`${idx+4}. ${escapeHtml(g.title).toUpperCase()} <span class="report-legend">OK: Conforme | N/A: Não aplicável | NR: Necessita reparo | CS: Componente substituído</span>`, activityTable(g.items))).join('')}
  ${section('CONCLUSÃO DO ATENDIMENTO', `
    <table class="report-table">
      <tr><th>Condição do equipamento</th><td>${v(f.condicao)}</td></tr>
      <tr><th>Restrições / observações de segurança</th><td>${nl(f.restricoes)}</td></tr>
      <tr><th>Pendências, recomendações e próximas ações</th><td>${nl(f.recomendacoes)}</td></tr>
      <tr><th>Observações gerais</th><td>${nl(f.observacoesGerais)}</td></tr>
      <tr><th>Responsável técnico</th><td>${escapeHtml(selectedTech().name)} — ${escapeHtml(selectedTech().role)}${selectedTech().id?' | '+escapeHtml(selectedTech().id):''}</td></tr>
      <tr><th>Destinatário do relatório</th><td>${v(f.relatorioResponsavel)} ${f.relatorioCargo?'— '+escapeHtml(f.relatorioCargo):''}${f.relatorioEmail?' | '+escapeHtml(f.relatorioEmail):''}</td></tr>
    </table>`)}
  ${photos.length?section('EVIDÊNCIAS / FOTOS', `<div class="report-photos">${photos.map((p,i)=>`<div class="report-photo"><img src="${p.dataUrl}"><p><strong>Foto ${i+1}</strong>${p.caption?' — '+escapeHtml(p.caption):''}</p></div>`).join('')}</div>`):''}
  <p style="font-size:.72rem;color:#59697a;margin-top:16px">Este relatório registra as condições verificadas e os serviços executados na data do atendimento. Recomendações e pendências devem ser avaliadas conforme a criticidade, o manual do fabricante e os requisitos de segurança aplicáveis.</p>`;
}

function specificReport(){
  const f=current.fields;
  if(current.type==='corretiva'){
    return section('3. MANUTENÇÃO CORRETIVA', textTable([
      ['Defeito / solicitação informada',f.defeitoInformado],
      ['Diagnóstico e condição encontrada',f.diagnostico],
      ['Causa identificada',f.causa],
      ['Serviços executados',f.servicosExecutados],
      ['Peças / materiais utilizados',f.pecas],
      ['Resultado dos testes',f.resultadoTestes]
    ]));
  }
  if(current.type==='visita'){
    return section('3. VISITA TÉCNICA', textTable([
      ['Motivo da chamada / solicitação do cliente',f.motivo],
      ['Diagnóstico e condição encontrada',f.diagnostico],
      ['Levantamentos / atividades realizadas',f.levantamentos]
    ]));
  }
  return section('3. MANUTENÇÃO PREVENTIVA', textTable([['Motivo / observação inicial',f.motivo]]));
}

function section(title,body){return `<h2>${title}</h2>${body}`}
function infoTable(rows){return `<table class="report-table">${rows.map(r=>`<tr>${r.map((x,i)=>i%2===0?`<th>${escapeHtml(x)}</th>`:`<td>${v(x)}</td>`).join('')}</tr>`).join('')}</table>`}
function textTable(rows){return `<table class="report-table">${rows.map(r=>`<tr><th style="width:32%">${escapeHtml(r[0])}</th><td>${nl(r[1])}</td></tr>`).join('')}</table>`}
function activityTable(items){
  return `<table class="report-table">
    <tr><th>Item de verificação</th><th style="width:65px">Resultado</th><th>Observação</th></tr>
    ${items.map(i=>{
      const base=`<tr><td>${escapeHtml(i.text)}</td><td class="center">${v(i.status)}</td><td>${v(i.obs)}</td></tr>`;
      const evidence=(i.itemPhotos||[]).length
        ? `<tr class="evidence-row"><td colspan="3">
             <div class="evidence-title">Evidências fotográficas</div>
             <div class="report-item-photos">${i.itemPhotos.map((p,k)=>`<figure><img src="${p.dataUrl}"><figcaption>Foto ${k+1}</figcaption></figure>`).join('')}</div>
           </td></tr>`
        : '';
      return base+evidence;
    }).join('')}
  </table>`;
}
function v(x){return x?escapeHtml(x):'—'}
function nl(x){return x?escapeHtml(x).replace(/\n/g,'<br>'):'—'}
function formatDate(d){if(!d)return '—'; const p=d.split('-'); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(reader.error||new Error('Falha ao ler a imagem.'));
    reader.onload=()=>{
      const original=reader.result;
      const img=new Image();
      img.onerror=()=>resolve(original); // formato não redimensionável: preserva original
      img.onload=()=>{
        try{
          const MAX=1600;
          const scale=Math.min(1,MAX/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
          if(scale>=1 && file.size<1400000){resolve(original);return;}
          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
          canvas.height=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
          const ctx=canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.82));
        }catch(e){resolve(original);}
      };
      img.src=original;
    };
    reader.readAsDataURL(file);
  });
}

// IndexedDB for photo persistence
const DB_NAME='matekservice_db', STORE='photos';

// -------- Clientes, equipamentos e histórico --------
function renderRegistrySummary(){
  const host=document.getElementById('registrySummary'); if(!host)return;
  const reg=loadRegistry();
  const eqCount=reg.clients.reduce((n,c)=>n+(c.equipments?.length||0),0);
  const services=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  host.innerHTML=`<div class="summary-pill"><strong>${reg.clients.length}</strong><span>clientes</span></div>
                  <div class="summary-pill"><strong>${eqCount}</strong><span>equipamentos</span></div>
                  <div class="summary-pill"><strong>${services.length}</strong><span>atendimentos salvos</span></div>`;
}

function renderFormRegistrySelectors(){
  const cs=document.getElementById('clientSelect'), es=document.getElementById('equipmentSelect');
  if(!cs||!es)return;
  const reg=loadRegistry();
  cs.innerHTML='<option value="">— Selecionar cliente —</option>'+reg.clients
    .sort((a,b)=>(a.name||'').localeCompare(b.name||''))
    .map(c=>`<option value="${c.id}">${escapeHtml(c.name||'Cliente sem nome')}</option>`).join('');
  cs.value=selectedRegistryClientId||'';
  const c=reg.clients.find(x=>x.id===cs.value);
  es.disabled=!c;
  es.innerHTML='<option value="">— Selecionar equipamento —</option>'+(c?.equipments||[])
    .map(e=>`<option value="${e.id}">${escapeHtml((e.tag?e.tag+' — ':'')+(e.name||'Equipamento'))}</option>`).join('');
  es.value=selectedRegistryEquipmentId||'';
}

function applyClientToForm(c){
  if(!c||!current)return;
  selectedRegistryClientId=c.id; selectedRegistryEquipmentId='';
  const m={cliente:c.name,contato:c.contact,telefoneEmail:c.phone,setor:c.sector,relatorioResponsavel:c.reportRecipient||'',relatorioCargo:c.reportRole||'',relatorioEmail:c.reportEmail||''};
  Object.entries(m).forEach(([k,v])=>{ if(v!==undefined){current.fields[k]=v||''; const el=document.querySelector(`[name="${k}"]`); if(el)el.value=v||'';}});
  renderFormRegistrySelectors();
}
function applyEquipmentToForm(e){
  if(!e||!current)return;
  selectedRegistryEquipmentId=e.id;
  const m={equipamento:e.name,tag:e.tag,fabricante:e.manufacturer,modelo:e.model,capacidade:e.capacity,localInstalacao:e.location};
  Object.entries(m).forEach(([k,v])=>{current.fields[k]=v||''; const el=document.querySelector(`[name="${k}"]`); if(el)el.value=v||'';});
  renderFormRegistrySelectors();
}

document.getElementById('clientSelect')?.addEventListener('change',e=>{
  const reg=loadRegistry(), c=reg.clients.find(x=>x.id===e.target.value);
  if(c) applyClientToForm(c); else {selectedRegistryClientId='';selectedRegistryEquipmentId='';renderFormRegistrySelectors();}
});
document.getElementById('equipmentSelect')?.addEventListener('change',e=>{
  const c=getRegistryClient(selectedRegistryClientId);
  const eq=c?.equipments?.find(x=>x.id===e.target.value);
  if(eq) applyEquipmentToForm(eq); else selectedRegistryEquipmentId='';
});

document.getElementById('saveClientFromForm')?.addEventListener('click',()=>{
  if(!current)return;
  const name=(current.fields.cliente||'').trim();
  if(!name){alert('Informe o nome do cliente antes de salvar.');return;}
  const reg=loadRegistry();
  let c=reg.clients.find(x=>x.id===selectedRegistryClientId);
  if(!c) c=reg.clients.find(x=>normalize(x.name)===normalize(name));
  if(!c){ c={id:registryUid('C'),equipments:[]}; reg.clients.push(c); }
  Object.assign(c,{name,contact:current.fields.contato||'',phone:current.fields.telefoneEmail||'',sector:current.fields.setor||'',notes:c.notes||''});
  selectedRegistryClientId=c.id; saveRegistry(reg); renderFormRegistrySelectors(); renderRegistrySummary();
  const s=document.getElementById('registryFormStatus'); if(s){s.textContent='Cliente salvo.';setTimeout(()=>s.textContent='',1800);}
});

document.getElementById('saveEquipmentFromForm')?.addEventListener('click',()=>{
  if(!current)return;
  if(!selectedRegistryClientId){alert('Primeiro selecione ou salve o cliente.');return;}
  const reg=loadRegistry(), c=reg.clients.find(x=>x.id===selectedRegistryClientId);
  if(!c)return;
  const name=(current.fields.equipamento||'').trim();
  if(!name && !(current.fields.tag||'').trim()){alert('Informe o equipamento ou a TAG antes de salvar.');return;}
  let eq=c.equipments.find(x=>x.id===selectedRegistryEquipmentId);
  if(!eq){eq={id:registryUid('E')};c.equipments.push(eq);}
  Object.assign(eq,{name,tag:current.fields.tag||'',manufacturer:current.fields.fabricante||'',model:current.fields.modelo||'',capacity:current.fields.capacidade||'',location:current.fields.localInstalacao||''});
  selectedRegistryEquipmentId=eq.id; saveRegistry(reg); renderFormRegistrySelectors(); renderRegistrySummary();
  const s=document.getElementById('registryFormStatus'); if(s){s.textContent='Equipamento salvo.';setTimeout(()=>s.textContent='',1800);}
});

function openRegistryScreen(){
  document.getElementById('homeScreen')?.classList.remove('active');
  document.getElementById('formScreen')?.classList.remove('active');
  document.getElementById('reportScreen')?.classList.remove('active');
  document.getElementById('registryScreen')?.classList.add('active');
  renderRegistryManager();
  window.scrollTo(0,0);
}
document.getElementById('openRegistryBtn')?.addEventListener('click',openRegistryScreen);
document.getElementById('backRegistryHome')?.addEventListener('click',showHome);

let registryEditingClientId='';
let registryEditingEquipmentId='';

function renderRegistryManager(filter=''){
  const reg=loadRegistry(), host=document.getElementById('clientList'); if(!host)return;
  const q=normalize(filter);
  const clients=reg.clients.filter(c=>{
    const blob=[c.name,c.contact,c.phone,c.sector,...(c.equipments||[]).flatMap(e=>[e.name,e.tag,e.manufacturer,e.model,e.location])].join(' ');
    return !q||normalize(blob).includes(q);
  }).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  host.innerHTML=clients.length?clients.map(c=>`<button type="button" class="registry-client-row ${c.id===registryEditingClientId?'active':''}" data-id="${c.id}">
    <strong>${escapeHtml(c.name||'Cliente sem nome')}</strong>
    <span>${c.equipments?.length||0} equipamento(s)</span>
  </button>`).join(''):'<div class="no-data">Nenhum cliente encontrado.</div>';
  host.querySelectorAll('.registry-client-row').forEach(b=>b.onclick=()=>editRegistryClient(b.dataset.id));
  if(registryEditingClientId) renderRegistryEditor();
}
document.getElementById('registrySearch')?.addEventListener('input',e=>renderRegistryManager(e.target.value));

document.getElementById('newClientBtn')?.addEventListener('click',()=>{
  registryEditingClientId='';registryEditingEquipmentId='';
  document.getElementById('clientEditorEmpty')?.classList.add('hidden');
  document.getElementById('clientEditor')?.classList.remove('hidden');
  ['regClientName','regClientContact','regClientPhone','regClientSector','regReportRecipient','regReportRole','regReportEmail','regClientNotes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('clientEditorTitle').textContent='Novo cliente';
  document.getElementById('equipmentRegistryList').innerHTML='<div class="no-data">Salve o cliente para cadastrar equipamentos.</div>';
  document.getElementById('equipmentEditor').classList.add('hidden');
  document.getElementById('clientHistory').innerHTML='<div class="no-data">Sem histórico.</div>';
});

function editRegistryClient(id){
  registryEditingClientId=id; registryEditingEquipmentId='';
  renderRegistryManager(document.getElementById('registrySearch')?.value||'');
  renderRegistryEditor();
}
function renderRegistryEditor(){
  const c=getRegistryClient(registryEditingClientId);
  if(!c)return;
  document.getElementById('clientEditorEmpty').classList.add('hidden');
  document.getElementById('clientEditor').classList.remove('hidden');
  document.getElementById('clientEditorTitle').textContent=c.name||'Cliente';
  document.getElementById('regClientName').value=c.name||'';
  document.getElementById('regClientContact').value=c.contact||'';
  document.getElementById('regClientPhone').value=c.phone||'';
  document.getElementById('regClientSector').value=c.sector||'';
  document.getElementById('regReportRecipient').value=c.reportRecipient||'';
  document.getElementById('regReportRole').value=c.reportRole||'';
  document.getElementById('regReportEmail').value=c.reportEmail||'';
  document.getElementById('regClientNotes').value=c.notes||'';
  const eh=document.getElementById('equipmentRegistryList');
  eh.innerHTML=(c.equipments||[]).length?(c.equipments||[]).map(e=>`<button type="button" class="registry-equipment-row ${e.id===registryEditingEquipmentId?'active':''}" data-id="${e.id}">
    <strong>${escapeHtml((e.tag?e.tag+' — ':'')+(e.name||'Equipamento'))}</strong>
    <span>${escapeHtml([e.manufacturer,e.model,e.capacity].filter(Boolean).join(' | '))}</span>
  </button>`).join(''):'<div class="no-data">Nenhum equipamento cadastrado.</div>';
  eh.querySelectorAll('.registry-equipment-row').forEach(b=>b.onclick=()=>editRegistryEquipment(b.dataset.id));
  renderClientHistory(c.id,registryEditingEquipmentId);
}
document.getElementById('saveClientBtn')?.addEventListener('click',()=>{
  const name=document.getElementById('regClientName').value.trim();
  if(!name){alert('Informe o nome do cliente.');return;}
  const reg=loadRegistry(); let c=reg.clients.find(x=>x.id===registryEditingClientId);
  if(!c) c=reg.clients.find(x=>normalize(x.name)===normalize(name));
  if(!c){c={id:registryUid('C'),equipments:[]};reg.clients.push(c);}
  registryEditingClientId=c.id;
  Object.assign(c,{name,contact:document.getElementById('regClientContact').value,phone:document.getElementById('regClientPhone').value,sector:document.getElementById('regClientSector').value,reportRecipient:document.getElementById('regReportRecipient').value,reportRole:document.getElementById('regReportRole').value,reportEmail:document.getElementById('regReportEmail').value,notes:document.getElementById('regClientNotes').value});
  saveRegistry(reg);renderRegistryManager(document.getElementById('registrySearch').value);renderRegistryEditor();renderRegistrySummary();
  const s=document.getElementById('clientSaveStatus');s.textContent='Salvo.';setTimeout(()=>s.textContent='',1600);
});
document.getElementById('deleteClientBtn')?.addEventListener('click',()=>{
  if(!registryEditingClientId)return;
  if(!confirm('Excluir este cliente e seus equipamentos do cadastro? Os relatórios salvos não serão excluídos.'))return;
  const reg=loadRegistry();reg.clients=reg.clients.filter(c=>c.id!==registryEditingClientId);saveRegistry(reg);
  registryEditingClientId='';registryEditingEquipmentId='';
  document.getElementById('clientEditor').classList.add('hidden');document.getElementById('clientEditorEmpty').classList.remove('hidden');
  renderRegistryManager(document.getElementById('registrySearch').value);renderRegistrySummary();
});

document.getElementById('newEquipmentBtn')?.addEventListener('click',()=>{
  if(!registryEditingClientId){alert('Salve primeiro o cliente.');return;}
  registryEditingEquipmentId='';
  ['regEqName','regEqTag','regEqManufacturer','regEqModel','regEqCapacity','regEqLocation'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('equipmentEditorTitle').textContent='Novo equipamento';
  document.getElementById('equipmentEditor').classList.remove('hidden');
});
function editRegistryEquipment(id){
  registryEditingEquipmentId=id;
  const c=getRegistryClient(registryEditingClientId),e=c?.equipments?.find(x=>x.id===id);if(!e)return;
  const vals={regEqName:e.name,regEqTag:e.tag,regEqManufacturer:e.manufacturer,regEqModel:e.model,regEqCapacity:e.capacity,regEqLocation:e.location};
  Object.entries(vals).forEach(([id,v])=>document.getElementById(id).value=v||'');
  document.getElementById('equipmentEditorTitle').textContent=(e.tag?e.tag+' — ':'')+(e.name||'Equipamento');
  document.getElementById('equipmentEditor').classList.remove('hidden');
  renderRegistryEditor();
}
document.getElementById('saveEquipmentBtn')?.addEventListener('click',()=>{
  const reg=loadRegistry(),c=reg.clients.find(x=>x.id===registryEditingClientId);if(!c)return;
  const name=document.getElementById('regEqName').value.trim(),tag=document.getElementById('regEqTag').value.trim();
  if(!name&&!tag){alert('Informe o equipamento ou a TAG.');return;}
  let e=c.equipments.find(x=>x.id===registryEditingEquipmentId);
  if(!e){e={id:registryUid('E')};c.equipments.push(e);registryEditingEquipmentId=e.id;}
  Object.assign(e,{name,tag,manufacturer:document.getElementById('regEqManufacturer').value,model:document.getElementById('regEqModel').value,capacity:document.getElementById('regEqCapacity').value,location:document.getElementById('regEqLocation').value});
  saveRegistry(reg);renderRegistryEditor();renderRegistryManager(document.getElementById('registrySearch').value);renderRegistrySummary();
});
document.getElementById('deleteEquipmentBtn')?.addEventListener('click',()=>{
  if(!registryEditingEquipmentId)return;
  if(!confirm('Excluir este equipamento do cadastro? Os relatórios salvos não serão excluídos.'))return;
  const reg=loadRegistry(),c=reg.clients.find(x=>x.id===registryEditingClientId);if(!c)return;
  c.equipments=c.equipments.filter(e=>e.id!==registryEditingEquipmentId);saveRegistry(reg);registryEditingEquipmentId='';
  document.getElementById('equipmentEditor').classList.add('hidden');renderRegistryEditor();renderRegistrySummary();
});

function renderClientHistory(clientId,equipmentId=''){
  const host=document.getElementById('clientHistory');if(!host)return;
  const all=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  let list=all.filter(s=>s.registryClientId===clientId || (!s.registryClientId && normalize(s.fields?.cliente)===normalize(getRegistryClient(clientId)?.name)));
  if(equipmentId){
    const c=getRegistryClient(clientId),e=c?.equipments?.find(x=>x.id===equipmentId);
    list=list.filter(s=>s.registryEquipmentId===equipmentId || (!s.registryEquipmentId && e && ((e.tag&&normalize(s.fields?.tag)===normalize(e.tag)) || normalize(s.fields?.equipamento)===normalize(e.name))));
  }
  list.sort((a,b)=>String(b.fields?.data||b.updatedAt||'').localeCompare(String(a.fields?.data||a.updatedAt||'')));
  host.innerHTML=list.length?list.map(s=>`<div class="history-row">
    <div><strong>${formatDate(s.fields?.data)} — ${TYPE_LABELS[s.type]}</strong><span>${escapeHtml((s.fields?.tag?s.fields.tag+' | ':'')+(s.fields?.equipamento||'Equipamento não informado'))}</span></div>
    <span>${escapeHtml(s.fields?.os||'Sem OS')}</span>
  </div>`).join(''):'<div class="no-data">Nenhum atendimento localizado para este cadastro.</div>';
}


function updateBackupStatus(){
  const el=document.getElementById('backupStatus');
  if(!el)return;
  const last=localStorage.getItem('matekservice_last_backup_at');
  if(!last){el.textContent='Dados locais • nenhum backup completo registrado nesta versão.';return;}
  const d=new Date(last);
  el.textContent='Dados locais • último backup: '+d.toLocaleString('pt-BR');
}

async function exportFullBackup(){
  const services=JSON.parse(localStorage.getItem('matekservice_services')||'[]');
  const registry=loadRegistry();
  const actions=loadActions();
  const photoBundles={};
  const db=await dbOpen();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>{
      for(const rec of (req.result||[])) photoBundles[rec.serviceId]=rec;
      resolve();
    };
    req.onerror=()=>reject(req.error);
  });

  const now=new Date().toISOString();
  const payload={
    format:'MatekserviceBackup',
    version:2,
    appVersion:'1.6S',
    exportedAt:now,
    services,
    registry,
    actions,
    photoBundles
  };
  const blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
  const a=document.createElement('a');
  const d=new Date(), pad=n=>String(n).padStart(2,'0');
  a.download=`Matekservice_backup_COMPLETO_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.json`;
  a.href=URL.createObjectURL(blob);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1200);
  localStorage.setItem('matekservice_last_backup_at',now);
  updateBackupStatus();
}

async function importFullBackup(file){
  const text=await file.text();
  const data=JSON.parse(text);
  if(data.format!=='MatekserviceBackup') throw new Error('Arquivo não reconhecido como backup do Matekservice.');
  if(!confirm(`Restaurar backup de ${new Date(data.exportedAt||Date.now()).toLocaleString('pt-BR')}? Os dados locais atuais serão substituídos.`)) return;

  localStorage.setItem('matekservice_services',JSON.stringify(data.services||[]));
  saveRegistry(data.registry||{clients:[]});
  // Backups antigos (v1) não tinham ações. Mantém vazio nesses casos.
  localStorage.setItem(ACTIONS_KEY,JSON.stringify(data.actions||[]));

  const db=await dbOpen();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    const store=tx.objectStore(STORE);
    store.clear();
    for(const rec of Object.values(data.photoBundles||{})) store.put(rec);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });

  localStorage.setItem('matekservice_last_backup_at',new Date().toISOString());
  repairAndImportRegistry();
  renderRegistrySummary();
  renderSaved();
  renderActionCenter();
  renderAgendaSummary();
  updateBackupStatus();
  alert('Backup restaurado com sucesso.');
  showHome();
}

document.getElementById('exportBackupBtn')?.addEventListener('click',()=>exportFullBackup().catch(e=>alert('Não foi possível gerar o backup: '+e.message)));
document.getElementById('importBackupInput')?.addEventListener('change',e=>{
  const f=e.target.files?.[0]; if(!f)return;
  importFullBackup(f).catch(err=>alert('Não foi possível restaurar o backup: '+err.message));
  e.target.value='';
});

function dbOpen(){
  return new Promise((res,rej)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:'serviceId'})};
    req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error);
  });
}
async function savePhotosToDB(serviceId, photoList, itemPhotoMap={}){
  const db=await dbOpen();
  return new Promise((res,rej)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({serviceId,photos:photoList,itemPhotos:itemPhotoMap});
    tx.oncomplete=res; tx.onerror=()=>rej(tx.error);
  });
}
async function loadPhotosFromDB(serviceId){
  const db=await dbOpen();
  return new Promise((res,rej)=>{
    const req=db.transaction(STORE).objectStore(STORE).get(serviceId);
    req.onsuccess=()=>res({general:req.result?.photos||[],items:req.result?.itemPhotos||{}});
    req.onerror=()=>rej(req.error);
  });
}
async function deletePhotosFromDB(serviceId){
  const db=await dbOpen();
  return new Promise((res,rej)=>{
    const req=db.transaction(STORE,'readwrite').objectStore(STORE).delete(serviceId);
    req.onsuccess=res; req.onerror=()=>rej(req.error);
  });
}

if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js').catch(()=>{}); }



const TECHNICIANS={
  mauricio:{name:'Mauricio Ribeiro',role:'Engenheiro Mecânico',id:'CREA 5060167625-SP'},
  caique:{name:'Hallef Caique da Silva',role:'Técnico Mecânico',id:'RG 38300081-6'}
};
function selectedTech(){
  const name=current?.fields?.tecnico||'Mauricio Ribeiro';
  return Object.values(TECHNICIANS).find(t=>t.name===name)||{name,role:'',id:''};
}
// A1.0 — assinaturas removidas. A identificação profissional permanece no relatório.
(function(){
  const sel=document.getElementById('presetTechnician');
  sel?.addEventListener('change',()=>{ if(current){ current.fields=current.fields||{}; current.fields.tecnico=sel.value; current.updatedAt=new Date().toISOString(); }});
})();


// A1.0 Oficial r2 — inicialização robusta após recarregar a página.
function initializeMatekservice(){
  try{
    showHome();
    const openDash=document.getElementById('openDashboardMain');
    if(openDash) openDash.onclick=()=>showDashboard();
    updateBackupStatus?.();
  }catch(err){
    console.error('Falha na inicialização do Matekservice:',err);
  }
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', initializeMatekservice, {once:true});
}else{
  initializeMatekservice();
}
