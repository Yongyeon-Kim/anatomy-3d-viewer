# 후속 작업 이슈와 로컬 Git 연결

작성일: 2026-11-06. 정비 작업: [#20](https://github.com/Yongyeon-Kim/anatomy-3d/issues/20).

## 작업 관리 원칙

큰 단계는 상위 이슈로 등록하고 가까운 단계부터 하위 이슈로 나눈다. 목적·완료 기준·선행 작업·미확정 사항을 각 이슈 본문에 기록했다. 기획·구현·검증·출시를 같은 완료 상태로 취급하지 않는다.

예정 → 진행 중 → 확인 대기 → 완료 상태로 관리한다. GitHub의 open 상태 안에서 본문과 진행 댓글로 세부 상태를 남긴다. 확인 대기에는 필요한 외부 입력과 계속할 수 있는 작업을 적는다. 완료 기준을 충족하면 관련 문서·커밋·검증 결과를 연결하고 closed/completed로 닫는다.

일정과 담당자는 실제 착수 시 정한다. 기능 변경이나 새 증거가 있으면 이슈 범위와 선행 관계를 갱신한다. 먼저 생성했다는 이유만으로 미확정 기능을 출시 약속으로 취급하지 않는다.

## 상위 이슈

| 이슈 | 등록 시 상태 | 선행 관계 |
| --- | --- | --- |
| [#8 시제품: 흉부 3D 조작 흐름 구현과 검증](https://github.com/Yongyeon-Kim/anatomy-3d/issues/8) | 예정 | #7 완료 결과 활용·병행 가능 |
| [#9 자산: 흉부 모델 품질 개선과 사용 범위 정리](https://github.com/Yongyeon-Kim/anatomy-3d/issues/9) | 예정 | #7 완료 결과 활용·병행 가능 |
| [#10 기능: 한국어 설명 화면과 장면 저장·공유 검증](https://github.com/Yongyeon-Kim/anatomy-3d/issues/10) | 예정 | #8 |
| [#11 기술: 웹·모바일 성능 검증과 구현 방향 결정](https://github.com/Yongyeon-Kim/anatomy-3d/issues/11) | 예정 | #8 |
| [#12 검증: 해부학 정확성과 설명 사용성 확인](https://github.com/Yongyeon-Kim/anatomy-3d/issues/12) | 예정 | #8, #9, #10, #11 |
| [#13 출시: 웹 공개와 운영 준비](https://github.com/Yongyeon-Kim/anatomy-3d/issues/13) | 예정 | #9, #10, #11, #12 |
| [#14 출시: Android·iOS 앱 패키징과 스토어 등록](https://github.com/Yongyeon-Kim/anatomy-3d/issues/14) | 예정 | #9, #11, #12 |

앱 출시 순서와 웹 공개와의 선후 관계는 미확정이다. 필요한 계정·비용·플랫폼 선택은 구체적인 준비 단계에서 결정한다. 최종 목표는 웹 공개와 앱 스토어 등록이다.

## 바로 다음 단계의 하위 이슈

다음 5개는 GitHub에서 상위 #8의 하위 이슈로 연결했다.

| 이슈 | 등록 시 상태 | 선행 관계 |
| --- | --- | --- |
| [#15 시제품: 실험 뷰어 구성과 흉부 GLB 로딩](https://github.com/Yongyeon-Kim/anatomy-3d/issues/15) | 예정 | #7 |
| [#16 시제품: 회전·확대·선택 중심 관찰 구현](https://github.com/Yongyeon-Kim/anatomy-3d/issues/16) | 예정 | #15 |
| [#17 시제품: 숨기기·선택만 보기·표시 복원 구현](https://github.com/Yongyeon-Kim/anatomy-3d/issues/17) | 예정 | #16 |
| [#18 시제품: 간격 조절과 원본 배치 복원 구현](https://github.com/Yongyeon-Kim/anatomy-3d/issues/18) | 예정 | #16 |
| [#19 시제품: 통합 조작 시나리오 확인과 다음 단계 판단](https://github.com/Yongyeon-Kim/anatomy-3d/issues/19) | 예정 | #15–#18 |

착수 순서는 #15 → #16 → #17·#18 → #19다. 자산 품질 #9는 병행할 수 있다. 첫 실험 기술 선택은 #15에서 임시 결정하고, 정식 구현 방향은 #11의 실제 측정으로 결정한다. 이번 정비 작업에서는 이 시제품 구현을 시작하지 않았다.

## 2026-11-06 시제품 구현 후 상태

#15–#19의 기능을 구현하고 현재 환경의 수치·브라우저 자동 검증을 수행했다. #15·#17·#18은 완료 기준을 확인했으며, #16·#19는 마우스와 터치 에뮬레이션 검사를 마치고 실물 휴대폰 확인을 기다린다. 상위 #8은 열어 둔다. 위 표의 ‘등록 시 상태’와 구현 미착수 설명은 등록 당시 기록이다. 최신 실행·검증·제한은 [21 문서](21-chest-prototype.md)를 따른다. 정식 기술 #11, 자산 #9, 전문가 검수 #12와 출시 #13·#14는 미완료다.

## 로컬 Git 연결

- 로컬 경로: `/home/kyy/workspace/portfolio/anatomy-3d`.
- 원격: `https://github.com/Yongyeon-Kim/anatomy-3d.git`.
- 로컬 브랜치: `main`, 추적 브랜치: `origin/main`.
- 이전에는 연결 도구를 통해 원격 커밋을 만들었고 로컬에는 `.git`이 없었다. 이번에 기존 원격 이력을 fetch하고 로컬 작업 폴더와 연결했다.
- 기존 파일·원본 모델·샘플은 보존했다. CSV의 줄바꿈만 다른 것을 확인해 원격과 맞췄고 텍스트 줄바꿈 규칙을 `.gitattributes`에 추가했다.
- 현재 PC는 사용자가 이미 등록한 MCP GitHub 인증을 이 저장소 전용 credential helper에서 읽는다. 토큰은 URL·Git 설정·프로젝트 파일에 복사하지 않았다. helper는 `.git/` 안에 있어 커밋되지 않으며 다른 저장소·호스트에 자격 증명을 제공하지 않는다.
- 다른 PC에서 clone할 때는 해당 PC의 GitHub 인증을 별도로 설정한다. 현재 PC에서는 원래 MCP 인증이 유지되는 동안 일반 Git 명령으로 사용한다.

```sh
cd /home/kyy/workspace/portfolio/anatomy-3d
git status
git log --oneline -5
git pull --ff-only
git push
```

원본·샘플·PNG 등은 기존 `.gitignore`에 따라 로컬에 보관한다. 이번 문서와 이슈 등록은 대용량 모델을 원격에 올린다는 뜻이 아니다.
