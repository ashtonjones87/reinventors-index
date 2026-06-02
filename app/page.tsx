import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import RetirementLanding from '@/components/RetirementLanding'

export default async function Home() {
  const h = await headers()
  const isRetirement = h.get('x-is-retirement') === '1'

  if (isRetirement) {
    return <RetirementLanding />
  }

  redirect('/home')
}
