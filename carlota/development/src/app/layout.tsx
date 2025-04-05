import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carlota Shop',
  description: 'Jewelry and Accesories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={"ma-0"} style={{
        // background: "linear-gradient(45deg, #FFF8E8, #C29A74)",
        // background: "linear-gradient(0deg, #FFF8E8, #4D4637)",
        // background: "#FFF8E8"
        background: "#4D4637",
      }}>
        {children}
      </body>
    </html>
  )
}
