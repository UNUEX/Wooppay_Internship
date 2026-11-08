import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { Header } from "@/widgets/header";

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
