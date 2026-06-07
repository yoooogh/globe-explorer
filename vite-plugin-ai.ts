import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

export function aiPlugin(): Plugin {
  let apiKey = '';

  return {
    name: 'vite-plugin-ai',

    config(_config, { mode }) {
      // Load .env file using Vite's built-in loader
      const env = loadEnv(mode, process.cwd(), '');
      apiKey = env.DEEPSEEK_API_KEY || '';
    },

    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const city = url.searchParams.get('city') || '';
        const country = url.searchParams.get('country') || '';

        if (!city) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '缺少城市名称' }));
          return;
        }

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '未配置 DEEPSEEK_API_KEY，请在 .env 文件中设置' }));
          return;
        }

        try {
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              max_tokens: 2000,
              temperature: 0.7,
              messages: [
                {
                  role: 'system',
                  content: '你是一个专业的旅行地理助手。请始终用中文回复，只返回JSON格式数据，不要添加任何额外说明。',
                },
                {
                  role: 'user',
                  content: `请用以下JSON格式回复关于"${city}"（${country}）的信息：

{
  "climate": "2-3句话描述当地气候特点",
  "vegetation": "2-3句话描述当地植被和自然景观",
  "attractions": [
    { "name": "景点名", "desc": "一句话介绍" }
  ],
  "culture": "2-3句话描述当地历史文化和民族特色",
  "tips": "给旅行者的2-3条实用建议"
}

attractions数组包含3-5个当地著名景点。直接返回JSON，不要markdown代码块。`,
                },
              ],
            }),
          });

          const data = await response.json() as any;

          if (data.error) {
            throw new Error(data.error.message || 'DeepSeek API 错误');
          }

          const text = data?.choices?.[0]?.message?.content || '';

          let parsed;
          try {
            parsed = JSON.parse(text.trim());
          } catch {
            const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) {
              parsed = JSON.parse(match[1].trim());
            } else {
              throw new Error(`AI响应格式错误: ${text.slice(0, 100)}`);
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(parsed));
        } catch (e) {
          console.error('DeepSeek API error:', e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'AI请求失败: ' + (e as Error).message }));
        }
      });
    },
  };
}
