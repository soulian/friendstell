import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: 저장소 이름이 repo면 https://username.github.io/repo/ 에 배포됨
// 로컬: npm run dev / 배포: BASE_PATH=/repo이름/ npm run build
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
