import { createApp } from './infrastructure/http/app';
import { config } from './config';

const app = createApp();
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
