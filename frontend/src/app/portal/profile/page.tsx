import PortalComingSoon from '@/screens/Portal/PortalComingSoon'
import { appConfig } from '@/config'

export default function PortalProfilePage() {
  const section = appConfig.portal.sections.find((s) => s.id === 'profile')!
  return <PortalComingSoon sectionTitle={section.title} />
}
