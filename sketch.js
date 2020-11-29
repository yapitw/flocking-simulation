const flock = []

let alignSlider, cohesionSlider, separationSlider

function setup() {
    createCanvas(640, 360)

    createSpan('Alignment')
    alignSlider = createSlider(0, 2, 1, 0.1)
    createSpan('Cohesion')
    cohesionSlider = createSlider(0, 2, 1, 0.1)
    createSpan('Separation')
    separationSlider = createSlider(0, 2, 1, 0.1)
    for (let i = 0; i < 100; i++) {
        flock.push(new Boid())
    }
}

function draw() {
    background(51)

    for (let boid of flock) {
        boid.flock(flock)
        boid.update()
        boid.show()
    }
}
