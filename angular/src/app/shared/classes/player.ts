import { ngMap } from './map';
import { ngArcadeSprite } from "./gameObjects";
import { ngMeleeWeapon } from './meleeWeapons';
import { Projectiles } from './projectiles';

export namespace Players
{
    export interface IPlayerCharacter {
        addAnimations()
        update()
        kill()
        respawn(map:ngMap)
    }

    export interface IPlayerState {
        movementVector:number,
        meleeWeapons:ngMeleeWeapon[],
        activeMelee?:ngMeleeWeapon,
        rangedWeapons:Projectiles.ngProjectileGroup[],
        activeRanged?:Projectiles.ngProjectileGroup
    }

    export interface IPlayerSettings {
        texture?:string,
        drag:number,
        bounce:number,
        turboCoefficient:number,
        maxVelocityX:number,
        maxVelocityY:number,                
        accelerationX:number,
        accelerationY:number,
        idleTimeout?:any,
        idleTimeoutMs?:number
    }

    export class ngPlayerCharacter extends ngArcadeSprite implements IPlayerCharacter
    {
        protected _state:IPlayerState = {
            movementVector: 270,
            meleeWeapons: [],
            rangedWeapons: [],
        }

        protected _settings:IPlayerSettings = {
            drag: 900,
            bounce: 0.3,
            turboCoefficient: 1.5,
            maxVelocityX: 250,
            maxVelocityY: 250,
            accelerationX: 2000,
            accelerationY: 2000,
        }

        private _cursors:Phaser.Input.Keyboard.CursorKeys;
        
        public get meleeWeapon():ngMeleeWeapon {
            return this._state.activeMelee;
        }

        public get movementVector():number {
            return this._state.movementVector;
        }

        public get projectiles():Phaser.Physics.Arcade.Group {
            return this._state.activeRanged.group;
        }

        public get accelleration():number {
            // todo: support vertical movement
            let accel = this._settings.accelerationX;
            return this._cursors.shift.isDown ? this._settings.accelerationX * this._settings.turboCoefficient : accel;
        }

        public get cursorKeys():Phaser.Input.Keyboard.CursorKeys {
            return this._cursors;
        }

        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "player")
        {
            super(scene, x, y, texture);
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);

            this.sprite.setBounce(this._settings.bounce);
            this.sprite.setCollideWorldBounds(true);
            this.sprite.body.allowGravity = false;
            this.sprite.setDrag(this._settings.drag, this._settings.drag);
            this.sprite.setAcceleration(0, 0);
            this.sprite.setVelocity(0, 0);
            this.sprite.setMaxVelocity(this._settings.maxVelocityX, this._settings.maxVelocityY);
            this.sprite.depth = 1;

            this._cursors = this.scene.input.keyboard.createCursorKeys();
            
            this._state.rangedWeapons.push(new Projectiles.ThrowingAxe(this.scene, this, { key: 'tiles' }).create());
            this._state.rangedWeapons.push(new Projectiles.StandardArrow(this.scene, this, { key: 'tiles' }).create());
            this._state.rangedWeapons.push(new Projectiles.BlueMagicOrb(this.scene, this, { key: 'tiles' }).create());
            this._state.rangedWeapons.push(new Projectiles.FireBall(this.scene, this, { key: 'tiles' }).create());

            this._state.activeRanged = this._state.rangedWeapons[0];

            this._state.meleeWeapons.push(new ngMeleeWeapon(this, 'tiles', 5660));
            this._state.activeMelee = this._state.meleeWeapons[0];
            
            this.registerInputHandler();

            this.scene.cameras.main.startFollow(this.sprite);
        }

        private registerInputHandler()
        {
            this.scene.input.keyboard.on('keydown_SPACE', (evt) => {
                if (!this.isAlive) return;
                this._state.activeRanged.fire();
            });

            this.scene.input.keyboard.on('keydown_SHIFT', (evt) => {
                if (!this.isAlive || this._state.activeMelee.visible) return;
                this._state.activeMelee.slash();
            });

            this.scene.input.keyboard.on('keyup_SHIFT', (evt) => {
                // clearInterval(this._weaponTimeout);
            });

            this.scene.input.keyboard.on('keyup_X', (evt) => {
                const curIdx = this._state.rangedWeapons.indexOf(this._state.activeRanged);
                let next = curIdx == this._state.rangedWeapons.length - 1 ? 0 : curIdx + 1;
                this._state.activeRanged = this._state.rangedWeapons[next];
            });
        }

        update()
        {
            if (!this.isAlive || !this.sprite.body) return;

            const diagonal = (this._cursors.left.isDown || this._cursors.right.isDown) && (this._cursors.up.isDown || this._cursors.down.isDown);
            const weaponVisible = this._state.activeMelee.visible;
            
            if (this._cursors.right.isDown)
            {
                this.sprite.setAccelerationX(this.accelleration);
                if (!diagonal) this.sprite.anims.play(`${this._settings.texture}_right`, true);
                if (!weaponVisible) this._state.movementVector = 0;
            }
            else if (this._cursors.left.isDown)
            {
                this.sprite.setAccelerationX(-1 * this.accelleration);
                if (!diagonal) this.sprite.anims.play(`${this._settings.texture}_left`, true);
                if (!weaponVisible) this._state.movementVector = 180;
            }
            else
            {
                this.sprite.setAccelerationX(0);
            }

            if (this._cursors.up.isDown)
            {
                this.sprite.setAccelerationY(-1 * this.accelleration);
                if (!weaponVisible)
                {
                    this.sprite.anims.play(`${this._settings.texture}_up`, true);
                    this._state.movementVector = 270;
                }
            }
            else if (this._cursors.down.isDown)
            {
                this.sprite.setAccelerationY(this.accelleration);
                if (!weaponVisible)
                {
                    this.sprite.anims.play(`${this._settings.texture}_down`, true);
                    this._state.movementVector = 90;
                }
            }
            else
            {
                this.sprite.setAccelerationY(0);
            }

            this._state.activeMelee.update();

        }
        kill()
        {
            if (!this.isAlive) this.kill();

            this.sprite.setTint(0xff0000);
            this.sprite.setAcceleration(0,0).setVelocity(0,0);
            this.sprite.visible = false;
        }
        respawn(map:ngMap) {
            let {x, y}:any = map.getSpawnPoint();
            this.sprite.clearTint();
            this.sprite.visible = true;
            this.sprite.setX(x);
            this.sprite.setY(y);
        }
        public projectilesOverlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(projectile:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
        {
            this.scene.physics.add.overlap(this._state.rangedWeapons.map(elem => elem.group), object, callback);
        }

        addAnimations()
        {   
            // needed for interface
            return;
        }

        // load ALL player spritesheets here ahead of time
        public static loadAssets(scene:Phaser.Scene)
        {
            scene.load.spritesheet('ninja', 'assets/sprites/ninja_m.png', { frameWidth: 32, frameHeight: 36 });
            scene.load.spritesheet('jedi', 'assets/sprites/jedi.png', { frameWidth: 32, frameHeight: 48 });
        }
    }

    export class BasePlayerCharacter extends ngPlayerCharacter {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "player")
        {
            super(scene, x, y, texture);
            this._settings.texture = texture;
            this.create();
        }
    }

    export class Jedi extends BasePlayerCharacter
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "jedi")
        {
            super(scene, x, y, texture);
        }

        addAnimations()
        {
            if (this.scene.anims.get(`${this._settings.texture}_right`)) return;

            this.scene.anims.create({
                key: `${this._settings.texture}_left`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 4, end: 7 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this._settings.texture}_right`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 8, end: 11 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this._settings.texture}_up`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 12, end: 15 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this._settings.texture}_down`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: 2
            });
        }
    }
    export class Ninja extends BasePlayerCharacter
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "ninja")
        {
            super(scene, x, y, texture);
        }

        addAnimations()
        {
            console.log(`${this._settings.texture}_down`);
            if (this.scene.anims.get(`${this._settings.texture}_right`)) return;

            this.scene.anims.create({
                key: `${this._settings.texture}_left`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this._settings.texture}_right`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this._settings.texture}_up`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this._settings.texture}_down`,
                frames: this.scene.anims.generateFrameNumbers(this._settings.texture, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: 2
            });
        }
    }
}