
# my-blog

Modern blogging platform built with Vue 3, Vite, Tailwind CSS, Pinia, Vue Router, and Tiptap editor.

## Features

- 📝 Rich text editing with Tiptap
- ⚡ Fast Vite dev/build
- 🎨 Tailwind CSS styling
- 🔍 Search overlay
- 🏷️ Tag support
- 👤 Author and summary display
- 📄 Paginated post list
- 🔗 REST API integration (see below)

## API Endpoints

- `GET /api/posts?page=1&limit=10` — Paginated list of posts (id, title, slug, created_at)
- `GET /api/post/:slug` — Full post (id, title, slug, summary, tags, content, author, created_at)

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Install dependencies
```sh
npm install
```

### Start development server
```sh
npm run dev
```

### Build for production
```sh
npm run build
```

### Type check
```sh
npm run type-check
```

## Project Structure

- `src/views/Home.vue` — Paginated post list
- `src/views/Blog.vue` — Single post view (fetches by slug)
- `src/views/Editor.vue` — Post editor (Tiptap)
- `src/components/` — UI components
- `src/lib/` — API/axios setup
- `src/stores/` — Pinia stores

## Recommended Extensions

- [VS Code](https://code.visualstudio.com/)
- [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## License

MIT
