const flock = []

let alignSlider, cohesionSlider, separationSlider

const WIDTH = 20

let boidsMat = [] // [posX: number, posY: number, velX: number, velY: number][][]
const accelerationMat = [] //[accX: number, accY: number][][]

function flockingGpuCalc(boidsMat, acceleration) {
    const [posX, posY, velX, velY] = boidsMat[this.thread.y][this.thread.x]
    let alignmentCount = 0
    const alignmentVel = [0, 0]
    let cohesionCount = 0
    const cohesionVel = [0, 0]
    let separationCount = 0
    const separationVel = [0, 0]

    const eyeSight = Math.atan2(velY, velX)

    for (let y = 0; y < this.constants.WIDTH; y++) {
        for (let x = 0; x < this.constants.WIDTH; x++) {
            // Skip current boid
            if (this.thread.y === y && this.thread.x === x) {
                continue
            }

            const [oPosX, oPosY, oVelX, oVelY] = boidsMat[y][x]

            const relativeAngle = Math.atan2(oPosY - posY, oPosX - posX)
            if (Math.abs(eyeSight - relativeAngle) > Math.PI * 0.7) {
                continue
            }

            const d = Math.sqrt(Math.pow(posX - oPosX, 2) + Math.pow(posY - oPosY, 2))

            // Alignment accumulation
            if (d < 100) {
                alignmentCount++
                alignmentVel[0] += oVelX
                alignmentVel[1] += oVelY
            }

            // Cohesion accumulation
            if (d < 50) {
                cohesionCount++
                cohesionVel[0] += oPosX
                cohesionVel[1] += oPosY
            }

            // Separation accumulation
            if (d < 25) {
                separationCount++
                separationVel[0] += (posX - oPosX) / ((d / 10) * (d / 10))
                separationVel[1] += (posY - oPosY) / ((d / 10) * (d / 10))
            }
        }
    }

    if (alignmentCount === 0) alignmentCount++
    if (cohesionCount === 0) cohesionCount++
    if (separationCount === 0) separationCount++

    const alX = (alignmentVel[0] / alignmentCount) * 0.5
    const alY = (alignmentVel[1] / alignmentCount) * 0.5
    const coX = (cohesionVel[0] / cohesionCount - posX) * 0.3
    const coY = (cohesionVel[1] / cohesionCount - posY) * 0.3
    const seX = (separationVel[0] / separationCount) * 2
    const seY = (separationVel[1] / separationCount) * 2

    const accX = (alX + coX + seX) / 10
    const accY = (alY + coY + seY) / 10

    let newVelX = velX + accX
    let newVelY = velY + accY

    // Mouse disturbing force
    // const mfX = posX - this.constants.mouseX
    // const mfY = posY - this.constants.mouseY
    // const md = Math.sqrt(Math.pow(mfX, 2) + Math.pow(mfY, 2))

    // if (md < 200) {
    //     newVelX += mfX / 20
    //     newVelY += mfY / 20
    // }

    const velD = Math.sqrt(Math.pow(newVelX, 2) + Math.pow(newVelY, 2))
    if (velD > this.constants.maxSpeed) {
        newVelX *= this.constants.maxSpeed / velD
        newVelY *= this.constants.maxSpeed / velD
    }

    let newPosX = posX + newVelX
    let newPosY = posY + newVelY
    if (newPosX <= 0) newPosX = this.constants.maxX
    if (newPosX > this.constants.maxX) newPosX = 0
    if (newPosY <= 0) newPosY = this.constants.maxY
    if (newPosY > this.constants.maxY) newPosY = 0

    return [newPosX, newPosY, newVelX, newVelY]
}

const initMatrix = () => {
    for (let y = 0; y < WIDTH; y++) {
        boidsMat.push([])
        accelerationMat.push([])
        for (let x = 0; x < WIDTH; x++) {
            const velocity = p5.Vector.random2D()
            velocity.setMag(random(2, 4))
            boidsMat[y].push([random(0, width), random(0, height), velocity.x, velocity.y])
            accelerationMat[y].push([0, 0])
        }
    }

    calcFlocking = gpu.createKernel(flockingGpuCalc)
    calcFlocking.setOutput([WIDTH, WIDTH])
    calcFlocking.setConstants({
        WIDTH,
        maxX: width,
        maxY: height,
        maxSpeed: 4,
        mouseX,
        mouseY,
    })
}

const gpu = new GPU()
let calcFlocking
const drawBoid = (posX, posY, velX, velY) => {
    push()
    fill(255)
    noStroke()
    translate(posX, posY)
    rotate(atan2(velY, velX) + PI / 2)
    beginShape()
    vertex(0, -3)
    vertex(3, 6)
    vertex(-3, 6)
    endShape(CLOSE)
    pop()
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    background(51)

    initMatrix()

    // createSpan('Alignment')
    // alignSlider = createSlider(0, 2, 1, 0.1)
    // createSpan('Cohesion')
    // cohesionSlider = createSlider(0, 2, 1, 0.1)
    // createSpan('Separation')
    // separationSlider = createSlider(0, 2, 1, 0.1)
}

function draw() {
    calcFlocking.setConstants({
        WIDTH: WIDTH,
        maxX: width,
        maxY: height,
        maxSpeed: 6,
        mouseX,
        mouseY,
    })
    boidsMat = calcFlocking(boidsMat, accelerationMat)
    background(51)

    for (let y = 0; y < WIDTH; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const [posX, posY, velX, velY] = boidsMat[y][x]
            drawBoid(posX, posY, velX, velY)
        }
    }
}
