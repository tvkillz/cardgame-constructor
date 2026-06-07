import { appConfig } from '@/config'
import StubPage from '@/screens/StubPage/StubPage'

export default function LeaderboardPage() {
  return (
    <StubPage
      title="Leaderboard"
      description={appConfig.descriptions.leaderboard}
    />
  )
}
