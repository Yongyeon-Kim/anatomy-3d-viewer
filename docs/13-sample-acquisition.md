# 흉부 샘플 확보와 이용 조건

확보일: 2026-11-06. 연결 이슈: [#4](https://github.com/Yongyeon-Kim/anatomy-3d/issues/4). **공식 원본 3개 압축파일을 확보하고 BodyParts3D에서 흉부 432개 OBJ를 추출했다.** 제품 구현 없이 자료 검증을 위한 파일만 준비했다.

## 확보한 배포본

| 배포본 | 실제 다운로드 크기 | 확보·검사 범위 |
| --- | --- | --- |
| BodyParts3D 4.0 PART-OF OBJ 99 | 64,888,505 bytes | 1,258개 파일 중 흉부 432개 형상 검사 |
| BodyParts3D 4.0 IS-A OBJ 99 | 142,903,898 bytes | 2,234개 파일 목록·공유 파일 비교, 3개 형상 표본 비교 |
| Z-Anatomy 공식 모델 ZIP | 86,734,957 bytes | 압축 목록, Startup.blend 추출, 헤더 확인 |

BodyParts3D는 공식 다운로드 페이지가 연결하는 `LATEST` 파일을 사용했다. 이름표·구성 관계표·README·현재 이용 조건 페이지도 함께 확보했다. 공식 페이지는 이 OBJ 배포본을 Polygon reduction rate 99%로 설명한다. 따라서 이번 결과를 원본 고해상도 모델 전체의 품질로 일반화하지 않는다. [공식 다운로드](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)

Z-Anatomy는 공식 저장소 커밋 `d909eb1e89bf47180b575e4dfacce639c90044b8`의 ZIP·Readme·License를 확보했다. 압축 해제한 Blender 파일은 306,838,281 bytes, 헤더는 `BLENDER-v305`다. 파일을 Blender로 열거나 포함된 스크립트를 실행하지 않았으므로 내부 오브젝트·형상 품질은 미검증이다. [고정 배포본](https://github.com/Z-Anatomy/Models-of-human-anatomy/tree/d909eb1e89bf47180b575e4dfacce639c90044b8)

## 재현과 저장 위치

- [원본 목록과 SHA-256](../research/source-manifest.json): 파일별 정확한 URL, 크기, 해시, 확보 시각.
- [재현 안내](../research/README.md): 다운로드 검증과 파일 검사 명령.
- 로컬 원본: `research/raw/bodyparts3d/`, `research/raw/z-anatomy/`.
- 로컬 추출 샘플: `research/samples/bodyparts3d/`.
- [배포본 비교 결과](../research/results/archive-comparison.json), [IS-A 형상 표본 비교](../research/results/isa-spot-check.json).

대용량 원본·파생 미리보기는 GitHub에 업로드하지 않는다. 로컬에서 확보한 데이터와 GitHub에 남기는 출처·검사 증거를 구분한다. 해시가 다른 새 배포본에는 이번 결과를 그대로 적용하지 않는다.

## 이용 조건에서 발견한 차이

### BodyParts3D

현재 공식 라이선스 페이지는 CC BY 4.0을 명시한다. 그러나 확보한 OBJ 내부와 오래된 README에는 CC BY-SA 2.1 Japan 표기가 남아 있다. 현재 고지와 원본 헤더의 불일치를 발견 사항으로 기록하고 두 자료를 보관했다. 현재 페이지를 근거로 검토하되 배포 단계에서는 채택 파일에 적용할 고지와 출처 문구를 확정해야 한다. [공식 이용 조건](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)

CC BY 4.0은 조건을 지키는 상업적 공유·가공을 허용하며, 출처·라이선스 링크·변경 여부를 표시하도록 한다. 웹·앱 및 출력 자료에도 이 조건을 반영해야 한다. 개별 스토어 배포 방식과 추가 제한의 충돌 여부까지 이번에 검토한 것은 아니다. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

### Z-Anatomy

배포본 License는 전체 자료를 CC BY-SA 4.0으로 소개하지만, 포함·참조·가공한 자산 목록에 **내이 CC BY-NC-SA 4.0, 신장 CC BY-NC 4.0**도 기재한다. 어느 오브젝트가 해당 자산을 포함하는지 이번에는 매핑하지 않았다. 따라서 ‘전체 파일을 상업 앱에 그대로 사용 가능’으로 승인할 수 없다. [배포본 License](https://raw.githubusercontent.com/Z-Anatomy/Models-of-human-anatomy/d909eb1e89bf47180b575e4dfacce639c90044b8/License.txt)

CC BY-SA 4.0은 상업 이용 자체를 금지하지 않지만 가공 자료 배포 시 동일조건변경허락이 요구된다. 모델·정의 텍스트·외부 참조 자산을 구분해서 확인해야 한다. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

## 용도별 결정

| 용도 | BodyParts3D 이번 샘플 | Z-Anatomy 이번 배포본 |
| --- | --- | --- |
| 로컬 형태·조작 검토 | 진행함 | 파일 확보와 헤더 확인까지 |
| 웹·앱 공개 | 고지 정리와 품질 보완 후 판단 | 사용 오브젝트별 출처 확인 전 보류 |
| 설명용 이미지·영상 | 출처·변경 표시 설계, 외형 품질 확인 필요 | NC 자산 혼입·가공 조건 확인 전 보류 |
| 상용 모델 후보 확정 | 아직 확정하지 않음 | 아직 확정하지 않음 |

파일 확보는 완료했지만 제품 배포 승인과 별개다. 구체적인 파일 품질은 [검사 결과](14-sample-quality-review.md)에 기록했다.
