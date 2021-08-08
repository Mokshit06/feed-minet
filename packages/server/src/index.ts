import 'dotenv-flow/config';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      cb(null, true);
    },
  })
);

app.use(express.json());

app.get('/', async (req, res) => {
  res.send('works');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
