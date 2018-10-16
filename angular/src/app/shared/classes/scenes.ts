import { BombGroup } from './bombs';
import { IMapConfig, ngMap } from './map';
import { Players } from './player';

export namespace Scenes {
    export interface IScene {
    }
    export class ngScene extends Phaser.Scene implements IScene{
        protected mapConfig:IMapConfig = null;
        protected sceneData:any;

        protected map:ngMap;

        init(data:any) {
            this.sceneData = data;    
        }

        preload() {
            if (this.mapConfig)
            {
                this.map = new ngMap(this, this.mapConfig);
                this.map.loadAssets();
            } 
            Players.ngPlayerCharacter.loadAssets(this);
        }
    }
    export class PlayerSelect extends ngScene {
        constructor ()
        {
            super({ key: 'player_config' });

            this.mapConfig = {
                tilemap: {
                    tilesetName: 'base-tiles',
                    jsonPath: 'assets/tilemaps/player_config.json',
                    mapData: { key: "playerconfig" }
                },
                spritesheetPath: 'assets/tilemaps/dungeon_1.png'
            }
        }

        preload() {
            super.preload();
        }

        create() {
            // load the map 
            this.map.create();

            this.map.map.objects[0].objects.forEach( (obj:any) => {
                let player:Players.BasePlayerCharacter = new (Players)[obj.name](this, obj.x, obj.y);
                player.spriteConfig.health = null;
                player.create();
                player.addAnimations();
                player.sprite.setInteractive();
                player.sprite.once("pointerdown", () => {
                    this.scene.start("level_1", {
                        player: obj.name
                    });
                });
            });

            // this.input.once("pointerdown", () => {
            //     this.scene.start("level_1", {
            //         player: "Sith"
            //     });
            // });
        }
    }
    export class Dungeon_1 extends ngScene {
        
        private player: Players.ngPlayerCharacter;
        private bombs: BombGroup;
        private config: any;

        constructor ()
        {
            super({ key: 'level_1' });

            this.mapConfig = {
                tilemap: {
                    tilesetName: 'base-tiles',
                    jsonPath: 'assets/tilemaps/dungeon_1.json',
                    deceleration: 20
                },
                spritesheetPath: 'assets/tilemaps/dungeon_1.png'
            }
        }
    
        preload() {

            super.preload();
            
            BombGroup.loadAssets(this);
            // ngStars.loadAssets(this);
        }
    
        create ()
        {
            // load the map 
            this.map.create();
            
            this.map.pathLayer.setCollisionByExclusion([-1]);
            
            // this.gameData.score.text = scene.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

            this.bombs = new BombGroup(this);
            this.bombs.collideWith([this.map.pathLayer, this.bombs.group]);

            // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
            const spawnPoint:any = this.map.getSpawnPoint();

            // this.player = new Players.Jedi(this, spawnPoint.x, spawnPoint.y);
            // this.player = new this.sceneData.player(this, spawnPoint.x, spawnPoint.y);
            this.player = new (Players)[this.sceneData.player](this, spawnPoint.x, spawnPoint.y);
            this.player.create();
            this.player.addAnimations();

            // collide with main path layer, and moving (dynamic) platforms
            this.player.collideWith([this.map.pathLayer], (player, platform) => this.map.platformCollide(player, platform));
            
            // collide with spikes and bombs
            this.player.collideWith([this.map.dynamicsSpikesGroup, this.map.staticSpikesGroup], () => {
                // this.gameData.over = true;
                this.player.kill();
            });

            this.bombs.addBomb(this.player.sprite.y, this.player.sprite.x);

            this.player.meleeWeapon.overlapWith(this.bombs.group, (weapon:Phaser.Physics.Arcade.Sprite, bomb:Phaser.Physics.Arcade.Sprite) => {
                if (!weapon.visible) return;

                const nudge = 50;
                let vX, vY;

                switch(this.player.movementVector)
                {
                    // right / left - only affects x axis
                    case 0:
                        vX = bomb.body.velocity.x < 0 ? -1 * bomb.body.velocity.x - nudge : bomb.body.velocity.x + nudge;
                        vY = bomb.body.velocity.y;
                        break;
                        
                    case 180:
                        vX = bomb.body.velocity.x < 0 ? bomb.body.velocity.x - nudge : -1 * bomb.body.velocity.x + nudge;
                        vY = bomb.body.velocity.y;
                        break;

                    // down / up - only affects y axis
                    case 90:
                        vY = bomb.body.velocity.y < 0 ? -1 * bomb.body.velocity.y - nudge : bomb.body.velocity.y + nudge;
                        vX = bomb.body.velocity.x + nudge;
                        break;

                    case 270:
                        vY = bomb.body.velocity.y < 0 ? bomb.body.velocity.y - nudge : -1 * bomb.body.velocity.y + nudge;
                        vX = bomb.body.velocity.x + nudge;
                        break;
                }
                
                bomb.setVelocity(vX, vY);
            });

            // projectiles collide w/ bombs
            this.player.projectilesOverlapWith(this.bombs.group, (projectile, bomb) => this.bombs.projectileCollide(projectile, bomb));
            
            // projectiles collide with pathlayer
            // this.player.projectilesOverlapWith([this.map.pathLayer, ...this.platforms, this.map.staticSpikesGroup, this.map.dynamicsSpikesGroup], (projectile, platform) => { 
            //     projectile.destroy();
            // });
        }
        update()
        {
            // if (this.gameData.over) 
            if (0) 
            {
                const cam = this.cameras.main;
                cam.shake(100, 0.05);
                cam.fade(250, 0, 0, 0);

                // Freeze the player to leave them on screen while fading but remove the marker immediately
                // this.player.sprite.fr.freeze();
                // this.marker.destroy();

                cam.once("camerafadeoutcomplete", () => {
                    // scene.scene.restart();
                    // this.player.sprite.destroy();
                    this.player.respawn(this.map);
                    // this.gameData.over = false;
                    cam.fadeIn();
                });
            };

            this.map.update();

            this.player.update();
            this.bombs.update();
        }
    
    }
}