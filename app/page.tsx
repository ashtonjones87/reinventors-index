import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import RetirementLanding from '@/components/RetirementLanding'

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const isRetirement = h.get('x-is-retirement') === '1'
  if (isRetirement) {
    return {
      title: "Retirement Index",
      description: "Retirement isn't a financial moment - it's an identity shift. Map how ready you are in five minutes. Free.",
      icons: { icon: '/icon.png' },
    }
  }
  return {}
}

export default async function Home() {
  const h = await headers()
  const isRetirement = h.get('x-is-retirement') === '1'

  if (isRetirement) {
    return <RetirementLanding />
  }

  redirect('/home')
}
