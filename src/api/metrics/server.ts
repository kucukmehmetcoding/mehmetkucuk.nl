import http from 'http';
import {register} from '@/api/metrics/route';

const server = http.createServer(async (_req, res) => {
  const metrics = await register.metrics();
  res.writeHead(200, {'content-type': register.contentType});
  res.end(metrics);
});

const port = Number(process.env.METRICS_PORT ?? 9464);
server.listen(port, () => {
  console.log(`Prometheus metrics listening on ${port}`);
});
