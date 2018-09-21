import { ngArcadeSprite } from "./gameObjects";

export class Player extends ngArcadeSprite
{
    private idleTimeout:any;
    private idleTimeoutMs:number = 500;

    private _cursors:Phaser.Input.Keyboard.CursorKeys;
    private _projectiles:Phaser.Physics.Arcade.Group;

    private direction:number = 1;

    public get projectiles():Phaser.Physics.Arcade.Group {
        return this._projectiles;
    }

    public get accelleration():number {
        let accel = this.settings.acceleration.x;
        return this._cursors.shift.isDown ? this.settings.acceleration.x * this.settings.turboCoefficient : accel;
    }

    public get cursorKeys():Phaser.Input.Keyboard.CursorKeys {
        return this._cursors;
    }

    public settings = {
        gravity: 800,
        bounce: 0.3,
        turboCoefficient: 1.5,
        velocity: {
            y: 2400,
            max: {
                x: 250,
                y: 450
            }
        },
        acceleration: {
            x: 1200,
            y: 1200
        }
    }

    constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "player")
    {
        super(scene, x, y, texture);
        this.create();
    }

    public create()
    {
        super.create();

        this.sprite.setBounce(this.settings.bounce);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setGravityY(this.settings.gravity);
        this.sprite.setAcceleration(0, 0);
        this.sprite.setVelocity(0, 0);
        this.sprite.setMaxVelocity(this.settings.velocity.max.x, this.settings.velocity.max.y);

        this._cursors = this.scene.input.keyboard.createCursorKeys();
        this._projectiles = this.scene.physics.add.group({ classType: Bullet, runChildUpdate: true });
        
        this.registerInputHandler();

        // scene.cameras.main.setBounds(0, 0, 4000, 3000);
        this.scene.cameras.main.startFollow(this.sprite);
    }

    public static loadAssets(scene:Phaser.Scene)
    {
        scene.load.image("bullet-1", "assets/bullets/bullet279.png");
        scene.load.spritesheet('player', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    addAnimations()
    {
        if (this.scene.anims.get("left")) return;

        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.sprite.anims.play('turn');
    }

    private registerInputHandler()
    {
        this.scene.input.keyboard.on('keydown_LEFT', (evt) => {
            if (!this.isAlive) return;
            this.sprite.setAccelerationX(-1 * (this.accelleration));
            this.sprite.anims.play("left", true);
            this.direction = -1;
        });

        this.scene.input.keyboard.on('keydown_RIGHT', (evt) => {
            if (!this.isAlive) return;
            this.sprite.setAccelerationX(this.accelleration);
            this.sprite.anims.play("right", true);
            this.direction = 1;
        });

        this.scene.input.keyboard.on('keydown_SHIFT', (evt) => {
            if (!this.isAlive) return;
            this.sprite.setMaxVelocity(this.settings.velocity.max.x * this.settings.turboCoefficient, this.settings.velocity.max.y);
        });
        
        this.scene.input.keyboard.on('keyup_SHIFT', (evt) => {
            if (!this.isAlive) return;
            this.sprite.setMaxVelocity(this.settings.velocity.max.x, this.settings.velocity.max.y);
        });

        this.scene.input.keyboard.on('keydown_DOWN', (evt) => {
            if (!this.isAlive || this.sprite.body.touching.down) return;
            // this.sprite.setAccelerationY(this.settings.acceleration.y);
            this.sprite.setVelocityY(this.settings.velocity.y);
        });

        this.scene.input.keyboard.on('keyup_DOWN', (evt) => {
            if (!this.isAlive || this.sprite.body.touching.down) return;
            // this.sprite.setAccelerationY(this.settings.acceleration.y);
            this.sprite.setVelocityY(this.settings.velocity.max.y);
        });

        // double jump
        this.scene.input.keyboard.on('keydown_UP', (evt) => {
            if (!this.isAlive) return;
            let ct: number = parseInt(this.sprite.getData("upCount")) || 0;

            if (1 || ct++ < 2) this.sprite.setVelocityY(-1 * (this.settings.velocity.y));
            this.sprite.setData("upCount", ct);
            
            // Todo: jepack fuel!
            this.sprite.setAccelerationY(-1200);
        });

        this.scene.input.keyboard.on('keyup_UP', (evt) => {
            if (!this.isAlive) return;
            this.sprite.setAccelerationY(0);
        });

        this.scene.input.keyboard.on('keydown_SPACE', (evt) => {
            if (!this.isAlive) return;

            // Get projectile from group
            var projectile = this._projectiles.get().setActive(true).setVisible(true);

            if (projectile)
            {
                projectile.fire(this.sprite, this.direction * 950);
            }
        });
    }

    private queuePlayIdle()
    {
        if (this.idleTimeout) return;

        this.idleTimeout = setTimeout(() => {
            this.sprite.anims.play('turn', true);
        }, this.idleTimeoutMs);
    }

    update()
    {
        if (!this.isAlive || !this.sprite.body) return;
        
        if (this.sprite.body.touching.down) 
        {
            this.sprite.setData("upCount", 0);
        }

        // movement in any direction stops the player from looking at you
        if (this.isAlive && (this._cursors.left.isDown || this._cursors.up.isDown || this._cursors.right.isDown || this._cursors.down.isDown))
        {
            clearTimeout(this.idleTimeout);
            // why?!
            this.idleTimeout = 0;
        }
        else if (this.sprite.body.touching.down)
        {
            if (!this.idleTimeout) this.queuePlayIdle();
        }
    }
    kill()
    {
        if (!this.isAlive) this.kill();

        // this.sprite.setMaxVelocity(1600);
        this.sprite.setTint(0xff0000);
        // this.sprite.setAccelerationY(-1200).setAccelerationX(0).setVelocityX(25);
        this.sprite.setAcceleration(0,0).setVelocity(0,0);

        // fall off screen
        // this.sprite.setCollideWorldBounds(false);
        // this.sprite.body.checkCollision = <ArcadeBodyCollision>{ none: true };

        // setTimeout(() => {
        //     this.sprite.setVelocityX(0);
        //     this.sprite.setAccelerationY(800);
        //     // this.player.sprite.setAcceleration(0, 50);
        // }, 500);
    }
    public projectilesOverlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(projectile:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.overlap(this.projectiles, object, callback);
    }
}
export class Bullet extends Phaser.Physics.Arcade.Sprite
{
    private _scene:Phaser.Scene;

    constructor(scene, x:number, y:number)
    {
        super(scene, x, y, '');
        this._scene = scene;
        Phaser.GameObjects.Image.call(this, this._scene, 0, 0, '');
    }
    
    fire(player:Phaser.Physics.Arcade.Sprite, velocity:number = 950, texture:string = "bullet-1")
    {
        this.setTexture(texture);
        this.setPosition(player.body.position.x + 20, player.body.position.y + 20);
        // this.setAcceleration(2000, 0);
        this.setVelocityY(0);
        this.setVelocityX(velocity);
        this.body.allowGravity = false;
        this.setSize(12, 12);
    }
}