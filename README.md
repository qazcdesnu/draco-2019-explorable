# draco-2019-explorable

An explorable explanation of Draco (Moritz et al., IEEE InfoVis 2019): visualization design knowledge as constraints.

**사이트:** https://draco-2019-explorable.vercel.app

데이터사이언스를 위한 시각화 수업의 논문 리뷰 발표를 웹사이트로 만든 것입니다. 같은 내용을 세 가지 보기(Paper, Deck, Explorer)로 보여 주고, 각 보기를 Draco의 비용 모델로 평가합니다. 각 보기가 위반한 soft constraint의 weight 합이 비용입니다(weight는 이 사이트용으로 정한 값).

## 리뷰 대상 논문

> D. Moritz, C. Wang, G. L. Nelson, H. Lin, A. M. Smith, B. Howe, J. Heer.
> "Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco."
> *IEEE Transactions on Visualization and Computer Graphics* 25(1), 2019.
> [doi:10.1109/TVCG.2018.2865240](https://doi.org/10.1109/TVCG.2018.2865240)

이 리뷰는 2019년 논문에 실린 Draco만 다룹니다. Draco 2 등 이후 작업은 "리뷰 범위 밖"으로 표시한 곳에서만 언급합니다.

- 2019 Draco Editor (브라우저에서 ASP 실행): https://idl.uw.edu/draco-editor/#/editor
- 논문에 적힌 공개 주소: https://uwdata.github.io/draco/ (현재 idl.uw.edu/draco로 리다이렉트)

## 구성

```
docs/        단계별 작업 문서 (논문 정리, 디자인, 목차, 배포)
frontend/    Vite + React + TypeScript 사이트
backend/     비어 있음 (정적 사이트로 배포)
```

로컬 실행:

```bash
cd frontend
npm install
npm run dev      # 개발 서버
npm run build    # 타입 검사 + 빌드 (dist/, 서드파티 라이선스 파일 포함)
npm run preview  # 빌드 결과 확인
```

## 저작권과 출처

**논문.** 논문의 저작권은 IEEE와 저자에게 있습니다. 이 저장소와 사이트에는 논문 PDF와 논문의 그림을 싣지 않습니다. 원문은 위의 DOI로 확인해 주세요.
- 사이트의 "Fig. N 재구성" 차트, 코드 예시, 개념도는 논문 내용을 바탕으로 새로 만든 것입니다.
- 논문 문장은 짧게 인용하거나 우리말로 풀어 썼고, 모든 내용에 논문의 절(§)과 그림 번호를 표시했습니다.
- 데모의 후보 차트, 가상 실험 결과, 합성 데이터는 설명용이며 사이트에 그렇게 표시했습니다.

**Draco.** 이 저장소는 Draco의 코드를 포함하지 않습니다. 사이트의 ASP 예시는 논문에 실린 규칙을 옮겨 적은 것입니다. Draco 소스 코드는 [uwdata/draco](https://github.com/uwdata/draco)에서 BSD-3-Clause로 공개되어 있습니다.

**데이터.** `frontend/public/data/cars.json`은 [vega-datasets](https://github.com/vega/vega-datasets) 2.8.0에서 가져왔습니다. 원출처는 [StatLib Datasets Archive](http://lib.stat.cmu.edu/datasets/)이며, vega-datasets는 이 데이터의 라이선스를 "명시되지 않음, 1982년 교육·연구 목적으로 배포"로 기록하고 있습니다.

**라이브러리와 글꼴.** React(MIT), Vega, Vega-Lite, vega-embed(BSD-3-Clause)와 그 의존성을 사이트에 번들합니다. 각 라이선스 전문은 빌드할 때 `dist/THIRD_PARTY_LICENSES.txt`로 함께 배포됩니다. 글꼴 Pretendard와 JetBrains Mono(SIL OFL 1.1)는 CDN에서 불러오며 저장소에 포함하지 않습니다.

## 라이선스

이 저장소에서 우리가 직접 쓴 코드와 리뷰 글은 [MIT License](LICENSE)를 따릅니다. MIT는 우리의 작업물에만 적용되며, 위에 적은 논문, 데이터, 라이브러리, 글꼴에는 각각의 원래 저작권과 라이선스가 그대로 적용됩니다.
