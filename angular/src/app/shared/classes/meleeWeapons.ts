import { IImpactConfig, IHasImpact } from './../interfaces/generic';
import { Players } from './player';
import { ngArcadeSprite } from './gameObjects';

export namespace MeleeWeapons {
    export class ngMeleeWeapon extends ngArcadeSprite implements IHasImpact {

        private _player: Players.ngPlayerCharacter;

        public get player(): Players.ngPlayerCharacter {
            return this._player;
        }

        protected config = {
            slashInterval: 15,
            slashRotation: .3
        };

        public impactConfig:IImpactConfig = {
            hitPoints: 5,
            durability: 0,
            staggerVelocity: 0,
            staggerDuration: 0,
            staggerVector: null
        }

        constructor(player: Players.ngPlayerCharacter, texture: string, frame: number, config?: any, impactConfig?:IImpactConfig) {
            super(player.scene, player.sprite.x, player.sprite.y, texture, frame);

            this._player = player;
            this.config = { ...this.config, ...config }
            
            if (impactConfig) this.impactConfig = { ...impactConfig };

            this.create();
        }
        public create() {
            super.create();

            this._sprite.body.allowGravity = false;
            this._sprite.setCollideWorldBounds(true);
            this._sprite.setOrigin(0, 1);
            this._sprite.depth = 0;
            this._sprite.visible = false;
        }
        public slash() {
            this.slashInterval();
        }
        private slashInterval() {
            if (!this._sprite.visible)
            {
                switch (this._player.movementState.vector)
                {
                    case 0:
                        this._sprite.flipX = false;
                        this._sprite.flipY = false;
                        this._sprite.setOrigin(0, 1);
                        this._sprite.rotation = 0;
                        break;

                    case 90:
                        this._sprite.flipY = true;
                        this._sprite.flipX = true;
                        this._sprite.setOrigin(1, 0);
                        this._sprite.setRotation(-1.75);
                        break;

                    case 180:
                        this._sprite.flipX = true;
                        this._sprite.flipY = false;
                        this._sprite.setOrigin(1, 1);
                        this._sprite.rotation = 0;
                        break;

                    case 270:
                        this._sprite.flipX = true;
                        this._sprite.flipY = false;
                        this._sprite.setOrigin(1, 1);
                        this._sprite.rotation = -2;
                        break;
                }
            }

            this._sprite.visible = true;

            const weaponSpeed = .4;
            const interval = 15;

            if (!this._player.movementState.vector && this._sprite.rotation < 1.5)
            {
                this._sprite.setRotation(this._sprite.rotation + weaponSpeed);
            }
            else if (this._player.movementState.vector == 180 && this._sprite.rotation > -1.5)
            {
                this._sprite.setRotation(this._sprite.rotation - weaponSpeed);
            }
            else if (this._player.movementState.vector == 270 && this._sprite.rotation <= .75)
            {
                this._sprite.setRotation(this._sprite.rotation + weaponSpeed);
            }
            else if (this._player.movementState.vector == 90 && this._sprite.rotation <= .75)
            {
                this._sprite.setRotation(this._sprite.rotation + weaponSpeed);
            }
            else
            {
                // finished slash; hide weapon and don't restart the interval
                this._sprite.visible = false;
                return;
            }

            setTimeout(() => this.slashInterval(), interval);
        }

        update() {
            let offset: any = {
                x: 0,
                y: 0
            };

            // define weapon offset position based on the movementVector
            switch (this._player.movementState.vector)
            {
                case 0:
                    offset.x = -5;
                    offset.y = 3;
                    break;

                case 90:
                    offset.x = 4;
                    offset.y = 2;
                    break;

                case 180:
                    offset.x = 8;
                    offset.y = -3;
                    break;


                case 270:
                    offset.x = 8;
                    offset.y = -2;
                    break;
            }

            this._sprite.setX(this._player.sprite.x + offset.x);
            this._sprite.setY(this._player.sprite.y + offset.y);
        }

    }
}