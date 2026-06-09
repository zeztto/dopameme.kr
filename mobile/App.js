import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'

const SITE_ORIGIN = 'https://dopameme.kr'
const ALLOWED_HOSTS = new Set(['dopameme.kr'])

function getHost(url) {
  const match = String(url).match(/^https?:\/\/([^/?#]+)/i)
  return match?.[1]?.toLowerCase() || null
}

function isAllowedUrl(url) {
  if (!url || url === 'about:blank') return true

  const host = getHost(url)
  return host ? ALLOWED_HOSTS.has(host) : false
}

async function openExternalUrl(url) {
  const canOpen = await Linking.canOpenURL(url)
  if (canOpen) {
    await Linking.openURL(url)
  }
}

export default function App() {
  const webViewRef = useRef(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(SITE_ORIGIN)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const handleShouldStartLoad = (request) => {
    if (isAllowedUrl(request.url)) return true

    openExternalUrl(request.url).catch(() => {
      Alert.alert('외부 링크를 열 수 없습니다', request.url)
    })
    return false
  }

  const handleBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack()
      return
    }

    webViewRef.current?.injectJavaScript("window.location.href = '/'; true;")
  }

  const handleReload = () => {
    setLoadError(null)
    webViewRef.current?.reload()
  }

  const handleOpenBrowser = () => {
    openExternalUrl(currentUrl || SITE_ORIGIN).catch(() => {
      Alert.alert('브라우저를 열 수 없습니다', currentUrl || SITE_ORIGIN)
    })
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: currentUrl || SITE_ORIGIN,
        url: currentUrl || SITE_ORIGIN,
      })
    } catch {
      Alert.alert('공유할 수 없습니다')
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          onPress={handleBack}
          style={({ pressed }) => [styles.toolButton, pressed && styles.toolButtonPressed]}
        >
          <Text style={styles.toolButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>도파밈</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="새로고침"
            onPress={handleReload}
            style={({ pressed }) => [styles.iconButton, pressed && styles.toolButtonPressed]}
          >
            <Text style={styles.iconButtonText}>↻</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="브라우저에서 열기"
            onPress={handleOpenBrowser}
            style={({ pressed }) => [styles.iconButton, pressed && styles.toolButtonPressed]}
          >
            <Text style={styles.iconButtonText}>↗</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="공유"
            onPress={handleShare}
            style={({ pressed }) => [styles.iconButton, pressed && styles.toolButtonPressed]}
          >
            <Text style={styles.iconButtonText}>Share</Text>
          </Pressable>
        </View>
      </View>

      {loadError ? (
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>연결할 수 없습니다</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
            onPress={handleReload}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="브라우저에서 열기"
            onPress={handleOpenBrowser}
            style={({ pressed }) => [styles.browserButton, pressed && styles.browserButtonPressed]}
          >
            <Text style={styles.browserButtonText}>브라우저에서 열기</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: SITE_ORIGIN }}
            originWhitelist={['https://dopameme.kr']}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onNavigationStateChange={(event) => {
              setCanGoBack(event.canGoBack)
              setCurrentUrl(event.url)
            }}
            onLoadStart={() => {
              setIsLoading(true)
            }}
            onLoadEnd={() => {
              setIsLoading(false)
            }}
            onError={(event) => {
              setLoadError(event.nativeEvent.description || '네트워크 상태를 확인해주세요.')
            }}
            onHttpError={(event) => {
              if (event.nativeEvent.statusCode >= 500) {
                setLoadError(`서버 응답 오류: ${event.nativeEvent.statusCode}`)
              }
            }}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled={false}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures
            pullToRefreshEnabled={Platform.OS === 'android'}
            applicationNameForUserAgent="DopamemeNative/0.1.0"
            injectedJavaScriptBeforeContentLoaded="window.__DOPAMEME_NATIVE_APP__ = true; true;"
          />
          {isLoading && (
            <View pointerEvents="none" style={styles.loadingOverlay}>
              <ActivityIndicator color="#2563EB" size="large" />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111827',
  },
  toolbar: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#111827',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#374151',
  },
  toolButton: {
    minHeight: 40,
    minWidth: 64,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  toolButtonPressed: {
    opacity: 0.7,
  },
  toolButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    minHeight: 40,
    minWidth: 40,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  iconButtonText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '900',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  errorState: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  errorText: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    width: '100%',
    minHeight: 48,
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#2563EB',
    marginBottom: 10,
  },
  retryButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  browserButton: {
    width: '100%',
    minHeight: 48,
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  browserButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  browserButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
})
