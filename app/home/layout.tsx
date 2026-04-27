export default function CompanionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
      {children}
    </div>
  )
}
