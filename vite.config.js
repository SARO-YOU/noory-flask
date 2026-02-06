import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       host: '0.0.0.0',
       strictPort: false,
     },
     preview: {
       host: '0.0.0.0',
       port: 4173,
       strictPort: false,
       allowedHosts: [
         'nooryshop.onrender.com',
         'shop.nooreyshop.abrdns.com',
         'localhost',
         '.onrender.com',
         '.abrdns.com'
       ]
     }
   })