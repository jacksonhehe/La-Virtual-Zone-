import express from 'express';
import { OpenAI } from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function fallbackLineup(players) {
  const lineup = [];
  const pick = (list, n) => list.sort((a,b) => (b.overall || b.ovr) - (a.overall || a.ovr)).slice(0,n).map(p => p.id);
  const byPos = {
    GK: players.filter(p => p.position === 'GK'),
    DF: players.filter(p => ['CB','LB','RB','LWB','RWB'].includes(p.position)),
    MF: players.filter(p => ['CDM','CM','CAM','LM','RM'].includes(p.position)),
    FW: players.filter(p => ['ST','LW','RW','CF'].includes(p.position)),
  };
  if(byPos.GK.length) lineup.push(...pick(byPos.GK,1));
  lineup.push(...pick(byPos.DF,4));
  lineup.push(...pick(byPos.MF,3));
  lineup.push(...pick(byPos.FW,3));
  return lineup.slice(0,11);
}

app.post('/ai/suggest-lineup', async (req, res) => {
  const { squad } = req.body;
  if(!Array.isArray(squad)) {
    return res.status(400).json({ error: 'Invalid squad' });
  }
  try {
    if(!process.env.OPENAI_API_KEY) throw new Error('Missing API key');
    const prompt = `Given this squad ${JSON.stringify(squad)}, return the best 11 player ids as a JSON array`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    const text = completion.choices[0]?.message?.content || '';
    const lineup = JSON.parse(text);
    if(!Array.isArray(lineup) || lineup.length !== 11) {
      throw new Error('Invalid AI response');
    }
    return res.json({ lineup });
  } catch (err) {
    const lineup = fallbackLineup(squad);
    return res.json({ lineup, fallback: true });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
