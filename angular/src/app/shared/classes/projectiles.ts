import { IImpactConfig, IHasImpact } from './../interfaces/generic';
import { Players } from './player';
import { ngGroup, ngLivingSprite } from "./gameObjects";

export namespace Projectiles {
    export abstract class ngProjectileGroup extends ngGroup implements IHasImpact
    {
        protected _owner:ngLivingSprite;

        protected _config = {
            velocity: 500,
            rateOfFire: 5,
            maxFired: 3,
            fixedSize: {
                x: 32,
                y: 32
            }
        }

        public impactConfig:IImpactConfig = {
            hitPoints: null,
            durability: 0,
            staggerVelocity: 0,
            staggerDuration: 0,
            staggerVector: null
        }

        private _debounceTimeout:any; 

        private _animationConfig:AnimationConfig;

        constructor(scene:Phaser.Scene, owner:ngLivingSprite, groupConfig?:GroupCreateConfig, impactConfig?:IImpactConfig)
        {
            super(scene);
            this._owner = owner;
            this._groupConfig = groupConfig;

            if (impactConfig) this.impactConfig = {...this.impactConfig, ...impactConfig};
        }

        public create()
        {
            super.create(this._groupConfig);
            return this;
        }

        public setAnimation(config:AnimationConfig)
        {
            // set the animation (even if it's been created)
            this._animationConfig = config; 
            
            /// don't recreate the same animation; the scene shares them, so all players can use them once loaded
            if (this.scene.anims.get(config.key)) return;
            this.scene.anims.create(config);
        }

        public fire(vector?:number)
        {
            if (!this._owner.sprite.body) return;

            // allow vector override (shoot in direction not facing)
            vector = vector || this._owner.movementState.vector;

            this._group.children.getArray().forEach( (child:Phaser.Physics.Arcade.Sprite, index) => {
                let x = Math.round(child.x);
                let y = Math.round(child.y);

                if (x > (this.scene.cameras.main.width + this._owner.sprite.x) || y > (this.scene.cameras.main.height + this._owner.sprite.y) ||
                    x < 0 || y < 0) {
                    child.setActive(false);
                    child.setRotation(0);
                    child.flipX = false;
                    child.setVelocity(0,0);
                    child.setPosition(0,0);
                }
            }, null);
            
            // rof limiter
            if (this._debounceTimeout || this._group.getTotalUsed() >= this._config.maxFired) return;

            var projectile = this._group.get(this._owner.sprite.body.position.x + 20, this._owner.sprite.body.position.y + 20, this._groupConfig.key, this._groupConfig.frame).setActive(true).setVisible(true);

            let velocity = this._config.velocity;
            const {x: vX, y: vY} = this._owner.sprite.body.velocity;

            // translate reverse direction vectors
            if (vector && vector < 0) vector = 360 + vector;
            
            // angle vector for projectiles (but only when moving or when overridden)
            if (vector == 225 || vector == 135)
            {
                projectile.setVelocityX(-velocity);
                vector = vector == 135 ? 90 : 270;
            }
            else if (vX < 0 && vY) {
                projectile.setVelocityX(-velocity);
                vector = vY > 0 ? 90 : 270;
            }
            else if (vector == 45 || vector == 315)
            {
                projectile.setVelocityX(velocity);
                vector = vector == 315 ? 270 : 90;
            }
            else if (vX > 0 && vY) {
                projectile.setVelocityX(velocity);
                vector = vY > 0 ? 90 : 270;
            }
            
            switch(vector)
            {
                case 0:
                    projectile.setVelocityX(velocity);
                    projectile.setRotation(0);
                    projectile.flipX = false;
                    projectile.setSize(this._config.fixedSize.x, this._config.fixedSize.y);
                    break;
                case 90:
                    projectile.setVelocityY(velocity);
                    projectile.setRotation(1.5);
                    projectile.flipX = false;
                    projectile.setSize(this._config.fixedSize.y, this._config.fixedSize.x);

                    // rotate projectile if vector is an angle
                    if (projectile.body.velocity.x < 0) projectile.setRotation(2);
                    if (projectile.body.velocity.x > 0) projectile.setRotation(1);

                    break;
                case 180:
                    projectile.setVelocityX(-1 * velocity);
                    projectile.setRotation(0);
                    projectile.flipX = true;
                    projectile.setSize(this._config.fixedSize.x, this._config.fixedSize.y);
                    break;                    
                case 270:
                    projectile.setVelocityY(-1 * velocity);
                    projectile.setRotation(-1.5);
                    projectile.flipX = false;
                    projectile.setSize(this._config.fixedSize.y, this._config.fixedSize.x);

                    // rotate projectile if vector is an angle
                    if (projectile.body.velocity.x < 0) projectile.setRotation(-2);
                    if (projectile.body.velocity.x > 0) projectile.setRotation(-1);

                    break;
            }
            
            projectile.body.allowGravity = false;
            
            if (this._animationConfig) projectile.anims.play(this._animationConfig.key);

            this._debounceTimeout = setTimeout(() => this._debounceTimeout = null, 500 / this._config.rateOfFire)
        }
    }
    export class ThrowingAxe extends ngProjectileGroup
    {
        constructor(scene:Phaser.Scene, owner:ngLivingSprite, groupConfig?:GroupCreateConfig, impactConfig?:IImpactConfig)
        {
            super(scene, owner, groupConfig, impactConfig || { hitPoints: 10 });
        }

        public create()
        {
            super.create();

            this._config.velocity = 350;
            this._config.rateOfFire = 5;
            this._config.maxFired = 3;

            this.setAnimation({
                key: "axe-throw",
                frames: this.scene.anims.generateFrameNumbers(this._groupConfig.key, { start: 1703, end: 1710 }),
                frameRate: 15,
                repeat: -1
            });

            return this;
        }

    }
    export class StandardArrow extends ngProjectileGroup
    {
        constructor(scene:Phaser.Scene, owner:ngLivingSprite, groupConfig?:GroupCreateConfig, impactConfig?:IImpactConfig)
        {
            super(scene, owner, groupConfig, impactConfig || { hitPoints: 5 });
        }

        public create()
        {
            this._groupConfig.frame = 1565;
            super.create();

            this._config.velocity = 600;
            this._config.rateOfFire = 10;
            this._config.maxFired = 2;
            this._config.fixedSize = { 
                x: 32,
                y: 5
            };

            return this;
        }

    }
    export class BlueMagicOrb extends ngProjectileGroup
    {
        constructor(scene:Phaser.Scene, owner:ngLivingSprite, groupConfig?:GroupCreateConfig, impactConfig?:IImpactConfig)
        {
            super(scene, owner, groupConfig, impactConfig || { hitPoints: 15 });
        }

        public create()
        {
            super.create();

            this._config.velocity = 200;
            this._config.rateOfFire = 2;
            this._config.maxFired = 2;

            this.setAnimation({
                key: "orb-fire",
                frames: this.scene.anims.generateFrameNumbers(this._groupConfig.key, { start: 1507, end: 1509 }),
                frameRate: 15,
                repeat: -1
            });

            return this;
        }

    }

    export class FireBall extends ngProjectileGroup
    {
        constructor(scene:Phaser.Scene, owner:ngLivingSprite, groupConfig?:GroupCreateConfig, impactConfig?:IImpactConfig)
        {
            super(scene, owner, groupConfig, impactConfig || { hitPoints: 20 });
        }

        public create()
        {
            super.create();

            this._config.velocity = 350;
            this._config.rateOfFire = 10;
            this._config.maxFired = 5;

            this.setAnimation({
                key: "fireball-launch",
                frames: this.scene.anims.generateFrameNumbers(this._groupConfig.key, { start: 4388, end: 4391 }),
                frameRate: 15,
                repeat: -1
            });

            return this;
        }

    }
}