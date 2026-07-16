import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const assetsRoot = path.resolve(__dirname, '../projects/voidborn/assets')

function voidbornAssetsPlugin(): Plugin {
  return {
    name: 'voidborn-assets',
    configureServer(server) {
      server.middlewares.use('/voidborn-assets', (req, res, next) => {
        const rel = decodeURIComponent((req.url || '').split('?')[0] || '').replace(/^\/+/, '')
        const filePath = path.normalize(path.join(assetsRoot, rel))
        if (!filePath.startsWith(assetsRoot) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          next()
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        const type =
          ext === '.png'
            ? 'image/png'
            : ext === '.webp'
              ? 'image/webp'
              : ext === '.jpg' || ext === '.jpeg'
                ? 'image/jpeg'
                : 'application/octet-stream'
        res.setHeader('Content-Type', type)
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), voidbornAssetsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@voidborn-cards': path.resolve(__dirname, '../projects/voidborn/game/cards.json'),
    },
  },
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
