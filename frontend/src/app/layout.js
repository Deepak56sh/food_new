// // app/layout.js
// import { Inter } from 'next/font/google'
// import '../styles/globals.css'
// import Header from '@/components/Header'
// import Footer from '@/components/Footer'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Your App Title',
//   description: 'Your app description',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className} suppressHydrationWarning>
//         {/* Header component */}
//         <Header />
        
//         {/* Main content */}
//         <main className="min-h-screen">
//           {children}
//         </main>
        
//         {/* Footer component */}
//         <Footer />
//       </body>
//     </html>
//   )
// }
import { Inter } from 'next/font/google';
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Your Website',
  description: 'Your website description',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}