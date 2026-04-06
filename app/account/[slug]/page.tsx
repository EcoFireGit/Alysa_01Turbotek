import { AccountDetailView } from '@/components/account/AccountDetailView'

export default function AccountPage({ params }: { params: { slug: string } }) {
  return <AccountDetailView accountId={params.slug} />
}
