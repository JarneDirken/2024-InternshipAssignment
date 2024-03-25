import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ height: 'calc(100vh - 72px)' }}>
      <Sidebar />
      {children}
    </div>
  );
}