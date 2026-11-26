import './style.css'
import * as THREE from 'three'

document.querySelector('#app').innerHTML = `
  <main class="game">
    <h1>Aja Doshanirvarana</h1>
    <p>Move with WASD or the arrow keys</p>
    <p id="inventory">Inventory: empty</p>
    <div id="scene"></div>
  </main>
`

const container = document.querySelector('#scene')
const scene = new THREE.Scene()
scene.background = new THREE.Color('#111827')

const camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 100)
camera.position.set(9, 11, 9)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
container.appendChild(renderer.domElement)

scene.add(new THREE.HemisphereLight(0xffffff, 0x394150, 2))

const sunlight = new THREE.DirectionalLight(0xffffff, 2)
sunlight.position.set(5, 10, 5)
scene.add(sunlight)

// Build a 9-by-9 tiled floor.
for (let x = -4; x <= 4; x++) {
  for (let z = -4; z <= 4; z++) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 0.15, 0.98),
      new THREE.MeshStandardMaterial({
        color: (x + z) % 2 === 0 ? '#b9a989' : '#9d8c6b',
      }),
    )
    tile.position.set(x, -0.075, z)
    scene.add(tile)
  }
}

// Add a simple altar in the middle of the room.
const altar = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.5, 1.5),
  new THREE.MeshStandardMaterial({ color: '#9b4d2e' }),
)
altar.position.set(0, 0.25, 0)
scene.add(altar)

const portal = new THREE.Mesh(
  new THREE.TorusGeometry(0.7, 0.12, 12, 32),
  new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0c4a6e',
    emissiveIntensity: 1.5,
  }),
)
portal.position.set(3, 0.9, 3)
portal.visible = false
scene.add(portal)

// The player is a placeholder for now.
const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.9, 0.65),
  new THREE.MeshStandardMaterial({ color: '#45c486' }),
)
player.position.set(-2, 0.45, 0)
scene.add(player)

const samagri = new THREE.Mesh(
  new THREE.SphereGeometry(0.35, 16, 16),
  new THREE.MeshStandardMaterial({ color: '#facc15' }),
)
samagri.position.set(2, 0.35, 0)
scene.add(samagri)

let hasSamagri = false
let altarCleared = false
const inventory = document.querySelector('#inventory')

const keys = new Set()

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
   if (key === 'e') {
  const itemDistance = player.position.distanceTo(samagri.position)

  if (!hasSamagri && itemDistance < 1.3) {
    hasSamagri = true
    scene.remove(samagri)
    inventory.textContent = 'Inventory: 1 samagri'
    return
  }

  const altarDistance = player.position.distanceTo(altar.position)

  if (hasSamagri && !altarCleared && altarDistance < 1.6) {
    hasSamagri = false
    altarCleared = true
    altar.material.color.set('#22c55e')
    portal.visible = true
    inventory.textContent = 'Altar cleared! Exit portal unlocked.'
  }
  const portalDistance = player.position.distanceTo(portal.position)

  if (altarCleared && portalDistance < 1.5) {
    inventory.textContent = 'Room complete!'
  }
}
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault()
    keys.add(key)
  }
})

window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase())
})

function resize() {
  const width = container.clientWidth
  const height = container.clientHeight
  const aspect = width / height
  const viewHeight = 12

  camera.left = (-viewHeight * aspect) / 2
  camera.right = (viewHeight * aspect) / 2
  camera.top = viewHeight / 2
  camera.bottom = -viewHeight / 2
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

window.addEventListener('resize', resize)
resize()

let previousTime = 0

function animate(time) {
  requestAnimationFrame(animate)

  const delta = Math.min((time - previousTime) / 1000, 0.05)
  previousTime = time

  const speed = 3 * delta
  if (keys.has('w') || keys.has('arrowup')) player.position.z -= speed
  if (keys.has('s') || keys.has('arrowdown')) player.position.z += speed
  if (keys.has('a') || keys.has('arrowleft')) player.position.x -= speed
  if (keys.has('d') || keys.has('arrowright')) player.position.x += speed

  // Keep the player inside the room for now.
  player.position.x = THREE.MathUtils.clamp(player.position.x, -3.8, 3.8)
  player.position.z = THREE.MathUtils.clamp(player.position.z, -3.8, 3.8)

  renderer.render(scene, camera)
}

requestAnimationFrame(animate)