# 3D 샘플 확보와 파일 검사

이 폴더는 제품 구현이 아닌 자료 검증용이다. 원본 모델과 추출 샘플은 로컬에만 저장하고 GitHub에는 URL·해시·측정 결과·재현 스크립트를 저장한다.

## 파일

- `source-manifest.json`: 원본 URL, 확보 시각, 크기, SHA-256, Z-Anatomy 고정 커밋.
- `results/archive-comparison.json`: 두 OBJ 배포본의 구성·동일 파일 비교.
- `results/bodyparts-summary.json`: 10개 그룹의 파일 매핑·크기·형상·변환 결과.
- `results/bodyparts-files.csv`: 개별 파일의 해시·형상 지표.
- `results/bodyparts-audit.json`: 전체 검사 결과. 로컬 생성 파일이며 Git에 포함하지 않는다.
- `results/chest-preview.png`, `results/isolated-organs.png`: 로컬 생성 미리보기.
- `raw/`: 공식 배포 압축파일과 이름 매핑·라이선스 자료.
- `samples/bodyparts3d/`: 선택한 432개 OBJ 원본 복사본.

## 재현

Python 3.12에서 검사했다. 가상환경 생성·pip를 지원하는 환경에서 저장소 루트를 기준으로 실행한다.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r research/requirements.txt
.venv/bin/python research/scripts/fetch_samples.py
.venv/bin/python research/scripts/audit_bodyparts.py
```

원본 약 295MB와 압축 해제·샘플·작업 공간을 고려해 최소 1GB 정도의 여유 공간을 준비한다. `LATEST` 주소는 바뀔 수 있다. 해시가 달라지면 멈추며 새 파일을 기존 검사 결과와 동일한 것으로 취급하지 않는다. 라이선스 HTML도 변할 수 있으므로 실패 시 해당 출처의 변경 내용을 확인한다.

현재 작업 환경에서는 `venv`의 ensurepip가 없어 `/tmp/anatomy-audit-venv`에 pip를 별도 준비해 검사했다. 전역 Python 패키지는 변경하지 않았다.

## 검사 방법과 한계

OBJ를 자동 수리하지 않고 읽는다. 원시 인덱스 기준 검사와 좌표가 정확히 같은 정점만 합친 검사를 구분한다. 허용 오차로 가까운 점을 합치거나 구멍을 메우지 않는다. 1e-12 이하 면적을 퇴화 후보로 집계한다. 자기 교차·구조 간 충돌·해부학적 정확성·실기기 성능은 검사하지 않는다.

분리 실험은 임의의 좌표 이동을 수치적으로 되돌리는 검사다. 실제 장기의 허용 이동 경로나 혈관·기관지 연결을 검증하지 않는다. 미리보기의 색은 검사자가 지정했으며 원본 조직 색·질감이 아니다. 축은 원본 좌표이며 인체 방향·물리 단위의 전문가 검증을 대체하지 않는다.

## 출처와 사용 조건

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

[현재 공식 이용 조건](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)과 원본 OBJ의 과거 CC BY-SA 2.1 JP 헤더를 함께 보관했다. 미리보기는 원본을 조합해 색과 투명도를 적용한 가공 자료다. 원본 파일은 수정하지 않았다. 출시 시 조건 대조 항목은 [확보 기록](../docs/13-sample-acquisition.md)에 있다.

Z-Anatomy는 압축파일과 라이선스 기록을 확보하고 Blender 파일 헤더만 확인했다. 포함된 Python 코드나 Blender 자동 실행 코드를 실행하지 않았다. 비상업 조건의 외부 자산이 출처 목록에 있어 상업 배포 적합성을 전체 묶음 기준으로 승인하지 않는다.

## Z-Anatomy 후속 검사

후속 작업에서는 자동 실행을 끈 Blender 3.6.23에서 폐 외형 5개를 추출했다. 초기 헤더 검사 이후의 결과는 [무료 모델 재검토](../docs/16-free-model-review.md)를 따른다.

```sh
blender --background --factory-startup --disable-autoexec --python research/scripts/inspect_z_anatomy.py
.venv/bin/python research/scripts/preview_z_lungs.py
```

이번 환경에서는 `/tmp/blender-3.6.23-linux-x64/blender`를 사용하고, 필요한 libSM·libICE 패키지만 `/tmp/anatomy-blender-libs`에 풀어 `LD_LIBRARY_PATH`로 지정했다. 시스템 패키지를 설치하거나 원본 스크립트를 실행하지 않았다.

공식 실행 파일 출처: `https://download.blender.org/release/Blender3.6/blender-3.6.23-linux-x64.tar.xz`.
SHA-256: `0e9a18af4d0060b825e9617e24a775f759e0f9f67271c062f3d53a539030af00`.

기본 메시만 내보낸다. 원본 파일의 식도 객체에서 의존성 순환 경고가 발생했으므로 전체 장면 평가가 정상이라고 주장하지 않는다. 폐 객체에는 보정 전 기본 데이터를 사용했고 결과 OBJ를 별도로 읽어 검사했다.

로컬 미리보기의 출처는 Z-Anatomy — The libre 3D atlas of anatomy, CC BY-SA 4.0이며, 원본 License에 기재된 BodyParts3D 및 기타 기여자·조건 기록을 함께 보관한다. 미리보기에는 검사자가 지정한 색·조명을 사용했다.

## 흉부 품질 비교와 시제품 자산 준비 (#7)

```sh
blender --background --factory-startup --disable-autoexec --python research/scripts/prepare_chest_review.py
.venv/bin/python research/scripts/summarize_chest_review.py
```

Blender 3.6.23과 위 Python 요구 패키지, 비교표 글꼴 DejaVu Sans가 필요하다. 저장소 루트 `anatomy-3d`에서 실행한다. 현재 환경의 Blender 실행 파일·라이브러리 경로는 위 설명을 따른다. 최종 이미지에는 AI 이미지 생성이나 후처리로 해부학 구조를 추가하지 않았다.

- `results/chest-preparation.json`: 원본 해시, 객체·행렬·형상 지표, 세분화 편차, GLB 해시.
- `results/chest-export-validation.json`: GLB 재읽기, 노드·삼각형·표면 경계 검사 결과.
- `results/chest-prototype-manifest.json`: 흉부 58개 메시를 6개 조작 묶음에 배정한 초안.
- `results/lungs-quality-comparison.png`, `results/chest-context-comparison.png`: 로컬 비교표.
- `samples/chest-review/*.glb`, `PROVENANCE.txt`: 로컬 내부 시제품 후보와 출처 기록.

음영만 보정한 경우 기본 형상 해시 일치를 검사한다. 경계는 정확히 같은 좌표만 병합해 센다. GLB 표면은 미참조 원본 정점을 포함하지 않을 수 있으므로 삼각형이 사용하는 정점의 경계를 대조한다. 원본 전체 정점의 경계와 미참조 정점 수도 남긴다. 내보내기 시 정점 분할·인덱스 재배열이 가능하므로 원시 정점 수만으로 동일성을 판정하지 않는다.

이 실험은 표면의 단방향 정점 거리·객체 좌표·표면 경계까지만 확인한다. 자기 교차·구조 간 충돌·의학적 정확성과 실제 기기 성능은 검증하지 않았다. Blender 종료 시 원본 로드에 따른 소량 메모리 잔여 경고가 있었지만 프로세스는 0으로 종료했고 산출물은 별도 라이브러리로 검증했다. 자세한 판단은 [19 문서](../docs/19-chest-quality-and-prototype-readiness.md)를 따른다.

## 복부 조작 시제품 자산

흉부와 같은 Z-Anatomy 원본에서 11개 그룹의 19개 메시를 내보낸다. 소장은 십이지장과 공장, 대장은 결장 4개 구간으로 구성한다. 횡격막은 흉부와 같은 기본 메시를 쓰고, 공장 곡선과 장기 표면은 원본에 설정된 Blender 형상으로 내보낸다. 원본 위치를 보존하며, 화면 색상은 뷰어에서 적용한다. 복부를 처음 열면 장기 관찰을 위해 횡격막을 숨기며, 구조 목록에서 다시 표시할 수 있다.

```sh
blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python research/scripts/prepare_abdomen.py
npm run assets
```

Blender 3.6.23으로 검증했다. 원본 파일은 `research/raw/z-anatomy/Startup.blend`이며, 결과 GLB와 내보내기 검사 기록 `export.json`은 `research/samples/abdomen/`에 생성된다. 스크립트는 원본 해시, 메시 이름, 삼각형 수를 확인하고 실행마다 결과 GLB의 해시를 기록한다. [복부 자산 기록](results/abdomen-prototype-manifest.json)에 원본 커밋, 검토본 해시, 구조별 오브젝트 이름을 남겼다. 원본 라이선스는 별도 비상업 콩팥 자산도 열거하고 있으므로, 공개 배포 전에는 해당 항목의 실제 사용 범위를 확인한다.

두 번의 내보내기에서 구조 이름·변환·인덱스와 표면 경계는 같았다. 일부 결장 정점의 좌표는 최대 약 `1.2e-7` 원본 단위만큼 차이가 나므로 파일 해시는 생성한 파일별로 검증한다.

## 전신 및 부위별 자산

현재 뷰어는 전신 개요, 9개 부위 및 폐 대체 모델을 같은 내보내기 절차로 준비한다. 원본은 해시로 고정한 `research/raw/z-anatomy/Startup.blend`이다. 처음 확보하는 경우 위의 `fetch_samples.py` 절차를 수행한다.

```sh
blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python research/scripts/prepare_regions.py
npm run assets
```

Blender 3.6.23에서 확인했다. 스크립트는 [부위 명세](results/region-manifest.json)의 오브젝트를 원본 위치에 두고, 곡선은 표면으로 변환한다. 원본 자동 스크립트 실행을 끄며, 검증한 모델과 해시 기록을 `research/samples/regions/`에 생성한다. 전신 개요의 큰 메시와 복벽 근육 8개 표면을 간소화한다. 복벽 근육은 원본 변환을 유지하고 표면 삼각형 수를 약 25%로 줄인다. GLB의 이름과 삼각형 수를 내보낼 때 사용한 기하와 대조하고, 사지의 좌우는 원본 X축에서 검사한다.

전신 혈관은 Z-Anatomy의 몸순환·폐순환·심장 동맥 및 정맥 컬렉션에 있는 곡선과 메시 총 659개를 내보낸다. 프로그램은 명세의 이름 집합을 원본 컬렉션의 기하 오브젝트와 대조한다. 전신에서는 혈관 곡선의 경로와 원본 위치를 유지하며 표면을 만드는 분할 수를 줄인다. 상세 부위에서 공유하는 혈관은 기존 해상도로 내보낸다.
