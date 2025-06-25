import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import eloHistory from '../../data/eloHistory.json';

const EloHistoryChart = () => (
  <div className="rounded bg-zinc-800 p-4">
    <h3 className="mb-2 text-sm font-semibold">Historial ELO</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={eloHistory}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="elo" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default EloHistoryChart;
