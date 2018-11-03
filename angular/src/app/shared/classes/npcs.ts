import { ngLivingSprite } from './gameObjects';
import { ngMap } from './map';
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

    export class ngNpc extends ngLivingSprite implements INpc
    {
        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture?:string, frame?:number, maxHealth?:number)
        {
            super(scene, x, y, texture, frame, maxHealth);
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);

            this.sprite.setBounce(this._movementSettings.bounce);
            this.sprite.setCollideWorldBounds(true);
            this.sprite.body.allowGravity = false;
            this.sprite.setDrag(this._movementSettings.drag, this._movementSettings.drag);
            this.sprite.setAcceleration(0, 0);
            this.sprite.setVelocity(0, 0);
            this.sprite.setMaxVelocity(this._movementSettings.maxVelocityX, this._movementSettings.maxVelocityY);
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

            if (this.weaponState.activeMelee) this.weaponState.activeMelee.update();
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

        // load ALL NPC spritesheets here ahead of time (if any)
        public static loadAssets(scene:Phaser.Scene)
        {
            return;
        }
    }
    export class eyeballSentinel extends ngNpc {

        constructor(scene:Phaser.Scene, x?:number, y?:number)
        {
            super(scene, x, y, 'tiles', 4564, 100);

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
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);
            
            this.addWeapons();
            this.movementState.vector = 0;

            setInterval(() => {
                this.rangedWeapon.fire();
                this.update();
            }, 800);
        }
        public addWeapons() {
            this.weaponState.rangedWeapons.push(new Projectiles.FireBall(this.scene, this, { key: 'tiles' }).create());
            this.weaponState.activeRanged = this.weaponState.rangedWeapons[0];
        }
    }
}