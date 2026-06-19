import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
})

// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig(({ mode }) => {
//   // Load env file based on mode
//   const env = loadEnv(mode, process.cwd(), '')

//   return {
//     plugins: [react()],
//     server: {
//       port: 5173,
//       proxy: {
//         '/api': {
//           target: env.VITE_API_URL,
//           changeOrigin: true,
//           secure: false,
//         }
//       }
//     },
//     define: {
//       'process.env': env
//     }
//   }
// })