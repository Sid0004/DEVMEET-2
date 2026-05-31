import AppNavbar from '../components/AppNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavbar />
      <div style={{ paddingTop: '56px' }}>{children}</div>
    </>
  );
}
