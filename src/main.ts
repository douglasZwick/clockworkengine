import P5 from "p5"
var canvasW = 640;
var canvasH = 360;
var clearColor;

const sketch = (p5: P5) =>
{
    function setup() {
        createCanvas(canvasW, canvasH);

        ENGINE = new Engine();
        let testScene = new TestScene();
        SPACE.Load(testScene);

        clearColor = color(40);

        frameRate(60);
    }

    function draw() {
        background(clearColor);

        ENGINE.Update(dt());
    }

    function dt() { return deltaTime / 1000; }
}

new P5(sketch)
