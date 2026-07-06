import '@/styles/globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { SocketProvider } from '@/components/layout/SocketProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Social Platform',
  description: 'Connect with the world',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <div className="container mx-auto max-w-7xl pt-16">
                <div className="flex gap-6">
                  <Sidebar />
                  <main className="flex-1 min-w-0">
                    {children}
                  </main>
                  <RightSidebar />
                </div>
              </div>
            </div>
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
