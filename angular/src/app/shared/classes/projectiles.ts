import { Players } from './player';
import { ngGroup } from "./gameObjects";

export namespace Projectiles {
    export class ngProjectileGroup extends ngGroup
    {
        protected _player:Players.ngPlayerCharacter;
        protected _animationKey:string = "bullet";

        protected _config = {
            velocity: 500,
            damage: 5,
            rateOfFire: 5,
            maxFired: 3,
            fixedSize: {
                x: 32,
                y: 32
            }
        }

        private _debounceTimeout:any;

        private _animationConfig:AnimationConfig;

        constructor(scene:Phaser.Scene, player:Players.ngPlayerCharacter, groupConfig?:GroupCreateConfig)
        {
            super(scene);
            this._player = player;
            this._groupConfig = groupConfig;
        }

        create()
        {
            super.create(this._groupConfig);
            return this;
        }

        setAnimation(config:AnimationConfig)
        {
            if (this.scene.anims.get(config.key)) return;

            this.scene.anims.create(config);
            this._animationConfig = config; 
        }

        fire()
        {
            this._group.children.getArray().forEach( (child:Phaser.Physics.Arcade.Sprite, index) => {
                let x = Math.round(child.x);
                let y = Math.round(child.y);

                if (x > (this.scene.cameras.main.width + this._player.sprite.x) || y > (this.scene.cameras.main.height + this._player.sprite.y) ||
                    x < 0 || y < 0) 
                {
                    child.setActive(false);
                    child.setRotation(0);
                    child.flipX = false;
                    child.setVelocity(0,0);
                    child.setPosition(0,0);
                }
            }, null);
            
            // rof limiter
            if (this._debounceTimeout || this._group.getTotalUsed() >= this._config.maxFired) return;

            var projectile = this._group.get(this._player.sprite.body.position.x + 20, this._player.sprite.body.position.y + 20, this._groupConfig.key, this._groupConfig.frame).setActive(true).setVisible(true);
            
            let velocity = this._config.velocity;
            
            switch(this._player.movementVector)
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
                    break;
            }
            
            projectile.body.allowGravity = false;
            
            if (this._animationConfig) projectile.anims.play(this._animationConfig.key);

            this._debounceTimeout = setTimeout(() => this._debounceTimeout = null, 500 / this._config.rateOfFire)
        }
    }
    export class ThrowingAxe extends ngProjectileGroup
    {
        create()
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
        create()
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
        create()
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
        create()
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