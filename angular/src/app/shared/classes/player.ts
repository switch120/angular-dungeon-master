import { ngMap } from './map';
import { ngLivingSprite } from "./gameObjects";
import { MeleeWeapons } from './meleeWeapons';
import { Projectiles } from './projectiles';

export namespace Players
{
    export interface IPlayerCharacter {
        addAnimations()
        addWeapons()
        registerInputHandler()
        update()
        kill()
        respawn(map:ngMap)
    }

    export abstract class ngPlayerCharacter extends ngLivingSprite implements IPlayerCharacter
    {
        private _cursors:Phaser.Input.Keyboard.CursorKeys;

        public get accelleration():number {
            // todo: support vertical movement
            let accel = this.movementSettings.accelerationX;
            return this._cursors.shift.isDown ? this.movementSettings.accelerationX * this.movementSettings.turboCoefficient : accel;
        }

        public get cursorKeys():Phaser.Input.Keyboard.CursorKeys {
            return this._cursors;
        }

        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "player", maxHealth?:number)
        {
            super(scene, x, y, texture, null, maxHealth);
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);

            this._movementSettings = {
                drag: 900,
                bounce: 0.3,
                turboCoefficient: 1.5,
                maxVelocityX: 250,
                maxVelocityY: 250,
                accelerationX: 2000,
                accelerationY: 2000,
                idleTimeoutMs: 325
            };

            this.sprite.setBounce(this.movementSettings.bounce);
            this.sprite.setCollideWorldBounds(true);
            this.sprite.body.allowGravity = false;
            this.sprite.setDrag(this.movementSettings.drag, this.movementSettings.drag);
            this.sprite.setAcceleration(0, 0);
            this.sprite.setVelocity(0, 0);
            this.sprite.setMaxVelocity(this.movementSettings.maxVelocityX, this.movementSettings.maxVelocityY);
            this.sprite.depth = 1;
        }

        public update()
        {
            if (!this.isAlive || !this.sprite.body) return;

            // move the health bar with the player
            this.healthBar.setX(this.sprite.getCenter().x - 30);
            this.healthBar.setY(this.sprite.y - 40);

            const diagonal = (this._cursors.left.isDown || this._cursors.right.isDown) && (this._cursors.up.isDown || this._cursors.down.isDown);
            const weaponVisible = this.meleeWeapon.visible;
            
            if (this._cursors.right.isDown)
            {
                this.sprite.setAccelerationX(this.accelleration);
                if (!diagonal) this.sprite.anims.play(`${this.spriteId}_right`, true);
                if (!weaponVisible) this.movementState.vector = 0;
            }
            else if (this._cursors.left.isDown)
            {
                this.sprite.setAccelerationX(-1 * this.accelleration);
                if (!diagonal) this.sprite.anims.play(`${this.spriteId}_left`, true);
                if (!weaponVisible) this.movementState.vector = 180;
            }
            else
            {
                this.sprite.setAccelerationX(0);
            }

            if (this._cursors.up.isDown)
            {
                this.sprite.setAccelerationY(-1 * this.accelleration);

                // lean left or right when moving upward diagonally
                if (this._cursors.right.isDown) this.sprite.setAngle(10);
                else if (this._cursors.left.isDown) this.sprite.setAngle(-10);
                else this.sprite.setAngle(0);

                if (!weaponVisible)
                {
                    this.sprite.anims.play(`${this.spriteId}_up`, true);
                    this.movementState.vector = 270;
                }
            }
            else if (this._cursors.down.isDown)
            {
                this.sprite.setAccelerationY(this.accelleration);

                // less angle when looking down diagonally
                if (this._cursors.right.isDown) this.sprite.setAngle(-5);
                else if (this._cursors.left.isDown) this.sprite.setAngle(5);
                else this.sprite.setAngle(0);
                
                if (!weaponVisible)
                {
                    this.sprite.anims.play(`${this.spriteId}_down`, true);
                    this.movementState.vector = 90;
                }
            }
            else
            {
                this.sprite.setAccelerationY(0);
                this.sprite.setAngle(0);
            }

            // are any movement controls down?
            const movementDown = Object.keys(this._cursors).reduce((isDown:boolean,cur:string) => {
                return this._cursors[cur].isDown ? true : isDown;
            }, false);

            if (!this.movementState.idleTimeout && this.sprite.anims.isPlaying && !movementDown) {
                this.movementState.idleTimeout = setTimeout(() => this.sprite.anims.stop(), this.movementSettings.idleTimeoutMs);
            }
            else if (this.movementState.idleTimeout && movementDown)
            {
                clearTimeout(this.movementState.idleTimeout);
                this.movementState.idleTimeout = null;
            }

            this.meleeWeapon.update();

        }
        public kill()
        {
            super.kill();
            
            this.sprite.setTint(0xff0000);
            this.sprite.setAcceleration(0,0).setVelocity(0,0);
            // this.sprite.visible = false;
        }
        public respawn(map:ngMap) {
            let {x, y}:any = map.getSpawnPoint();
            this.sprite.clearTint();
            this.sprite.visible = true;
            this.sprite.setX(x);
            this.sprite.setY(y);
        }

        public registerInputHandler()
        {
            this._cursors = this.scene.input.keyboard.createCursorKeys();
            return;
        }

        // load ALL player spritesheets here ahead of time
        public static loadAssets(scene:Phaser.Scene)
        {
            scene.load.spritesheet('ninja', 'assets/sprites/ninja_m.png', { frameWidth: 32, frameHeight: 36 });
            scene.load.spritesheet('warrior_f', 'assets/sprites/warrior_f.png', { frameWidth: 32, frameHeight: 36 });
            scene.load.spritesheet('jedi', 'assets/sprites/jedi.png', { frameWidth: 32, frameHeight: 48 });
            scene.load.spritesheet('marajade', 'assets/sprites/marajade.png', { frameWidth: 32, frameHeight: 48 });
            scene.load.spritesheet('sith', 'assets/sprites/sith.png', { frameWidth: 32, frameHeight: 48 });
            scene.load.spritesheet('darthsidious', 'assets/sprites/darthsidious.png', { frameWidth: 32, frameHeight: 48 });
        }
    }

    export abstract class BasePlayerCharacter extends ngPlayerCharacter implements IPlayerCharacter {
        
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "player")
        {
            super(scene, x, y, texture, 1000);
        }

        public registerInputHandler() {
            super.registerInputHandler();

            this.scene.input.keyboard.on('keydown_SPACE', (evt) => {
                if (!this.isAlive || !this.rangedWeapon) return;
                this.rangedWeapon.fire();
            });

            this.scene.input.keyboard.on('keydown_SHIFT', (evt) => {
                if (!this.isAlive || !this.meleeWeapon) return;

                // put the melee weapon in front of player sprite if they're facing downward
                this.meleeWeapon.sprite.depth = this.movementState.vector > 0 ? 2 : 0;

                // don't slash again if the weapon is still visible from the last
                if (this.meleeWeapon.visible) return;

                this.meleeWeapon.slash();
            });

            this.scene.input.keyboard.on('keyup_SHIFT', (evt) => {
                // clearInterval(this._weaponTimeout);
            });

            this.scene.input.keyboard.on('keyup_X', (evt) => {
                if (!this.weaponState.rangedWeapons.length) return;

                const curIdx = this.weaponState.rangedWeapons.indexOf(this.rangedWeapon);
                let next = curIdx == this.weaponState.rangedWeapons.length - 1 ? 0 : curIdx + 1;
                this.weaponState.activeRanged = this.weaponState.rangedWeapons[next];
            });
        }

        public addWeapons() {
            this.weaponState.rangedWeapons.push(new Projectiles.ThrowingAxe(this.scene, this, { key: 'tiles' }).create());
            this.weaponState.rangedWeapons.push(new Projectiles.StandardArrow(this.scene, this, { key: 'tiles' }).create());
            this.weaponState.rangedWeapons.push(new Projectiles.BlueMagicOrb(this.scene, this, { key: 'tiles' }).create());
            this.weaponState.rangedWeapons.push(new Projectiles.FireBall(this.scene, this, { key: 'tiles' }).create());

            this.weaponState.activeRanged = this.weaponState.rangedWeapons[0];

            this.weaponState.meleeWeapons.push(new MeleeWeapons.ngMeleeWeapon(this, 'tiles', 5660, null, { hitPoints: 10 }));
            this.weaponState.activeMelee = this.weaponState.meleeWeapons[0];
        }
    }

    export class ThreeFramePlayer extends BasePlayerCharacter implements IPlayerCharacter {
        public addAnimations()
        {
            if (this.scene.anims.get(`${this.spriteId}_right`)) return;

            this.scene.anims.create({
                key: `${this.spriteId}_left`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this.spriteId}_right`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this.spriteId}_up`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this.spriteId}_down`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: 2
            });

            // three frame players need to be set to down or they're facing upward to start (spritesheet configuration)
            this.sprite.anims.play(`${this.spriteId}_down`, true);
            this.sprite.anims.stop();
            this.movementState.vector = 90;
        }
    }

    export class FourFramePlayer extends BasePlayerCharacter implements IPlayerCharacter {
        public addAnimations()
        {
            if (this.scene.anims.get(`${this.spriteId}_right`)) return;

            this.scene.anims.create({
                key: `${this.spriteId}_left`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 4, end: 7 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this.spriteId}_right`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 8, end: 11 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this.spriteId}_up`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 12, end: 15 }),
                frameRate: 10,
                repeat: 2
            });

            this.scene.anims.create({
                key: `${this.spriteId}_down`,
                frames: this.scene.anims.generateFrameNumbers(this.spriteId, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: 2
            });
        }
    }

    export class Jedi extends FourFramePlayer
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "jedi")
        {
            super(scene, x, y, texture);
        }
    }
    export class MaraJade extends FourFramePlayer
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "marajade")
        {
            super(scene, x, y, texture);
        }
    }
    export class Sith extends FourFramePlayer
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "sith")
        {
            super(scene, x, y, texture);
        }
    }
    export class DarthSidious extends FourFramePlayer
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "darthsidious")
        {
            super(scene, x, y, texture);
        }
    }
    export class Ninja extends ThreeFramePlayer
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "ninja")
        {
            super(scene, x, y, texture);
        }
    }
    export class ShieldMaiden extends ThreeFramePlayer
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture:string = "warrior_f")
        {
            super(scene, x, y, texture);
        }
    }
}