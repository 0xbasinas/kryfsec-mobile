import { CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, Share, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Txt } from '@/components/ui'
import { IconAlertTriangle, IconEye, IconEyeOff, IconKey, IconLinkOff, IconQrcode, IconRefresh, IconShare, IconX } from '@/lib/icons'
import { sync, useSync } from '@/lib/sync'
import { timeAgo } from '@/sync-core'
import { useTheme } from '@/theme'

function useNow(ms = 30_000): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

/** "Synced 2 min ago", "Syncing…", "Offline – will try again". */
export function SyncStatusLine() {
  const t = useTheme()
  const s = useSync()
  const now = useNow()
  const [color, text] = s.busy
    ? [t.accent, 'Syncing…']
    : s.error
      ? [t.danger, s.error]
      : s.offline
        ? [t.warn, `Offline – will try again${s.lastSync ? ` · last synced ${timeAgo(s.lastSync, now)}` : ''}`]
        : s.lastSync
          ? [t.success, `Synced ${timeAgo(s.lastSync, now)}`]
          : [t.warn, 'Not synced yet']
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {s.busy ? <ActivityIndicator size="small" color={t.accent} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />}
      <Txt variant="small" color={s.error && !s.busy ? t.danger : t.fg} style={{ flex: 1 }}>
        {text}
        {s.conflicts > 0 && !s.busy ? (
          <Txt variant="small" muted>{` · ${s.conflicts} conflict ${s.conflicts === 1 ? 'copy' : 'copies'} made`}</Txt>
        ) : null}
      </Txt>
    </View>
  )
}

function Warning() {
  const t = useTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        backgroundColor: t.card2,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: t.border
      }}>
      <IconAlertTriangle size={18} color={t.warn} strokeWidth={1.8} />
      <Txt variant="small" muted style={{ flex: 1 }}>
        Save the sync key somewhere safe, like a password manager. It is the only way to reach your synced data. If you lose it,
        nobody can recover the synced copy, not even us. Data on your devices stays.
      </Txt>
    </View>
  )
}

function Scanner({ open, onClose, onKey }: { open: boolean; onClose: () => void; onKey: (text: string) => void }) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const [perm, request] = useCameraPermissions()
  const done = useRef(false)

  useEffect(() => {
    if (open) {
      done.current = false
      if (perm && !perm.granted && perm.canAskAgain) void request()
    }
  }, [open, perm, request])

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#111110' }}>
        {perm?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              if (done.current || !data) return
              done.current = true
              onKey(data)
            }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 }}>
            <Txt color="#e8e8e3" style={{ textAlign: 'center' }}>
              kryfsec needs the camera to scan the sync key. The picture is not saved or sent anywhere.
            </Txt>
            {perm && !perm.canAskAgain ? (
              <Txt variant="small" color="#a3a29c" style={{ textAlign: 'center' }}>
                Camera access is off. Turn it on in the phone settings, or paste the key instead.
              </Txt>
            ) : (
              <Button label="Allow camera" onPress={() => void request()} />
            )}
          </View>
        )}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 24, alignItems: 'center', gap: 12 }}>
          <Txt variant="small" color="#e8e8e3" style={{ backgroundColor: 'rgba(17,17,16,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
            Desktop app: Settings → Sync
          </Txt>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close scanner"
            style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: t.card }}>
            <IconX size={22} color={t.fg} />
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

/** Settings → Sync. Pair with the desktop app by QR code or pasted key. */
export function SyncSection() {
  const t = useTheme()
  const s = useSync()
  const [scan, setScan] = useState(false)
  const [paste, setPaste] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [working, setWorking] = useState(false)
  const key = s.paired ? sync.keyText() : null

  const join = (text: string) => {
    Alert.alert(
      'Join this sync?',
      'Data from the other device is added to this phone. The example data on this phone is removed. Your own entries stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            setWorking(true)
            try {
              await sync.join(text)
              setPaste(false)
              setKeyInput('')
            } catch (err) {
              Alert.alert('Could not join', err instanceof Error ? err.message : String(err))
            } finally {
              setWorking(false)
            }
          }
        }
      ]
    )
  }

  const turnOn = async () => {
    setWorking(true)
    try {
      await sync.create()
    } catch (err) {
      Alert.alert('Could not turn on sync', err instanceof Error ? err.message : String(err))
    } finally {
      setWorking(false)
    }
  }

  const turnOff = () =>
    Alert.alert('Turn off sync on this phone?', 'Your data stays on this phone. The synced copy stays for your other devices.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Turn off', style: 'destructive', onPress: () => void sync.unpair() }
    ])

  if (!s.paired) {
    return (
      <>
        <Txt variant="small" muted>
          Keep this phone and the kryfsec desktop app in sync. End-to-end encrypted: the server only stores locked data it cannot
          read. No account needed.
        </Txt>
        <Button label="Scan the desktop QR code" icon={IconQrcode} onPress={() => setScan(true)} disabled={working} />
        {paste ? (
          <View style={{ gap: 8 }}>
            <TextInput
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="KS1-…"
              placeholderTextColor={t.faint}
              autoCapitalize="characters"
              autoCorrect={false}
              style={{ color: t.fg, fontSize: 14, fontFamily: 'monospace', backgroundColor: t.card2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => setPaste(false)} />
              <Button label="Join" style={{ flex: 1 }} disabled={!keyInput.trim() || working} onPress={() => join(keyInput)} />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Paste a key" icon={IconKey} variant="ghost" style={{ flex: 1 }} onPress={() => setPaste(true)} />
            <Button label="New sync here" variant="ghost" style={{ flex: 1 }} onPress={() => void turnOn()} disabled={working} />
          </View>
        )}
        <Scanner
          open={scan}
          onClose={() => setScan(false)}
          onKey={(text) => {
            setScan(false)
            join(text)
          }}
        />
      </>
    )
  }

  return (
    <>
      <SyncStatusLine />
      <Txt variant="small" muted>
        Syncs when the app opens, a few seconds after you change something, and when you pull down on a list.
      </Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.card2, borderRadius: 12, paddingLeft: 14, paddingRight: 6 }}>
        <Txt variant="mono" style={{ flex: 1, fontSize: 12 }} numberOfLines={1} selectable={showKey}>
          {showKey ? key : `${key?.slice(0, 8)}${'-••••'.repeat(4)}…`}
        </Txt>
        <Pressable onPress={() => setShowKey((v) => !v)} accessibilityLabel={showKey ? 'Hide key' : 'Show key'} style={{ padding: 10 }}>
          {showKey ? <IconEyeOff size={18} color={t.muted} /> : <IconEye size={18} color={t.muted} />}
        </Pressable>
        <Pressable onPress={() => key && void Share.share({ message: key })} accessibilityLabel="Share key" style={{ padding: 10 }}>
          <IconShare size={18} color={t.muted} />
        </Pressable>
      </View>
      <Warning />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
        <Button label="Turn off" icon={IconLinkOff} variant="ghost" style={{ flex: 1 }} onPress={turnOff} />
        <Button label="Sync now" icon={IconRefresh} style={{ flex: 1 }} disabled={s.busy} onPress={() => void sync.syncNow()} />
      </View>
    </>
  )
}
