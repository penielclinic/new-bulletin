# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

교회 주보(Church Bulletin) 웹 애플리케이션. Next.js(React) 기반으로 주보를 웹에서 편집하고 PDF로 출력할 수 있다.

## Commands

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 테스트 실행
npm test

# 단일 테스트 파일 실행
npm test -- <파일명 또는 패턴>

# 테스트 감시 모드
npm test -- --watch
```

## Architecture

- `app/` — Next.js App Router 기반 페이지 및 레이아웃
- `components/` — 재사용 가능한 React 컴포넌트
  - `bulletin/` — 주보 관련 컴포넌트 (섹션, 레이아웃, 인쇄 뷰)
  - `ui/` — 공통 UI 컴포넌트
- `lib/` — 유틸리티 함수, PDF 생성 로직
- `types/` — TypeScript 타입 정의
- `public/` — 정적 파일 (폰트, 이미지)

PDF 출력은 `lib/pdf.ts`에서 처리하며, 웹 뷰와 인쇄 뷰는 CSS `@media print` 또는 별도 컴포넌트로 분리한다.

## Coding Conventions

- **언어**: TypeScript 사용, `any` 타입 지양
- **컴포넌트**: 함수형 컴포넌트 + React Hooks만 사용
- **스타일링**: Tailwind CSS 사용, 인라인 스타일 지양
- **파일명**: 컴포넌트는 PascalCase (`BulletinHeader.tsx`), 유틸리티는 camelCase (`pdfGenerator.ts`)
- **상태 관리**: 로컬 상태는 `useState`/`useReducer`, 전역 상태가 필요한 경우 Context API 또는 Zustand 사용
- **PDF 생성**: `react-pdf` 또는 `@react-pdf/renderer` 라이브러리 활용
- **인쇄 스타일**: `@media print` CSS로 웹 뷰와 인쇄 뷰를 분리
- **한글 폰트**: PDF 출력 시 한글 폰트를 `public/fonts/`에 포함하여 깨짐 방지
- **교우소식(MemberNews)**: 같은 유형(새가족 등)이라도 각 인원을 별도 행(row)으로 렌더링한다
- **한글 줄바꿈**: 이름·단어가 글자 중간에서 끊기지 않도록 반드시 아래 패턴을 사용한다
  - 공백으로 구분된 이름/단어 목록은 `split(/\s+/)`으로 분리 후 각 항목을 `<span className="whitespace-nowrap">` 으로 감싸고 부모에 `flex flex-wrap gap-x-1` 적용
  - 단일 이름/단어 셀(테이블·그리드)은 해당 요소에 `whitespace-nowrap` 적용
  - 문장·제목·설명 텍스트는 `style={{ wordBreak: "keep-all" }}` 적용 (어절 중간 끊김 방지)
