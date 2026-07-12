# Day50 - Todo App
## Chạy backend

```bash
cd todo-api
node server.js
```

Mặc định chạy ở `http://localhost:3000`, có thể đổi port bằng biến môi trường `PORT`.

## Chạy frontend

```bash
cd todo-app-frontend
npm install
npm run dev
```

Mở `http://localhost:5173`. Lúc dev, frontend lấy URL backend từ `.env.local` (`VITE_BASE_API=http://localhost:3000`), nhớ chạy backend trước thì mới load được task.

## Các endpoint

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/tasks` | Lấy toàn bộ task |
| GET | `/api/tasks/:id` | Lấy 1 task theo id, 404 nếu không có |
| POST | `/api/tasks` | Tạo task mới, body `{ title }` |
| PUT | `/api/tasks/:id` | Cập nhật `title`/`isCompleted`, 404 nếu không có |
| DELETE | `/api/tasks/:id` | Xóa task, 404 nếu không có |
| ANY | `/bypass-cors?url=...` | Proxy request tới `url` bất kỳ, dùng để test gọi API bên ngoài mà không dính lỗi CORS |

## Deploy

- Backend: deploy trên Render, chạy tại https://day50.onrender.com
- Frontend: build bằng `.env.production` (trỏ về backend Render ở trên) rồi deploy qua gh-pages:

```bash
cd todo-app-frontend
npm run deploy
```

- Link demo: https://tranduong05-la.github.io/Day50/

