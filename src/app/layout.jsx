import './globals.css';

export const metadata = {
  title: 'POPCLEAN - Marketplace de Serviços Domésticos',
  description: 'Encontre profissionais de limpeza qualificados na sua região',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
