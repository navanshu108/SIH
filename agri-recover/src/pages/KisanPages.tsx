import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Bot, Check, ChevronRight, CloudRain, Droplets,
  FileUp, Leaf, MapPin, Mic, Plus, Send, ShieldAlert, Sparkles,
  Sprout, ThermometerSun, Upload, Volume2, Wind, X, Loader2, LogOut, Store,
  Trash2, Calendar, TestTube
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { alerts, mandi, schemes } from "../services/mockServices";
import { askAssistant } from "../services/assistantService";
import { getLiveContext, getLiveContextForLocation, getSavedLocationContext, type LiveContext } from "../services/liveContextService";

// ── Complete India State & District Database ───────────────────────────
const indiaData: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Saraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

// ── Expanded Offline Crop Database ─────────────────────────────────────────
export const crops = [
  { 
    id: "soyabean", name: "Soyabean", localName: "सोयाबीन", season: "Kharif", 
    duration: "90-120 days", water: "Medium", soil: ["Loamy", "Black", "Well drained"], suitability: 95, stage: "Vegetative", 
    temperature: "20°C - 35°C (Optimum: 25°C - 30°C)", rainfall: "500 - 1000 mm",
    advice: "Maintain proper plant population. Waterlogging is the biggest threat - proper drainage is a must.", 
    pests: ["Yellow Mosaic Virus", "Rust", "Caterpillar", "Root Rot", "Stem Fly"],
    alternates: ["Green Gram", "Black Gram", "Maize", "Sunflower"]
  },
  { 
    id: "maize", name: "Maize", localName: "मक्का", season: "Kharif", 
    duration: "90-120 days", water: "Medium", soil: ["Loamy", "Sandy loam", "Alluvial"], suitability: 88, stage: "Vegetative", 
    temperature: "20°C - 32°C (Optimum: 25°C - 30°C)", rainfall: "600 - 1000 mm",
    advice: "Ensure proper spacing and good drainage. Avoid stress during flowering & silking.", 
    pests: ["Leaf blight", "Stalk rot", "Fall Armyworm"],
    alternates: ["Mung", "Urad", "Millets", "Vegetables"]
  },
  { 
    id: "green-gram", name: "Green Gram", localName: "मूंग", season: "Kharif", 
    duration: "60-70 days", water: "Low", soil: ["Sandy loam", "Loam"], suitability: 92, stage: "Flowering", 
    temperature: "25°C - 35°C (Optimum: 28°C - 30°C)", rainfall: "500 - 800 mm",
    advice: "Provide life saving irrigation during drought. Spray 2% Potassium Nitrate at flowering.", 
    pests: ["Yellow Mosaic Virus", "Powdery Mildew", "Aphids"],
    alternates: ["Cowpea", "Sesame", "Pearl Millet"]
  },
  { 
    id: "wheat", name: "Wheat", localName: "गेहूं", season: "Rabi", 
    duration: "120-150 days", water: "Medium", soil: ["Loam", "Clay loam", "Alluvial"], suitability: 90, stage: "Tillering", 
    temperature: "15°C - 25°C", rainfall: "500 - 1000 mm (Requires winter irrigation)",
    advice: "Ensure timely sowing in November. Provide 4-6 irrigations at critical stages like CRI and booting.", 
    pests: ["Termites", "Aphids", "Rust (Yellow/Brown)"],
    alternates: ["Mustard", "Chickpea (Gram)", "Barley"]
  },
  { 
    id: "paddy", name: "Paddy (Rice)", localName: "धान", season: "Kharif", 
    duration: "120-150 days", water: "High", soil: ["Clay", "Clay loam"], suitability: 94, stage: "Transplanting", 
    temperature: "25°C - 35°C", rainfall: "1000 - 1500 mm",
    advice: "Maintain 2-5 cm standing water in field. Do not let cracks develop in soil during vegetative stage.", 
    pests: ["Stem Borer", "Brown Plant Hopper", "Blast Disease"],
    alternates: ["Maize", "Sugarcane", "Jute"]
  },
  { 
    id: "cotton", name: "Cotton", localName: "कपास", season: "Kharif", 
    duration: "150-180 days", water: "Medium", soil: ["Black", "Clay"], suitability: 85, stage: "Boll formation", 
    temperature: "21°C - 30°C", rainfall: "500 - 1000 mm",
    advice: "Highly sensitive to waterlogging. Ensure deep ploughing and clean cultivation.", 
    pests: ["Pink Bollworm", "Whitefly", "Jassids"],
    alternates: ["Soyabean", "Pigeon Pea (Tur)"]
  },
  { 
    id: "mustard", name: "Mustard", localName: "सरसों", season: "Rabi", 
    duration: "100-120 days", water: "Low", soil: ["Sandy loam", "Loam"], suitability: 89, stage: "Flowering", 
    temperature: "10°C - 25°C", rainfall: "250 - 400 mm",
    advice: "Thinning should be done 15 days after sowing. Highly susceptible to frost.", 
    pests: ["Aphids", "Alternaria Blight", "White Rust"],
    alternates: ["Wheat", "Barley", "Gram"]
  },
  { 
    id: "sugarcane", name: "Sugarcane", localName: "गन्ना", season: "Kharif", 
    duration: "300-360 days", water: "High", soil: ["Deep loamy", "Clay loam"], suitability: 80, stage: "Grand Growth", 
    temperature: "20°C - 35°C", rainfall: "1500 - 2500 mm",
    advice: "Requires heavy fertilization and frequent irrigation. Earth up the crop to prevent lodging.", 
    pests: ["Early Shoot Borer", "Red Rot", "Pyrilla"],
    alternates: ["Paddy", "Banana"]
  },
  { 
    id: "groundnut", name: "Groundnut", localName: "मूंगफली", season: "Kharif", 
    duration: "90-120 days", water: "Low", soil: ["Sandy", "Sandy loam"], suitability: 86, stage: "Pegging", 
    temperature: "25°C - 30°C", rainfall: "500 - 700 mm",
    advice: "Calcium (Gypsum) application is critical at pegging stage. Avoid heavy clay soils.", 
    pests: ["White Grub", "Tikka Disease", "Collar Rot"],
    alternates: ["Pearl Millet", "Sesame", "Castor"]
  },
  { 
    id: "tomato", name: "Tomato", localName: "टमाटर", season: "Horticulture", 
    duration: "90-120 days", water: "Medium", soil: ["Loamy", "Sandy loam"], suitability: 88, stage: "Fruiting", 
    temperature: "20°C - 28°C", rainfall: "600 - 800 mm",
    advice: "Staking is required for indeterminate varieties. Very sensitive to frost and waterlogging.", 
    pests: ["Fruit Borer", "Early Blight", "Leaf Curl Virus"],
    alternates: ["Brinjal", "Chilli", "Okra"]
  }
];

// ── Shared micro-components ────────────────────────────────────────────────
const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <section className={"card " + className} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>{children}</section>
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
          <h2>Your primary crop is in its <b>vegetative stage.</b></h2>
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
        <Metric icon={<Leaf />} label="Crop health" value="82 / 100" detail="Monitor field conditions" tone="green" />
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
            <div><span className="eyebrow">YOUR PRIMARY CROP</span><h3>Soyabean health</h3></div>
            <Link to="/crops/soyabean">Crop guide →</Link>
          </div>
          <div className="crop-health">
            <div className="leaf-orb"><Leaf /></div>
            <div>
              <b>82<span>/100</span></b>
              <p>Healthy · needs attention</p>
              <div className="progress"><i style={{ width: "82%" }} /></div>
            </div>
          </div>
          <div className="advisory"><Sparkles size={17} /><span>Inspect lower leaves this week for early pest symptoms.</span></div>
        </Card>
      </div>
      <div className="grid-3">
        <Card className="span-2">
          <div className="card-head">
            <div><span className="eyebrow">MARKET INTELLIGENCE</span><h3>Agmarknet Prices</h3></div>
            <Link to="/mandi">View Mandi Bhav →</Link>
          </div>
          <div className="market">
            <b>₹4,650 <small>/ quintal</small></b>
            <span>▲ Soybean this week</span>
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
          {["Clear drainage channels", "Inspect lower leaves", "Check local mandi price"].map((x, i) => (
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
  const [context, setContext] = useState<LiveContext | undefined>();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
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

  return (
    <main>
      <Title eyebrow="EVIDENCE-LED RISK VIEW" title="Risk radar" copy="Signals derived from Open-Meteo forecast model. Not official disaster alerts." />
      <Card className="risk-live">
        <div>
          <b>{context ? "Live weather signal" : "No location data"}</b>
          <span>{context ? `${context.location}` : "Set your location first."}</span>
        </div>
        <Link to="/location" className="button secondary"><MapPin size={14} /> Change location</Link>
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
      <Title eyebrow="OFFLINE CROP DATABASE" title="Crop library" copy="Comprehensive crop profiles and parameters for Indian conditions." />
      <div className="toolbar">
        <input aria-label="Search crop" placeholder="Search crops (e.g. Wheat, Maize)" value={q} onChange={e => setQ(e.target.value)} />
        <div style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {["All", "Kharif", "Rabi", "Horticulture"].map(x => (
            <button key={x} className={season === x ? "selected" : ""} onClick={() => setSeason(x)}>{x}</button>
          ))}
        </div>
      </div>
      <div className="crop-grid">
        {visible.map(c => (
          <Link to={"/crops/" + c.id} className="crop-card" key={c.id}>
            <div><span>{c.season}</span><b>{c.name}</b><small>{c.localName}</small></div>
            <p>{c.duration} · {c.water} water</p>
            <em>{c.soil.join(" · ")} soil</em>
          </Link>
        ))}
        {visible.length === 0 && <p style={{ padding: '2rem', color: '#6b7280' }}>No crops found matching your search.</p>}
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
        <div><span>{c.season} CROP</span><h1>{c.name}</h1><p>{c.localName} · Duration: {c.duration}</p></div>
        <Badge level="HEALTHY" />
      </div>
      <div className="grid-3">
        <Card><span className="eyebrow">SOIL &amp; CLIMATE</span><h3>{c.soil[0]}</h3><p>Temp: {c.temperature}<br/>Rain: {c.rainfall}</p></Card>
        <Card><span className="eyebrow">CURRENT STAGE</span><h3>{c.stage}</h3><p>Monitor crop condition weekly.</p></Card>
        <Card><span className="eyebrow">FIELD NOTE</span><h3>General advisory</h3><p>{c.advice}</p></Card>
      </div>
      <div className="grid-2">
        <Card>
          <span className="eyebrow">PESTS &amp; DISEASE WATCH</span>
          <h3>Regular checks matter</h3>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            {c.pests.map(p => <li key={p}>{p}</li>)}
          </ul>
        </Card>
        <Card>
          <span className="eyebrow">CONTINGENCY PLANNING</span>
          <h3>Alternate Crops</h3>
          <p style={{ marginTop: '0.5rem' }}>If replanting is needed due to severe damage:</p>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            {c.alternates.map(a => <li key={a}>{a}</li>)}
          </ul>
        </Card>
      </div>
    </main>
  );
}

// ── Crop Advisor ────────────────────────────────────────────────────────────
export function CropAdvisor() {
  const [soil, setSoil] = useState("Loam");
  const [water, setWater] = useState("Medium");
  const [season, setSeason] = useState("Kharif");
  const savedLoc = localStorage.getItem("kisansetu_location") || "Location not set";
  
  const rec = useMemo(() => {
    return crops.filter(c => 
      (c.soil.some(s => s.toLowerCase().includes(soil.toLowerCase())) || c.water === water) &&
      (season === "All" || c.season === season)
    ).slice(0, 4);
  }, [soil, water, season]);

  return (
    <main>
      <Title eyebrow="PERSONALISED DISCOVERY" title="Crop advisor" copy="Discover the best crops for your exact field conditions based on our offline database." />
      <Card className="advisor">
        <div className="form-grid">
          <label>Location (Auto-detected)<input disabled value={savedLoc} style={{ backgroundColor: '#f3f4f6' }} /></label>
          <label>Season<select value={season} onChange={e => setSeason(e.target.value)}><option>Kharif</option><option>Rabi</option><option>Horticulture</option><option>All</option></select></label>
          <label>Soil type<select value={soil} onChange={e => setSoil(e.target.value)}>
            <option value="Loam">Loam / Loamy</option>
            <option value="Black">Black Soil</option>
            <option value="Clay">Clay / Heavy</option>
            <option value="Sandy">Sandy / Sandy Loam</option>
            <option value="Alluvial">Alluvial</option>
          </select></label>
          <label>Water availability<select value={water} onChange={e => setWater(e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></label>
        </div>
      </Card>
      <h2 className="section-title">Recommended for your field</h2>
      <div className="recommendations">
        {rec.length > 0 ? rec.map(c => (
          <Card key={c.id} className="recommend">
            <div><Badge level="GOOD FIT" /><h3>{c.name}</h3><p>{c.season} · {c.soil[0]} soil · {c.duration}</p></div>
            <Link className="button secondary" to={"/crops/" + c.id}>View guide</Link>
          </Card>
        )) : (
          <p style={{ color: '#6b7280' }}>No exact matches found. Try adjusting your parameters.</p>
        )}
      </div>
    </main>
  );
}

// ── Location Select (OSM Integration) ──────────────────────────────────────
export function LocationSelect() {
  const [stateName, setStateName] = useState("Madhya Pradesh");
  const [district, setDistrict] = useState("Seoni");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function resolveAndSave(e: React.FormEvent) {
    e.preventDefault();
    if (!village.trim()) return;
    setLoading(true);
    const query = `${village}, ${district}, ${stateName}, India`;
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        localStorage.setItem("kisansetu_lat", lat);
        localStorage.setItem("kisansetu_lng", lon);
        
        const cleanName = `${village}, ${district}`;
        localStorage.setItem("kisansetu_location", cleanName);
        
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert("Could not locate this exact village/city on the map. Please try a nearby larger town or city.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Title eyebrow="LOCATION & LIVE CONTEXT" title="Select your farming area" copy="Select your State and District, then enter your Village or City to sync local offline weather and alerts." />
      <Card>
        <form onSubmit={resolveAndSave}>
          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              State
              <select value={stateName} onChange={(e) => { setStateName(e.target.value); setDistrict(indiaData[e.target.value]?.[0] || ""); }} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                {Object.keys(indiaData).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              District
              <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                {indiaData[stateName]?.map((d: string) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              Village / City <span className="required" style={{color:'red'}}>*</span>
              <input required placeholder="e.g. Kurai" value={village} onChange={(e) => setVillage(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </label>
          </div>
          
          <div className="location-result" style={{ marginBottom: '20px' }}>
            <b>Current Saved Location:</b>
            <span>{localStorage.getItem("kisansetu_location") || "None"}</span>
          </div>

          <button type="submit" className="button" disabled={loading || !village.trim()}>
            {loading ? "Locating on OSM..." : saved ? <><Check size={15} /> Saved successfully!</> : <><MapPin size={15} /> Update & Save Location</>}
          </button>
        </form>
      </Card>
    </main>
  );
}

// ── My Farm (Digital Field Ledger) ─────────────────────────────────────────
export function MyFarm() {
  const [fields, setFields] = useState<any[]>(() => {
    const saved = localStorage.getItem("kisansetu_fields");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Force migration: If old string-based tasks exist, wipe them out to prevent crash
        if (parsed.length > 0 && typeof parsed[0].tasks?.[0] === 'string') {
          throw new Error("Old data format detected. Wiping local storage to prevent crash.");
        }
        return parsed;
      } catch (e) {
        console.warn("Resetting fields due to schema change:", e);
      }
    }
    // Default initial data for showcase
    return [
      { id: "1", name: "North field", area: "2.0", unit: "acres", crop: "Soyabean", sowingDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], tasks: [{ id: "t1", text: "Clear drainage channels", done: true }, { id: "t2", text: "Monitor for yellow mosaic virus", done: false }] },
      { id: "2", name: "Canal plot", area: "1.5", unit: "acres", crop: "Maize", sowingDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], tasks: [{ id: "t3", text: "Apply nitrogen top-dressing", done: false }, { id: "t4", text: "Check for waterlogging", done: false }] },
    ];
  });

  useEffect(() => {
    localStorage.setItem("kisansetu_fields", JSON.stringify(fields));
  }, [fields]);

  const [adding, setAdding] = useState(false);
  const [activeField, setActiveField] = useState<any>(null);
  
  // Add field form state
  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newCrop, setNewCrop] = useState("Soyabean");
  const [newSowingDate, setNewSowingDate] = useState("");

  // Add task state
  const [newTaskText, setNewTaskText] = useState("");

  const getDAS = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return 0;
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  const formatDate = (ds: string) => {
    if (!ds || isNaN(new Date(ds).getTime())) return "N/A";
    return new Date(ds).toLocaleDateString('en-GB');
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newArea.trim() || !newSowingDate) return;
    const newField = {
      id: Date.now().toString(),
      name: newName,
      area: newArea,
      unit: "acres",
      crop: newCrop,
      sowingDate: newSowingDate,
      tasks: [{ id: Date.now().toString() + "_t", text: "Initial field prep and soil testing", done: false }]
    };
    setFields([...fields, newField]);
    setAdding(false);
    setNewName(""); setNewArea(""); setNewSowingDate("");
  };

  const handleDeleteField = (id: string) => {
    if (confirm("Are you sure you want to delete this field? This action cannot be undone.")) {
      setFields(fields.filter(f => f.id !== id));
      setActiveField(null);
    }
  };

  const toggleTask = (fieldId: string, taskId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, tasks: f.tasks.map((t: any) => t.id === taskId ? { ...t, done: !t.done } : t) };
      }
      return f;
    }));
    if (activeField && activeField.id === fieldId) {
      setActiveField((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, done: !t.done } : t)
      }));
    }
  };

  const deleteTask = (fieldId: string, taskId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, tasks: f.tasks.filter((t: any) => t.id !== taskId) };
      }
      return f;
    }));
    if (activeField && activeField.id === fieldId) {
      setActiveField((prev: any) => ({
        ...prev,
        tasks: prev.tasks.filter((t: any) => t.id !== taskId)
      }));
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !activeField) return;
    const newTask = { id: Date.now().toString(), text: newTaskText, done: false };
    
    setFields(fields.map(f => {
      if (f.id === activeField.id) {
        return { ...f, tasks: [...f.tasks, newTask] };
      }
      return f;
    }));
    setActiveField((prev: any) => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    setNewTaskText("");
  };

  return (
    <main>
      <Title eyebrow="DIGITAL FARM DIARY" title="Field Manager" copy="A private, offline-first dashboard to track your crop lifecycles, fields, and daily tasks." />
      
      <div className="card-head fields-head">
        <div><span className="eyebrow">FIELD REGISTER</span><h2>Your active plots</h2></div>
        <button className="button" onClick={() => setAdding(true)}><Plus size={16} /> Add field</button>
      </div>
      
      <div className="field-list">
        {fields.length === 0 && (
          <Card className="empty-state">
            <Sprout size={34} />
            <h2>No fields registered</h2>
            <p>Add your farm plots to track crop stages, activities, and daily tasks.</p>
          </Card>
        )}
        {fields.map(f => {
          const das = getDAS(f.sowingDate);
          // Assuming an average full lifecycle of 120 days for the progress bar
          const progress = Math.min(100, Math.max(0, (das / 120) * 100));
          return (
          <Card className="field" key={f.id} onClick={() => setActiveField(f)}>
            <div className="field-icon"><Sprout /></div>
            <div><h3>{f.name}</h3><p>{f.area} {f.unit} · {f.crop}</p></div>
            <div className="field-stage">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <b>Day {das} <small>since sowing</small></b>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}><Calendar size={12} style={{ display: 'inline', marginBottom: '-2px' }}/> {formatDate(f.sowingDate)}</span>
              </div>
              <div className="progress" style={{ backgroundColor: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <i style={{ display: 'block', height: '100%', backgroundColor: '#16a34a', width: `${progress}%` }} />
              </div>
            </div>
            <button className="button secondary" onClick={(e) => { e.stopPropagation(); setActiveField(f); }}>View field</button>
          </Card>
        )})}
      </div>

      {/* Field Detail Modal - Z-INDEX FIXED */}
      {activeField && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setActiveField(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setActiveField(null)}>
              <X size={24} color="#6b7280" />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>{activeField.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <Badge level="HEALTHY" />
               <Badge level={`${getDAS(activeField.sowingDate)} Days Old`} />
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <small style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Sprout size={14}/> CROP</small>
                <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>{activeField.crop}</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <small style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> AREA</small>
                <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>{activeField.area} {activeField.unit}</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Farm Ledger & Tasks</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {(!activeField.tasks || activeField.tasks.length === 0) && <p style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>No tasks recorded yet.</p>}
                {activeField.tasks && activeField.tasks.map((t: any) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: t.done ? '#f9fafb' : '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#9ca3af' : '#374151' }}>
                      <input type="checkbox" checked={t.done} onChange={() => toggleTask(activeField.id, t.id)} style={{ width: '18px', height: '18px', accentColor: '#16a34a' }} />
                      <span style={{ fontSize: '0.95rem' }}>{t.text}</span>
                    </label>
                    <button onClick={() => deleteTask(activeField.id, t.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} aria-label="Delete Task">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem' }}>
                <input required value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="e.g. Added 50kg Urea" style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
                <button type="submit" className="button" style={{ padding: '0.75rem 1rem' }}><Plus size={16}/> Add</button>
              </form>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #fee2e2', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="button secondary" style={{ width: '100%', justifyContent: 'center', borderColor: '#fca5a5', color: '#dc2626', backgroundColor: '#fef2f2' }} onClick={() => handleDeleteField(activeField.id)}>
                <Trash2 size={16} /> Delete Field
              </button>
              <button className="button secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveField(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {adding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setAdding(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setAdding(false)}>
              <X size={24} color="#6b7280" />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Register new field</h2>
            <form onSubmit={handleAddField}>
              <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Field Name <span style={{color:'red'}}>*</span>
                <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. North River Plot" autoFocus style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '6px', border: '1px solid #d1d5db' }}/>
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Area (Acres) <span style={{color:'red'}}>*</span>
                  <input required type="number" step="0.1" min="0.1" value={newArea} onChange={e => setNewArea(e.target.value)} placeholder="e.g. 1.5" style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '6px', border: '1px solid #d1d5db' }}/>
                </label>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Crop <span style={{color:'red'}}>*</span>
                  <select required value={newCrop} onChange={e => setNewCrop(e.target.value)} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }}>
                    {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </label>
              </div>

              <label style={{ display: 'block', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Sowing Date <span style={{color:'red'}}>*</span>
                <input required type="date" value={newSowingDate} onChange={e => setNewSowingDate(e.target.value)} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '6px', border: '1px solid #d1d5db' }}/>
              </label>

              <button type="submit" className="button" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>Save field</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ── User Authentication (Login, Registration, Guest, & Logout) ─────────────
export function Login() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"signin" | "register" | "guest">("register");

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors1, setErrors1] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Step 2 fields (OSM Location)
  const [stateName, setStateName] = useState("Madhya Pradesh");
  const [district, setDistrict] = useState("Seoni");
  const [village, setVillage] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [place, setPlace] = useState("");

  // Check Active Session
  const isLoggedIn = !!localStorage.getItem("kisansetu_name");
  const currentName = localStorage.getItem("kisansetu_name");
  const currentMode = localStorage.getItem("kisansetu_mode");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("kisansetu_name");
    localStorage.removeItem("kisansetu_email");
    localStorage.removeItem("kisansetu_lat");
    localStorage.removeItem("kisansetu_lng");
    localStorage.removeItem("kisansetu_location");
    localStorage.removeItem("kisansetu_mode");
    
    // Force a full browser reload to clear React Router state and reset all protected routes
    window.location.href = "/login";
  };

  // If already logged in, show the active session card
  if (isLoggedIn) {
    return (
      <main className="auth-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Sprout size={40} color="#16a34a" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Active Session</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              You are currently logged in as <br/><strong style={{ color: '#111827', fontSize: '1.1rem' }}>{currentName}</strong> <br/>({currentMode === 'guest' ? 'Guest Mode' : 'Registered User'}).
            </p>
          </div>
          <button className="button" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginBottom: '1rem' }}>
            Continue to Dashboard
          </button>
          <button className="button secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', borderColor: '#fee2e2', color: '#b91c1c', backgroundColor: '#fef2f2' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </main>
    );
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors1({});

    setTimeout(() => {
      if (mode !== "guest") {
        if (mode === "register" && !name.trim()) {
          setErrors1({ name: "Name is required for registration." });
          setLoading(false);
          return;
        }
        if (!email.includes("@") || password.length < 6) {
          setErrors1({ contact: "Invalid email or password (min 6 chars)." });
          setLoading(false);
          return;
        }
      } else {
        if (!name.trim()) {
          setErrors1({ name: "Please enter a name for guest mode." });
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      setStep(2); // Proceed to location step
    }, 800);
  };

  async function resolveLocationAndFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!village.trim()) {
      setLocError("Village or City name is required.");
      return;
    }
    
    setLocLoading(true);
    setLocError("");
    const query = `${village}, ${district}, ${stateName}, India`;
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      
      let finalLat, finalLng, finalPlace;

      if (data && data.length > 0) {
        finalLat = data[0].lat;
        finalLng = data[0].lon;
        finalPlace = `${village}, ${district}`;
      } else {
        const fbRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(district + ', ' + stateName + ', India')}&format=json&limit=1`);
        const fbData = await fbRes.json();
        if (fbData && fbData.length > 0) {
          finalLat = fbData[0].lat;
          finalLng = fbData[0].lon;
          finalPlace = `${district}, ${stateName}`;
          alert("Could not locate exact village. Saving District level coordinates.");
        } else {
           throw new Error("Location not found");
        }
      }
      
      // Determine the final name to save
      let finalName = name.trim();
      if (mode === "signin") {
        finalName = email.split('@')[0] || "Returning Farmer"; 
      } else if (mode === "guest" && !finalName) {
        finalName = "Guest User";
      }

      localStorage.setItem("kisansetu_name", finalName);
      if (email) localStorage.setItem("kisansetu_email", email);
      localStorage.setItem("kisansetu_lat", finalLat);
      localStorage.setItem("kisansetu_lng", finalLng);
      localStorage.setItem("kisansetu_location", finalPlace);
      localStorage.setItem("kisansetu_mode", mode);
      
      setPlace(finalPlace);
      setStep(3);

    } catch (err) {
      setLocError("Could not identify this location on OSM. Please try a different village or check spelling.");
    } finally {
      setLocLoading(false);
    }
  }

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

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {mode !== "signin" && (
              <label className="auth-label">
                {mode === "guest" ? "Display Name" : "Full name"} <span className="required">*</span>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors1({}); }}
                  placeholder={mode === "guest" ? "e.g. Guest Farmer" : "e.g. Ramesh Patel"}
                  required
                />
                {errors1.name && <span className="field-error">{errors1.name}</span>}
              </label>
            )}

            {mode !== "guest" && (
              <label className="auth-label">
                Email address <span className="required">*</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors1({}); }}
                  placeholder="farmer@example.com"
                  required
                />
                {errors1.contact && <span className="field-error">{errors1.contact}</span>}
              </label>
            )}

            {mode !== "guest" && (
              <label className="auth-label">
                Password <span className="required">*</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors1({}); }}
                  placeholder="Enter your password (min 6 chars)" 
                  required
                />
              </label>
            )}

            <button disabled={loading} type="submit" className="button auth-btn" style={{ justifyContent: 'center' }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : mode === "signin" ? "Sign in" : "Continue"} {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth-legal">
            ⚠ Never enter Aadhaar, bank account, or OTPs in KisanSetu unless an authorised government service requests them.
          </p>
        </div>
      )}

      {/* ── Step 2: OSM Location ───────────────────────────────── */}
      {step === 2 && (
        <div className="auth-card card">
          <StepDots />
          <span className="eyebrow">STEP 2 OF 2 · FARMING LOCATION</span>
          <h1 className="auth-title">Where is your farm?</h1>
          <p className="auth-subtitle">
            Select your State and District, then enter your Village. This sets up your local weather and alerts.
          </p>

          <form onSubmit={resolveLocationAndFinish}>
            <div className="form-grid" style={{ marginBottom: '20px', marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                State
                <select value={stateName} onChange={(e) => { setStateName(e.target.value); setDistrict(indiaData[e.target.value]?.[0] || ""); }} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  {Object.keys(indiaData).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                District
                <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  {indiaData[stateName]?.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                Village / City <span className="required" style={{color:'red'}}>*</span>
                <input required placeholder="e.g. Kurai" value={village} onChange={(e) => setVillage(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </label>
            </div>

            {locError && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{locError}</div>}

            <div className="auth-nav-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="button secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                ← Back
              </button>
              <button
                type="submit"
                className="button"
                disabled={locLoading || !village.trim()}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {locLoading ? <Loader2 className="animate-spin" size={18} /> : "Locate & Save"} {!locLoading && <ArrowRight size={15} />}
              </button>
            </div>
          </form>

          <small className="auth-legal" style={{ display: 'block', marginTop: '1.5rem' }}>
            Location data stays on this device. It is used only to fetch weather and risk data for your area.
          </small>
        </div>
      )}

      {/* ── Step 3: Success ──────────────────────────────────────────── */}
      {step === 3 && (
        <div className="auth-card card">
          <div className="auth-success-icon"><Check size={28} /></div>
          <h1 className="auth-title">You're all set!</h1>
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

  const SUPPORTED_INDIAN_CROPS = crops.map(c => c.name);

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

// ── Mandi ──────────────────────────────────────────────────────────────────
export function Mandi() {
  const [stateName, setStateName] = useState("Madhya Pradesh");
  const [district, setDistrict] = useState("Seoni");
  const [commodity, setCommodity] = useState("Soyabean");
  const [marketSearch, setMarketSearch] = useState("");
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COMMODITIES = ["Soyabean", "Maize", "Wheat", "Green Gram", "Cotton", "Mustard", "Tomato", "Onion", "Potato", "Paddy(Dhan)(Common)"];

  useEffect(() => {
    const savedLoc = localStorage.getItem("kisansetu_location");
    if (savedLoc) {
      const parts = savedLoc.split(",").map(s => s.trim());
      if (parts.length >= 2) {
        const potentialState = parts[parts.length - 1];
        const potentialDistrict = parts[parts.length - 2];
        
        if (indiaData && indiaData[potentialState]) {
          setStateName(potentialState);
          if (indiaData[potentialState].includes(potentialDistrict)) {
            setDistrict(potentialDistrict);
          } else {
            setDistrict(indiaData[potentialState][0]);
          }
        }
      }
    }
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    setError("");
    try {
      const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
      const targetUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&filters[state]=${stateName}&filters[district]=${district}`;
      
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("API Error");
      
      const proxyData = await res.json();
      const data = JSON.parse(proxyData.contents);
      
      if (data.records && data.records.length > 0) {
        let filtered = data.records;
        if (commodity !== "All") {
          filtered = data.records.filter((r: any) => 
            r.commodity.toLowerCase().includes(commodity.toLowerCase().split(' ')[0])
          );
        }
        
        if (filtered.length > 0) {
          filtered.sort((a: any, b: any) => b.modal_price - a.modal_price);
          setPrices(filtered);
          setLoading(false);
          return;
        }
      }
      
      throw new Error("No recent data");
      
    } catch (err: any) {
      setTimeout(() => {
        const basePrice = commodity === "Soyabean" ? 4650 : commodity === "Wheat" ? 2300 : commodity === "Maize" ? 2150 : commodity === "Cotton" ? 7200 : 3500;
        setPrices([
          { market: `${district} Main APMC`, commodity: commodity, min_price: basePrice - 150, max_price: basePrice + 200, modal_price: basePrice, arrival_date: new Date().toLocaleDateString("en-GB") },
          { market: `${district} Rural Mandi`, commodity: commodity, min_price: basePrice - 200, max_price: basePrice + 100, modal_price: basePrice - 50, arrival_date: new Date().toLocaleDateString("en-GB") }
        ]);
        
        setError(err.message === "No recent data" 
          ? `No live records found for ${commodity} in ${district} today. Showing historical estimates.`
          : "Could not fetch live data. Displaying offline estimates.");
        setLoading(false);
      }, 800);
    }
  };

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateName, district, commodity]);

  const displayedPrices = prices.filter(p => p.market.toLowerCase().includes(marketSearch.toLowerCase()));
  
  const avgPrice = displayedPrices.length > 0 
    ? Math.round(displayedPrices.reduce((acc, curr) => acc + Number(curr.modal_price), 0) / displayedPrices.length) 
    : 0;

  const chartData = displayedPrices.slice(0, 7).map(p => ({
    market: p.market.length > 10 ? p.market.substring(0, 10) + '...' : p.market,
    price: Number(p.modal_price)
  }));

  return (
    <main>
      <Title eyebrow="MARKET INTELLIGENCE" title="Live Mandi Prices" copy="Powered by Government of India (Agmarknet) Open Data. Prices are updated based on local APMC uploads." />
      
      <Card className="mandi-top">
        <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            State
            <select value={stateName} onChange={(e) => { setStateName(e.target.value); setDistrict(indiaData[e.target.value]?.[0] || ""); }} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              {Object.keys(indiaData).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            District
            <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              {indiaData[stateName]?.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Commodity
            <select value={commodity} onChange={(e) => setCommodity(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="All">All Commodities</option>
              {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
           <div style={{ flex: 1, minWidth: '200px' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>District Average ({commodity})</span>
              <b style={{ display: 'block', fontSize: '1.8rem', color: '#111827' }}>₹{avgPrice > 0 ? avgPrice : "---"} <small style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/ quintal</small></b>
           </div>
           <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                Filter by Market (APMC)
                <input 
                  placeholder="e.g. Krishi Upaj Mandi" 
                  value={marketSearch} 
                  onChange={e => setMarketSearch(e.target.value)} 
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </label>
           </div>
        </div>
      </Card>

      {error && <div style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16}/> {error}</div>}

      {chartData.length > 0 && !loading && (
        <Card>
          <div className="card-head"><div><span className="eyebrow">PRICE COMPARISON</span><h3>{commodity} across {district}</h3></div></div>
          <div className="chart large">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="market" tick={{fontSize: 12}} interval={0} />
                <YAxis domain={["dataMin - 200", "dataMax + 200"]} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(v) => [`₹${v}`, "Modal Price"]} />
                <Bar dataKey="price" fill="#166534" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}><Loader2 className="animate-spin" style={{ margin: '0 auto', marginBottom: '1rem' }} size={32} /> Fetching live prices from Agmarknet...</div>
        ) : displayedPrices.length > 0 ? (
          displayedPrices.map((p, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <b style={{ color: '#111827', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Store size={18} color="#16a34a"/> {p.market}</b>
                <Badge level="LIVE" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commodity</span>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#374151', fontSize: '1.1rem' }}>{p.commodity}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}><small style={{ color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Min Price</small><b style={{ color: '#ef4444' }}>₹{p.min_price}</b></div>
                <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}><small style={{ color: '#166534', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Modal Price</small><b style={{ color: '#16a34a', fontSize: '1.2rem' }}>₹{p.modal_price}</b><small style={{ display: 'block', fontSize: '0.7rem', color: '#166534' }}>/ quintal</small></div>
                <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}><small style={{ color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Max Price</small><b style={{ color: '#3b82f6' }}>₹{p.max_price}</b></div>
              </div>
              <div style={{ marginTop: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af' }}>
                Arrival Date: {p.arrival_date}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No prices found for the selected criteria. Try changing the commodity or district.</div>
        )}
      </div>
    </main>
  );
}

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

export function DisasterPlaybooks() {
  const [kind, setKind] = useState("Flood & Heavy Rain");
  const data: Record<string, string[]> = {
    "Flood & Heavy Rain": [
      "PRE-ALERT: Dig trench drains along field borders to ensure rapid water exit. Harvest any mature crops immediately.",
      "DURING: Disconnect all farm electrical equipment. Do not apply fertilizers or pesticides as they will wash away and pollute local water.",
      "POST-FLOOD (48hrs): Drain stagnant water immediately to prevent root rot. Once leaves dry, apply a 2% foliar Urea spray to revive vegetative growth.",
      "DISEASE CONTROL: Submerged roots are prone to fungal attack. Apply Copper Oxychloride or Mancozeb as a preventive drench.",
      "INSURANCE: Photograph the flooded field with timestamps and GPS coordinates. Notify the PMFBY helpline or local agriculture office within 72 hours."
    ],
    "Drought & Dry Spells": [
      "SOIL MOISTURE: Apply thick organic mulch (crop residue, leaves) around plant bases to drastically reduce water evaporation from the soil.",
      "IRRIGATION TACTICS: Shift to night-time or early-morning irrigation. Restrict water to life-saving irrigation at critical stages (flowering/grain-filling).",
      "NUTRIENTS: Suspend top-dressing of solid nitrogen fertilizers. Instead, use foliar sprays of Potassium Nitrate (KNO3) (1-2%) to induce drought tolerance.",
      "WEEDING: Aggressively remove weeds manually; they steal limited water and nutrients from your primary crop.",
      "SOIL PREP: Stop deep plowing which exposes subsoil moisture to the hot sun. Practice zero-tillage or minimum tillage where possible."
    ],
    "Heatwave (Loo)": [
      "MICRO-CLIMATE: Apply light, frequent irrigation during late evening to cool the soil canopy. Ensure fields do not become waterlogged.",
      "CROP PROTECTION: Spray a 2% Kaolin (white clay) solution on leaves. This acts as a sunscreen, reflecting intense solar radiation and reducing transpiration.",
      "CHEMICAL BAN: Strictly halt all pesticide, fungicide, and herbicide spraying between 10 AM and 4 PM to prevent severe leaf scorching (phytotoxicity).",
      "LIVESTOCK: Ensure animals have 24/7 access to cool drinking water, provide heavily shaded areas, and add electrolytes to their feed."
    ],
    "Hailstorm & Rain": [
      "PRE-ALERT: If severe weather is forecast, use anti-hail nets for high-value horticulture and nursery crops. Harvest ready produce immediately.",
      "POST-DAMAGE: Do NOT prune damaged branches immediately while wet. Wait for the crop to dry to prevent spreading bacterial infections.",
      "WOUND CARE: Spray broad-spectrum systemic fungicides (like Carbendazim + Mancozeb) within 24 hours to stop fungal infections from entering hail-damaged plant wounds.",
      "RECOVERY BOOST: Apply a light dose of quick-acting nitrogen (Urea) foliar spray 3-4 days after the storm to encourage a new flush of leaves.",
      "CLAIMS: Document all damage with a camera immediately. Do not clear the field until a local official has surveyed the loss for crop insurance."
    ],
    "Pest Outbreak": [
      "EARLY WARNING: Set up pheromone traps and light traps at field borders to detect the arrival of adult moths or pests early.",
      "BARRIERS: Dig boundary trenches around the field and apply dust formulations (e.g., Malathion 5% DP) in the trenches to stop crawling pests (like Fall Armyworm).",
      "TREATMENT: Spray Neem Seed Kernel Extract (NSKE 5%) as an organic deterrent. If crossing economic threshold levels (ETL), use recommended chemical insecticides targeting the central leaf whorl.",
      "COMMUNITY DEFENSE: Coordinate with neighboring farmers for simultaneous, collective spraying. Drum-beating and loud noises can help deter settling locust swarms."
    ]
  };
  return (
    <main>
      <Title eyebrow="EMERGENCY GUIDES" title="Disaster playbooks" copy="Highly actionable, offline-ready response lists designed by agricultural scientists." />
      <div className="tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {Object.keys(data).map(x => <button className={`button ${kind === x ? "" : "secondary"}`} key={x} onClick={() => setKind(x)}>{x}</button>)}
      </div>
      <Card className="playbook">
        <Badge level="PRIORITY NOW" />
        <h2 style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>{kind} Response Protocol</h2>
        {data[kind].map((x, i) => {
          const splitIndex = x.indexOf(":");
          const prefix = splitIndex !== -1 ? x.substring(0, splitIndex) : "";
          const text = splitIndex !== -1 ? x.substring(splitIndex + 1) : x;
          return (
            <div className="play-step" key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <b style={{ color: '#16a34a', fontSize: '1.2rem', minWidth: '30px' }}>0{i + 1}</b>
              <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>
                {prefix && <strong style={{ color: '#111827' }}>{prefix}:</strong>} {text}
              </p>
            </div>
          );
        })}
        <div className="materials" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <b style={{ display: 'block', marginBottom: '0.5rem', color: '#111827' }}>Emergency Kit Checklist</b>
          <span style={{ color: '#4b5563' }}>Fully charged phone/camera · Field record book · Clean drinking water · Local agriculture helpline numbers saved</span>
        </div>
      </Card>
    </main>
  );
}

// ── Pest & Disease (Gemini Vision API Integration) ──────────────────────────
export function PestDisease() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); 
    }
  };

  const analyzePlant = async () => {
    if (!image) {
      setError("Please upload an image of the affected plant first.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = image.type || "image/jpeg";

        if (!apiKey || apiKey.trim() === "") {
          // Fallback demo data if no key is provided in .env
          setTimeout(() => {
            setResult({
              name: "Yellow Mosaic Virus (Mock Data)",
              confidence: 92,
              symptoms: "Yellowing of leaves, stunted growth, and reduced pod formation. This is offline mock data because the VITE_GEMINI_API_KEY environment variable is not set.",
              immediate: "Remove and destroy infected plants immediately to prevent spread.",
              organic: "Control whitefly vectors using Neem oil (3ml/L). Use yellow sticky traps.",
              chemical: "Spray Imidacloprid 17.8 SL @ 0.3 ml/L or Thiamethoxam 25 WG @ 0.2 g/L."
            });
            setLoading(false);
          }, 2000);
          return;
        }

        // Live API Call to Google Gemini Vision
        try {
          const promptText = `Analyze this plant image. Identify any disease, pest, or if it is healthy. Respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting, no backticks, and no extra text: {"name": "Disease or Condition Name", "confidence": 95, "symptoms": "Brief description of visible symptoms", "immediate": "Immediate action to take", "organic": "Organic or Biological treatment", "chemical": "Chemical treatment if applicable"}`;

          // Using the stable gemini-3.6-flash endpoint
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data
                      }
                    }
                  ]
                }
              ]
            }),
          });

          if (!response.ok) {
             const errData = await response.json();
             throw new Error(errData.error?.message || "Gemini API request failed");
          }

          const data = await response.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Clean up any markdown blocks Gemini might have added
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

          try {
            const parsedResult = JSON.parse(rawText);
            setResult({
              name: parsedResult.name || "Unknown Condition",
              confidence: parsedResult.confidence || 0,
              symptoms: parsedResult.symptoms || "Could not analyze symptoms clearly.",
              immediate: parsedResult.immediate || "Consult local agricultural expert.",
              organic: parsedResult.organic || "N/A",
              chemical: parsedResult.chemical || "N/A"
            });
          } catch (parseError) {
            console.error("Failed to parse Gemini JSON:", rawText);
            throw new Error("Could not parse the AI's response. Please try again with a clearer image.");
          }

          setLoading(false);
        } catch (err: any) {
          console.error(err);
          setError("Gemini API Error: " + err.message);
          setLoading(false);
        }
      };
    } catch (err) {
      console.error(err);
      setError("Failed to process image.");
      setLoading(false);
    }
  };

  return (
    <main>
      <Title eyebrow="AI DIAGNOSTICS" title="Pest & Disease Center" copy="Powered by Google Gemini Vision API for accurate visual disease identification and treatment." />
      <div className="diagnose">
        <Card>
          <div style={{ marginBottom: '1rem' }}>
            <label className="auth-label">Upload Plant Image <span className="required">*</span></label>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', marginTop: '0.5rem', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Plant preview" style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '8px' }} />
              ) : (
                <div style={{ color: '#6b7280' }}>
                  <Upload size={32} style={{ margin: '0 auto', marginBottom: '0.5rem' }} />
                  <p>Tap to upload a clear photo of the affected leaf or plant</p>
                </div>
              )}
            </div>
          </div>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

          <button className="button" onClick={analyzePlant} disabled={loading || !image} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><Loader2 className="animate-spin" size={16} /> Analyzing with Gemini AI...</> : <><Sparkles size={16} /> Identify Disease</>}
          </button>
        </Card>
        
        {result && (
          <Card className="result">
            <div className="card-head" style={{ marginBottom: '1rem' }}>
              <div>
                <span className="eyebrow">ANALYSIS RESULT</span>
                <h2 style={{ fontSize: '1.5rem', color: '#111827' }}>{result.name}</h2>
              </div>
              <Badge level={result.confidence > 80 ? "HIGH CONFIDENCE" : "POSSIBLE MATCH"} />
            </div>
            
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}><strong>Symptoms:</strong> {result.symptoms}</p>
            
            <h4 style={{ color: '#b91c1c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16}/> Immediate Action</h4>
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>{result.immediate}</p>
            
            <h4 style={{ color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Leaf size={16}/> Organic / Biological Treatment</h4>
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>{result.organic}</p>
            
            <h4 style={{ color: '#ea580c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Droplets size={16}/> Chemical Treatment</h4>
            <p style={{ fontSize: '0.95rem' }}>{result.chemical}</p>
          </Card>
        )}
      </div>
    </main>
  );
}

// ── Upcoming Features (Separated Pages) ────────────────────────────────────

export function Relief() {
  return (
    <main>
      <Title eyebrow="FUTURE RELEASES" title="Relief & Claims" copy="We are working closely with government partners to bring PMFBY integrations directly to your dashboard." />
      <Card className="empty-state" style={{ padding: '4rem 2rem', border: '2px dashed #d1d5db', backgroundColor: '#f9fafb' }}>
        <ShieldAlert size={48} color="#16a34a" style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>Relief & Claims Navigator</h2>
        <p style={{ color: '#4b5563', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem', lineHeight: '1.6' }}>
          Direct integration with PMFBY (Pradhan Mantri Fasal Bima Yojana) to seamlessly file crop loss claims, upload geotagged damage photos, and track government relief funds straight from your dashboard.
        </p>
        <Badge level="COMING SOON" />
      </Card>
    </main>
  );
}

export function SoilTesting() {
  return (
    <main>
      <Title eyebrow="FUTURE RELEASES" title="Soil Testing & Research" copy="Connect your farm directly to ICAR-approved laboratories for scientific analysis." />
      <Card className="empty-state" style={{ padding: '4rem 2rem', border: '2px dashed #d1d5db', backgroundColor: '#f9fafb' }}>
        <TestTube size={48} color="#d97706" style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>Soil Testing Courier</h2>
        <p style={{ color: '#4b5563', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem', lineHeight: '1.6' }}>
          Book a doorstep courier pickup for your field's soil samples. Send them directly to approved research labs and automatically receive a digital Soil Health Card with precise fertilizer recommendations.
        </p>
        <Badge level="COMING SOON" />
      </Card>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────

export function Notifications() {
  const [read, setRead] = useState<number[]>([]);
  const notes = [
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