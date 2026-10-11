// 출처와 저작권 고지. 모든 보기의 끝(Deck은 마지막 슬라이드)에 붙는다.
export function Credits() {
  return (
    <footer className="credits">
      <p>
        <b>출처</b> D. Moritz, C. Wang, G. L. Nelson, H. Lin, A. M. Smith, B. Howe, J. Heer.
        "Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco."
        <i> IEEE TVCG</i> 25(1):438–448, 2019. <a href="https://doi.org/10.1109/TVCG.2018.2865240">doi:10.1109/TVCG.2018.2865240</a>
      </p>
      <p>
        논문의 저작권은 IEEE와 저자에게 있습니다. 이 사이트는 수업 발표용 비공식 리뷰이며, 논문의 그림이나 PDF를 싣지 않습니다.
        "Fig. N 재구성"으로 표시한 차트와 코드는 논문 내용을 바탕으로 새로 만든 것입니다.
      </p>
      <p>
        데이터: vega-datasets의 <code>cars.json</code> (원출처 StatLib, 1982년 교육·연구 목적 배포).
        라이브러리: React, Vega, Vega-Lite, vega-embed 등 (<a href={`${import.meta.env.BASE_URL}THIRD_PARTY_LICENSES.txt`}>라이선스 전문</a>).
        글꼴: Pretendard, JetBrains Mono (SIL OFL 1.1).
      </p>
    </footer>
  )
}
