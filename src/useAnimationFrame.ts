import { useRef } from 'react'
import useMounted from './useMounted'
import useStableMemo from './useStableMemo'
import useWillUnmount from './useWillUnmount'

export interface UseAnimationFrameReturn {
  cancel(): void

  /**
   * Request for the provided callback to be called on the next animation frame.
   * Previously registered callbacks will be cancelled
   */
  request(callback: FrameRequestCallback): void

  /**
   * Request for the provided callback to be called on the next animation frame.
   * Previously registered callbacks can be cancelled by providing `cancelPrevious`
   */
  request(cancelPrevious: boolean, callback: FrameRequestCallback): void
}
/**
 * Returns a controller object for requesting and cancelling an animation freame that is properly cleaned up
 * once the component unmounts. New requests cancel and replace existing ones.
 *
 * ```ts
 * const [style, setStyle] = useState({});
 * const animationFrame = useAnimationFrame();
 *
 * const handleMouseMove = (e) => {
 *   animationFrame.request(() => {
 *     setStyle({ top: e.clientY, left: e.clientY })
 *   })
 * }
 *
 * const handleMouseUp = () => {
 *   animationFrame.cancel()
 * }
 *
 * return (
 *   <div onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
 *     <Ball style={style} />
 *   </div>
 * )
 * ```
 */
export default function useAnimationFrame(): UseAnimationFrameReturn {
  const isMounted = useMounted()
  const handle = useRef<number | undefined>()

  const cancel = () => {
    if (handle.current != null) {
      cancelAnimationFrame(handle.current)
    }
  }

  useWillUnmount(cancel)

  return useStableMemo(
    () => ({
      request(
        cancelPrevious: boolean | FrameRequestCallback,
        fn?: FrameRequestCallback,
      ) {
        if (!isMounted()) return

        if (cancelPrevious) cancel()

        handle.current = requestAnimationFrame(
          fn || (cancelPrevious as FrameRequestCallback),
        )
      },
      cancel,
    }),
    [],
  )
}
