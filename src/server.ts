import app from './app';

const PORT = process.env.PORT || 3050;

app.get('/', (req, res) => {
  res.send('Hello TypeScript + Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
