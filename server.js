const express = require('express');
const path = require('path');
const cors = require('cors');
const { HuaChar, HuaSource } = require('huaming');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/name-generator-online.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'name-generator-online.html'));
});
app.get('/', (req, res) => {
  res.redirect('/name-generator-online.html');
});
app.use(express.static(__dirname));

const PORT = parseInt(process.env.PORT) || 3456;

const STYLE_MAP = {
  '古风': { type: 'source', source: 'chuci' },
  '仙侠': { type: 'source', source: 'tangshi' },
  '诗意': { type: 'source', source: 'songci' },
  '清雅': { type: 'source', source: 'shijing' },
  '江湖': { type: 'source', source: 'songci' },
  '金·金金': { type: 'char', fiveElements: '金金' },
  '金·金木': { type: 'char', fiveElements: '金木' },
  '金·金水': { type: 'char', fiveElements: '金水' },
  '金·金火': { type: 'char', fiveElements: '金火' },
  '金·金土': { type: 'char', fiveElements: '金土' },
  '木·木木': { type: 'char', fiveElements: '木木' },
  '木·木水': { type: 'char', fiveElements: '木水' },
  '木·木火': { type: 'char', fiveElements: '木火' },
  '木·木土': { type: 'char', fiveElements: '木土' },
  '木·木金': { type: 'char', fiveElements: '木金' },
  '水·水水': { type: 'char', fiveElements: '水水' },
  '水·水木': { type: 'char', fiveElements: '水木' },
  '水·水火': { type: 'char', fiveElements: '水火' },
  '水·水土': { type: 'char', fiveElements: '水土' },
  '水·水金': { type: 'char', fiveElements: '水金' },
  '火·火火': { type: 'char', fiveElements: '火火' },
  '火·火木': { type: 'char', fiveElements: '火木' },
  '火·火水': { type: 'char', fiveElements: '火水' },
  '火·火土': { type: 'char', fiveElements: '火土' },
  '火·火金': { type: 'char', fiveElements: '火金' },
  '土·土土': { type: 'char', fiveElements: '土土' },
  '土·土木': { type: 'char', fiveElements: '土木' },
  '土·土水': { type: 'char', fiveElements: '土水' },
  '土·土火': { type: 'char', fiveElements: '土火' },
  '土·土金': { type: 'char', fiveElements: '土金' },
};

const STYLE_SOURCE_LABEL = {
  '古风': '楚辞',
  '仙侠': '唐诗',
  '诗意': '宋词',
  '清雅': '诗经',
  '江湖': '宋词',
  '金·金金': '五行',
  '金·金木': '五行',
  '金·金水': '五行',
  '金·金火': '五行',
  '金·金土': '五行',
  '木·木木': '五行',
  '木·木水': '五行',
  '木·木火': '五行',
  '木·木土': '五行',
  '木·木金': '五行',
  '水·水水': '五行',
  '水·水木': '五行',
  '水·水火': '五行',
  '水·水土': '五行',
  '水·水金': '五行',
  '火·火火': '五行',
  '火·火木': '五行',
  '火·火水': '五行',
  '火·火土': '五行',
  '火·火金': '五行',
  '土·土土': '五行',
  '土·土木': '五行',
  '土·土水': '五行',
  '土·土火': '五行',
  '土·土金': '五行',
};

app.get('/api/huaming', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 10, 50);
  const style = Object.keys(STYLE_MAP).includes(req.query.style) ? req.query.style : '古风';
  const gender = ['男', '女', '不限'].includes(req.query.gender) ? req.query.gender : '不限';
  const surname = req.query.surname || '';

  const config = STYLE_MAP[style];
  let names = [];

  if (config.type === 'source') {
    try {
      const hua = new HuaSource({ source: config.source, count: count * 2 });
      const raw = hua.generate();
      names = raw.map(n => {
        const nameStr = n.toString();
        let verse = '';
        if (n._meta && n._meta.content) {
          const sentences = n._meta.content.split(/[，。！？；、：""''「」【】《》（）\n\r]/).filter(Boolean);
          const found = sentences.find(s => s.includes(nameStr));
          if (found) verse = found.trim();
        }
        return {
          name: nameStr,
          meta: n._meta ? `${n._meta.author || ''}《${n._meta.title || ''}》` : '',
          verse,
          source: STYLE_SOURCE_LABEL[style]
        };
      });
    } catch {
      names = [];
    }
  }

  if (config.type === 'char' || names.length < count) {
    let fe = config.fiveElements || '金木水火土';
    if (gender === '男') fe = '金水';
    else if (gender === '女') fe = '木火';

    try {
      const hua = new HuaChar({ fiveElements: fe, count: count * 2 });
      const raw = hua.generate();
      const charNames = raw.map(n => ({
        name: n,
        meta: '',
        source: STYLE_SOURCE_LABEL[style]
      }));
      names = [...names, ...charNames];
    } catch {
      // fallback - nothing
    }
  }

  const seen = new Set();
  const unique = [];
  for (const n of names) {
    if (!seen.has(n.name)) {
      seen.add(n.name);
      unique.push(n);
    }
  }

  const result = unique.slice(0, count);
  if (surname) result.forEach(n => { n.name = surname + n.name; });
  res.json({ code: 200, data: result, total: result.length });
});

app.get('/api/styles', (req, res) => {
  res.json({ code: 200, data: Object.keys(STYLE_MAP) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`花名 API 服务已启动: http://localhost:${PORT}`);
  console.log(`测试: http://localhost:${PORT}/api/huaming?count=5&style=古风`);
});
