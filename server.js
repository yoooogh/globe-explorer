// Globe Explorer — Production Server (Railway)
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Middleware ───
app.use(express.json());

// ─── Static files (built SPA) ───
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ─── Env ───
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const AMAP_API_KEY = process.env.AMAP_API_KEY || '';
const ARK_API_KEY = process.env.ARK_API_KEY || '';
const ARK_BOT_ID = process.env.ARK_BOT_ID || '';

// ─── /api/ai ───
app.get('/api/ai', async (req, res) => {
  const city = req.query.city || '';
  const country = req.query.country || '';
  if (!city) return res.status(400).json({ error: '缺少城市名称' });
  if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: '未配置 DEEPSEEK_API_KEY' });

  try {
    const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat', max_tokens: 2000, temperature: 0.7,
        messages: [
          { role: 'system', content: '你是专业的旅行地理助手。只返回JSON，不要添加任何额外说明。' },
          { role: 'user', content: `请用JSON回复关于"${city}"（${country}）的信息：\n{\n  "climate": "2-3句话描述气候",\n  "vegetation": "2-3句话描述植被",\n  "attractions": [{"name":"景点名","desc":"一句话介绍"}],\n  "culture": "2-3句话描述文化",\n  "tips": "2-3条实用建议"\n}\nattractions包含3-5个景点。直接返回JSON，不要markdown代码块。` }
        ],
      }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || 'DeepSeek API error');
    const text = d?.choices?.[0]?.message?.content || '';
    let parsed;
    try { parsed = JSON.parse(text.trim()); }
    catch {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) parsed = JSON.parse(m[1].trim());
      else throw new Error(`AI format error: ${text.slice(0,100)}`);
    }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'AI请求失败: ' + e.message });
  }
});

// ─── /api/travel ───
app.get('/api/travel', async (req, res) => {
  const fromLat = parseFloat(req.query.fromLat || '');
  const fromLon = parseFloat(req.query.fromLon || '');
  const toLat = parseFloat(req.query.toLat || '');
  const toLon = parseFloat(req.query.toLon || '');
  const fromCity = req.query.fromCity || '';
  const toCity = req.query.toCity || '';

  if (isNaN(fromLat) || isNaN(toLat)) return res.status(500).json({ error: '缺少坐标' });

  // Haversine
  const R = 6371;
  const dLatR = (toLat - fromLat) * Math.PI / 180;
  const dLonR = (toLon - fromLon) * Math.PI / 180;
  const ha = Math.sin(dLatR/2)**2 + Math.cos(fromLat*Math.PI/180)*Math.cos(toLat*Math.PI/180)*Math.sin(dLonR/2)**2;
  const straightKm = R * 2 * Math.atan2(Math.sqrt(ha), Math.sqrt(1-ha));
  const result = { driving: null, train: null, flight: null };
  let roadKm = Math.round(straightKm * 1.38);

  // 驾车
  if (AMAP_API_KEY) {
    try {
      const u = `https://restapi.amap.com/v3/direction/driving?origin=${fromLon.toFixed(6)},${fromLat.toFixed(6)}&destination=${toLon.toFixed(6)},${toLat.toFixed(6)}&extensions=all&key=${AMAP_API_KEY}`;
      const r = await fetch(u); const d = await r.json();
      if (d.status === '1' && d.route?.paths?.[0]) {
        const p = d.route.paths[0];
        roadKm = Math.round(parseInt(p.distance) / 1000);
        const s = parseInt(p.duration);
        const toll = parseInt(p.tolls || '0');
        const fuel = Math.round(roadKm/100*8*7.8);
        result.driving = { distance: roadKm, time: `${Math.floor(s/3600)}h${Math.round((s%3600)/60)}m`, toll, fuel, total: toll+fuel, source: '高德地图' };
      }
    } catch {}
  }
  if (!result.driving) {
    const toll = Math.round(roadKm*0.42), fuel = Math.round(roadKm/100*8*7.8), m = Math.round(roadKm/75*60);
    result.driving = { distance: roadKm, time: `${Math.floor(m/60)}h${m%60}m`, toll, fuel, total: toll+fuel, source: '坐标估算' };
  }

  // 高铁（估算）
  const trainDist = Math.round(roadKm * 0.92);
  const spd = roadKm < 400 ? 220 : roadKm < 800 ? 260 : 290;
  const tm = Math.round(trainDist/spd*60 + 40);
  result.train = { distance: trainDist, time: `${Math.floor(tm/60)}h${tm%60}m`, secondClass: Math.round(trainDist*0.46), firstClass: Math.round(trainDist*0.73), businessClass: Math.round(trainDist*1.02) };

  // 机票 + 高铁（火山方舟 Bot 搜索）
  if (ARK_API_KEY && ARK_BOT_ID && fromCity && toCity) {
    // Flight
    if (straightKm > 300) {
      try {
        const r = await fetch('https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ARK_API_KEY}` },
          body: JSON.stringify({ model: ARK_BOT_ID, max_tokens: 600, messages: [{ role: 'user', content: `在携程搜索${fromCity}到${toCity}机票（直达+中转）。用表格列出：航空公司、航班号、出发→到达时间、经停、票价。` }] }),
        });
        const rawText = (await r.json())?.choices?.[0]?.message?.content || '';
        result.flight = { raw: rawText, time: `${Math.round(straightKm/750+0.5)}h${Math.round(straightKm*60/750%60)}m`, source: '实时搜索', parsed: parseFlightTable(rawText) };
      } catch {}
    }
    // Train search
    if (roadKm > 100 && roadKm < 2500) {
      try {
        const r = await fetch('https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ARK_API_KEY}` },
          body: JSON.stringify({ model: ARK_BOT_ID, max_tokens: 800, messages: [{ role: 'user', content: `搜索${fromCity}到${toCity}高铁火车票。直达和中转都列。直达表头：车次|出发站|到达站|发车时间|到达时间|历时|二等座票价。中转表头：第一段车次|出发站|中转站|第二段车次|到达站|发车时间|到达时间|总历时|全程票价。` }] }),
        });
        const rawText = (await r.json())?.choices?.[0]?.message?.content || '';
        result.train = { ...result.train, searchResult: rawText, source: '实时搜索', parsed: parseTrainTable(rawText) };
      } catch {}
    }
  }

  res.json(result);
});

// ─── 纯代码 Markdown 表格解析（port from vite-plugin-travel.ts） ───

function parseFlightTable(text) {
  const lines = text.split('\n').filter(l => l.includes('|') && l.split('|').filter(Boolean).length >= 4);
  if (lines.length < 2) return [];
  const rows = [];
  for (const l of lines) {
    if (/^\|[\s\-:|]+\|$/.test(l)) continue;
    const cols = l.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 4) rows.push(cols);
  }
  const items = [];
  for (const r of rows) {
    const j = r.join('');
    if (j.includes('航空') || j.includes('航班号') || j.length < 5) continue;
    const airline = (r[0]||'').replace(/\s+/g,'');
    const flightNo = r[1]||'';
    const route = r[2]||'';
    const stop = r[3]||'';
    const price = (r[4]||r[r.length-1]||'').replace(/[元¥\s]/g,'');
    const m = route.match(/(\d{1,2}:\d{2})\s+(.+?)\s*[→]\s*(\d{1,2}:\d{2})\s+(.+)/);
    items.push({
      type:'flight', mode:'transfer',
      depart: m?.[1]||'', from: m?.[2]||'', arrive: m?.[3]||'', to: m?.[4]||'',
      via: stop!=='无'?stop:'',
      airline: (airline+' '+flightNo).trim(), price,
    });
  }
  return items;
}

function parseTrainTable(text) {
  const items = [];
  const parts = text.split(/(?:###\s*|直达方案|中转方案)/i);
  for (const part of parts) {
    const isTransfer = /中转|换乘|第一段/.test(part);
    const lines = part.split('\n').filter(l => l.includes('|') && l.split('|').filter(Boolean).length>=5);
    if (lines.length < 2) continue;
    const rows = [];
    for (const l of lines) {
      if (/^\|[\s\-:|]+\|$/.test(l)) continue;
      const cols = l.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 5) rows.push(cols);
    }
    if (rows.length < 2) continue;
    const n = rows[1]?.length || rows[0]?.length || 0;
    for (const r of rows) {
      const j = r.join('');
      if (j.includes('车次')||j.includes('第一段')||j.includes('序号')||j.length<5) continue;
      if (!isTransfer) {
        items.push({
          type:'train', mode:'direct',
          trainNo: r[0]||'', from: r[1]||'', to: r[2]||'',
          depart: r[3]||'', arrive: r[4]||'', duration: r[5]||'',
          price: (r[6]||r[n-1]||'').replace(/[¥￥元约\s]/g,''),
        });
      } else if (n>=9) {
        const t1 = r[1]||'';
        const from = r[2]||'';
        const t2Idx = r.findIndex((c,idx) => idx>2 && /[GCDK]\d{2,4}/.test(c));
        items.push({
          type:'train', mode:'transfer',
          trainNo: (t1+'转'+(t2Idx>0?r[t2Idx]:r[4]||'')).replace(/undefined/g,''),
          from, via: t2Idx>0?(r[t2Idx-1]||''):(r[3]||''),
          to: r[t2Idx>0?t2Idx+1:5]||r[n-3]||'',
          depart: r[t2Idx>0?t2Idx-2:3]||r[3]||'',
          arrive: r[t2Idx>0?t2Idx+2:6]||r[n-2]||'',
          duration: r[t2Idx>0?t2Idx+3:7]||r[n-3]||'',
          totalPrice: (r[n-1]||'').replace(/[¥￥元约\s]/g,''),
          price: (r[n-1]||'').replace(/[¥￥元约\s]/g,''),
        });
      }
    }
  }
  return items;
}

// ─── SPA fallback ───
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── Start ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Globe Explorer running on port ${PORT}`);
});
