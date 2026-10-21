import { Bell, Bot, ChevronLeft, CloudSun, Droplets, FileHeart, LayoutDashboard, Leaf, Menu, Search, ShieldAlert, Sprout, Store, Wheat, TestTube } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

// 1. IMPORT YOUR TRANSLATION FILES
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';

export function Layout({children}:{children:React.ReactNode}) { 
  const [open,setOpen]=useState(false); 
  const [search,setSearch]=useState(false); 
  const loc=useLocation(); 
  const guest=localStorage.getItem('kisansetu_mode')!=='account'; 
  
  // 2. INITIALIZE THE TRANSLATION HOOK
  const { t } = useLanguage();

  // 3. MOVE NAV ARRAY INSIDE so it can dynamically read the translation t() function
  const navItems = [
    ['/dashboard', t('nav.dashboard'), LayoutDashboard],
    ['/my-farm', t('nav.myFarm'), Sprout],
    ['/crop-advisor', t('nav.cropAdvisor'), Wheat],
    ['/crops', t('nav.cropLibrary'), Leaf],
    ['/weather', t('nav.weather'), CloudSun],
    ['/risk-radar', t('nav.riskRadar'), ShieldAlert],
    ['/mandi', t('nav.mandiBhav'), Store],
    ['/schemes', t('nav.schemes'), FileHeart]
  ] as const;
  
  return (
    <div className="app-shell">
      <aside className={open?'sidebar open':'sidebar'}>
        <div className="brand">
          <span className="brand-mark"><Sprout size={22}/></span>
          <span><b>KisanSetu</b><small>SMART FARM INTELLIGENCE</small></span>
          <button className="icon mobile-only" onClick={()=>setOpen(false)}><ChevronLeft/></button>
        </div>
        <nav>
          {/* Update nav.map to navItems.map */}
          {navItems.map(([to,label,Icon]: any)=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><Icon size={18}/>{label}</NavLink>)}
          
          <p className="nav-label">RESILIENCE</p>
          <NavLink to="/disaster-playbooks" onClick={()=>setOpen(false)}><ShieldAlert size={18}/>{t('nav.playbooks')}</NavLink>
          <NavLink to="/post-flood-assessment" onClick={()=>setOpen(false)}><Droplets size={18}/>{t('nav.floodAssessment')}</NavLink>
          <NavLink to="/relief" onClick={()=>setOpen(false)}><FileHeart size={18}/>{t('nav.reliefClaims')}</NavLink>
          <NavLink to="/pest-disease" onClick={()=>setOpen(false)}><Leaf size={18}/>{t('nav.pestDisease')}</NavLink>
          <NavLink to="/soil-testing" onClick={()=>setOpen(false)}><TestTube size={18}/>{t('nav.soilTesting')}</NavLink>
        </nav>
        <div className="offline">
          <span/> {navigator.onLine ? t('common.online') : t('common.offline')}<br/><small>Last synced 10 min ago</small>
        </div>
      </aside>
      
      <section className="workspace">
        <header>
          <button className="icon mobile-only" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button>
          <div><b>{navItems.find(x=>x[0]===loc.pathname)?.[1]||'KisanSetu'}</b><small>{localStorage.getItem('kisansetu_location')||'Sehore, Madhya Pradesh'}</small></div>
          
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* 4. INTEGRATE THE LANGUAGE TOGGLE BUTTON */}
            <LanguageToggle />

            <button className="search" onClick={()=>setSearch(true)}><Search size={17}/> {t('common.searchPlaceholder')} <kbd>⌘ K</kbd></button>
            <NavLink className="icon" to="/notifications" aria-label="Notifications"><Bell size={19}/><i/></NavLink>
            <NavLink className="avatar" to="/login" aria-label={guest?'Sign in or continue as guest':'Account'}>{guest?'G':(localStorage.getItem('kisansetu_name')||'RS').slice(0,2).toUpperCase()}</NavLink>
          </div>
        </header>
        
        {/* Main Content Rendered Here */}
        {children}
      </section>
      
      {search&&<SearchDialog close={()=>setSearch(false)}/>}
      
      {/* Ask AgriRecover Floating Action Button (Green, Bottom Right) */}
      <NavLink className="mitra-fab" to="/assistant"><Bot size={20}/> <span>{t('common.askAssistant')}</span></NavLink>
    </div>
  );
}

function SearchDialog({close}:{close:()=>void}) { 
  const [q,setQ]=useState(''); 
  const items=['Soybean crop guide','Soybean mandi prices','Yellow mosaic disease','PM Fasal Bima Yojana','Flood recovery playbook']; 
  return (
    <div className="dialog-backdrop" onMouseDown={close}>
      <div className="search-dialog" onMouseDown={e=>e.stopPropagation()}>
        <Search size={19}/>
        <input autoFocus placeholder="Search KisanSetu" value={q} onChange={e=>setQ(e.target.value)}/>
        <button onClick={close}>Esc</button>
        <div>
          {items.filter(x=>x.toLowerCase().includes(q.toLowerCase())).map(x=><button key={x} onClick={close}>{x}<span>Open →</span></button>)}
        </div>
      </div>
    </div>
  );
}