// 표지(Part 0)의 사이트 주소와 QR 코드 (IMP-006).
// QR은 읽기 상황의 최적 보기(Paper)로 연다. public/qr.svg는 아래 SITE_LINK로 만든 정적 파일이다.
const SITE_LINK = 'https://draco-2019-explorable.vercel.app/?view=paper&ctx=read'
const SITE_LABEL = 'draco-2019-explorable.vercel.app'

// 안내 문구를 QR 위에 둔다: Deck 표지에서 오른쪽 아래 비용 토스트가 열려도 가리지 않게.
export function SiteQR() {
  return (
    <figure className="site-qr">
      <figcaption>
        휴대폰으로 같이 보기
        <a href={SITE_LINK}>{SITE_LABEL}</a>
      </figcaption>
      <img src={`${import.meta.env.BASE_URL}qr.svg`} alt={`사이트 QR 코드: ${SITE_LINK}`} width={41} height={41} />
    </figure>
  )
}
