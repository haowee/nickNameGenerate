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
  '民国': { type: 'char', fiveElements: '火土' },
  '近代': { type: 'char', fiveElements: '金水' },
  '仙侠': { type: 'source', source: 'chuci' },
  '现代': { type: 'char', fiveElements: '木火' },
  '诗意': { type: 'source', source: 'tangshi' },
  '清雅': { type: 'source', source: 'shijing' },
  '江湖': { type: 'source', source: 'songci' },
  '宫廷': { type: 'char', fiveElements: '火土' },
  '森系': { type: 'char', fiveElements: '木水' },
};

const STYLE_SOURCE_LABEL = {
  '古风': '楚辞',
  '民国': '字库',
  '近代': '字库',
  '仙侠': '楚辞',
  '现代': '字库',
  '诗意': '唐诗',
  '清雅': '诗经',
  '江湖': '宋词',
  '宫廷': '字库',
  '森系': '字库',
};

app.get('/api/huaming', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 10, 50);
  const style = Object.keys(STYLE_MAP).includes(req.query.style) ? req.query.style : '古风';
  const gender = ['男', '女', '不限'].includes(req.query.gender) ? req.query.gender : '不限';

  const config = STYLE_MAP[style];
  let names = [];

  if (config.type === 'source') {
    try {
      const hua = new HuaSource({ source: config.source, count: count * 2 });
      const raw = hua.generate();
      names = raw.map(n => ({
        name: n.toString(),
        meta: n._meta ? `${n._meta.author || ''}《${n._meta.title || ''}》` : '',
        source: STYLE_SOURCE_LABEL[style]
      }));
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
  res.json({ code: 200, data: result, total: result.length });
});

app.get('/api/styles', (req, res) => {
  res.json({ code: 200, data: Object.keys(STYLE_MAP) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`花名 API 服务已启动: http://localhost:${PORT}`);
  console.log(`测试: http://localhost:${PORT}/api/huaming?count=5&style=古风`);
});
