import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'is-from.in | Free Subdomain Service',
  description: 'Get your free is-from.in subdomain, By @SayCrazyy on Telegram!',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Toaster position="top-center" />
        <main className="min-h-screen flex flex-col items-center justify-start p-4">
          {children}
        </main>
      </body>
    </html>
  )
}