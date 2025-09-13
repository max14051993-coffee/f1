export const metadata = {
  title: 'F1/F2/F3 schedule',
  description: 'Upcoming qualifying & race times (Europe/Belgrade)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{fontFamily:'Inter, system-ui, Arial, sans-serif', background:'#fafafa'}}>
        {children}
      </body>
    </html>
  );
}
