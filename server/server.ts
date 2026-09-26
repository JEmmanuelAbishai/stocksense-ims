
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { dashboardRouter } from './routes/dashboard.routes';
import { productsRouter } from './routes/products.routes';
import { operationsRouter } from './routes/operations.routes';
import { stockRouter } from './routes/stock.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StockSense Cloud API',
    version: '1.0.0'
  });
});

app.use('/api/dashboard', dashboardRouter); 
app.use('/api/products', productsRouter);   
app.use('/api/operations', operationsRouter); 
app.use('/api/stock', stockRouter);         

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(` StockSense Backend Server running on port ${PORT}`);
    console.log(`📦 Member 1: /api/dashboard`);
    console.log(`📦 Member 2: /api/products`);
    console.log(`📦 Member 3: /api/operations`);
    console.log(`📦 Member 4: /api/stock`);
  });
}

export default app;