import './globals.css'

export const metadata = {
  title: 'POPCLEAN - Marketplace de Serviços Domésticos',
  description: 'Service Box Operações Ltda',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
