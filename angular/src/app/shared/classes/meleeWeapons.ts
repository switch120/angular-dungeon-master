import { Players } from './player';
import { ngArcadeSprite } from './gameObjects';

export namespace MeleeWeapons {
    export class ngMeleeWeapon extends ngArcadeSprite {

        private _player: Players.ngPlayerCharacter;

        public get player(): Players.ngPlayerCharacter {
            return this._player;
        }

        protected config = {
            slashInterval: 15,
            slashRotation: .3
        };

        constructor(player: Players.ngPlayerCharacter, texture: string, frame: number, config?: any) {
            super(player.scene, player.sprite.x, player.sprite.y, texture, frame);

            this._player = player;
            this.config = { ...this.config, ...config }

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
                switch (this._player.movementVector)
                {
                    case 0:
                        this._sprite.flipX = false;
                        this._sprite.flipY = false;
                        this._sprite.setOrigin(0, 1);
                        this._sprite.rotation = 0;
                        break;

                    case 90:
                        this._sprite.flipY = true;
                        this._sprite.flipX = false;
                        this._sprite.setOrigin(0, 0);
                        this._sprite.rotation = -.5;
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
                        this._sprite.rotation = -1.25;
                        break;
                }
            }

            this._sprite.visible = true;

            const weaponSpeed = .3;
            const interval = 15;

            if (!this._player.movementVector && this._sprite.rotation < 1.5)
            {
                this._sprite.setRotation(this._sprite.rotation + weaponSpeed);
            }
            else if (this._player.movementVector == 180 && this._sprite.rotation > -1.5)
            {
                this._sprite.setRotation(this._sprite.rotation - weaponSpeed);
            }
            else if (this._player.movementVector == 270 && this._sprite.rotation < .25)
            {
                this._sprite.setRotation(this._sprite.rotation + weaponSpeed);
            }
            else if (this._player.movementVector == 90 && this._sprite.rotation < 1)
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

            switch (this._player.movementVector)
            {
                case 0:
                    offset.x = -5;
                    offset.y = 3;
                    break;

                case 90:
                    offset.x = 0;
                    offset.y = 0;
                    break;

                case 180:
                    offset.x = 8;
                    offset.y = -3;
                    break;


                case 270:
                    offset.x = 5;
                    offset.y = 2;
                    break;
            }

            this._sprite.setX(this._player.sprite.x + offset.x);
            this._sprite.setY(this._player.sprite.y + offset.y);
        }

    }
}