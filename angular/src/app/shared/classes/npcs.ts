import { ngLivingSprite } from './gameObjects';
import { ngMap } from './map';
import { Projectiles } from './projectiles';
import { IImpactConfig, IHasAnimations } from '../interfaces/generic';

export namespace Npcs {
    export interface INpc {
        tilemapProperties?:any
        impactConfig:IImpactConfig
        update()
        respawn(map:ngMap)
    }   

    export abstract class ngNpc extends ngLivingSprite implements INpc, IHasAnimations
    {
        public tilemapProperties?:any;

        // impact config is optional for npcs
        protected _impactConfig?:IImpactConfig;

        public get impactConfig():IImpactConfig {
            return this._impactConfig;
        }

        public set animationsComplete(callback) {
            this.sprite.on("animationcomplete", callback, this);
        }

        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture?:string, frame?:number, maxHealth?:number, tilemapProperties?:any)
        {
            super(scene, x, y, texture || "tiles", frame, maxHealth);
            this.tilemapProperties = tilemapProperties;
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);

            this.sprite.setCollideWorldBounds(true);
            this.sprite.body.allowGravity = false;
            this.sprite.depth = 1;
            
            if (this.movementSettings) {
                this.sprite.setBounce(this._movementSettings.bounce || 0);
                this.sprite.setDrag(this._movementSettings.drag || 0, this._movementSettings.drag || 0);
                this.sprite.setMaxVelocity(this._movementSettings.maxVelocityX || 0, this._movementSettings.maxVelocityY || 0);
                this.sprite.setAcceleration(this.movementSettings.accelerationX || 0, this.movementSettings.accelerationY || 0);
                this.sprite.setMaxVelocity(this.movementSettings.maxVelocityX || 0, this.movementSettings.maxVelocityY || 0);
            }
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

            if (this.weaponState.activeMelee) this.weaponState.activeMelee.update();
        }

        public respawn(map:ngMap) {
            this.sprite.clearTint();
            this.sprite.visible = true;
            this.sprite.setX(this.spriteConfig.x);
            this.sprite.setY(this.spriteConfig.y);
        }

        // load ALL NPC spritesheets here ahead of time (if any)
        public static loadAssets(scene:Phaser.Scene)
        {
            return;
        }
    }
    export class eyeballSentinel extends ngNpc {

        private _direction: number = 1;
        private _intervalAngleOffset: number = 45;
        private _firingAngle: number;
        private _maxFiringAngle: number;
        private _minFiringAngle: number;

        private _interval:any;

        public firingIntervalMs: number = 800;

        constructor(scene:Phaser.Scene, x?:number, y?:number, properties?:any)
        {
            super(scene, x, y, null, 4564, 100, properties);

            this._maxFiringAngle = this.tilemapProperties && this.tilemapProperties.maxAngle ? this.tilemapProperties.maxAngle : 90;
            this._minFiringAngle = this.tilemapProperties && this.tilemapProperties.minAngle ? this.tilemapProperties.minAngle : -90;

            this._firingAngle = this._minFiringAngle;
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);
            
            this.addWeapons();
            this.addAnimations();

            this.movementState.vector = 0;

            this._interval = setInterval(() => {
                this.rangedWeapon.fire(this._firingAngle);
                this.update();
                
                if (this._maxFiringAngle == this._minFiringAngle) return;

                // increment/decrement
                this._firingAngle += this._intervalAngleOffset * this._direction;

                if (this._firingAngle >= this._maxFiringAngle) this._direction = -1;
                else if (this._firingAngle <= this._minFiringAngle) this._direction = 1;

            }, this.firingIntervalMs);
        }
        public addWeapons() {
            
            this.weaponState.rangedWeapons.push(new Projectiles.FireBall(this.scene, this, { key: 'tiles' }, { hitPoints: 200 }).create());
            this.weaponState.activeRanged = this.weaponState.rangedWeapons[0];
        }
        public addAnimations()
        {
            if (this.scene.anims.get(`${this.spriteId}_kill`)) return;

            this.scene.anims.create({
                key: `${this.spriteId}_kill`,
                frames: this.scene.anims.generateFrameNumbers('tiles', { start: 1615, end: 1618 }),
                frameRate: 10,
                repeat: 3,
                hideOnComplete: true
            });

            this.animationsComplete = (animation, frame) => {
                this.sprite.disableBody();
                this.sprite.destroy();
            };
        }
        public kill()
        {
            this.sprite.anims.play(`${this.spriteId}_kill`, true);
            super.kill();
            clearInterval(this._interval);
        }
    }
    export class darkWraith extends ngNpc {
        constructor(scene:Phaser.Scene, x?:number, y?:number, properties?:any)
        {
            super(scene, x, y, null, 6033, 10, properties);

            this._movementSettings = {
                bounce: 1,
                maxVelocityX: 250,
                maxVelocityY: 250,
                accelerationX: 50,
                accelerationY: 30,
            };

            // todo: stagger
            this._impactConfig = {
                hitPoints: 100
            }
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);
            this.addAnimations();            
        }
        public addAnimations()
        {
            if (this.scene.anims.get(`${this.spriteId}_kill`)) return;

            this.scene.anims.create({
                key: `${this.spriteId}_kill`,
                frames: this.scene.anims.generateFrameNumbers('tiles', { start: 1615, end: 1618 }),
                frameRate: 10,
                repeat: 3,
                hideOnComplete: true
            });

            this.animationsComplete = (animation, frame) => {
                this.sprite.disableBody();
                this.sprite.destroy();
            };
        }
        public kill()
        {
            this.sprite.anims.play(`${this.spriteId}_kill`, true);
            super.kill();
        }
    }
}