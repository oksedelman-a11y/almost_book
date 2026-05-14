// Этот файл Vercel точно распознает как бессерверную функцию Node.js
// и выполнит его, а не отдаст как текст.
export default async function handler(req, res) {
  // Если сервер еще не запущен, импортируем и запускаем его.
  // Vercel сам передаст ему управление входящим запросом.
  if (!global.__app) {
    const appModule = await import('../dist/index.mjs');
    global.__app = appModule.default || appModule;
  }

  // Передаем запрос в Express-приложение.
  // Это заставит Vercel обрабатывать запрос через наш сервер.
  return global.__app(req, res);
}