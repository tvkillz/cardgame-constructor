import Header from '@/components/Header/Header'
import './styles.css'

type StubPageProps = {
  title: string
  description: string
}

export default function StubPage({ title, description }: StubPageProps) {
  return (
    <div className="stub-page">
      <Header />
      <main className="stub-page__main">
        <h1>{title}</h1>
        <p>{description}</p>
      </main>
    </div>
  )
}
