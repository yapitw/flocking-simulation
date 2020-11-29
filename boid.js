class Boid {
    constructor() {
        this.position = createVector(random(width), random(height))
        this.velocity = p5.Vector.random2D()
        this.velocity.setMag(random(2, 4))
        this.acceleration = createVector()
        this.maxForce = 1
        this.maxSpeed = 4
    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0
        } else if (this.position.x < 0) {
            this.position.x = width
        }

        if (this.position.y > height) {
            this.position.y = 0
        } else if (this.position.y < 0) {
            this.position.y = height
        }
    }

    flock(boids) {
        let alignment = this.align(boids)
        let cohesion = this.cohesion(boids)
        let separation = this.separation(boids)

        alignment.mult(alignSlider.value())
        cohesion.mult(cohesionSlider.value())
        separation.mult(separationSlider.value())

        this.acceleration.add(alignment)
        this.acceleration.add(cohesion)
        this.acceleration.add(separation)
        this.acceleration.div(10)
    }

    align(boids) {
        let perceptionRadius = 100
        let total = 0
        let steering = createVector()
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y)
            if (other !== this && d < perceptionRadius) {
                steering.add(other.velocity)
                total++
            }
        }
        if (total > 0) {
            steering.div(total)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    cohesion(boids) {
        let perceptionRadius = 100
        let total = 0
        let steering = createVector()
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y)
            if (other !== this && d < perceptionRadius) {
                steering.add(other.position)
                total++
            }
        }
        if (total > 0) {
            steering.div(total)
            steering.sub(this.position)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    separation(boids) {
        let perceptionRadius = 20
        let total = 0
        let steering = createVector()
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y)
            if (other !== this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.position, other.position)
                diff.div(d * d)
                steering.add(diff)
                total++
            }
        }
        if (total > 0) {
            steering.div(total)
            steering.setMag(this.maxSpeed)
            steering.sub(this.velocity)
            steering.limit(this.maxForce)
        }
        return steering
    }

    update() {
        this.position.add(this.velocity)
        this.velocity.mult(0.98)
        this.velocity.add(this.acceleration)
        this.velocity.limit(this.maxSpeed)
        this.acceleration.set(0, 0)
        this.edges()
    }

    show() {
        push()
        noFill()
        stroke(255)
        translate(this.position.x, this.position.y)
        rotate(atan2(this.velocity.y, this.velocity.x) + PI / 2)
        beginShape()
        vertex(0, -3)
        vertex(3, 6)
        vertex(-3, 6)
        endShape(CLOSE)
        pop()
    }
}
