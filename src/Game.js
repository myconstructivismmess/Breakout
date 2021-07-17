/**
 * Author
 @Inateno / http://inateno.com / http://dreamirl.com

 * ContributorsList
 @Inateno

 ***
 simple Game declaration
 **/
import DE from "@dreamirl/dreamengine";
var Game = {};

Game.render = null;
Game.scene = null;
Game.gameObjects = {
    paddle: null,
    bricks: null,
    balls: null,
    walls: null,
    confetti: null,
    scriptHolder: null,
};

// Properties
Game.properties = {
    spawnAnimation: {
        speed: 0.02,
        easingFunction: function(t) {
            return 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
        },
    },
    screen: {
        size: {
            width: 1920, // px
            height: 1080, // px
        },
        backgroundColors: {
            default: "0x740334",
        },
    },
    walls: {
        color: "0x290F2A",
        width: 20, // px
    },
    paddle: {
        width: 300, // px
        height: 80, // px
        verticalOffset: 50, // px Vertical offset from the bottom of the screen to the paddle
        ballSpacing: 60, // px Space between a stuck ball and the paddle
        colors: {
            default: "0xECCBC0",
        },
        keyboard: {
            speed: 30, // Movement speed via keyboard in px per frame
            left: ["left"], // Keys to make the paddle go left
            right: ["right"], // Keys to make the paddle go right
            releaseBall: ["jump"], // Keys to make the paddle release the ball
        },
        mouse: {
            speed: 70,
        },
    },
    bricks: {
        width: 150, // px
        height: 50, // px
        spacing: 20, // px Space between bricks
        rows: 10, // Number of rows of bricks
        lines: 7, // Number of lines of bricks
        colors: {
            default: "0xCA3A47",
        },
    },
    balls: {
        size: 40, // px
        colors: {
            default: "0xF2E209",
            hit: "0xFFFFFF"
        },
        hitAnimation: {
            speed: 0.06,
            size: 80,
            easingFunction: function (t) {
                return Math.pow(1 - t, 5);
            }
        }
    },
    confetti: {},
};

// Math
Game.collisionDetectionFunction = function(line1, line2) {
    let denominator = ((line1[1].x - line1[0].x) * (line2[1].y - line2[0].y)) - ((line1[1].y - line1[0].y) * (line2[1].x - line2[0].x));
    let numerator1 = ((line1[0].y - line2[0].y) * (line2[1].x - line2[0].x)) - ((line1[0].x - line2[0].x) * (line2[1].y - line2[0].y));
    let numerator2 = ((line1[0].y - line2[0].y) * (line1[1].x - line1[0].x)) - ((line1[0].x - line2[0].x) * (line1[1].y - line1[0].y));

    if (denominator === 0) {
        return numerator1 === 0 && numerator2 === 0;
    }

    let r = numerator1 / denominator;
    let s = numerator2 / denominator;

    return (0 <= r && r <= 1) && (0 <= s && s <= 1);
}

// Initialization
Game.init = function() {
    Game.render = new DE.Render("render", {
        resizeMode: "stretch-ratio",
        width: Game.properties.screen.size.width,
        height: Game.properties.screen.size.height,
        backgroundColor: Game.properties.screen.backgroundColors.default,
        roundPixels: false,
        powerPreferences: "high-performance",
    });

    Game.render.init();
    DE.start();
};

Game.onload = function() {
    // Scene & Camera
    Game.scene = new DE.Scene();
    Game.camera = new DE.Camera(0, 0, Game.properties.screen.size.width, Game.properties.screen.size.height, {
        scene: Game.scene,
    });
    Game.camera.interactive = true;
    Game.render.add(Game.camera);
    Game.camera.triggerWallsShake = function() {
        this.shake(10, 10, 200);
    };
    Game.camera.triggerBricksShake = function() {
        DE.pause();
        setTimeout(() => {
            DE.unPause();
            Game.camera.shake(20, 20, 200);
        }, 30);
    };

    // Mouse
    Game.camera.pointermove = function(pos, e) {
        Game.gameObjects.paddle.vars.mouse.target = pos.x;
        Game.gameObjects.paddle.vars.keys.active = false;
    };
    Game.camera.pointerup = function(pos, e) {
        Game.gameObjects.paddle.launchBall();
    };

    // Keys
    for (let i = 0; i < Game.properties.paddle.keyboard.left.length; i++) {
        let key = Game.properties.paddle.keyboard.left[i];

        DE.Inputs.on("keyDown", key, function() {
            Game.gameObjects.paddle.vars.keys.left += 1;
            Game.gameObjects.paddle.vars.keys.active = true;
        });
        DE.Inputs.on("keyUp", key, function() {
            Game.gameObjects.paddle.vars.keys.left -= 1;
        });
    }
    for (let i = 0; i < Game.properties.paddle.keyboard.right.length; i++) {
        let key = Game.properties.paddle.keyboard.right[i];

        DE.Inputs.on("keyDown", key, function() {
            Game.gameObjects.paddle.vars.keys.right += 1;
            Game.gameObjects.paddle.vars.keys.active = true;
        });
        DE.Inputs.on("keyUp", key, function() {
            Game.gameObjects.paddle.vars.keys.right -= 1;
        });
    }
    for (let i = 0; i < Game.properties.paddle.keyboard.releaseBall.length; i++) {
        let key = Game.properties.paddle.keyboard.releaseBall[i];

        DE.Inputs.on("keyDown", key, function() {
            Game.gameObjects.paddle.launchBall();
        });
    }

    Game.die = function(ball) {
        console.log("you died");
        ball.vars.stuck = true;
    };

    // Game Objects
    Game.gameObjects.scriptHolder = new DE.GameObject({
        vars: {
            spawnAnimation: {
                completed: false,
                time: 0,
                easedTime: 0,
            },
        },
        x: 0,
        y: 0,
        automatisms: [["updateSpawnAnimationTime"]],
        updateSpawnAnimationTime: function() {
            if (!this.vars.spawnAnimation.completed) {
                this.vars.spawnAnimation.time = Math.min(this.vars.spawnAnimation.time + Game.properties.spawnAnimation.speed, 1);
                this.vars.spawnAnimation.easedTime = Game.properties.spawnAnimation.easingFunction(this.vars.spawnAnimation.time);

                if (this.vars.spawnAnimation.time === 1) {
                    this.vars.spawnAnimation.completed = true;
                }
            }
        },
    });
    Game.gameObjects.paddle = new DE.GameObject({
        vars: {
            keys: { left: 0, right: 0, active: true },
            mouse: {
                target: 0,
            },
            size: {
                width: Game.properties.paddle.width,
                height: Game.properties.paddle.height,
            },
        },
        x: Game.properties.screen.size.width / 2,
        y: -Game.properties.paddle.verticalOffset,
        automatisms: [["updateMouse"], ["updateKeys"], ["updateSpawnAnimation"]],
        renderer: new DE.RectRenderer(Game.properties.paddle.width, Game.properties.paddle.height, Game.properties.paddle.colors.default, {
            fill: true,
            x: -Game.properties.paddle.width / 2,
            y: -Game.properties.paddle.height,
        }),
        clamp: function(x) {
            return Math.min(
                Math.max(x, Game.properties.walls.width + Game.properties.paddle.width / 2),
                Game.properties.screen.size.width - Game.properties.walls.width - Game.properties.paddle.width / 2,
            );
        },
        updateMouse: function() {
            if (!this.vars.keys.active && Game.gameObjects.scriptHolder.vars.spawnAnimation.completed) {
                let xBound = this.clamp(this.vars.mouse.target);
                if (this.x < xBound) {
                    this.x += Math.min(xBound - this.x, Game.properties.paddle.mouse.speed);
                } else if (this.x > xBound) {
                    this.x -= Math.min(this.x - xBound, Game.properties.paddle.mouse.speed);
                }
            }
        },
        updateKeys: function() {
            if (Game.gameObjects.scriptHolder.vars.spawnAnimation.completed) {
                let movement = ((this.vars.keys.left > 0 ? -1 : 0) + (this.vars.keys.right > 0 ? 1 : 0)) * Game.properties.paddle.keyboard.speed;
                this.x = this.clamp(this.x + movement);
            }
        },
        checkCollision: function(ballLines, velocity) {
            let collision = false;
            let newVelocity = { x: velocity.x, y: velocity.y };

            let lines = {
                top: [
                    { x: this.x - this.vars.size.width / 2, y: this.y - this.vars.size.height },
                    { x: this.x + this.vars.size.width / 2, y: this.y - this.vars.size.height }
                ],
                left: [
                    { x: this.x - this.vars.size.width / 2, y: this.y - this.vars.size.height },
                    { x: this.x - this.vars.size.width / 2, y: this.y }
                ],
                right: [
                    { x: this.x + this.vars.size.width / 2, y: this.y - this.vars.size.height },
                    { x: this.x + this.vars.size.width / 2, y: this.y }
                ],
            }

            if (Game.collisionDetectionFunction(ballLines.bottomLeftCorner, lines.top) || Game.collisionDetectionFunction(ballLines.bottomRightCorner, lines.top)) { // Top
                collision = true;
                newVelocity.y = -Math.abs(velocity.y);
            }

            if (Game.collisionDetectionFunction(ballLines.topRightCorner, lines.left) || Game.collisionDetectionFunction(ballLines.bottomRightCorner, lines.left)) { // Left
                collision = true;
                newVelocity.x = -Math.abs(velocity.x);
            }

            if (Game.collisionDetectionFunction(ballLines.topLeftCorner, lines.right) || Game.collisionDetectionFunction(ballLines.bottomLeftCorner, lines.right)) { // Right
                collision = true;
                newVelocity.x = Math.abs(velocity.x);
            }

            if (collision) {
                return newVelocity;
            }
        },
        launchBall: function() {
            if (Game.gameObjects.scriptHolder.vars.spawnAnimation.completed) {
                for (let i = 0; i < Game.gameObjects.balls.length; i++) {
                    if (Game.gameObjects.balls[i].vars.stuck) {
                        Game.gameObjects.balls[i].vars.stuck = false;
                        Game.gameObjects.balls[i].x = this.x;
                        Game.gameObjects.balls[i].setLaunchVelocity();
                    }
                }
            }
        },
        updateSpawnAnimation: function() {
            if (!Game.gameObjects.scriptHolder.vars.spawnAnimation.completed) {
                this.y =
                    -Game.properties.paddle.verticalOffset +
                    Game.gameObjects.scriptHolder.vars.spawnAnimation.easedTime * Game.properties.screen.size.height;
            }
        },
    });
    Game.gameObjects.walls = new DE.GameObject({
        x: 0,
        y: 0,
        renderers: [
            new DE.RectRenderer(Game.properties.walls.width * 2, Game.properties.screen.size.height, Game.properties.walls.color, {
                // Left
                x: -Game.properties.walls.width,
                fill: true,
            }),
            new DE.RectRenderer(Game.properties.walls.width * 2, Game.properties.screen.size.height, Game.properties.walls.color, {
                // Right
                x: Game.properties.screen.size.width - Game.properties.walls.width,
                fill: true,
            }),
            new DE.RectRenderer(Game.properties.screen.size.width, Game.properties.walls.width * 2, Game.properties.walls.color, {
                // Top
                y: -Game.properties.walls.width,
                fill: true,
            }),
        ],
        checkCollision: function(ballLines, velocity) {
            let collision = false;
            let newVelocity = { x: velocity.x, y: velocity.y };

            let lines = {
                top: [
                    { x: Game.properties.walls.width, y: Game.properties.walls.width },
                    { x: Game.properties.screen.size.width - Game.properties.walls.width, y: Game.properties.walls.width }
                ],
                left: [
                    { x: Game.properties.walls.width, y: Game.properties.walls.width },
                    { x: Game.properties.walls.width, y: Game.properties.screen.size.height },
                ],
                right: [
                    { x: Game.properties.screen.size.width - Game.properties.walls.width, y: Game.properties.walls.width },
                    { x: Game.properties.screen.size.width - Game.properties.walls.width, y: Game.properties.screen.size.height }
                ],
            }

            if (Game.collisionDetectionFunction(ballLines.topLeftCorner, lines.top) || Game.collisionDetectionFunction(ballLines.topRightCorner, lines.top)) { // Top
                collision = true;
                newVelocity.y = Math.abs(velocity.y);
            }

            if (Game.collisionDetectionFunction(ballLines.topLeftCorner, lines.left) || Game.collisionDetectionFunction(ballLines.bottomLeftCorner, lines.left)) { // Left
                collision = true;
                newVelocity.x = Math.abs(velocity.x);
            }

            if (Game.collisionDetectionFunction(ballLines.topRightCorner, lines.right) || Game.collisionDetectionFunction(ballLines.bottomRightCorner, lines.right)) { // Right
                collision = true;
                newVelocity.x = -Math.abs(velocity.x);
            }

            if (collision) {
                Game.camera.triggerWallsShake();
                return newVelocity;
            }
        },
    });
    Game.gameObjects.balls = [];
    Game.gameObjects.balls.push(
        new DE.GameObject({
            vars: {
                stuck: true,
                hitAnimation: {
                    active: false,
                    time: 1,
                    easedTime: 0
                },
                velocity: { x: 0, y: 0 },
            },
            x: Game.properties.screen.size.width / 2,
            y:
                Game.properties.screen.size.height -
                Game.properties.paddle.verticalOffset -
                Game.properties.paddle.height -
                Game.properties.paddle.ballSpacing,
            renderer: new DE.RectRenderer(Game.properties.balls.size, Game.properties.balls.size, Game.properties.balls.colors.default, {
                fill: true,
                x: -Game.properties.balls.size / 2,
                y: -Game.properties.balls.size / 2,
            }),
            automatisms: [["updatePosition"], ["updateHitAnimation"] /*["updateRotation"]*/],
            updatePosition: function() {
                if (!this.vars.stuck) {
                    this.x += this.vars.velocity.x;
                    this.y += this.vars.velocity.y;

                    let halfSize = Game.properties.balls.size / 2;
                    let ballLines = {
                        topLeftCorner: [
                            { x: this.x - halfSize, y: this.y - halfSize },
                            { x: this.x - halfSize + this.vars.velocity.x, y: this.y - halfSize + this.vars.velocity.y }
                        ],
                        topRightCorner: [
                            { x: this.x + halfSize, y: this.y - halfSize },
                            { x: this.x + halfSize + this.vars.velocity.x, y: this.y - halfSize + this.vars.velocity.y }
                        ],
                        bottomLeftCorner: [
                            { x: this.x - halfSize, y: this.y + halfSize },
                            { x: this.x - halfSize + this.vars.velocity.x, y: this.y + halfSize + this.vars.velocity.y }
                        ],
                        bottomRightCorner: [
                            { x: this.x + halfSize, y: this.y + halfSize },
                            { x: this.x + halfSize + this.vars.velocity.x, y: this.y + halfSize + this.vars.velocity.y }
                        ]
                    }

                    let velocityWalls = Game.gameObjects.walls.checkCollision(ballLines, this.vars.velocity);
                    if (velocityWalls) {
                        this.vars.velocity = velocityWalls;
                        this.triggerHitAnimation();
                    }

                    let velocityPaddle = Game.gameObjects.paddle.checkCollision(ballLines, this.vars.velocity);
                    if (velocityPaddle) {
                        this.vars.velocity = velocityPaddle;
                        this.triggerHitAnimation();
                    }

                    for (let i = 0; i < Game.gameObjects.bricks.length; i++) {
                        let velocityBrick = Game.gameObjects.bricks[i].checkCollision(ballLines, this.vars.velocity);
                        if (velocityBrick) {
                            this.vars.velocity = velocityBrick;
                            this.triggerHitAnimation();
                        }
                    }

                    if (this.y >= Game.properties.screen.size.height) {
                        Game.die(this);
                    }
                } else {
                    this.x = Game.gameObjects.paddle.x;
                    this.y = Game.gameObjects.paddle.y - Game.properties.paddle.height - Game.properties.paddle.ballSpacing;
                }
            },
            updateHitAnimation: function () {
                if (this.vars.hitAnimation.active) {
                    this.vars.hitAnimation.time = Math.min(this.vars.hitAnimation.time + Game.properties.balls.hitAnimation.speed, 1);
                    this.vars.hitAnimation.easedTime = Game.properties.balls.hitAnimation.easingFunction(this.vars.hitAnimation.time);

                    if (this.vars.hitAnimation.time === 1) {
                        this.vars.hitAnimation.active = false;
                    }

                    let newSize = {
                        width: Game.properties.balls.size + this.vars.hitAnimation.easedTime * (Game.properties.balls.hitAnimation.size - Game.properties.balls.size),
                        height: Game.properties.balls.size + this.vars.hitAnimation.easedTime * (Game.properties.balls.hitAnimation.size - Game.properties.balls.size)
                    };

                    this.renderer.updateRender({
                        x: -newSize.width / 2,
                        y: -newSize.height / 2,
                        width: newSize.width,
                        height: newSize.height,
                        color: this.vars.hitAnimation.time <= 0.8 ? Game.properties.balls.colors.hit : Game.properties.balls.colors.default
                    });
                }
            },
            triggerHitAnimation: function() {
                this.vars.hitAnimation.active = true;
                this.vars.hitAnimation.time = 0;
            },
            setLaunchVelocity: function () {
                this.vars.velocity = {
                    x: (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random() * (15 - 5)) + 5),
                    y: -20,
                };
            },
        }),
    );
    Game.gameObjects.bricks = [];
    let xOffset =
        Game.properties.screen.size.width / 2 -
        (Game.properties.bricks.width * Game.properties.bricks.rows + Game.properties.bricks.spacing * (Game.properties.bricks.rows - 1)) / 2 +
        Game.properties.bricks.width / 2;
    for (let x = 0; x < Game.properties.bricks.rows; x++) {
        for (let y = 0; y < Game.properties.bricks.lines; y++) {
            let initialRotation = (Math.PI / 4) * (Math.random() > 0.5 ? -1 : 1);
            let initialTimeOffset = -Math.random() * 0.7;

            Game.gameObjects.bricks.push(
                new DE.GameObject({
                    vars: {
                        active: true,
                        spawnAnimation: {
                            completed: false,
                            time: initialTimeOffset,
                            easedTime: 0,
                            initialY:
                                Game.properties.walls.width +
                                (Game.properties.bricks.spacing + Game.properties.bricks.height / 2) +
                                y * (Game.properties.bricks.height + Game.properties.bricks.spacing) -
                                Game.properties.screen.size.height,
                            targetY:
                                Game.properties.walls.width +
                                (Game.properties.bricks.spacing + Game.properties.bricks.height / 2) +
                                y * (Game.properties.bricks.height + Game.properties.bricks.spacing),
                            initialRotation: initialRotation,
                            targetRotation: 0,
                        },
                        size: {
                            width: Game.properties.bricks.width,
                            height: Game.properties.bricks.height
                        }
                    },
                    rotation: initialRotation,
                    x: xOffset + x * (Game.properties.bricks.width + Game.properties.bricks.spacing),
                    y:
                        Game.properties.walls.width +
                        (Game.properties.bricks.spacing + Game.properties.bricks.height / 2) +
                        y * (Game.properties.bricks.height + Game.properties.bricks.spacing) -
                        Game.properties.screen.size.height,
                    automatisms: [["updateSpawnAnimation"], ["updateSpawnAnimationTime"]],
                    renderer: new DE.RectRenderer(
                        Game.properties.bricks.width,
                        Game.properties.bricks.height,
                        Game.properties.bricks.colors.default,
                        {
                            x: -Game.properties.bricks.width / 2,
                            y: -Game.properties.bricks.height / 2,
                            fill: true,
                        },
                    ),
                    updateSpawnAnimationTime: function() {
                        if (!this.vars.spawnAnimation.completed) {
                            this.vars.spawnAnimation.time = Math.min(this.vars.spawnAnimation.time + Game.properties.spawnAnimation.speed, 1);
                            this.vars.spawnAnimation.easedTime = Game.properties.spawnAnimation.easingFunction(
                                Math.max(this.vars.spawnAnimation.time, 0),
                            );

                            if (this.vars.spawnAnimation.time === 1) {
                                this.vars.spawnAnimation.completed = true;
                                this.updateSpawnAnimation(true);
                            }
                        }
                    },
                    checkCollision: function(ballLines, velocity) {
                        if (this.vars.active) {
                            let collision = false;
                            let newVelocity = { x: velocity.x, y: velocity.y };

                            let lines = {
                                top: [
                                    { x: this.x - this.vars.size.width / 2, y: this.y - this.vars.size.height / 2 },
                                    { x: this.x + this.vars.size.width / 2, y: this.y - this.vars.size.height / 2 }
                                ],
                                bottom: [
                                    { x: this.x - this.vars.size.width / 2, y: this.y + this.vars.size.height / 2 },
                                    { x: this.x + this.vars.size.width / 2, y: this.y + this.vars.size.height / 2 }
                                ],
                                left: [
                                    { x: this.x - this.vars.size.width / 2, y: this.y - this.vars.size.height / 2 },
                                    { x: this.x - this.vars.size.width / 2, y: this.y + this.vars.size.height / 2 }
                                ],
                                right: [
                                    { x: this.x + this.vars.size.width / 2, y: this.y - this.vars.size.height / 2 },
                                    { x: this.x + this.vars.size.width / 2, y: this.y + this.vars.size.height / 2 }
                                ],
                            }

                            if (Game.collisionDetectionFunction(ballLines.bottomLeftCorner, lines.top) || Game.collisionDetectionFunction(ballLines.bottomRightCorner, lines.top)) { // Top
                                collision = true;
                                newVelocity.y = -Math.abs(velocity.y);
                            }

                            if (Game.collisionDetectionFunction(ballLines.topLeftCorner, lines.bottom) || Game.collisionDetectionFunction(ballLines.topRightCorner, lines.bottom)) { // Bottom
                                collision = true;
                                newVelocity.y = Math.abs(velocity.y);
                            }

                            if (Game.collisionDetectionFunction(ballLines.topRightCorner, lines.left) || Game.collisionDetectionFunction(ballLines.bottomRightCorner, lines.left)) { // Left
                                collision = true;
                                newVelocity.x = -Math.abs(velocity.x);
                            }

                            if (Game.collisionDetectionFunction(ballLines.topLeftCorner, lines.right) || Game.collisionDetectionFunction(ballLines.bottomLeftCorner, lines.right)) { // Right
                                collision = true;
                                newVelocity.x = Math.abs(velocity.x);
                            }

                            if (collision) {
                                this.break();
                                Game.camera.triggerBricksShake();
                                return newVelocity;
                            }
                        }
                    },
                    break: function() {
                        this.vars.active = false;
                        this.renderer.updateRender({
                            fill: false,
                        });
                    },
                    updateSpawnAnimation: function(ignore = false) {
                        if (!this.vars.spawnAnimation.completed || ignore) {
                            this.y =
                                this.vars.spawnAnimation.initialY +
                                this.vars.spawnAnimation.easedTime * (this.vars.spawnAnimation.targetY - this.vars.spawnAnimation.initialY);
                            this.rotation =
                                this.vars.spawnAnimation.initialRotation +
                                this.vars.spawnAnimation.easedTime *
                                    (this.vars.spawnAnimation.targetRotation - this.vars.spawnAnimation.initialRotation);
                        }
                    },
                }),
            );
        }
    }

    // Add GameObjects to scene
    Game.scene.add(Game.gameObjects.walls, Game.gameObjects.paddle, Game.gameObjects.bricks, Game.gameObjects.balls, Game.gameObjects.scriptHolder);
};

/*Game.ship = null;
Game.obj = null;

// init
Game.init = function() {
		console.log('game init');
		// DE.config.DEBUG = 1;
		// DE.config.DEBUG_LEVEL = 2;

		// Create the renderer before assets start loading
		Game.render = new DE.Render('render', {
				resizeMode: 'stretch-ratio',
				width: 1920,
				height: 1080,
				backgroundColor: '0x00004F',
				roundPixels: false,
				powerPreferences: 'high-performance',
		});
		Game.render.init();

		DE.start();
};

Game.onload = function() {
		console.log('game start');

		// scene
		Game.scene = new DE.Scene();

		// don't do this because DisplayObject bounds is not set to the render size but to the objects inside the scene
		// scene.interactive = true;
		// scene.click = function()
		// {
		//   console.log( "clicked", arguments );
		// }

		// if no Camera, we add the Scene to the render (this can change if I make Camera)

		Game.camera = new DE.Camera(0, 0, 1920, 1080, {
				scene: Game.scene,
				backgroundImage: 'bg',
		});
		Game.camera.interactive = true;
		Game.camera.pointermove = function(pos, e) {
				Game.targetPointer.moveTo(pos, 100);
		};
		Game.camera.pointerdown = function(pos, e) {
				Game.ship.gameObjects[0].moveTo(Game.targetPointer, 500);
				// Game.targetPointer.shake( 10, 10, 200 );
				Game.targetPointer.renderer.setBrightness([1, 0]);
		};
		Game.camera.pointerup = function(pos, e) {
				console.log('up');
				Game.targetPointer.shake(10, 10, 200);
		};
		Game.render.add(Game.camera);
		// Game.render.add( Game.scene );

		Game.targetPointer = new DE.GameObject({
				zindex: 500,
				renderer: new DE.SpriteRenderer({ spriteName: 'target', scale: 0.3 }),
		});

		Game.ship;
		Game.ship2;

		// WIP working on a simple "AnimatedSprite" declaration
		// var imgs = ["ship1.png","ship2.png","ship3.png","ship4.png","ship5.png","ship6.png"];
		// var textureArray = [];

		// for (var i=0; i < imgs.length; i++)
		// {
		//   var texture = PIXI.utils.TextureCache[imgs[i]];
		//   textureArray.push(texture);
		// };

		// var mc = new PIXI.extras.AnimatedSprite(textureArray);

		Game.ship = new DE.GameObject({
				x: 240,
				y: 240,
				scale: 1,
				renderers: [
						new DE.SpriteRenderer({ spriteName: 'ayeraShip' }),
						new DE.TextRenderer('', {
								localizationKey: 'player.data.realname',
								y: -100,
								textStyle: {
										fill: 'white',
										fontSize: 35,
										fontFamily: 'Snippet, Monaco, monospace',
										strokeThickness: 1,
										align: 'center',
								},
						}),
						new DE.SpriteRenderer({
								spriteName: 'reactor',
								y: 80,
								scale: 0.3,
								rotation: Math.PI,
						}),
				],
				axes: { x: 0, y: 0 },
				interactive: true,
				click: function() {
						console.log('click');
				},
				checkInputs: function() {
						this.translate({ x: this.axes.x * 2, y: this.axes.y * 2 });
				},
				automatisms: [['checkInputs', 'checkInputs']],
				gameObjects: [
						new DE.GameObject({
								x: 150,
								scale: 0.5,
								automatisms: [['rotate', 'rotate', { value1: -0.07 }]],
								gameObjects: [
										new DE.GameObject({
												x: 250,
												scale: 2,
												renderer: new DE.SpriteRenderer({ spriteName: 'player-bullet' }),
										}),
										new DE.GameObject({
												x: -250,
												scale: 2,
												rotation: Math.PI,
												renderer: new DE.SpriteRenderer({
														spriteName: 'player-bullet',
														loop: true,
												}),
										}),
										// this object is moving in local coords only
										new DE.GameObject({
												y: -250,
												scale: 2,
												rotation: Math.PI,
												renderer: new DE.SpriteRenderer({
														spriteName: 'player-bullet',
														loop: true,
												}),
												getCorrectMoveTo: function() {
														// console.log( this.y, this.getWorldPos().y )
														this.moveTo({ y: -this.y }, 500, null, null, true);
												},
												automatisms: [['moveTo', 'getCorrectMoveTo', { interval: 550 }]],
										}),
								],
						}),
				],
		});

		Game.ship.fire = function() {
				DE.Save.save('fire', DE.Save.get('fire') + 1 || 1);
				DE.Audio.fx.play('piew');
				var bullet = new DE.GameObject({
						x: this.x,
						y: this.y,
						rotation: this.rotation,
						renderer: new DE.SpriteRenderer({ spriteName: 'player-bullet' }),
				});
				bullet.addAutomatism('translateY', 'translateY', { value1: -6 });
				// bullet.moveTo( { z: 10 }, 2000 );
				// bullet.addAutomatism( "rotate", "rotate", { value1: Math.random() * 0.1 } );
				// bullet.addAutomatism( "inverseAutomatism", "inverseAutomatism", { value1: "rotate", interval: 100 } );
				bullet.addAutomatism('askToKill', 'askToKill', {
						interval: 2000,
						persistent: false,
				});

				console.log('fired in total ' + DE.Save.get('fire') + ' times');
				Game.scene.add(bullet);
		};

		Game.ship2 = new DE.GameObject({
				x: 700,
				y: 640,
				renderers: [
						new DE.TextureRenderer({ spriteName: 'ship3.png' }),
						new DE.SpriteRenderer({
								spriteName: 'reactor',
								y: 80,
								scale: 0.3,
								rotation: Math.PI,
						}),
				],
		});
		Game.ship2.addAutomatism('lookAt', 'lookAt', { value1: Game.ship });

		Game.heart1 = new DE.GameObject({
				x: 1600,
				y: 100,
				zindex: 10,
				renderer: new DE.TextureRenderer({ spriteName: 'heart' }),
		});
		Game.heart2 = new DE.GameObject({
				x: 1700,
				y: 100,
				zindex: 10,
				renderer: new DE.TextureRenderer({
						spriteName: 'heart',
						width: 50,
						height: 20,
				}),
		});

		var rectangle = new DE.GameObject({
				x: 800,
				y: 300,
				interactive: true,
				renderers: [
						new DE.RectRenderer(40, 70, '0xFFFF00', {
								lineStyle: [4, '0xFF3300', 1],
								fill: true,
								x: -20,
								y: -35,
						}),
						new DE.RectRenderer(40, 70, '0xF0F0F0', {
								lineStyle: [4, '0xFF3300', 1],
								fill: true,
								x: -20,
								y: -35,
								visible: false,
						}),
				],
				pointerover: function() {
						this.renderers[1].visible = true;
						console.log('mouse over');
				},
				pointerout: function() {
						this.renderers[1].visible = false;
						console.log('mouse out');
				},
		});
		var rectangle2 = new DE.GameObject({
				x: 850,
				y: 300,
				renderer: new DE.RectRenderer(40, 70, '0xDDF0CC', {
						lineStyle: [4, '0x00F30D', 10],
						x: -20,
						y: -35,
				}),
		});

		var customShape = new DE.GameObject({
				x: 900,
				y: 300,
				renderer: new DE.GraphicRenderer(
						[
								{ beginFill: '0x66CCFF' },
								{ drawRect: [0, 0, 50, 50] },
								{ endFill: [] },
						],
						{ x: -25, y: -25 },
				),
		});
		Game.shapes = {
				customShape: customShape,
				rectangle: rectangle,
				rectangle2: rectangle2,
		};

		function scroller() {
				this.z -= 0.1;
				if (this.z < 2) {
						this.z = 10;
				}
		}
		for (var i = 0, a, b, c, d, e, f, g; i < 100; i += 5) {
				a = new DE.GameObject({
						_staticPosition: true,
						x: 100,
						y: 100,
						z: i * 0.1,
						renderer: new DE.RectRenderer(40, 70, '0x' + i + 'DCCFC', {
								lineStyle: [4, '0xFF3300', 1],
								fill: true,
								x: -20,
								y: -35,
						}),
				});
				a.scroller = scroller;
				a.addAutomatism('scroller', 'scroller');
				b = new DE.GameObject({
						_staticPosition: true,
						x: 1820,
						y: 100,
						z: i * 0.1,
						renderer: new DE.RectRenderer(40, 70, '0x' + i + 'DCCFC', {
								lineStyle: [4, '0xFF3300', 1],
								fill: true,
								x: -20,
								y: -35,
						}),
				});
				b.scroller = scroller;
				b.addAutomatism('scroller', 'scroller');
				c = new DE.GameObject({
						_staticPosition: true,
						x: 1820,
						y: 980,
						z: i * 0.1,
						renderer: new DE.RectRenderer(40, 70, '0x' + i + 'DCCFC', {
								lineStyle: [4, '0xFF3300', 1],
								fill: true,
								x: -20,
								y: -35,
						}),
				});
				c.scroller = scroller;
				c.addAutomatism('scroller', 'scroller');
				d = new DE.GameObject({
						_staticPosition: true,
						x: 100,
						y: 980,
						z: i * 0.1,
						renderer: new DE.RectRenderer(40, 70, '0x' + i + 'DCCFC', {
								lineStyle: [4, '0xFF3300', 1],
								fill: true,
								x: -20,
								y: -35,
						}),
				});
				d.scroller = scroller;
				d.addAutomatism('scroller', 'scroller');

				e = new DE.GameObject({
						_staticPosition: true,
						x: 960,
						y: 100,
						z: i * 0.1,
						renderer: new DE.RectRenderer(1720, 10, '0x' + i + 'DCCFC', {
								lineStyle: [4, '0xFF3300', 1],
								fill: false,
								x: -860,
								y: -5,
						}),
				});
				e.scroller = scroller;
				e.addAutomatism('scroller', 'scroller');

				f = new DE.GameObject({
						_staticPosition: true,
						x: 960,
						y: 980,
						z: i * 0.1,
						renderer: new DE.RectRenderer(1720, 10, '0x' + i + 'DCCFC', {
								lineStyle: [4, '0xFF3300', 1],
								fill: false,
								x: -860,
								y: -5,
						}),
				});
				f.scroller = scroller;
				f.addAutomatism('scroller', 'scroller');
				Game.scene.add(a, b, c, d, e, f);

				if (i % 10 == 0) {
						g = new DE.GameObject({
								_staticPosition: true,
								x: 960,
								y: 980,
								zindex: 10,
								z: i * 0.1,
								renderer: new DE.RectRenderer(10, 30, '0xFFFFFF', { x: -5, y: -15 }),
						});
						g.scroller = scroller;
						g.addAutomatism('scroller', 'scroller');

						Game.scene.add(g);
				}
		}

		var button = new DE.GameObject({
				x: 960,
				y: 100,
				zindex: 50,
				interactive: true,
				hitArea: new DE.PIXI.Rectangle(-225, -50, 450, 100),
				cursor: 'pointer',
				renderers: [
						new DE.RectRenderer(400, 80, '0xFFCDCD', {
								lineStyle: [4, '0x000000', 1],
								fill: true,
								x: -200,
								y: -40,
						}),
						new DE.TextRenderer('Camera Move: false', {
								textStyle: {
										fill: 'black',
										fontSize: 35,
										fontFamily: 'Snippet, Monaco, monospace',
										strokeThickness: 1,
										align: 'center',
								},
						}),
				],
				pointerover: function() {
						this.renderer.updateRender({
								color: Game.moveCamera ? '0xDEFFDE' : '0xFFDEDE',
						});
				},
				pointerout: function() {
						this.renderer.updateRender({
								color: Game.moveCamera ? '0xCDFFCD' : '0xFFCDCD',
						});
				},
				pointerdown: function() {
						this.renderer.updateRender({
								color: Game.moveCamera ? '0x00FF00' : '0xFF0000',
						});
				},
				pointerup: function() {
						Game.moveCamera = !Game.moveCamera;
						this.renderers[1].text = 'Camera Move: ' + Game.moveCamera.toString();
						this.pointerover();

						if (Game.moveCamera) {
								Game.camera.focus(Game.ship, { options: { rotation: true } });
						} else {
								Game.camera.target = undefined;
						}
				},
		});

		var buttonFocusObj = new DE.GameObject({
				x: 500,
				y: 100,
				zindex: 50,
				interactive: true,
				hitArea: new DE.PIXI.Rectangle(-225, -50, 450, 100),
				cursor: 'pointer',
				renderers: [
						new DE.RectRenderer(400, 80, '0xFFCDCD', {
								lineStyle: [4, '0x000000', 1],
								fill: true,
								x: -200,
								y: -40,
						}),
						new DE.TextRenderer('Object focus: false', {
								textStyle: {
										fill: 'black',
										fontSize: 35,
										fontFamily: 'Snippet, Monaco, monospace',
										strokeThickness: 1,
										align: 'center',
								},
						}),
				],
				pointerover: function() {
						this.renderer.updateRender({
								color: Game.focusObj ? '0xDEFFDE' : '0xFFDEDE',
						});
				},
				pointerout: function() {
						this.renderer.updateRender({
								color: Game.focusObj ? '0xCDFFCD' : '0xFFCDCD',
						});
				},
				pointerdown: function() {
						this.renderer.updateRender({
								color: Game.focusObj ? '0x00FF00' : '0xFF0000',
						});
				},
				pointerup: function() {
						Game.focusObj = !Game.focusObj;
						this.renderers[1].text = 'Object focus: ' + Game.focusObj.toString();
						this.pointerover();

						if (Game.focusObj) {
								Game.ship2.focus(Game.ship, {
										options: { rotation: true },
										offsets: { x: -250, y: -250 },
								});
						} else {
								Game.ship2.target = undefined;
						}
				},
		});

		Game.scene.add(
				Game.ship,
				Game.ship2,
				Game.heart1,
				Game.heart2,
				customShape,
				rectangle,
				rectangle2,
				button,
				buttonFocusObj,
				Game.targetPointer,
		);

		DE.Inputs.on('keyDown', 'left', function() {
				Game.ship.axes.x = -2;
		});
		DE.Inputs.on('keyDown', 'right', function() {
				Game.ship.axes.x = 2;
		});
		DE.Inputs.on('keyUp', 'right', function() {
				Game.ship.axes.x = 0;
		});
		DE.Inputs.on('keyUp', 'left', function() {
				Game.ship.axes.x = 0;
		});

		DE.Inputs.on('keyDown', 'up', function() {
				Game.ship.axes.y = -2;
		});
		DE.Inputs.on('keyDown', 'down', function() {
				Game.ship.axes.y = 2;
		});
		DE.Inputs.on('keyUp', 'down', function() {
				Game.ship.axes.y = 0;
		});
		DE.Inputs.on('keyUp', 'up', function() {
				Game.ship.axes.y = 0;
		});

		DE.Inputs.on('keyDown', 'fire', function() {
				Game.ship.addAutomatism('fire', 'fire', { interval: 150 });
		});
		DE.Inputs.on('keyUp', 'fire', function() {
				Game.ship.removeAutomatism('fire');
		});

		DE.Inputs.on('keyDown', 'deep', function() {
				Game.ship.z += 0.1;
		});
		DE.Inputs.on('keyDown', 'undeep', function() {
				Game.ship.z -= 0.1;
		});
};*/

// just for helping debugging stuff, never do this ;)
window.Game = Game;

export default Game;
