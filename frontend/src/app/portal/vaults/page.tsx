import PortalComingSoon from '@/screens/Portal/PortalComingSoon'
import { appConfig } from '@/config'

export default function PortalVaultsPage() {
  const section = appConfig.portal.sections.find((s) => s.id === 'vaults')!
  return <PortalComingSoon sectionTitle={section.title} />
}
