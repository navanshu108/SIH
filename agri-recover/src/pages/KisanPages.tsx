import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Bot, Check, ChevronRight, CloudRain, Droplets,
  FileUp, Leaf, MapPin, Mic, Navigation, Plus, Send, ShieldAlert, Sparkles,
  Sprout, ThermometerSun, Upload, Volume2, Wind,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { crops } from "../data/cropsIndia";
import { alerts, diagnosePlant, mandi, schemes } from "../services/mockServices";
import { askAssistant } from "../services/assistantService";
import { getLiveContext, getLiveContextForLocation, getSavedLocationContext, reverseGeocode, type LiveContext } from "../services/liveContextService";
import { LocationMap } from "../components/LocationMap";

// ── Shared micro-components ────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={"card " + className}>{children}</section>
);
const Badge = ({ level }: { level: string }) => (
  <span className={"badge " + level.toLowerCase().replace(/\s+/g, "-")}>{level}</span>
);
const Title = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) => (
  <div className="page-title">
    <span>{eyebrow}</span>
    <h1>{title}</h1>
    <p>{copy}</p>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────
export function Dashboard() {
  const [done, setDone] = useState([false, false, false]);
  const [wx, setWx] = useState<LiveContext | null>(null);
  const userName = localStorage.getItem("kisansetu_name") || "Farmer";
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  useEffect(() => {
    getSavedLocationContext().then(ctx => { if (ctx) setWx(ctx); });
  }, []);

  const riskLevel = wx ? (wx.rainProbability >= 70 ? "High" : wx.rainProbability >= 40 ? "Moderate" : "Low") : "–";
  const riskDetail = wx ? `Rainfall · ${wx.rainProbability}% chance` : "Set location for live data";
  const riskTone = wx ? (wx.rainProbability >= 70 ? "orange" : "green") : "green";

  return (
    <main>
      <div className="welcome">
        <div>
          <p>{dayStr}</p>
          <h1>{greeting}, {userName} <span>👋</span></h1>
          <h2>Your soybean crop is in its <b>vegetative stage.</b></h2>
        </div>
        <Link className="button light" to="/crop-advisor">View crop advice <ArrowRight size={16} /></Link>
      </div>
      {wx && wx.rainProbability >= 40 && (
        <div className="critical">
          <AlertTriangle size={20} />
          <div>
            <b>{wx.rainProbability >= 70 ? "Heavy" : "Moderate"} rainfall risk · next 12 hours</b>
            <span>{wx.location} · {wx.rainProbability}% precipitation probability.</span>
          </div>
          <Link to="/risk-radar">View risk radar <ChevronRight size={17} /></Link>
        </div>
      )}
      <div className="metrics">
        <Metric icon={<CloudRain />} label="Weather" value={wx ? `${wx.temperature}°` : "–"} detail={wx ? `Rain likely · ${wx.rainProbability}%` : "Set location"} tone="blue" />
        <Metric icon={<Droplets />} label="Humidity" value={wx ? `${wx.humidity}%` : "–"} detail={wx ? `Feels like ${wx.feelsLike}°C` : "Set location"} tone="green" />
        <Metric icon={<Leaf />} label="Crop health" value="82 / 100" detail="Monitor yellow mosaic" tone="green" />
        <Metric icon={<ShieldAlert />} label="Disaster risk" value={riskLevel} detail={riskDetail} tone={riskTone} />
      </div>
      <div className="grid-2">
        <Card>
          <div className="card-head">
            <div><span className="eyebrow">7-DAY OUTLOOK</span><h3>Weather intelligence</h3></div>
            <Link to="/weather">Full forecast →</Link>
          </div>
          {wx ? (
            <>
              <div className="weather-now">
                <CloudRain />
                <div><b>{wx.temperature}°C</b><span>{wx.location}</span></div>
                <div><strong>{wx.humidity}%</strong><small>Humidity</small></div>
                <div><strong>{wx.wind} km/h</strong><small>Wind</small></div>
              </div>
              <div className="chart small">
                <ResponsiveContainer>
                  <AreaChart data={wx.dailyForecast}>
                    <defs>
                      <linearGradient id="rain" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#0284c7" stopOpacity=".32" />
                        <stop offset="1" stopColor="#0284c7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" /><Tooltip formatter={(v: number) => [`${v} mm`, "Rain"]} />
                    <Area dataKey="rain" stroke="#0284c7" fill="url(#rain)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="weather-loading">
              <CloudRain size={28} />
              <span>Set your location to see live weather</span>
              <Link className="button secondary" to="/location">Set location</Link>
            </div>
          )}
        </Card>
        <Card>
          <div className="card-head">
            <div><span className="eyebrow">YOUR PRIMARY CROP</span><h3>Soybean health</h3></div>
            <Link to="/crops/soybean">Crop guide →</Link>
          </div>
          <div className="crop-health">
            <div className="leaf-orb"><Leaf /></div>
            <div>
              <b>82<span>/100</span></b>
              <p>Healthy · needs attention</p>
              <div className="progress"><i style={{ width: "82%" }} /></div>
            </div>
          </div>
          <div className="advisory"><Sparkles size={17} /><span>Inspect lower leaves this week for yellow mosaic symptoms.</span></div>
        </Card>
      </div>
      <div className="grid-3">
        <Card className="span-2">
          <div className="card-head">
            <div><span className="eyebrow">MARKET INTELLIGENCE</span><h3>Soybean · Indore mandi</h3></div>
            <Link to="/mandi">View Mandi Bhav →</Link>
          </div>
          <div className="market">
            <b>₹4,850 <small>/ quintal</small></b>
            <span>▲ 3.8% this week</span>
          </div>
          <div className="chart">
            <ResponsiveContainer>
              <AreaChart data={mandi}>
                <XAxis dataKey="day" /><YAxis hide domain={["dataMin - 30", "dataMax + 30"]} /><Tooltip />
                <Area dataKey="price" stroke="#166534" fill="#dcfce7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div><span className="eyebrow">TODAY'S PRIORITIES</span><h3>Farm tasks</h3></div>
            <b>3</b>
          </div>
          {["Clear drainage channels", "Inspect soybean leaves", "Check local mandi price"].map((x, i) => (
            <label className="task" key={x}>
              <input type="checkbox" checked={done[i]} onChange={() => setDone(d => d.map((v, j) => j === i ? !v : v))} />
              <span>{x}<small>{i === 0 ? "High priority" : i === 1 ? "Due today" : "Market check"}</small></span>
            </label>
          ))}
          <Link to="/my-farm" className="text-link">Open farm planner →</Link>
        </Card>
      </div>
    </main>
  );
}


function Metric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string }) {
  return (
    <Card className="metric">
      <span className={"metric-icon " + tone}>{icon}</span>
      <div><small>{label}</small><b>{value}</b><em>{detail}</em></div>
    </Card>
  );
}

// ── Weather ────────────────────────────────────────────────────────────────
export function Weather() {
  const [wx, setWx] = useState<LiveContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSavedLocationContext()
      .then(ctx => { setWx(ctx ?? null); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main>
        <Title eyebrow="LOCAL CONDITIONS" title="Weather intelligence" copy="Loading live conditions for your saved location…" />
        <Card className="empty-state"><CloudRain size={34} /><p>Fetching live weather from Open-Meteo…</p></Card>
      </main>
    );
  }

  if (!wx) {
    return (
      <main>
        <Title eyebrow="LOCAL CONDITIONS" title="Weather intelligence" copy="No location set. Go to Location to pick your farming area." />
        <Card className="empty-state">
          <CloudRain size={34} />
          <h2>No location set</h2>
          <p>Set your farm location to see real weather conditions.</p>
          <Link className="button" to="/location"><MapPin size={15} /> Set location</Link>
        </Card>
      </main>
    );
  }

  const updatedTime = new Date(wx.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <main>
      <Title
        eyebrow="LOCAL CONDITIONS"
        title="Weather intelligence"
        copy={`Live data for ${wx.location} · Updated ${updatedTime} · Source: Open-Meteo forecast model`}
      />
      <div className="weather-hero">
        <div>
          <span>NOW · {wx.location.toUpperCase()}</span>
          <b>{wx.temperature}°</b>
          <p>Feels like {wx.feelsLike}°C · {wx.rainProbability}% rain probability</p>
        </div>
        <CloudRain size={86} />
        <div className="weather-stats">
          <p><Droplets /> Humidity <b>{wx.humidity}%</b></p>
          <p><Wind /> Wind <b>{wx.wind} km/h</b></p>
          <p><CloudRain /> Rain (24 h) <b>{wx.maxRain24h} mm</b></p>
          <p><ThermometerSun /> Max today <b>{wx.maxTemp24h}°C</b></p>
        </div>
      </div>
      <Card>
        <div className="card-head">
          <div><span className="eyebrow">7-DAY TREND</span><h3>Rainfall &amp; temperature</h3></div>
          <span className="live-badge">● Live</span>
        </div>
        <div className="chart large">
          <ResponsiveContainer>
            <AreaChart data={wx.dailyForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="rain" orientation="left" unit=" mm" />
              <YAxis yAxisId="temp" orientation="right" unit="°C" />
              <Tooltip formatter={(v: number, name: string) => name === "rain" ? [`${v} mm`, "Rainfall"] : [`${v}°C`, "Max Temp"]} />
              <Area yAxisId="rain" dataKey="rain" name="rain" stroke="#0284c7" fill="#e0f2fe" strokeWidth={2} />
              <Area yAxisId="temp" dataKey="temp" name="temp" stroke="#d97706" fill="transparent" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <small className="risk-disclaimer">Source: Open-Meteo forecast model · {wx.location} · {wx.latitude.toFixed(4)}°N, {wx.longitude.toFixed(4)}°E · Not an official IMD forecast.</small>
      </Card>
    </main>
  );
}


// ── Risk Radar ─────────────────────────────────────────────────────────────
type HazardLevel = "WATCH" | "MONITOR" | "CLEAR";

interface HazardSignal {
  id: string;
  icon: React.ReactNode;
  title: string;
  level: HazardLevel;
  value: string;
  detail: string;
  action: string;
}

function buildHazards(ctx: LiveContext): HazardSignal[] {
  const signals: HazardSignal[] = [];

  const rain = ctx.rainProbability;
  const rainLevel: HazardLevel = rain >= 70 ? "WATCH" : rain >= 40 ? "MONITOR" : "CLEAR";
  signals.push({
    id: "rain",
    icon: <CloudRain size={22} />,
    title: "Rainfall risk",
    level: rainLevel,
    value: `${rain}% probability`,
    detail: `Expected accumulation: ${ctx.maxRain24h} mm in 24 h`,
    action: rainLevel === "WATCH"
      ? "Clear drainage channels before rain arrives. Move harvested produce to shelter."
      : rainLevel === "MONITOR"
      ? "Monitor rainfall and inspect drainage. Avoid unnecessary irrigation."
      : "No elevated rain signal. Continue routine monitoring.",
  });

  const temp = ctx.maxTemp24h;
  const heatLevel: HazardLevel = temp >= 42 ? "WATCH" : temp >= 38 ? "MONITOR" : "CLEAR";
  signals.push({
    id: "heat",
    icon: <ThermometerSun size={22} />,
    title: "Heat stress",
    level: heatLevel,
    value: `${temp}°C max today`,
    detail: `Feels like ${ctx.feelsLike}°C · Humidity ${ctx.humidity}%`,
    action: heatLevel === "WATCH"
      ? "Irrigate early morning. Avoid pesticide spraying during peak heat. Provide shade for livestock."
      : heatLevel === "MONITOR"
      ? "Schedule field work for early morning or evening. Ensure animals have water access."
      : "Temperature within normal range.",
  });

  const wind = ctx.wind;
  const windLevel: HazardLevel = wind >= 50 ? "WATCH" : wind >= 30 ? "MONITOR" : "CLEAR";
  signals.push({
    id: "wind",
    icon: <Wind size={22} />,
    title: "Wind advisory",
    level: windLevel,
    value: `${wind} km/h`,
    detail: "10-metre wind speed (current)",
    action: windLevel === "WATCH"
      ? "Secure lightweight equipment and covers. Delay spraying — drift risk is high."
      : windLevel === "MONITOR"
      ? "Be cautious with spraying operations. Check for crop lodging."
      : "Wind is calm. No advisory.",
  });

  const rain7 = ctx.rain7daySum;
  const droughtLevel: HazardLevel = rain7 < 5 ? "WATCH" : rain7 < 20 ? "MONITOR" : "CLEAR";
  signals.push({
    id: "drought",
    icon: <Droplets size={22} />,
    title: "Dry spell indicator",
    level: droughtLevel,
    value: `${rain7} mm / 7 days`,
    detail: "Forecast rain over next 7 days",
    action: droughtLevel === "WATCH"
      ? "Prioritise irrigation for critical crop stages. Use mulch and conserve soil moisture."
      : droughtLevel === "MONITOR"
      ? "Monitor soil moisture. Consider supplemental irrigation if conditions worsen."
      : "Adequate rain forecast. No dry-spell concern.",
  });

  return signals;
}

const levelColor: Record<HazardLevel, string> = {
  WATCH: "#b91c1c",
  MONITOR: "#a16207",
  CLEAR: "#167344",
};

function HazardCard({ signal }: { signal: HazardSignal }) {
  return (
    <Card className={`hazard-card hazard-${signal.level.toLowerCase()}`}>
      <div className="hazard-header">
        <span className={`hazard-icon hazard-icon--${signal.level.toLowerCase()}`}>{signal.icon}</span>
        <div>
          <Badge level={signal.level} />
          <h3>{signal.title}</h3>
        </div>
        <b className="hazard-value" style={{ color: levelColor[signal.level] }}>{signal.value}</b>
      </div>
      <p className="hazard-detail">{signal.detail}</p>
      <div className="hazard-action"><Check size={15} />{signal.action}</div>
    </Card>
  );
}

export function RiskRadar() {
  const [context, setContext] = useState<LiveContext | undefined>(() => {
    const lat = Number(localStorage.getItem("kisansetu_lat"));
    const lng = Number(localStorage.getItem("kisansetu_lng"));
    const loc = localStorage.getItem("kisansetu_location");
    if (lat && lng && loc) return undefined;
    return undefined;
  });
  const [loading, setLoading] = useState(false);
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    const lat = Number(localStorage.getItem("kisansetu_lat"));
    const lng = Number(localStorage.getItem("kisansetu_lng"));
    const loc = localStorage.getItem("kisansetu_location") ?? "Saved location";
    if (lat && lng) {
      setLoading(true);
      getLiveContextForLocation(lat, lng, loc).then(ctx => { setContext(ctx); setLoading(false); });
    }
  }, []);

  async function refreshGPS() {
    setLoading(true);
    const ctx = await getLiveContext();
    setContext(ctx);
    setLoading(false);
  }

  const hazards = context ? buildHazards(context) : [];
  const savedLat = Number(localStorage.getItem("kisansetu_lat")) || 23.2599;
  const savedLng = Number(localStorage.getItem("kisansetu_lng")) || 77.4126;
  const savedLoc = localStorage.getItem("kisansetu_location") || "Bhopal, Madhya Pradesh";

  return (
    <main>
      <Title
        eyebrow="EVIDENCE-LED RISK VIEW"
        title="Risk radar"
        copy="Signals derived from Open-Meteo forecast model for your saved location. These are weather model outputs — not official IMD, NDMA, or government disaster alerts."
      />

      <Card className="risk-live">
        <div>
          <b>{context?.source === "live" ? "Live weather signal" : loading ? "Loading…" : "No location data yet"}</b>
          <span>
            {context?.source === "live"
              ? `${context.location} · updated ${new Date(context.updatedAt).toLocaleTimeString()}`
              : "Set your location first, or use GPS to load real conditions."}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/location" className="button secondary"><MapPin size={14} /> Change location</Link>
          <button className="button" onClick={refreshGPS}>{loading ? "Refreshing…" : <><Navigation size={14} /> Use my GPS</>}</button>
        </div>
      </Card>

      {context ? (
        <>
          <div className="hazard-grid">
            {hazards.map(h => <HazardCard key={h.id} signal={h} />)}
          </div>
          <small className="risk-disclaimer">
            ⓘ All values are from the Open-Meteo forecast model ({new Date(context.updatedAt).toLocaleString()}).
            They are <b>not</b> official government alerts. For official disaster warnings, follow IMD, NDMA, and your state disaster management authority.
          </small>
        </>
      ) : !loading ? (
        <Card className="empty-state">
          <ShieldAlert size={34} />
          <h2>Choose a real location</h2>
          <p>Set your farm location to see weather-model risk signals based on actual forecast data.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="button" to="/location"><MapPin size={15} /> Set location</Link>
            <button className="button secondary" onClick={refreshGPS}>Use GPS instead</button>
          </div>
        </Card>
      ) : (
        <Card className="empty-state"><p>Loading weather data…</p></Card>
      )}

      <h2 className="section-title">Your location on the map</h2>
      <div className="card risk-map-card">
        <LocationMap
          latitude={context?.latitude ?? savedLat}
          longitude={context?.longitude ?? savedLng}
          accuracyMetres={context?.accuracyMetres}
          height={300}
        />
        <div className="risk-map-label">
          <MapPin size={12} />
          {context?.location ?? savedLoc} — {(context?.latitude ?? savedLat).toFixed(5)}°N, {(context?.longitude ?? savedLng).toFixed(5)}°E
        </div>
      </div>

      <h2 className="section-title">Preparedness guides</h2>
      <div className="alerts">
        {alerts.map(a => (
          <Card className="alert" key={a.title}>
            <Badge level="GUIDANCE" />
            <h3>{a.title}</h3>
            <p>Offline preparedness guidance — not a live alert.</p>
            <div><Check size={16} />{a.action}</div>
          </Card>
        ))}
      </div>
    </main>
  );
}

// ── Crop Library ────────────────────────────────────────────────────────────
export function CropLibrary() {
  const [season, setSeason] = useState("All");
  const [q, setQ] = useState("");
  const visible = crops.filter(c => (season === "All" || c.season === season) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <main>
      <Title eyebrow="OFFLINE CROP DATABASE" title="Crop library" copy="Practical crop profiles for Indian conditions. Local guidance may differ." />
      <div className="toolbar">
        <input aria-label="Search crop" placeholder="Search crops" value={q} onChange={e => setQ(e.target.value)} />
        <div>{["All", "Kharif", "Rabi", "Zaid", "Horticulture"].map(x => (
          <button key={x} className={season === x ? "selected" : ""} onClick={() => setSeason(x)}>{x}</button>
        ))}</div>
      </div>
      <div className="crop-grid">
        {visible.map(c => (
          <Link to={"/crops/" + c.id} className="crop-card" key={c.id}>
            <div><span>{c.season}</span><b>{c.name}</b><small>{c.localName}</small></div>
            <i>{c.suitability}%<small>match</small></i>
            <p>{c.duration} · {c.water} water</p>
            <em>{c.soil.join(" · ")} soil</em>
          </Link>
        ))}
      </div>
    </main>
  );
}

// ── Crop Details ────────────────────────────────────────────────────────────
export function CropDetails() {
  const { id } = useParams();
  const c = crops.find(x => x.id === id) || crops[0];
  return (
    <main>
      <Link className="back" to="/crops">← Crop library</Link>
      <div className="detail-head">
        <div><span>{c.season} CROP</span><h1>{c.name}</h1><p>{c.localName} · Typical duration {c.duration}</p></div>
        <Badge level="HEALTHY" />
      </div>
      <div className="grid-3">
        <Card><span className="eyebrow">SOIL &amp; WATER</span><h3>{c.soil.join(" / ")}</h3><p>{c.water} water requirement</p></Card>
        <Card><span className="eyebrow">CURRENT STAGE</span><h3>{c.stage}</h3><p>Monitor crop condition weekly.</p></Card>
        <Card><span className="eyebrow">FIELD NOTE</span><h3>General advisory</h3><p>{c.advice}</p></Card>
      </div>
      <Card>
        <span className="eyebrow">PESTS &amp; DISEASE WATCH</span>
        <h3>Regular checks matter</h3>
        <p>{c.pests.join(" · ")}. Do not use pesticide based on an app result alone; seek local expert confirmation.</p>
      </Card>
    </main>
  );
}

// ── Crop Advisor ────────────────────────────────────────────────────────────
export function CropAdvisor() {
  const [soil, setSoil] = useState("Black");
  const [water, setWater] = useState("Medium");
  const rec = useMemo(() => crops.filter(c => c.soil.includes(soil) && c.water === water).slice(0, 3), [soil, water]);
  return (
    <main>
      <Title eyebrow="PERSONALISED DISCOVERY" title="Crop advisor" copy="Compare likely fit using your soil, season, water availability and risk preference." />
      <Card className="advisor">
        <div className="form-grid">
          <label>Location<select><option>Sehore, Madhya Pradesh</option><option>Indore, Madhya Pradesh</option></select></label>
          <label>Season<select><option>Kharif</option><option>Rabi</option></select></label>
          <label>Soil type<select value={soil} onChange={e => setSoil(e.target.value)}><option>Black</option><option>Loamy</option><option>Sandy loam</option></select></label>
          <label>Water availability<select value={water} onChange={e => setWater(e.target.value)}><option>Medium</option><option>Low</option><option>High</option></select></label>
          <label>Farm size<input defaultValue="4.5 acres" /></label>
          <label>Risk tolerance<select><option>Balanced</option><option>Low risk</option><option>Higher opportunity</option></select></label>
        </div>
      </Card>
      <h2 className="section-title">Recommended for your field</h2>
      <div className="recommendations">
        {rec.map(c => (
          <Card key={c.id} className="recommend">
            <div><Badge level="GOOD FIT" /><h3>{c.name}</h3><p>{c.season} · {c.soil[0]} soil · {c.duration}</p></div>
            <b>{c.suitability}%<small> suitability</small></b>
            <Link className="button secondary" to={"/crops/" + c.id}>View crop guide</Link>
          </Card>
        ))}
      </div>
    </main>
  );
}

// ── Mandi ──────────────────────────────────────────────────────────────────
export function Mandi() {
  return (
    <main>
      <Title eyebrow="MARKET INTELLIGENCE" title="Mandi Bhav" copy="Indicative mock prices, for exploration only. Confirm prices and quality terms at the mandi." />
      <Card className="mandi-top">
        <div>
          <label>Crop<select><option>Soybean</option><option>Wheat</option><option>Maize</option></select></label>
          <label>Mandi<select><option>Indore</option><option>Bhopal</option></select></label>
        </div>
        <span>Today's average</span>
        <b>₹4,850 <small>/ quintal</small></b>
        <em>▲ 3.8% this week</em>
        <p>Range ₹4,600 – ₹5,020</p>
      </Card>
      <Card>
        <div className="card-head"><div><span className="eyebrow">7-DAY PRICE TREND</span><h3>Soybean · Indore</h3></div></div>
        <div className="chart large">
          <ResponsiveContainer>
            <BarChart data={mandi}>
              <XAxis dataKey="day" /><YAxis domain={["dataMin - 100", "dataMax + 100"]} /><Tooltip />
              <Bar dataKey="price" fill="#166534" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </main>
  );
}

// ── Schemes ────────────────────────────────────────────────────────────────
export function Schemes() {
  return (
    <main>
      <Title eyebrow="OFFICIAL ASSISTANCE" title="Government scheme navigator" copy="Explore commonly referenced programmes. Always confirm eligibility, dates and portals through authorised sources." />
      <div className="scheme-grid">
        {schemes.map(s => (
          <Card key={s.name} className="scheme">
            <span className="scheme-icon">🏛</span>
            <h3>{s.name}</h3>
            <p>{s.benefit}</p>
            <div><b>Typical documents</b><span>{s.docs}</span></div>
            <a className="button secondary" href={s.url} target="_blank" rel="noreferrer">{s.status} ↗</a>
          </Card>
        ))}
      </div>
    </main>
  );
}

// ── Disaster Playbooks ─────────────────────────────────────────────────────
export function DisasterPlaybooks() {
  const [kind, setKind] = useState("Flood");
  const data: Record<string, string[]> = {
    Flood: ["Clear drains and move equipment to higher ground.", "Do not enter fast-moving water or apply fertiliser before assessment.", "After water recedes, document loss and inspect crop roots."],
    Drought: ["Prioritise irrigation for critical growth stages.", "Do not apply fertiliser to severely moisture-stressed crops.", "Use mulch and follow local water scheduling guidance."],
    Heatwave: ["Irrigate early morning when suitable.", "Do not spray in peak heat.", "Provide shade or water access for livestock."],
    Hailstorm: ["Move available harvested produce under cover.", "Do not rush to prune damaged crops immediately.", "Photograph losses and contact local authorities."],
  };
  return (
    <main>
      <Title eyebrow="EMERGENCY GUIDES" title="Disaster playbooks" copy="Simple action lists that remain available offline. Follow local emergency instructions first." />
      <div className="tabs">
        {Object.keys(data).map(x => <button className={kind === x ? "selected" : ""} key={x} onClick={() => setKind(x)}>{x}</button>)}
      </div>
      <Card className="playbook">
        <Badge level="PRIORITY NOW" />
        <h2>{kind} response guide</h2>
        {data[kind].map((x, i) => <div className="play-step" key={x}><b>0{i + 1}</b><p>{x}</p></div>)}
        <div className="materials"><b>Keep ready</b><span>Phone/camera · field record · clean water · local helpline details</span></div>
      </Card>
    </main>
  );
}

// ── Pest & Disease ─────────────────────────────────────────────────────────
export function PestDisease() {
  const [symptom, setSymptom] = useState("Yellow leaves");
  const [result, setResult] = useState<any>();
  const [loading, setLoading] = useState(false);
  async function go() { setLoading(true); setResult(await diagnosePlant(symptom)); setLoading(false); }
  return (
    <main>
      <Title eyebrow="ADVISORY-ONLY SCREENING" title="Pest &amp; disease center" copy="Image and symptom screening are mock prototype results, not a diagnosis or treatment prescription." />
      <div className="diagnose">
        <Card>
          <label>Crop<select><option>Soybean</option><option>Tomato</option><option>Cotton</option></select></label>
          <label>What do you see?
            <select value={symptom} onChange={e => setSymptom(e.target.value)}>
              <option>Yellow leaves</option><option>Brown leaf spots</option><option>Leaf curling</option>
            </select>
          </label>
          <label className="upload"><Upload /><span>Upload a plant image</span><input type="file" accept="image/*" /></label>
          <button className="button" onClick={go}>{loading ? "Checking…" : "Check symptoms"} <ArrowRight size={16} /></button>
        </Card>
        {result ? (
          <Card className="result">
            <Badge level="POSSIBLE MATCH" />
            <h2>{result.name} <span>{result.confidence}%</span></h2>
            <p>{result.symptoms}</p>
            <h4>Immediate field check</h4><p>{result.immediate}</p>
            <h4>Organic approach</h4><p>{result.organic}</p>
            <h4>Chemical treatment</h4><p>{result.chemical}</p>
          </Card>
        ) : (
          <Card className="result empty"><Leaf size={36} /><h3>Start a screening</h3><p>Add a symptom or image to see a demo advisory.</p></Card>
        )}
      </div>
    </main>
  );
}

// ── My Farm ────────────────────────────────────────────────────────────────
export function MyFarm() {
  const [fields, setFields] = useState([
    { name: "North field", area: "2.0 acres", crop: "Soybean", day: 42 },
    { name: "Canal plot", area: "1.5 acres", crop: "Maize", day: 31 },
    { name: "Home plot", area: "1.0 acre", crop: "Vegetables", day: 16 },
  ]);
  const [adding, setAdding] = useState(false);
  return (
    <main>
      <Title eyebrow="YOUR FARM" title="Farm overview" copy="A private local dashboard for fields, crop stages, tasks and records." />
      <div className="farm-summary">
        <Card><small>TOTAL AREA</small><b>4.5 acres</b><span>3 active fields</span></Card>
        <Card><small>ACTIVE CROPS</small><b>3</b><span>Soybean primary crop</span></Card>
        <Card><small>FARM HEALTH</small><b>82 / 100</b><span>Good · attention needed</span></Card>
      </div>
      <div className="card-head fields-head">
        <div><span className="eyebrow">FIELD REGISTER</span><h2>Your fields</h2></div>
        <button className="button" onClick={() => setAdding(true)}><Plus size={16} /> Add field</button>
      </div>
      <div className="field-list">
        {fields.map(f => (
          <Card className="field" key={f.name}>
            <div className="field-icon"><Sprout /></div>
            <div><h3>{f.name}</h3><p>{f.area} · {f.crop}</p></div>
            <div className="field-stage">
              <b>Day {f.day} <small>/ 105</small></b>
              <div className="progress"><i style={{ width: (f.day / 105) * 100 + "%" }} /></div>
              <span>Vegetative → Flowering</span>
            </div>
            <button className="button secondary">View field</button>
          </Card>
        ))}
      </div>
      {adding && (
        <div className="dialog-backdrop">
          <div className="modal">
            <button className="close" onClick={() => setAdding(false)}>×</button>
            <h2>Add a field</h2>
            <input placeholder="Field name" autoFocus />
            <input placeholder="Area (e.g. 1.5 acres)" />
            <select><option>Soybean</option><option>Maize</option><option>Wheat</option></select>
            <button className="button" onClick={() => { setFields([...fields, { name: "New field", area: "1 acre", crop: "Soybean", day: 1 }]); setAdding(false); }}>Save field</button>
          </div>
        </div>
      )}
    </main>
  );
}

// ── Relief ─────────────────────────────────────────────────────────────────
export function Relief() {
  const [selected, setSelected] = useState("Flood");
  const docs = ["Identity document", "Land record", "Bank details", "Crop details", "Crop-loss evidence", "Insurance information", "Local authority report"];
  const [checked, setChecked] = useState<boolean[]>(docs.map(() => false));
  return (
    <main>
      <Title eyebrow="RECOVERY SUPPORT" title="Relief &amp; claims navigator" copy="Typical checklist only — requirements vary by state, scheme, incident and insurer." />
      <Card>
        <label>What happened?
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            {["Flood", "Drought", "Hailstorm", "Cyclone", "Pest outbreak", "Crop loss"].map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
        <div className="relief-callout">
          <ShieldAlert />
          <div><b>{selected} support checklist</b><p>Document field condition promptly and contact the appropriate local agriculture office or insurer.</p></div>
        </div>
        <h3>Typical supporting documents</h3>
        {docs.map((x, i) => (
          <label className="task" key={x}>
            <input type="checkbox" checked={checked[i]} onChange={() => setChecked(checked.map((v, j) => i === j ? !v : v))} />
            <span>{x}</span>
          </label>
        ))}
        <button className="button"><FileUp size={16} /> Generate checklist</button>
      </Card>
    </main>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────
export function Notifications() {
  const [read, setRead] = useState<number[]>([]);
  const notes = [
    ...alerts.map(a => ({ title: a.title, body: a.action, priority: a.level })),
    { title: "Task reminder", body: "Inspect soybean leaves today.", priority: "MODERATE" },
    { title: "Scheme update", body: "Review PM Fasal Bima details before the local window closes.", priority: "LOW" },
  ];
  return (
    <main>
      <Title eyebrow="ALERT CENTRE" title="Notifications" copy="Priority signals, farm reminders and service updates stored on this device." />
      <div className="notification-list">
        {notes.map((n, i) => (
          <button className={"notification " + (read.includes(i) ? "read" : "")} key={n.title} onClick={() => setRead([...read, i])}>
            <Badge level={n.priority} />
            <div><h3>{n.title}</h3><p>{n.body}</p></div>
            {!read.includes(i) && <i>New</i>}
          </button>
        ))}
      </div>
    </main>
  );
}

// ── Assistant ──────────────────────────────────────────────────────────────
export function Assistant() {
  const [messages, setMessages] = useState([{ from: "ai", text: "Namaste Ramesh. I can help with your farm, weather, crop health, market and scheme questions." }]);
  const [input, setInput] = useState("");
  const [voice, setVoice] = useState(false);
  const [context, setContext] = useState<LiveContext>();
  const [loading, setLoading] = useState(false);
  async function refresh() { setLoading(true); setContext(await getLiveContext()); setLoading(false); }
  async function send(q = input) {
    if (!q.trim()) return;
    setMessages(m => [...m, { from: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const answer = await askAssistant(q, context);
      setMessages(m => [...m, { from: "ai", text: answer }]);
    } catch {
      setMessages(m => [...m, { from: "ai", text: "I could not reach the online assistant. Please try again or use saved advisory information." }]);
    } finally { setLoading(false); }
  }
  return (
    <main className="assistant-page">
      <Title eyebrow="YOUR FARM COMPANION" title="Kisan Mitra AI" copy="General agricultural guidance only. For severe disease, pesticide use or major crop loss, consult a qualified expert or local agriculture office." />
      <Card className="live-context">
        <div>
          <b>{context?.source === "live" ? "Live location context enabled" : "Use local conditions"}</b>
          <span>{context?.source === "live" ? `${context.location} · ${context.temperature}°C · ${context.rainProbability}% rain chance` : "Allow location to give the assistant current-area weather context."}</span>
        </div>
        <button className="button secondary" onClick={refresh}>{loading ? "Updating…" : "Use my location"}</button>
      </Card>
      <Card className="chat">
        <div className="chat-head">
          <span className="ai-avatar"><Bot /></span>
          <div><b>Kisan Mitra</b><small><i /> {import.meta.env.VITE_ASSISTANT_API_URL ? "Online AI connected" : "Local guidance mode"}</small></div>
          <button className="icon" onClick={() => setMessages([])} aria-label="Clear chat">×</button>
        </div>
        <div className="messages">
          {messages.map((m, i) => <div className={"message " + m.from} key={i}>{m.text}</div>)}
          {loading && <div className="message ai">Kisan Mitra is checking…</div>}
        </div>
        <div className="prompts">
          {["Will rain affect my crop?", "How do I spot yellow mosaic?", "Show schemes for me"].map(x => (
            <button key={x} onClick={() => send(x)}>{x}</button>
          ))}
        </div>
        <div className="chat-input">
          <button className={voice ? "recording" : "icon"} onClick={() => setVoice(!voice)} aria-label="Voice input"><Mic size={19} /></button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={voice ? "Listening…" : "Ask about your farm"} />
          <button className="icon" aria-label="Read guidance aloud"><Volume2 size={19} /></button>
          <button className="send" onClick={() => send()} aria-label="Send"><Send size={18} /></button>
        </div>
      </Card>
    </main>
  );
}

// ── Generic placeholder ────────────────────────────────────────────────────
export function GenericPage({ title }: { title: string }) {
  return (
    <main>
      <Title eyebrow="KISANSETU" title={title} copy="This prototype page is ready for your account-specific information and service integrations." />
      <Card className="empty-state">
        <Sparkles size={34} /><h2>Ready to personalise</h2>
        <p>Connect verified local data and complete your farm profile to continue.</p>
        <Link className="button" to="/my-farm">Open My Farm</Link>
      </Card>
    </main>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────
export function Login() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"signin" | "register" | "guest">("register");

  // Step 1 fields
  const [name, setName] = useState(localStorage.getItem("kisansetu_name") || "");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [errors1, setErrors1] = useState<Record<string, string>>({});

  // Step 2 fields
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [place, setPlace] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [locError, setLocError] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (mode !== "guest") {
      if (!name.trim()) e.name = "Full name is required.";
      if (mode === "register") {
        const mobileOk = /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""));
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!mobileOk && !emailOk)
          e.contact = "Enter a valid 10-digit Indian mobile number or email address.";
      } else {
        // Sign-in: need mobile or email
        const mobileOk = /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""));
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!mobileOk && !emailOk)
          e.contact = "Enter a valid 10-digit mobile number or email address.";
      }
    } else {
      if (!name.trim()) e.name = "Please enter your name to continue.";
    }
    setErrors1(e);
    return Object.keys(e).length === 0;
  }

  function advanceStep1() {
    if (validateStep1()) setStep(2);
  }

  // ── Location helpers ────────────────────────────────────────────────────
  async function resolveLocation(latitude: number, longitude: number) {
    setLocLoading(true);
    setLocError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const a = data.address as Record<string, string> | undefined;
      let label = "";
      if (a) {
        const city = a.city || a.town || a.village || a.suburb || a.hamlet || a.county;
        const state = a.state;
        label = [city, state].filter(Boolean).join(", ");
      }
      if (!label) label = data.display_name?.split(",").slice(0, 3).join(", ") ?? "";
      if (!label) throw new Error("Could not identify location");
      setLat(latitude);
      setLng(longitude);
      setPlace(label);
      setGpsStatus("done");
    } catch {
      setLocError("Could not identify this location. Try GPS or pick a different point.");
      setGpsStatus("error");
    } finally {
      setLocLoading(false);
    }
  }

  function triggerGPS() {
    if (!navigator.geolocation) { setLocError("GPS is not available on this device."); return; }
    setGpsStatus("locating");
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      p => resolveLocation(p.coords.latitude, p.coords.longitude),
      () => { setGpsStatus("error"); setLocError("GPS permission denied or timed out. Tap the map to pick your location."); },
      { enableHighAccuracy: true, timeout: 14000 }
    );
  }

  function saveAndFinish() {
    if (!lat || !lng || !place) { setLocError("Please confirm your location before continuing."); return; }
    localStorage.setItem("kisansetu_name", name.trim() || "Farmer");
    localStorage.setItem("kisansetu_lat", String(lat));
    localStorage.setItem("kisansetu_lng", String(lng));
    localStorage.setItem("kisansetu_location", place);
    localStorage.setItem("kisansetu_mode", mode === "guest" ? "guest" : "account");
    setStep(3);
  }

  // ── Map pin position (use saved pin or centre of India if nothing yet) ──
  const mapLat = lat ?? 22.5937;
  const mapLng = lng ?? 78.9629;

  // ── Step progress indicator ─────────────────────────────────────────────
  const StepDots = () => (
    <div className="auth-steps">
      {[1, 2, 3].map(s => (
        <div key={s} className={`auth-step-dot ${step >= s ? "done" : ""} ${step === s ? "active" : ""}`}>
          {step > s ? <Check size={10} /> : s}
        </div>
      ))}
    </div>
  );

  return (
    <main className="auth-page">
      {/* ── Step 1: Identity ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="auth-card card">
          <StepDots />
          <span className="eyebrow">STEP 1 OF 2 · IDENTITY</span>
          <h1 className="auth-title">
            {mode === "signin" ? "Welcome back" : mode === "guest" ? "Quick access" : "Create your profile"}
          </h1>
          <p className="auth-subtitle">
            {mode === "signin"
              ? "Sign in to access your saved farm data and live alerts."
              : mode === "guest"
              ? "Continue without an account. Data stays on this device only."
              : "Your account keeps farm records safe and synced across devices."}
          </p>

          <div className="auth-mode-tabs">
            <button className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>
              New account
            </button>
            <button className={mode === "signin" ? "selected" : ""} onClick={() => setMode("signin")}>
              Sign in
            </button>
            <button className={mode === "guest" ? "selected" : ""} onClick={() => setMode("guest")}>
              Guest
            </button>
          </div>

          <label className="auth-label">
            Full name <span className="required">*</span>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErrors1({}); }}
              placeholder="e.g. Ramesh Patel"
              autoComplete="name"
            />
            {errors1.name && <span className="field-error">{errors1.name}</span>}
          </label>

          {mode !== "guest" && (
            <label className="auth-label">
              Mobile number or email <span className="required">*</span>
              <input
                value={mobile || email}
                onChange={e => {
                  const v = e.target.value;
                  setErrors1({});
                  if (/^\d/.test(v)) { setMobile(v); setEmail(""); }
                  else { setEmail(v); setMobile(""); }
                }}
                placeholder="10-digit mobile or email address"
                inputMode="tel"
                autoComplete="tel"
              />
              {errors1.contact && <span className="field-error">{errors1.contact}</span>}
            </label>
          )}

          {mode === "signin" && (
            <label className="auth-label">
              Password <span className="required">*</span>
              <input type="password" placeholder="Enter your password" autoComplete="current-password" />
            </label>
          )}

          <button className="button auth-btn" onClick={advanceStep1}>
            {mode === "signin" ? "Sign in" : "Continue"} <ArrowRight size={16} />
          </button>

          <p className="auth-legal">
            ⚠ Never enter Aadhaar, bank account, OTP, or insurance policy numbers in KisanSetu unless an authorised government service specifically requests them through official channels.
          </p>
        </div>
      )}

      {/* ── Step 2: Mandatory Location ───────────────────────────────── */}
      {step === 2 && (
        <div className="auth-card auth-card--wide card">
          <StepDots />
          <span className="eyebrow">STEP 2 OF 2 · FARMING LOCATION</span>
          <h1 className="auth-title">Where is your farm?</h1>
          <p className="auth-subtitle">
            Your location is required to show real weather, risk alerts, and crop advice for your area.
            Use GPS for the most accurate result, or tap the map to pin your field.
          </p>

          {/* GPS button */}
          <div className="auth-loc-row">
            <button
              className={`button ${gpsStatus === "locating" ? "secondary" : ""}`}
              onClick={triggerGPS}
              disabled={gpsStatus === "locating" || locLoading}
            >
              <Navigation size={15} />
              {gpsStatus === "locating" ? "Detecting GPS…" : gpsStatus === "done" ? "GPS detected ✓" : "Use my GPS location"}
            </button>
            {place && <span className="auth-place-pill"><MapPin size={12} /> {place}</span>}
          </div>

          {locError && <p className="field-error auth-loc-error">{locError}</p>}

          {/* Interactive map */}
          <div className="auth-map-wrap">
            <LocationMap
              latitude={mapLat}
              longitude={mapLng}
              onChange={(la, ln) => resolveLocation(la, ln)}
              height={340}
            />
          </div>

          {locLoading && (
            <div className="location-loading">
              <span className="loading-dot" /> Identifying location from coordinates…
            </div>
          )}

          {/* Confirmed location display */}
          {place && lat && lng && (
            <div className="auth-loc-confirmed">
              <Check size={16} />
              <div>
                <b>{place}</b>
                <small>{lat.toFixed(5)}°N, {lng.toFixed(5)}°E</small>
              </div>
            </div>
          )}

          <div className="auth-nav-row">
            <button className="button secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              className="button"
              onClick={saveAndFinish}
              disabled={!place || !lat || locLoading}
            >
              {!place ? "Pin your location to continue" : "Confirm & finish"} {place && <ArrowRight size={15} />}
            </button>
          </div>

          <small className="auth-legal">
            Location data stays on this device. It is used only to fetch weather and risk data for your area.
          </small>
        </div>
      )}

      {/* ── Step 3: Success ──────────────────────────────────────────── */}
      {step === 3 && (
        <div className="auth-card card">
          <div className="auth-success-icon"><Check size={28} /></div>
          <h1 className="auth-title">You're all set, {name.trim() || "Farmer"}!</h1>
          <p className="auth-subtitle">
            {mode === "guest"
              ? "Continuing as guest. Your farm data is stored on this device only."
              : "Your profile is ready. Live weather and alerts are now active for:"}
          </p>
          {place && (
            <div className="auth-loc-confirmed">
              <MapPin size={16} />
              <div><b>{place}</b><small>Farm location confirmed</small></div>
            </div>
          )}
          <Link className="button auth-btn" to="/dashboard">
            Go to dashboard <ArrowRight size={16} />
          </Link>
          <small className="auth-legal">
            This is a prototype. Do not enter production credentials, sensitive personal data, or real financial information.
          </small>
        </div>
      )}
    </main>
  );
}

// ── Location Select ────────────────────────────────────────────────────────
export function LocationSelect() {
  const [lat, setLat] = useState(Number(localStorage.getItem("kisansetu_lat")) || 23.2599);
  const [lng, setLng] = useState(Number(localStorage.getItem("kisansetu_lng")) || 77.4126);
  const [place, setPlace] = useState(localStorage.getItem("kisansetu_location") || "");
  const [accuracy, setAccuracy] = useState<number | undefined>();
  const [context, setContext] = useState<LiveContext>();
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [saved, setSaved] = useState(false);
  const didAutoGPS = useRef(false);

  // Auto-detect GPS on first mount if no location saved yet
  useEffect(() => {
    if (didAutoGPS.current) return;
    didAutoGPS.current = true;
    const hasSaved = Boolean(localStorage.getItem("kisansetu_lat"));
    if (!hasSaved) {
      triggerGPS();
    } else {
      // Load weather for saved location
      const savedLat = Number(localStorage.getItem("kisansetu_lat"));
      const savedLng = Number(localStorage.getItem("kisansetu_lng"));
      const savedLoc = localStorage.getItem("kisansetu_location") ?? "Saved location";
      setLoading(true);
      getLiveContextForLocation(savedLat, savedLng, savedLoc).then(ctx => { setContext(ctx); setLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choose(latitude: number, longitude: number, acc?: number) {
    setLat(latitude);
    setLng(longitude);
    setAccuracy(acc);
    setLoading(true);
    const name = await reverseGeocode(latitude, longitude);
    setPlace(name);
    const ctx = await getLiveContextForLocation(latitude, longitude, name);
    setContext(ctx);
    setLoading(false);
  }

  function triggerGPS() {
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      p => {
        setGpsStatus("done");
        choose(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function save() {
    localStorage.setItem("kisansetu_lat", String(lat));
    localStorage.setItem("kisansetu_lng", String(lng));
    localStorage.setItem("kisansetu_location", place || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const gpsLabel = gpsStatus === "locating" ? "Locating…" : gpsStatus === "error" ? "GPS unavailable" : gpsStatus === "done" ? "GPS located ✓" : "Use my GPS location";

  return (
    <main>
      <Title
        eyebrow="LOCATION &amp; LIVE CONTEXT"
        title="Select your farming area"
        copy="Use GPS for your actual location, or tap the map to pick a field area. The map does not verify land ownership or crop boundaries."
      />
      <Card>
        {/* Location header */}
        <div className="location-actions">
          <div>
            <b className="location-place">{place || "No location set"}</b>
            <span>{lat.toFixed(5)}°N, {lng.toFixed(5)}°E {accuracy ? `· ±${Math.round(accuracy)} m` : ""}</span>
          </div>
          <button className="button" onClick={triggerGPS} disabled={gpsStatus === "locating"}>
            <Navigation size={15} /> {gpsLabel}
          </button>
        </div>

        {/* Interactive map */}
        <LocationMap
          latitude={lat}
          longitude={lng}
          onChange={(la, ln) => choose(la, ln)}
          accuracyMetres={accuracy}
          height={420}
        />

        {/* Live weather context result */}
        {loading && <div className="location-loading"><span className="loading-dot" />Fetching weather for this location…</div>}
        {context && !loading && (
          <div className="location-result">
            <b>{context.source === "live" ? "✓ Live conditions loaded" : "Saved context only"}</b>
            <span>
              {context.temperature}°C (feels {context.feelsLike}°C) · {context.humidity}% humidity ·{" "}
              {context.wind} km/h wind · {context.rainProbability}% rain probability (next 12 h)
            </span>
            <small>
              Updated {new Date(context.updatedAt).toLocaleString()} · Weather model data (Open-Meteo) — not an official disaster warning.
            </small>
          </div>
        )}

        <button className="button" onClick={save} disabled={!place && !lat}>
          {saved ? <><Check size={15} /> Saved!</> : <><MapPin size={15} /> Save selected location</>}
        </button>
      </Card>
    </main>
  );
}

// ── Post-Flood Assessment ──────────────────────────────────────────────────
export function PostFloodAssessment() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [floodData, setFloodData] = useState<any>(null);
  const [formData, setFormData] = useState({
    cropName: '', growthStage: '', floodDuration: '', waterDepth: '', soilType: '', cropCondition: ''
  });
  
  const [result, setResult] = useState<{
    risk: 'Low' | 'Moderate' | 'High';
    action: string;
    description: string;
    apiInsight: string;
  } | null>(null);

  const lat = localStorage.getItem('kisansetu_lat') || '22.2014'; 
  const lng = localStorage.getItem('kisansetu_lng') || '77.0500';
  const locationName = localStorage.getItem('kisansetu_location') || 'Saved Farm Location';

  const SUPPORTED_INDIAN_CROPS = [
    'Soybean', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Vegetables'
  ];

  useEffect(() => {
    const fetchFloodData = async () => {
      try {
        const res = await fetch(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge,river_discharge_mean,river_discharge_max&past_days=7&forecast_days=3`);
        const data = await res.json();
        setFloodData(data);
      } catch (err) {
        console.error("Failed to fetch Open-Meteo flood data", err);
      }
    };
    fetchFloodData();
  }, [lat, lng]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const analyzeData = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const duration = parseInt(formData.floodDuration) || 0;
      let riskScore = 0;
      let apiInsight = "Normal regional water levels detected. Local field drainage is your primary concern.";

      if (duration > 48) riskScore += 3;
      else if (duration > 24) riskScore += 2;
      
      if (formData.cropCondition === 'Severe Rot') riskScore += 3;
      else if (formData.cropCondition === 'Yellowing') riskScore += 1;

      if (formData.waterDepth === 'Complete') riskScore += 2;
      if (formData.soilType === 'Clay') riskScore += 1;
      
      if (formData.growthStage === 'Flowering' || formData.growthStage === 'Seedling') riskScore += 1;

      if (floodData && floodData.daily) {
        const latestDischarge = floodData.daily.river_discharge[7]; 
        const meanDischarge = floodData.daily.river_discharge_mean[7];
        const maxDischarge = floodData.daily.river_discharge_max[7];

        if (latestDischarge > meanDischarge * 2) {
          riskScore += 2; 
          apiInsight = `Open-Meteo Alert: Regional river discharge is significantly elevated (${latestDischarge} m³/s vs normal ${meanDischarge} m³/s). Groundwater table is high, delaying field drying.`;
        } else if (latestDischarge > maxDischarge * 0.8) {
          riskScore += 3; 
          apiInsight = `Open-Meteo Alert: Critical flood levels nearby. River discharge is near maximum capacity. Prolonged waterlogging is highly likely.`;
        }
      }

      let finalResult;
      if (riskScore >= 6) {
        finalResult = {
          risk: 'High' as const,
          action: 'Consider Replanting',
          description: `With ${duration}hrs of flooding and severe symptoms, ${formData.cropName} recovery is unlikely. Prepare field for alternate short-duration crops (e.g., short-cycle pulses) to secure the season.`,
          apiInsight
        };
      } else if (riskScore >= 3) {
        finalResult = {
          risk: 'Moderate' as const,
          action: 'Monitor Closely & Apply Interventions',
          description: `The ${formData.cropName} is stressed but salvageable. Drain excess water immediately. Apply a foliar spray of 2% Urea or Potassium Nitrate once leaves dry to revive vegetative growth.`,
          apiInsight
        };
      } else {
        finalResult = {
          risk: 'Low' as const,
          action: 'Continue Standard Management',
          description: `Good chance of recovery. The ${formData.cropName} is resilient at this stage. Ensure field drainage is clear and monitor for fungal diseases over the next 3-5 days.`,
          apiInsight
        };
      }

      setResult(finalResult);
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  return (
    <main>
      <Title 
        eyebrow="SMART RECOVERY TOOL" 
        title="Post-Flood Assessment" 
        copy="Powered by Open-Meteo Global Flood API & Crop Science to evaluate recovery risk." 
      />
      
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <MapPin size={24} color="#16a34a" />
          <div>
            <b>Assessing risk for: {locationName}</b>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Auto-detected coordinates ({Number(lat).toFixed(4)}°N, {Number(lng).toFixed(4)}°E)</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={analyzeData}>
            <div className="form-grid">
              <label>Crop
                <select required name="cropName" onChange={handleInputChange} value={formData.cropName}>
                  <option value="">Select supported crop...</option>
                  {SUPPORTED_INDIAN_CROPS.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </label>

              <label>Growth Stage
                <select required name="growthStage" onChange={handleInputChange} value={formData.growthStage}>
                  <option value="">Select Stage...</option>
                  <option value="Seedling">Seedling / Early Vegetative</option>
                  <option value="Vegetative">Active Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Fruiting">Fruiting / Maturity</option>
                </select>
              </label>

              <label>Flood Duration (Hours)
                <input required type="number" name="floodDuration" onChange={handleInputChange} value={formData.floodDuration} placeholder="e.g., 24" />
              </label>

              <label>Submergence Level
                <select required name="waterDepth" onChange={handleInputChange} value={formData.waterDepth}>
                  <option value="">Select...</option>
                  <option value="Partial">Partial (Only stems/roots)</option>
                  <option value="Complete">Complete (Leaves submerged)</option>
                </select>
              </label>

              <label>Soil Type
                <select required name="soilType" onChange={handleInputChange} value={formData.soilType}>
                  <option value="">Select...</option>
                  <option value="Clay">Black/Clay (Slow drainage)</option>
                  <option value="Loam">Loam / Alluvial (Moderate)</option>
                  <option value="Sandy">Sandy (Fast drainage)</option>
                </select>
              </label>

              <label>Visible Symptoms
                <select required name="cropCondition" onChange={handleInputChange} value={formData.cropCondition}>
                  <option value="">Select...</option>
                  <option value="Healthy">Mostly Healthy / Minor Mud</option>
                  <option value="Yellowing">Mild/Moderate Yellowing</option>
                  <option value="Severe Rot">Severe Wilting or Root Rot</option>
                </select>
              </label>
            </div>

            <button disabled={loading || !floodData} type="submit" className="button" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
              {loading ? "Analyzing Data…" : "Analyze Multi-Source Recovery Risk"}
            </button>
            {!floodData && <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>Connecting to Open-Meteo Global Flood API...</p>}
          </form>
        ) : (
          <div>
            <div className="card-head" style={{ marginBottom: '1rem' }}>
              <div>
                <span className="eyebrow">DECISION ENGINE RESULT</span>
                <h2>{result?.action}</h2>
              </div>
              <Badge level={result?.risk === 'High' ? 'HIGH RISK' : result?.risk === 'Moderate' ? 'MONITOR' : 'GOOD FIT'} />
            </div>
            
            <div className="playbook">
              <div className="play-step" style={{ marginTop: '1rem' }}>
                <b>API</b>
                <p>{result?.apiInsight}</p>
              </div>
              <div className="play-step">
                <b>Plan</b>
                <p>{result?.description}</p>
              </div>
            </div>

            <button onClick={() => setStep(1)} className="button secondary" style={{ marginTop: '1.5rem' }}>
              ← New Assessment
            </button>
          </div>
        )}
      </Card>
    </main>
  );
}