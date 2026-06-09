import CreateMarketForm from './CreateMarketForm'

export default async function CreateMarketPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="border-b-3 border-primary/15 pb-6">
        <div className="text-sm font-black text-primary">Market Operations</div>
        <h1 className="mt-2 text-4xl font-black text-text-primary">새 마켓 생성</h1>
        <p className="mt-3 text-base font-semibold text-text-secondary">
          운영자가 직접 관리하는 예측 마켓을 생성합니다. 지역, 콘텐츠 언어, 마감 타임존을 함께 지정할 수 있습니다.
        </p>
      </header>

      <CreateMarketForm />
    </div>
  )
}
