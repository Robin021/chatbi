import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/app/client-layout'
import { Layout } from 'antd'
import PageSider from '../components/PageSider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDI',
  description: 'PDI - Professional Data Intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <ClientLayout>
          <Layout style={{ height: '100vh', width: '100%'}}>
            <PageSider collapsible={false} width={250} />
            <Layout style={{ height: '100vh', width: '100%', overflow: 'auto' }}>
              {children}
            </Layout>
          </Layout>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover={false}
            theme="light"
          />
        </ClientLayout>
      </body>
    </html>
  )
}
