import { BombGroup } from './bombs';
import { IMapConfig, ngMap } from './map';
import { Players } from './player';
import { Npcs } from './npcs';
import { WorldObjects } from './worldObjects';

export namespace Scenes {
    export interface IScene {
        gameOver:boolean
        npcs:Npcs.ngNpc[]
        worldObjects:WorldObjects.ngWorldObject[]
        init(data:any)
        preload()
        initNpcs(player:Players.BasePlayerCharacter)
        initWorldObjects(player:Players.BasePlayerCharacter)
        update()
    }
    export abstract class ngScene extends Phaser.Scene implements IScene {
        protected mapConfig:IMapConfig = null;
        protected sceneData:any;
        protected map:ngMap;
        protected _gameOver:boolean = false;

        private _npcs:Npcs.ngNpc[] = [];
        private _worldObjects:WorldObjects.ngWorldObject[] = [];

        public get npcs():Npcs.ngNpc[] {
            return this._npcs;
        }

        public get worldObjects():WorldObjects.ngWorldObject[] {
            return this._npcs;
        }

        public get gameOver():boolean {
            return this._gameOver;
        }

        public init(data:any) {
            this.sceneData = data;
        }

        public preload() {
            if (this.mapConfig)
            {
                this.map = new ngMap(this, this.mapConfig);
                this.map.loadAssets();
            } 
            Players.ngPlayerCharacter.loadAssets(this);
        }

        public initNpcs(player:Players.BasePlayerCharacter)
        {
            this.map.map.objects[0].objects.forEach( (obj:any) => {
                let npc:Npcs.ngNpc = new (Npcs)[obj.name](this, obj.x, obj.y, obj.properties);
                npc.create();

                // enemy projectiles collide with the pathLayer
                npc.projectilesCollideWith([this.map.pathLayer], (projectile, platform) => { 
                    projectile.destroy();
                });

                // enemy projectiles collide with the player
                npc.projectilesOverlapWith([player.sprite], (p, projectile) => { 
                    player.hit(npc.rangedWeapon.impactConfig);
                    projectile.destroy();
                });

                // player projectiles collide with npc
                player.projectilesOverlapWith(npc.sprite, (n, projectile) => {
                    if (!npc.isAlive) return;
                    
                    npc.hit(player.rangedWeapon.impactConfig);
                    
                    // todo: support durability as a diminishing value
                    if (!player.rangedWeapon.impactConfig.durability) projectile.destroy();
                });

                // npc collide w/ pathLayer
                npc.collideWith(this.map.pathLayer);

                // npc collide w/ player if impactConfig exists
                if (npc.impactConfig) {
                    npc.collideWith(player.sprite, (n, p) => {
                        player.hit(npc.impactConfig);
                    });
                }

                this._npcs.push(npc);
            });
        }
        public initWorldObjects(player:Players.BasePlayerCharacter)
        {
            this.map.map.objects.find(layer => layer.name == "Objects").objects.filter(obj => obj.type == "WorldObject").forEach((obj:any) => {
                let wObj:WorldObjects.ngWorldObject = new (WorldObjects)[obj.name](this, obj.x, obj.y, obj.properties);
                wObj.create();

                // npc collide w/ player if impactConfig exists
                if (wObj.healConfig) {
                    wObj.overlapWith(player.sprite, (n, p) => {
                        player.heal(wObj.healConfig);
                    });
                }

                this._worldObjects.push(wObj);
            });
        }

        public update() {
            this.map.update();

            this.npcs.forEach(npc => {
                npc.update();
            });

            this.worldObjects.forEach(wObj => {
                wObj.update();
            });
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
        create() {
            // load the map 
            this.map.create();

            this.map.map.objects[0].objects.forEach( (obj:any) => {
                let player:Players.BasePlayerCharacter = new (Players)[obj.name](this, obj.x, obj.y);
                player.maxHealth = null;
                player.create();
                player.addAnimations();
                player.sprite.setInteractive();
                player.sprite.once("pointerdown", () => {
                    this.scene.start("level_1", {
                        player: obj.name
                    });
                });
            });
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
                    jsonPath: 'assets/tilemaps/dungeon_1_new.json',
                    deceleration: 20
                },
                spritesheetPath: 'assets/tilemaps/dungeon_1.png'
            }
        }
    
        preload() {

            super.preload();
            
            BombGroup.loadAssets(this);
        }
    
        create ()
        {
            // load the map 
            this.map.create();
            
            this.map.pathLayer.setCollisionByExclusion([-1]);
            
            // this.gameData.score.text = scene.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

            // this.bombs = new BombGroup(this);
            // this.bombs.collideWith([this.map.pathLayer, this.bombs.group]);

            // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
            const spawnPoint:any = this.map.getSpawnPoint();

            this.player = new (Players)[this.sceneData.player](this, spawnPoint.x, spawnPoint.y);
            this.player.create();
            this.player.addWeapons();
            this.player.addAnimations();
            this.player.registerInputHandler();

            // start following the player's character
            this.cameras.main.startFollow(this.player.sprite);

            // this.player.collideWith(this.bombs.group, (player, bomb) => {
            //     if (!this.player.meleeWeapon.visible)
            //     {
            //         this.player.hit({
            //             hitPoints: 10
            //         });
            //     }
            // });

            // let eye = new Npcs.eyeballSentinel(this, this.player.sprite.x, this.player.sprite.y);
            // eye.create();

            // this.bombs.addBomb(this.player.sprite.y, this.player.sprite.x);

            // this.player.meleeWeapon.overlapWith(this.bombs.group, (weapon:Phaser.Physics.Arcade.Sprite, bomb:Phaser.Physics.Arcade.Sprite) => {
            //     if (!weapon.visible) return;

            //     const nudge = 50;
            //     let vX, vY;

            //     switch(this.player.movementState.vector)
            //     {
            //         // right / left - only affects x axis
            //         case 0:
            //             vX = bomb.body.velocity.x < 0 ? -1 * bomb.body.velocity.x - nudge : bomb.body.velocity.x + nudge;
            //             vY = bomb.body.velocity.y;
            //             break;
                        
            //         case 180:
            //             vX = bomb.body.velocity.x < 0 ? bomb.body.velocity.x - nudge : -1 * bomb.body.velocity.x + nudge;
            //             vY = bomb.body.velocity.y;
            //             break;

            //         // down / up - only affects y axis
            //         case 90:
            //             vY = bomb.body.velocity.y < 0 ? -1 * bomb.body.velocity.y - nudge : bomb.body.velocity.y + nudge;
            //             vX = bomb.body.velocity.x + nudge;
            //             break;

            //         case 270:
            //             vY = bomb.body.velocity.y < 0 ? bomb.body.velocity.y - nudge : -1 * bomb.body.velocity.y + nudge;
            //             vX = bomb.body.velocity.x + nudge;
            //             break;
            //     }
                
            //     bomb.setVelocity(vX, vY);
            // });

            // projectiles collide w/ bombs
            // this.player.projectilesOverlapWith(this.bombs.group, (projectile, bomb) => this.bombs.projectileCollide(projectile, bomb));

            super.initNpcs(this.player);
            super.initWorldObjects(this.player);
            
            // projectiles collide with pathlayer
            this.player.projectilesCollideWith([this.map.pathLayer], (projectile, platform) => { 
                projectile.destroy();
            });
        }
        update()
        {
            super.update();

            if (!this.player.isAlive && !this.gameOver) 
            {
                const cam = this.cameras.main;
                cam.shake(100, 0.05);
                cam.fade(250, 0, 0, 0);

                this._gameOver = true;

                cam.once("camerafadeoutcomplete", () => {
                    this.player.respawn(this.map);
                    cam.fadeIn();

                    this._gameOver = false;

                    this.scene.restart();
                });
            };

            this.player.update();
            this.bombs.update();
        }
    
    }
}