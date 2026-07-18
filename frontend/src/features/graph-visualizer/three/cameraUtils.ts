import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { Box3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function fitCameraToBounds(
  camera: PerspectiveCamera,
  controls: OrbitControlsImpl,
  bounds: Box3,
) {
  const size = bounds.getSize(new Vector3())
  const center = bounds.getCenter(new Vector3())
  const maxSize = Math.max(size.x, size.z, 4)
  const distance = MathUtils.clamp(maxSize * 1.35, 8, 38)

  camera.position.set(center.x + distance * 0.72, distance * 0.65, center.z + distance * 0.72)
  camera.near = 0.1
  camera.far = Math.max(1000, distance * 12)
  camera.lookAt(center)
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  controls.update()
}

export function moveCameraTowardSelection(
  camera: PerspectiveCamera,
  controls: OrbitControlsImpl,
  target: Vector3,
) {
  controls.target.lerp(target, 0.08)

  const desiredPosition = new Vector3(target.x + 4.8, target.y + 4, target.z + 4.8)
  camera.position.lerp(desiredPosition, 0.055)
  camera.lookAt(controls.target)
  camera.updateProjectionMatrix()
}
