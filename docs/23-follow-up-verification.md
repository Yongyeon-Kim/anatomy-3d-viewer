# 후속 구현과 검증 기록

## 도판과 설명 장면

전신과 9개 상세 부위에서 구조를 선택하면 오른쪽에 도판을 표시한다. `src/anatomy-plate.js`는 원본 변환으로 표면을 투영하고 아이보리 바탕 위에 음영과 지시선을 그린다. 등세모근 위·가운데·아래와 넓은등근은 좌우 각각 선택할 수 있다. 선택 영역의 강조와 설명은 같은 원본 메시를 사용한다. 화면에서 구조 간격을 벌린 상태에서도 도판상의 위치는 원본 배치를 기준으로 한다.

도판은 Z-Anatomy의 Gauthier Kervyn과 기여자, BodyParts3D의 Database Center for Life Science가 출처에 포함된 GLB의 원본 표면에서 생성한다. 적용한 변경은 후면 또는 사선 투영, 회색 음영, 한 가지 강조색, 표면을 가리키는 지시선과 한국어 라벨이다. 별도 제공자 자산이 섞인 부위는 원본의 이용 조건을 연결한다. OpenStax 예시는 구성 참고로 사용했다. [고정 원본과 라이선스](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/d909eb1e89bf47180b575e4dfacce639c90044b8/License.txt) · [참고한 어깨대 근육 도판](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)

고정 원본에서 `Ascending part of trapezius muscle.l/r`의 표면은 위쪽, `Descending part of trapezius muscle.l/r`는 아래쪽에 있다. 각 쌍의 Blender Z축 경계 상자 중심은 위부터 1.4951, 1.4102, 1.2672였다. 원본 ID를 유지하면서 UI에서 각각 내림부분(위쪽), 가로부분, 오름부분(아래쪽)으로 설명한다. [IFAA 등세모근 용어](https://ifaa.unifr.ch/Public/EntryPage/TA98%20Tree/TA98%20EN/04.3.01%20TA98%20EN.htm)

**설명 장면**은 브라우저에 최근 장면 하나를 저장한다. 선택한 부위와 세부 구조, 개별 메시 표시, 간격, 카메라 위치와 회전 중심을 복원한다. 공유 링크는 같은 장면을 열며 수신자는 해당 서버에 접속할 수 있어야 한다. 대상 GLB의 SHA-256이 다르면 기본 배치와 버전 안내를 표시한다. PNG는 현재 3D 캔버스의 모형만 내보낸다. 설명 글과 조작부는 웹 화면에서 읽을 수 있다.

자동 검사에서 왼쪽 넓은등근을 단독 표시하고 간격과 카메라를 바꾼 뒤 브라우저 저장과 링크로 재현했다. 메시 단독 표시, 위치 복원, PNG 다운로드와 변경된 GLB 지문 거부를 검사했다. 도판은 등 근육 여덟 개의 그림과 강조 좌우가 각각 다르고, 목뼈와 심실에서도 선택에 맞춰 표시되는지 데스크톱과 모바일 에뮬레이션에서 확인했다. [#10](https://github.com/Yongyeon-Kim/anatomy-3d/issues/10) · [#34](https://github.com/Yongyeon-Kim/anatomy-3d/issues/34)

## 자산과 부위 경계

전신과 9개 상세 부위의 안정 ID, 골격·관절·근육·장기 묶음, 한국어 이름과 동의어, 영어와 원본 오브젝트 ID, 기본 시점과 분리 방향은 [부위 자산 명세](../research/results/region-manifest.json)에 있다. 상세 구조의 한국어 설명과 보정한 이름은 [설명 코드](../src/anatomy-content.js)에 있다. 좌우는 해부학적 좌우다. 모든 파일에 Blender Z-up에서 glTF Y-up으로 같은 변환을 적용하며, 동일 이름으로 공유하는 오브젝트의 원본 행렬이 일치하는지 검사한다.

고정 원본 ID는 `d909eb1e89bf47180b575e4dfacce639c90044b8`이다. 10개 모델에서 사용하는 고유 오브젝트 1,199개를 원본의 표면 492개와 변환 곡선 707개로 대조했다. 같은 뼈·횡격막·구불결장을 여러 부위에 포함할 수 있다. 내보내기 코드는 부위 내부 중복, 삼각형이 없는 곡선·주석·비표면, 유한 좌표가 없는 오브젝트를 검사한다. GLB의 파일 해시·메시 수·삼각형 수는 생성 시 같은 이름의 JSON에 기록된다. 준비 스크립트는 기록과 파일을 대조한다. [자산 준비와 재현](../research/README.md#전신-및-부위별-자산)

| 모델 파일 | 파일별 이용 범위와 확인할 출처 |
| --- | --- |
| `body-region.glb`, `abdomen-region.glb` | 개인 검토용. `Kidney.l/r`는 Z-Anatomy 라이선스에 Lissie Cowley 출처 및 CC BY-NC 4.0 예외가 기재돼 있다. 배포 전에 실제 두 메시의 원본 증빙을 대조한다. |
| `head-neck-region.glb` | 개인 검토용. `White matter of telencephalon.l/r`는 상류 원본이 University of Washington 백질을 열거한다. `Cochlea.l/r`와 귓속뼈는 University of Dundee 내이 자산과 대조 대상이다. 뇌신경 후보는 Dundee CAHID CC BY 4.0 자료와 원본 객체를 확인한다. |
| `chest-region.glb`, `back-spine-region.glb`, `lungs-smooth.glb` | 개인 검토용. 화면 및 도판에 쓰는 오브젝트는 고정 Z-Anatomy 원본에서 추출했다. 관련 모형 출처와 라이선스는 위 원본 기록에 연결한다. |
| `pelvis-region.glb`, `left-arm-region.glb`, `right-arm-region.glb`, `left-leg-region.glb`, `right-leg-region.glb` | 개인 검토용. 원본 남성 골반과 좌우 사지 구조를 고정 Z-Anatomy 원본에서 추출했다. |

머리·목 모델의 개별 구조는 원본 제공처 자료와 대조한다. [상류 백질 사용 범위 확인](https://github.com/Z-Anatomy/Models-of-human-anatomy/issues/10) · [University of Dundee 내이 원본](https://www.dundee.ac.uk/tilt/medical-illustration/anatomy-inner-ear)

| 구조 | 확인 결과와 다음 작업 |
| --- | --- |
| 횡격막·척추·식도 | 흉부와 복부의 횡격막, 복부와 등·척추의 첫째 허리뼈 행렬이 일치한다. 흉부 식도의 아래끝 0.01 이내 표면과 복부 위 표면의 최근접 정점 차이는 약 0.000196 원본 좌표 단위다. 점은 횡격막 경계 상자 안에 있다. 연결부의 내강·조직 경계는 전문가 검토 항목이다. [#26](https://github.com/Yongyeon-Kim/anatomy-3d/issues/26) · [OpenStax 식도](https://openstax.org/books/anatomy-and-physiology/pages/23-3-the-mouth-pharynx-and-esophagus) |
| 흉부 심장·기관지 | 심방·심실 4개, 일부 판막과 유두근, 기관과 양쪽 주기관지, 좌우 폐엽·구역기관지 26개가 포함된다. 개별 폐내 기관지에 한국어 이름을 연결했다. 더 작은 기도 가지와 미포함 판막 및 접합 경계의 시각 품질은 추가 자산 검수 대상으로 기록한다. [#9](https://github.com/Yongyeon-Kim/anatomy-3d/issues/9) |
| 복부 소화관과 복벽 | 십이지장과 공장은 포함된다. BodyParts3D의 돌창자 FMA7208에는 32개 표면 원소가 있어 정렬·연속성 검토 후보로 남긴다. 피부·피하조직·복막의 전체 정렬 표면도 후보가 필요하다. [#9](https://github.com/Yongyeon-Kim/anatomy-3d/issues/9) · [#22](https://github.com/Yongyeon-Kim/anatomy-3d/issues/22) |
| 머리·목 | 원본 `Neo-cortex` 표면 126개에서 네 대뇌엽의 양쪽 대표 겉질 34개를 분리했다. 홍채·망막의 좌우 4개와 뇌신경 I·II·V·VII·VIII의 좌우 10개도 추가했다. 나머지 겉질의 세분화, 세부 감각 구조, 뇌신경·백질·내이의 파일별 배포 근거가 남아 있다. [#25](https://github.com/Yongyeon-Kim/anatomy-3d/issues/25) |
| 골반·회음 | 원본 골반저·골반벽·방광·요도와 남성 생식 구조를 표시한다. BodyParts3D 직장 FMA14544의 `FJ2571.obj`는 기존 `Sigmoid colon` 표면과 중심을 맞췄을 때 평균 최근접 정점 거리가 약 0.00348 원본 좌표 단위여서 분리된 새 구조로 넣기 전에 중복과 경계를 확인한다. 여성 골반과 자궁의 Visible Human Female 후보는 별도 자료이며 그대로 합치기 전에 치골결합, 엉치뼈와 엉덩관절 좌표를 대조한다. [#27](https://github.com/Yongyeon-Kim/anatomy-3d/issues/27) · [BodyParts3D 배포본](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) · [NIH 여성 골반](https://3d.nih.gov/entries/3DPX-020984) · [NIH 자궁](https://3d.nih.gov/entries/3DPX-020996) |

### 흉부 표면 비교

| 표면 | 같은 좌표의 정점을 합친 열린 모서리 | 세 면 이상을 잇는 모서리 |
| --- | ---: | ---: |
| 폐 5개 엽 | 72 | 5 |
| 심방·심실 4개 | 587 | 0 |
| 양쪽 주기관지 | 각 24 | 0 |
| 식도 | 0 | 0 |

오른쪽 아래 폐엽의 모서리 중복과 심장·기관지의 열린 경계는 기존 표면에 존재한다. 보기용 현재 메시의 경계를 유지하고 음영을 부드럽게 적용한다. 접합 확인과 절단·체적 설명이 필요한 자산은 별도 폐곡면과 검수 결과를 기준으로 판단한다. 전체 흉부 파일은 6,435,724바이트, 폐 전용 파일은 191,156바이트이며 동일한 폐 5개 엽 형상을 쓴다. 재질과 확대 비교에서 기본 부드러운 음영을 사용하고 세분화 후보는 로컬 비교 자료로 유지한다. AnatomyTOOL 원본 제공 페이지 요청은 502를 반환했다. 모델 교체 판단은 원본 제공처에서 흉부 파일과 라이선스를 확인한 뒤 한다. [기존 표면·음영 비교](19-chest-quality-and-prototype-readiness.md) · [Open3DModel 제공 페이지](https://anatomytool.org/open3dmodel-create)

## 실기기, 전문가와 출시

| 범위 | 확인 방법과 남은 기준 |
| --- | --- |
| 흉부 조작 [#8](https://github.com/Yongyeon-Kim/anatomy-3d/issues/8) · [#16](https://github.com/Yongyeon-Kim/anatomy-3d/issues/16) · [#19](https://github.com/Yongyeon-Kim/anatomy-3d/issues/19) | 실물 Android Chrome과 iOS Safari에서 회전, 핀치, 선택 중심, 두 손가락을 놓은 뒤 탭 복구와 원래 배치 복원을 확인한다. 기기와 OS·브라우저 버전을 함께 기록한다. |
| 성능 [#11](https://github.com/Yongyeon-Kim/anatomy-3d/issues/11) · [#30](https://github.com/Yongyeon-Kim/anatomy-3d/issues/30) | `node scripts/benchmark-viewer.mjs`는 로컬 프로덕션 서버의 흉부 및 경량 폐 렌더에서 30초 드래그, HTTP·파싱·첫 표시, 다음 프레임까지 입력 반응과 브라우저 자원 수를 측정한다. 실물에서는 최초 표시와 부위 연속 전환, 메모리와 실제 터치를 별도로 측정한다. |
| 해부학과 사용성 [#12](https://github.com/Yongyeon-Kim/anatomy-3d/issues/12) · [#21](https://github.com/Yongyeon-Kim/anatomy-3d/issues/21) | 구조 선택 후 이름·좌우·위치·기능·원본과 도판의 대응을 검수한다. 현재 우선 확인 대상은 등세모근 세 부분, 심장 판막, 식도→위 경계와 골반 소화관이다. 설명자와 청자가 원래 배치와 설명용 간격을 구분하고 저장한 장면을 다시 열 수 있는지 실제 과제로 검사한다. |
| 웹 [#13](https://github.com/Yongyeon-Kim/anatomy-3d/issues/13) | 개인 시험은 정적 프로덕션 빌드의 HTTPS 접속, 인증 필수, 모델 파일 직접 요청 차단을 확인했다. 운영 주소·호스팅, 공개 콘텐츠와 자산 권리, 이용 안내와 운영 복구 확인은 웹 출시에서 진행한다. 현재 장면 저장은 브라우저 로컬 저장소를 사용한다. |
| 앱 [#14](https://github.com/Yongyeon-Kim/anatomy-3d/issues/14) | 웹 시제품의 실기기 결과를 반영해 지원 OS와 패키징 방식을 확정한다. Android 빌드·서명 및 iOS의 Xcode·서명이 필요하며 개발자 계정, 제출 자료와 실제 설치 검증을 연결한다. [출시 계획](08-release-plan.md) |
