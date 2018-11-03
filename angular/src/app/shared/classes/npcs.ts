import { ngLivingSprite } from './gameObjects';
import { ngMap } from './map';
import { MeleeWeapons } from './meleeWeapons';
import { Projectiles } from './projectiles';

export namespace Npcs {
    export interface INpc {
        addAnimations()
        addWeapons()
        update()
        hit(IImpactConfig)
        kill()
        respawn(map:ngMap)
    }   
    export interface INpcState {
        movementVector:number,
        meleeWeapons:MeleeWeapons.ngMeleeWeapon[],
        activeMelee?:MeleeWeapons.ngMeleeWeapon,
        rangedWeapons:Projectiles.ngProjectileGroup[],
        activeRanged?:Projectiles.ngProjectileGroup,
        idleTimeout?:any,
    }

    export interface INpcSettings {
        texture?:string,
        drag:number,
        bounce:number,
        maxVelocityX:number,
        maxVelocityY:number,                
        accelerationX:number,
        accelerationY:number,
        idleTimeoutMs?:number
    }

    export class ngNpc extends ngLivingSprite implements INpc
    {
        protected _state:INpcState = {
            movementVector: 270,
            meleeWeapons: [],
            rangedWeapons: [],
        }

        protected _settings:INpcSettings = {
            drag: 900,
            bounce: 0.3,
            maxVelocityX: 250,
            maxVelocityY: 250,
            accelerationX: 2000,
            accelerationY: 2000,
            idleTimeoutMs: 325
        }

        public get meleeWeapon():MeleeWeapons.ngMeleeWeapon {
            return this._state.activeMelee;
        }

        public get movementVector():number {
            return this._state.movementVector;
        }

        public get projectiles():Phaser.Physics.Arcade.Group {
            return this._state.activeRanged.group;
        }

        public get accelleration():number {
            return this._settings.accelerationX;
        }

        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, frame?:number, maxHealth?:number)
        {
            super(scene, x, y, null, frame, maxHealth);
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
        }

        public update()
        {
            if (!this.isAlive || !this.sprite.body) return;

            // move the health bar with the npc
            if (this.maxHealth)
            {
                this.healthBar.setX(this.sprite.getCenter().x - 30);
                this.healthBar.setY(this.sprite.y - 40);
            }

            this._state.activeMelee.update();
        }
        public kill()
        {
            if (!this.isAlive) this.kill();

            this.sprite.setTint(0xff0000);
            this.sprite.setAcceleration(0,0).setVelocity(0,0);
            this.sprite.visible = false;
        }
        public respawn(map:ngMap) {
            this.sprite.clearTint();
            this.sprite.visible = true;
            this.sprite.setX(this.spriteConfig.x);
            this.sprite.setY(this.spriteConfig.y);
        }
        public projectilesOverlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(projectile:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
        {
            this.scene.physics.add.overlap(this._state.rangedWeapons.map(elem => elem.group), object, callback);
        }
        public projectilesCollideWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(projectile:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
        {
            this.scene.physics.add.collider(this._state.rangedWeapons.map(elem => elem.group), object, callback);
        }

        public addAnimations()
        {   
            // needed for interface
            return;
        }

        public addWeapons()
        {   
            // needed for interface
            return;
        }

        // load ALL NPC spritesheets here ahead of time (if any)
        public static loadAssets(scene:Phaser.Scene)
        {
            return;
        }
    }
}