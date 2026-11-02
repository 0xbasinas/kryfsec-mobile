import { useEffect, useState } from 'react'
import { KeyboardEvents } from 'react-native-keyboard-controller'

/**
 * Height of the on-screen keyboard (0 when hidden).
 *
 * The app draws edge to edge, so on Android the window does not shrink when
 * the keyboard opens and React Native's own keyboard events may not fire.
 * react-native-keyboard-controller reads the real keyboard insets instead.
 */
export function useKeyboardHeight(): number {
  const [h, setH] = useState(0)
  useEffect(() => {
    const show = KeyboardEvents.addListener('keyboardWillShow', (e) => setH(e.height))
    const hide = KeyboardEvents.addListener('keyboardWillHide', () => setH(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])
  return h
}
