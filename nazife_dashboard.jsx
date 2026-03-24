import { useState } from "react";

// ─── VERİTABANI ──────────────────────────────────────────────────────────────
const PLAYERS = [
  { id:"wembanyama", name:"Victor Wembanyama", team:"SAS", ppg:24.3, rpg:11.1, apg:3.0, bpg:2.8,
    barems:{ points:{v:22.5,c:"güçlü"}, rebounds:{v:10.5,c:"güçlü"}, blocks:{v:2.5,c:"güçlü"}, assists:{v:2.5,c:"normal"} },
    spread_sensitivity:"normal",
    veto:["Injury check kritik (diz/ayak bilegi)","Back-to-back 2. macı: dakika kısıtı","Blowout >15 fark → kural 19.7"] },
  { id:"jokic", name:"Nikola Jokic", team:"DEN", ppg:28.1, rpg:12.6, apg:10.5, bpg:0.7,
    barems:{ points:{v:27.5,c:"dikkatli",note:"26.5 sürekli sınırda"}, rebounds:{v:11.5,c:"güçlü"}, assists:{v:9.5,c:"güçlü"} },
    spread_sensitivity:"düşük",
    veto:["Sayi baremi 27.5 kullan (26.5 sinirlarda kaliyor)","65-mac kuralı riski"] },
  { id:"sga", name:"Shai Gilgeous-Alexander", team:"OKC", ppg:31.6, rpg:4.4, apg:6.6, spg:2.0,
    barems:{ points:{v:29.5,c:"güçlü"}, assists:{v:6.5,c:"normal"}, steals:{v:1.5,c:"güçlü"}, points_under:{v:30.5,c:"güçlü",note:"OKC çok fav iken"} },
    spread_sensitivity:"yüksek",
    veto:["Dönüş ilk macı: tekli yok","OKC spread >12 → over tekli yok (19.7)","Injury check kritik (abdominal)"] },
  { id:"doncic", name:"Luka Doncic", team:"LAL", ppg:33.4, rpg:8.5, apg:8.5,
    barems:{ points:{v:29.5,c:"güçlü",note:"LeBron yokken 35+"}, rebounds:{v:7.5,c:"güçlü"}, assists:{v:7.5,c:"normal"} },
    spread_sensitivity:"normal",
    veto:["LeBron yokken barem yuksel","Hamstring gecmisi: injury check","Teknik foul sorunu"] },
  { id:"brunson", name:"Jalen Brunson", team:"NYK", ppg:29.1, rpg:3.5, apg:6.6,
    barems:{ points:{v:27.5,c:"dikkatli",note:"Spread <10 sartıyla"}, assists:{v:6.5,c:"normal"} },
    spread_sensitivity:"yüksek",
    veto:["NYK spread >15 → Brunson erken cekilir (19.7)","Blowout kanitlandi: WAS macında 32 fark, 23 sayi"] },
  { id:"banchero", name:"Paolo Banchero", team:"ORL", ppg:22.2, rpg:8.5, apg:5.0,
    barems:{ points:{v:22.5,c:"güçlü"}, rebounds:{v:8.5,c:"dikkatli",note:"Varyans yüksek"} },
    spread_sensitivity:"normal",
    veto:["Ribaund varyansı çok yüksek → sayi over tercih et","Takim kayip serisinde: kural 19.6"] },
  { id:"cunningham", name:"Cade Cunningham", team:"DET", ppg:24.1, rpg:5.0, apg:9.2,
    barems:{ points:{v:24.5,c:"güçlü"}, assists:{v:8.5,c:"normal",note:"9.5 sınırda kaliyor"} },
    spread_sensitivity:"normal",
    veto:["Asist baremi 9.5 değil 8.5 kullan"] },
  { id:"brown", name:"Jaylen Brown", team:"BOS", ppg:26.0, rpg:7.2, apg:5.1,
    barems:{ points_tatum_out:{v:24.5,c:"güçlü",note:"Tatum yokken"}, points_tatum_in:{v:21.5,c:"güçlü",note:"Tatum varken"} },
    spread_sensitivity:"normal",
    veto:["Tatum sahada ise barem 21.5'e düşür","Ejeksiyon geçmişi: temperament riski"] },
];

const TEAMS = [
  { id:"WAS", name:"Washington Wizards", drtg:120, tier:"kötü",
    open:["Guard profillerine tam açık","3pt savunması berbat (%40.5)","Pick-and-roll savunması berbat"],
    strong:[], blowout_risk:"çok yüksek" },
  { id:"IND", name:"Indiana Pacers", drtg:125, tier:"tank",
    open:["Her pozisyona açık","Big forward profilleri için büyük açık","Pace yüksek"],
    strong:[], blowout_risk:"düşük" },
  { id:"NYK", name:"New York Knicks", drtg:112.7, tier:"orta",
    open:["Center/big forward: ribaund ve sayıda açık","Post savunması zayıf"],
    strong:["Perimeter: Bridges, Anunoby güçlü"] },
  { id:"MIA", name:"Miami Heat", drtg:112.5, tier:"orta",
    open:["Center profillerine açık","Second chance veriyor"],
    strong:["Help defense: Spoelstra sistemi iyi"] },
  { id:"PHI", name:"Philadelphia 76ers", drtg:116.1, tier:"zayıf",
    open:["Kadro kırıkken guard savunması çöküyor","Transition savunması kötü"],
    strong:["Embiid sağlıksa organize olabiliyor"] },
  { id:"BOS", name:"Boston Celtics", drtg:109, tier:"güçlü",
    open:["Uzak üçlüklere izin veriyor (Wemby bunu kullandı)"],
    strong:["White, Brown perimeter savunması güçlü","Help defense iyi"] },
];

const TESTS = [
  { date:"2026-03-24", player:"wembanyama", opp:"MIA", spread:"MIA -3", market:"points", line:22.5, dir:"over", actual:26, result:"win" },
  { date:"2026-03-24", player:"wembanyama", opp:"MIA", spread:"MIA -3", market:"rebounds", line:10.5, dir:"over", actual:15, result:"win" },
  { date:"2026-03-24", player:"wembanyama", opp:"MIA", spread:"MIA -3", market:"blocks", line:2.5, dir:"over", actual:5, result:"win" },
  { date:"2026-03-24", player:"sga", opp:"PHI", spread:"OKC -20", market:"points_under", line:30.5, dir:"under", actual:22, result:"win" },
  { date:"2026-03-23", player:"banchero", opp:"IND", spread:"IND -2", market:"points", line:22.5, dir:"over", actual:39, result:"win" },
  { date:"2026-03-23", player:"banchero", opp:"IND", spread:"IND -2", market:"rebounds", line:8.5, dir:"over", actual:4, result:"loss", flag:"Varyans" },
  { date:"2026-03-23", player:"cunningham", opp:"LAL", spread:"DET -3", market:"points", line:24.5, dir:"over", actual:30, result:"win" },
  { date:"2026-03-23", player:"cunningham", opp:"LAL", spread:"DET -3", market:"assists", line:9.5, dir:"over", actual:8, result:"loss", flag:"Barem" },
  { date:"2026-03-23", player:"brunson", opp:"WAS", spread:"NYK -22.5", market:"points", line:27.5, dir:"over", actual:23, result:"loss", flag:"19.7 ihlali" },
  { date:"2026-03-23", player:"brunson", opp:"WAS", spread:"NYK -22.5", market:"assists", line:6.5, dir:"over", actual:4, result:"loss", flag:"19.7 ihlali" },
  { date:"2026-03-23", player:"booker", opp:"TOR", spread:"PHX -22", market:"points", line:28.5, dir:"over", actual:25, result:"loss", flag:"19.7 ihlali" },
  { date:"2026-03-23", player:"brown", opp:"MIN", spread:"MIN +10.5", market:"points", line:24.5, dir:"over", actual:29, result:"win" },
  { date:"2026-03-13", player:"sga", opp:"BOS", spread:"OKC -2", market:"points", line:27.5, dir:"over", actual:35, result:"win" },
  { date:"2026-03-13", player:"sga", opp:"BOS", spread:"OKC -2", market:"assists", line:5.5, dir:"over", actual:9, result:"win" },
  { date:"2026-03-11", player:"wembanyama", opp:"BOS", spread:"SAS -2", market:"points", line:24.5, dir:"over", actual:39, result:"win" },
  { date:"2026-03-11", player:"wembanyama", opp:"BOS", spread:"SAS -2", market:"rebounds", line:10.5, dir:"over", actual:11, result:"win" },
  { date:"2026-03-08", player:"doncic", opp:"NYK", spread:"NYK -3.5", market:"points", line:29.5, dir:"over", actual:35, result:"win" },
  { date:"2026-03-08", player:"doncic", opp:"NYK", spread:"NYK -3.5", market:"rebounds", line:7.5, dir:"over", actual:8, result:"win" },
  { date:"2026-03-05", player:"jokic", opp:"UTA", spread:"DEN -10", market:"points", line:26.5, dir:"over", actual:26, result:"loss", flag:"Barem 27.5 olmalıydı" },
  { date:"2026-03-05", player:"jokic", opp:"UTA", spread:"DEN -10", market:"rebounds", line:11.5, dir:"over", actual:15, result:"win" },
  { date:"2026-03-05", player:"jokic", opp:"UTA", spread:"DEN -10", market:"assists", line:9.5, dir:"over", actual:11, result:"win" },
  { date:"2026-03-01", player:"wembanyama", opp:"NYK", spread:"SAS -1.5", market:"points", line:22.5, dir:"over", actual:25, result:"win" },
  { date:"2026-03-01", player:"wembanyama", opp:"NYK", spread:"SAS -1.5", market:"rebounds", line:10.5, dir:"over", actual:13, result:"win" },
  { date:"2026-03-01", player:"wembanyama", opp:"NYK", spread:"SAS -1.5", market:"blocks", line:2.5, dir:"over", actual:4, result:"win" },
];

// ─── YARDIMCILAR ─────────────────────────────────────────────────────────────
const tierColor = { "güçlü":"bg-blue-100 text-blue-800", "orta":"bg-yellow-100 text-yellow-800",
  "zayıf":"bg-orange-100 text-orange-800", "kötü":"bg-red-100 text-red-800", "tank":"bg-red-200 text-red-900" };
const confColor = { "güçlü":"text-green-700 font-bold", "normal":"text-gray-600", "dikkatli":"text-orange-600 font-semibold" };
const marketLabel = { points:"📊 Sayı", rebounds:"🏀 Ribaund", assists:"🎯 Asist",
  blocks:"🛡️ Blok", steals:"⚡ Steal", points_under:"📉 Sayı Under",
  points_tatum_out:"📊 Sayı (Tatum yok)", points_tatum_in:"📊 Sayı (Tatum var)" };

function winRate(tests) {
  const valid = tests.filter(t => t.result === "win" || t.result === "loss");
  if (!valid.length) return null;
  return (valid.filter(t => t.result === "win").length / valid.length * 100).toFixed(0);
}

// ─── BILEŞENLER ──────────────────────────────────────────────────────────────
function StatBadge({ label, value }) {
  return (
    <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
}

function WinRateBadge({ rate }) {
  if (rate === null) return null;
  const color = rate >= 80 ? "bg-green-100 text-green-800" : rate >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>%{rate}</span>;
}

function PlayerCard({ player, tests, onClick, selected }) {
  const playerTests = tests.filter(t => t.player === player.id);
  const rate = winRate(playerTests);
  return (
    <div onClick={() => onClick(player.id)}
      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300 hover:shadow"}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-gray-900">{player.name}</div>
          <div className="text-sm text-gray-500">{player.team}</div>
        </div>
        <WinRateBadge rate={rate} />
      </div>
      <div className="grid grid-cols-4 gap-1 mt-3">
        {player.ppg && <StatBadge label="PPG" value={player.ppg} />}
        {player.rpg && <StatBadge label="RPG" value={player.rpg} />}
        {player.apg && <StatBadge label="APG" value={player.apg} />}
        {player.bpg && <StatBadge label="BPG" value={player.bpg} />}
        {player.spg && <StatBadge label="SPG" value={player.spg} />}
      </div>
    </div>
  );
}

function PlayerDetail({ player, tests }) {
  const playerTests = tests.filter(t => t.player === player.id);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
          <div className="text-sm text-gray-500">{player.team} · Spread hassasiyeti: <span className="font-semibold">{player.spread_sensitivity}</span></div>
        </div>
      </div>

      {/* Baremler */}
      <div>
        <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">Barem Kalibrasyonu</h3>
        <div className="space-y-2">
          {Object.entries(player.barems).map(([key, b]) => (
            <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700">{marketLabel[key] || key}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{b.v}</span>
                <span className={`text-xs ${confColor[b.c]}`}>{b.c}</span>
                {b.note && <span className="text-xs text-gray-400">· {b.note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vetolar */}
      {player.veto.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">⚠️ Veto / Dikkat</h3>
          <div className="space-y-1">
            {player.veto.map((v, i) => (
              <div key={i} className="text-sm bg-orange-50 text-orange-800 rounded px-3 py-1.5">{v}</div>
            ))}
          </div>
        </div>
      )}

      {/* Test Geçmişi */}
      {playerTests.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">
            Test Geçmişi · <WinRateBadge rate={winRate(playerTests)} />
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 text-white">
                  {["Tarih","Rakip","Market","Çizgi","Fiil","Sonuç","Not"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerTests.map((t, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-2 py-1.5 text-gray-600">{t.date.slice(5)}</td>
                    <td className="px-2 py-1.5 font-semibold">{t.opp}</td>
                    <td className="px-2 py-1.5">{marketLabel[t.market] || t.market}</td>
                    <td className="px-2 py-1.5">{t.line} {t.dir === "over" ? "↑" : "↓"}</td>
                    <td className="px-2 py-1.5 font-bold">{t.actual}</td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${t.result === "win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {t.result === "win" ? "✅" : "❌"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-gray-400">{t.flag || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamsTab() {
  const [selected, setSelected] = useState(null);
  const team = TEAMS.find(t => t.id === selected);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {TEAMS.map(t => (
          <div key={t.id} onClick={() => setSelected(t.id === selected ? null : t.id)}
            className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${selected === t.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-900">{t.id}</div>
                <div className="text-xs text-gray-500">{t.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">{t.drtg}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${tierColor[t.tier] || "bg-gray-100 text-gray-700"}`}>{t.tier}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {team && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-gray-900">{team.name} · DRtg: {team.drtg}</h3>
          {team.open.length > 0 && (
            <div>
              <div className="text-xs font-bold text-green-700 mb-1 uppercase">✅ Açık Alanlar</div>
              {team.open.map((o, i) => <div key={i} className="text-sm bg-green-50 text-green-800 rounded px-2 py-1 mb-1">{o}</div>)}
            </div>
          )}
          {team.strong.length > 0 && (
            <div>
              <div className="text-xs font-bold text-red-700 mb-1 uppercase">🛡️ Güçlü Alanlar</div>
              {team.strong.map((s, i) => <div key={i} className="text-sm bg-red-50 text-red-800 rounded px-2 py-1 mb-1">{s}</div>)}
            </div>
          )}
          {team.blowout_risk && (
            <div className="text-xs bg-orange-50 text-orange-800 rounded px-2 py-1">⚠️ Blowout riski: {team.blowout_risk}</div>
          )}
        </div>
      )}
    </div>
  );
}

function StatsTab({ tests }) {
  const total = tests.length;
  const wins = tests.filter(t => t.result === "win").length;
  const losses = tests.filter(t => t.result === "loss").length;
  const blowoutLosses = tests.filter(t => t.flag && t.flag.includes("19.7")).length;
  const nonBlowout = tests.filter(t => !t.flag || !t.flag.includes("19.7"));
  const nbWins = nonBlowout.filter(t => t.result === "win").length;

  const byMarket = {};
  tests.forEach(t => {
    if (!byMarket[t.market]) byMarket[t.market] = { wins: 0, total: 0 };
    byMarket[t.market].total++;
    if (t.result === "win") byMarket[t.market].wins++;
  });

  const byPlayer = {};
  tests.forEach(t => {
    if (!byPlayer[t.player]) byPlayer[t.player] = { wins: 0, total: 0 };
    byPlayer[t.player].total++;
    if (t.result === "win") byPlayer[t.player].wins++;
  });

  return (
    <div className="space-y-5">
      {/* Genel */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Toplam Tahmin", value: total },
          { label: "İsabet", value: `${wins}/${total}` },
          { label: "Genel Başarı", value: `%${(wins/total*100).toFixed(0)}` },
          { label: "Blowout Hariç", value: `%${(nbWins/nonBlowout.length*100).toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Market bazında */}
      <div>
        <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase">Market Bazında</h3>
        <div className="space-y-2">
          {Object.entries(byMarket).map(([market, d]) => {
            const rate = d.wins / d.total * 100;
            return (
              <div key={market} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2">
                <div className="flex-1 text-sm text-gray-700">{marketLabel[market] || market}</div>
                <div className="text-xs text-gray-500">{d.wins}/{d.total}</div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${rate >= 80 ? "bg-green-500" : rate >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${rate}%` }} />
                </div>
                <div className={`text-xs font-bold w-10 text-right ${rate >= 80 ? "text-green-700" : rate >= 60 ? "text-yellow-700" : "text-red-600"}`}>
                  %{rate.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Oyuncu bazında */}
      <div>
        <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase">Oyuncu Bazında</h3>
        <div className="space-y-2">
          {Object.entries(byPlayer).sort((a,b) => b[1].wins/b[1].total - a[1].wins/a[1].total).map(([pid, d]) => {
            const p = PLAYERS.find(x => x.id === pid);
            const rate = d.wins / d.total * 100;
            return (
              <div key={pid} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{p?.name || pid}</div>
                </div>
                <div className="text-xs text-gray-500">{d.wins}/{d.total}</div>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${rate >= 80 ? "bg-green-500" : rate >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${rate}%` }} />
                </div>
                <div className={`text-xs font-bold w-10 text-right ${rate >= 80 ? "text-green-700" : rate >= 60 ? "text-yellow-700" : "text-red-600"}`}>
                  %{rate.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TestsTab({ tests }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? tests : filter === "win" ? tests.filter(t => t.result === "win") : tests.filter(t => t.result === "loss");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[["all","Tümü"], ["win","✅ İsabet"], ["loss","❌ Miss"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === v ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800 text-white">
              {["Tarih","Oyuncu","Rakip","Market","Çizgi","Fiil","Sonuç","Not"].map(h => (
                <th key={h} className="px-2 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const p = PLAYERS.find(x => x.id === t.player);
              return (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-2 py-1.5 text-gray-500">{t.date.slice(5)}</td>
                  <td className="px-2 py-1.5 font-semibold text-gray-800">{p?.name.split(" ")[0] || t.player}</td>
                  <td className="px-2 py-1.5">{t.opp}</td>
                  <td className="px-2 py-1.5">{marketLabel[t.market] || t.market}</td>
                  <td className="px-2 py-1.5">{t.line} {t.dir === "over" ? "↑" : "↓"}</td>
                  <td className="px-2 py-1.5 font-bold">{t.actual}</td>
                  <td className="px-2 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${t.result === "win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {t.result === "win" ? "✅ Win" : "❌ Miss"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-orange-600">{t.flag || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function NazifeDashboard() {
  const [tab, setTab] = useState("players");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const player = PLAYERS.find(p => p.id === selectedPlayer);
  const tabs = [
    { id: "players", label: "👤 Oyuncular" },
    { id: "teams", label: "🏟️ Takımlar" },
    { id: "tests", label: "📋 Testler" },
    { id: "stats", label: "📊 İstatistik" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-5 text-white">
          <h1 className="text-2xl font-black tracking-tight">NAZIFE PRO</h1>
          <div className="text-blue-200 text-sm mt-1">NBA Oyuncu Prop Analiz Sistemi · v3.0 · 24 Mart 2026</div>
          <div className="flex gap-4 mt-3">
            {[
              { label: "Genel", value: `%${(TESTS.filter(t=>t.result==="win").length/TESTS.length*100).toFixed(0)}` },
              { label: "Sayı", value: "%83" },
              { label: "Blok", value: "%100" },
              { label: "Asist", value: "%50" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-blue-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedPlayer(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          {tab === "players" && (
            <div className="space-y-4">
              {!selectedPlayer ? (
                <div className="grid grid-cols-1 gap-3">
                  {PLAYERS.map(p => (
                    <PlayerCard key={p.id} player={p} tests={TESTS}
                      onClick={setSelectedPlayer} selected={selectedPlayer === p.id} />
                  ))}
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedPlayer(null)}
                    className="mb-4 text-sm text-blue-600 hover:underline">← Geri</button>
                  <PlayerDetail player={player} tests={TESTS} />
                </div>
              )}
            </div>
          )}
          {tab === "teams" && <TeamsTab />}
          {tab === "tests" && <TestsTab tests={TESTS} />}
          {tab === "stats" && <StatsTab tests={TESTS} />}
        </div>
      </div>
    </div>
  );
}
