// Загружаем и запускаем сервер
const run = async () => {
  if (!global.__app) {
    const app = (await import('../dist/index.mjs')).default;
    global.__app = app;
    // Запускаем прослушивание порта (Vercel сам предоставит порт)
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  }
};
run();

// Экспортируем функцию-обработчик, которую Vercel будет вызывать при каждом запросе
export default async function handler(req, res) {
  await run();
  return global.__app(req, res);
}