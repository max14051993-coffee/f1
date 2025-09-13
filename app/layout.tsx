export const metadata = {
  title: 'F1/F2/F3 schedule',
  description: 'Upcoming qualifying & race times (Europe/Belgrade)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: '"Titillium Web", system-ui, Arial, sans-serif',
          background: '#000',
          color: '#fff',
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
