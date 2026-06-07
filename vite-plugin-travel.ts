import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

let amapKey = '';
let arkKey = '';
let arkBotId = '';

export function travelPlugin(): Plugin {
  return {
    name: 'vite-plugin-travel',
    config(_config, { mode }) {
      const env = loadEnv(mode, process.cwd(), '');
      amapKey = env.AMAP_API_KEY || '';
      arkKey = env.ARK_API_KEY || '';
      arkBotId = env.ARK_BOT_ID || '';
    },
    configureServer(server) {
      server.middlewares.use('/api/travel', async (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const fromLat = parseFloat(url.searchParams.get('fromLat') || '');
        const fromLon = parseFloat(url.searchParams.get('fromLon') || '');
        const toLat = parseFloat(url.searchParams.get('toLat') || '');
        const toLon = parseFloat(url.searchParams.get('toLon') || '');
        const fromCity = url.searchParams.get('fromCity') || '';
        const toCity = url.searchParams.get('toCity') || '';

        const sendError = (msg: string) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: msg }));
        };
        if (isNaN(fromLat) || isNaN(toLat)) return sendError('缺少坐标');

        // Haversine
        const R = 6371;
        const dLatR = (toLat - fromLat) * Math.PI / 180;
        const dLonR = (toLon - fromLon) * Math.PI / 180;
        const ha = Math.sin(dLatR / 2) ** 2 +
          Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * Math.sin(dLonR / 2) ** 2;
        const straightKm = R * 2 * Math.atan2(Math.sqrt(ha), Math.sqrt(1 - ha));
        const result: any = { driving: null, train: null, flight: null };
        let roadKm = Math.round(straightKm * 1.38);

        // ─── 🚗 高德驾车 ───
        if (amapKey) {
          try {
            const u = `https://restapi.amap.com/v3/direction/driving?origin=${fromLon.toFixed(6)},${fromLat.toFixed(6)}&destination=${toLon.toFixed(6)},${toLat.toFixed(6)}&extensions=all&key=${amapKey}`;
            const r = await fetch(u); const d = await r.json() as any;
            if (d.status === '1' && d.route?.paths?.[0]) {
              const p = d.route.paths[0];
              roadKm = Math.round(parseInt(p.distance) / 1000);
              const s = parseInt(p.duration);
              const toll = parseInt(p.tolls || '0');
              const fuel = Math.round(roadKm / 100 * 8 * 7.8);
              result.driving = { distance: roadKm, time: `${Math.floor(s / 3600)}h${Math.round((s % 3600) / 60)}m`, toll, fuel, total: toll + fuel, source: '高德地图' };
            }
          } catch {}
        }
        if (!result.driving) {
          const toll = Math.round(roadKm * 0.42), fuel = Math.round(roadKm / 100 * 8 * 7.8), m = Math.round(roadKm / 75 * 60);
          result.driving = { distance: roadKm, time: `${Math.floor(m / 60)}h${m % 60}m`, toll, fuel, total: toll + fuel, source: '坐标估算' };
        }

        // ─── 🚄 高铁 ───
        const trainDist = Math.round(roadKm * 0.92);
        const spd = roadKm < 400 ? 220 : roadKm < 800 ? 260 : 290;
        const tm = Math.round(trainDist / spd * 60 + 40);
        result.train = { distance: trainDist, time: `${Math.floor(tm / 60)}h${tm % 60}m`, secondClass: Math.round(trainDist * 0.46), firstClass: Math.round(trainDist * 0.73), businessClass: Math.round(trainDist * 1.02) };

        // ─── ✈️ 机票 ───
        if (arkKey && arkBotId && fromCity && toCity && straightKm > 300) {
          try {
            const r = await fetch('https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${arkKey}` },
              body: JSON.stringify({
                model: arkBotId, max_tokens: 600,
                messages: [{ role: 'user', content: `在携程搜索${fromCity}到${toCity}机票（直达+中转）。用表格列出：航空公司、航班号、出发→到达时间、经停、票价。如有邻近城市出发方案请单列。` }],
              }),
            });
            const rawText = (await r.json() as any)?.choices?.[0]?.message?.content || '';
            result.flight = { raw: rawText, time: `${Math.round(straightKm / 750 + 0.5)}h${Math.round(straightKm * 60 / 750 % 60)}m`, source: '实时搜索' };
            result.flight.parsed = parseFlightTable(rawText);
          } catch {}
        }

        // ─── 🚄 高铁 ───
        if (arkKey && arkBotId && fromCity && toCity && roadKm > 100 && roadKm < 2500) {
          try {
            const r = await fetch('https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${arkKey}` },
              body: JSON.stringify({
                model: arkBotId, max_tokens: 800,
                messages: [{ role: 'user', content: `搜索${fromCity}到${toCity}高铁火车票。直达和中转都列。直达表头：车次|出发站|到达站|发车时间|到达时间|历时|二等座票价。中转表头：第一段车次|出发站|中转站|第二段车次|到达站|发车时间|到达时间|总历时|全程票价。` }],
              }),
            });
            const rawText = (await r.json() as any)?.choices?.[0]?.message?.content || '';
            result.train = { searchResult: rawText, source: '实时搜索', distance: result.train.distance, time: result.train.time, secondClass: result.train.secondClass, firstClass: result.train.firstClass, businessClass: result.train.businessClass };
            result.train.parsed = parseTrainTable(rawText);
          } catch {}
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    },
  };
}

// ─── 纯代码 Markdown 表格解析 ───

interface ParsedTrip {
  type: 'flight' | 'train';
  mode: 'direct' | 'transfer' | 'nearby';
  trainNo?: string;
  from?: string; to?: string;
  via?: string; stopDur?: string;
  depart?: string; arrive?: string;
  duration?: string;
  airline?: string;
  price?: string; totalPrice?: string;
  tag?: string;
}

function parseFlightTable(text: string): ParsedTrip[] {
  const lines = text.split('\n').filter(l => l.includes('|') && l.split('|').filter(Boolean).length >= 4);
  if (lines.length < 2) return [];

  const rows: string[][] = [];
  for (const l of lines) {
    if (/^\|[\s\-:|]+\|$/.test(l)) continue;
    const cols = l.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length >= 4) rows.push(cols);
  }

  const items: ParsedTrip[] = [];
  for (const r of rows) {
    const j = r.join('');
    // Skip header
    if (j.includes('航空') || j.includes('航班号')) continue;
    if (j.length < 5) continue;

    // Cols: 0=airline, 1=flightNo, 2=depart→arrive info, 3=stop, 4=price
    const airline = (r[0] || '').replace(/\s+/g, '');
    const flightNo = r[1] || '';
    const routeInfo = r[2] || '';
    const stop = r[3] || '';
    const price = (r[4] || r[r.length - 1] || '').replace(/[元¥\s]/g, '');

    // Parse route: "20:50 北京大兴→22:55 浦东 T1"
    const m = routeInfo.match(/(\d{1,2}:\d{2})\s+(.+?)\s*[→]\s*(\d{1,2}:\d{2})\s+(.+)/);
    const depart = m?.[1] || '';
    const from = m?.[2] || '';
    const arrive = m?.[3] || '';
    const to = m?.[4] || '';

    items.push({
      type: 'flight', mode: 'transfer',
      depart, from, arrive, to,
      via: stop !== '无' ? stop : '',
      airline: (airline + ' ' + flightNo).trim(),
      price,
    });
  }
  return items;
}

function parseTrainTable(text: string): ParsedTrip[] {
  const items: ParsedTrip[] = [];

  // Split into sections
  const parts = text.split(/(?:###\s*|直达方案|中转方案)/i);
  for (const part of parts) {
    const isTransfer = /中转|换乘|第一段/.test(part);
    const lines = part.split('\n').filter(l => l.includes('|') && l.split('|').filter(Boolean).length >= 5);
    if (lines.length < 2) continue;

    const rows: string[][] = [];
    for (const l of lines) {
      if (/^\|[\s\-:|]+\|$/.test(l)) continue;
      const cols = l.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 5) rows.push(cols);
    }
    if (rows.length < 2) continue;

    // Determine column layout from first data row
    const first = rows[1] || rows[0];
    const n = first.length;

    for (const r of rows) {
      const j = r.join('');
      if (j.includes('车次') || j.includes('第一段') || j.includes('序号') || j.length < 5) continue;

      if (!isTransfer) {
        // 直达: 车次|出发站|到达站|发车时间|到达时间|历时|票价 (7 cols)
        items.push({
          type: 'train', mode: 'direct',
          trainNo: r[0] || '',
          from: r[1] || '', to: r[2] || '',
          depart: r[3] || '', arrive: r[4] || '',
          duration: r[5] || '',
          price: (r[6] || r[n - 1] || '').replace(/[¥￥元约\s]/g, ''),
        });
      } else if (n >= 9) {
        // 中转（9+列）: 序号|第一段车次|出发站|第一段到达站[中转站]|...|票价
        // 尝试提取: 车次1+车次2, 出发站, 中转站, 到达站, 票价
        const t1 = r[1] || ''; // 第一段车次
        const from = r[2] || ''; // 出发站
        // Find via station - look for a "中转站" or "第一段到达站" column
        const t2Idx = r.findIndex((c, idx) => idx > 2 && /[GCDK]\d{2,4}/.test(c));
        const via = t2Idx > 0 ? (r[t2Idx - 1] || '') : (r[3] || '');
        const t2 = t2Idx > 0 ? r[t2Idx] : (r[4] || '');
        const toIdx = t2Idx > 0 ? t2Idx + 1 : 5;
        const to = r[toIdx] || r[n - 3] || '';

        items.push({
          type: 'train', mode: 'transfer',
          trainNo: (t1 + '转' + t2).replace(/undefined/g, ''),
          from, via, to,
          depart: r[t2Idx > 0 ? t2Idx - 2 : 3] || r[3] || '',
          arrive: r[toIdx + 1] || r[n - 2] || '',
          duration: r[toIdx + 2] || r[n - 3] || '',
          totalPrice: (r[n - 1] || '').replace(/[¥￥元约\s]/g, ''),
          price: (r[n - 1] || '').replace(/[¥￥元约\s]/g, ''),
        });
      }
    }
  }
  return items;
}
