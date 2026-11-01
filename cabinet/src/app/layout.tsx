import Header from "@/components/Header";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = { title: "Кабинет предпринимателя" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}