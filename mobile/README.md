# 도파밈 React Native App

Expo 기반 React Native shell입니다. 현재 production web origin인 `https://dopameme.kr`만 WebView로 로드합니다.

## 실행

```bash
cd mobile
npm install
npm run ios
npm run android
```

## 범위

- `dopameme.kr` origin allowlist
- native toolbar: back, reload, open in browser, share
- shared cookie session 유지
- 네트워크/server error retry state
- 외부 URL은 system browser로 위임

## 보안/운영 메모

- 인증 페이지와 WebAuthn/passkey는 production origin에서 처리합니다.
- WebView에서 passkey 동작이 제한되는 기기에서는 toolbar의 browser action으로 system browser fallback을 제공합니다.
- 앱스토어 제출 전에는 native splash/icon, privacy manifest, push notification entitlement, deep link 정책을 별도 확정해야 합니다.
