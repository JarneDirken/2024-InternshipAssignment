import "../globals.css";
import Header from "@/components/layout/header";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ height: 'calc(100vh - 72px)' }}>
      <Header/>
      {children}
    </div>
  );
}