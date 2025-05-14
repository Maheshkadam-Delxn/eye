import { AuthProvider } from '../context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Eye Clinic Management System',
  description: 'A comprehensive eye clinic management solution',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 