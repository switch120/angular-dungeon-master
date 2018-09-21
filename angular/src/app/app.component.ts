import { IMapConfig, ngMap } from './shared/classes/map';
import { BombGroup } from './shared/classes/bombs';
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import * as Phaser from 'phaser';
import { Player } from './shared/classes/player';
import { ngStars } from './shared/classes/collectibles';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

    private player: Player;

    private gameData = {
        over: false,
        score: {
            text: null,
            value: 0
        },
        deceleration: 20
    }

    private mapConfig:IMapConfig = {
        tilemap: {
            tilesetName: '0x72-industrial-tileset-32px-extruded',
            jsonPath: 'assets/tilemaps/platformer.json',
            deceleration: this.gameData.deceleration
        },
        spritesheetPath: 'assets/tilemaps/platformer.png'
    }

    private bullet;
    private bullets;
    private bulletTime = 0;

    private game: Phaser.Game;

    private config: any;

    private map:ngMap;

    private platforms:any[] = [];
    private stars: ngStars;
    private bombs: BombGroup;

    constructor() {
        const _t = this;
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 600 }
                }
            },
            scene: {
                preload: function () { _t.preload(this) },
                create: function () { _t.create(this) },
                update: function () { _t.update(this) },
                render: this.render
            }
        };
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.game = new Phaser.Game(this.config);
    }

    preload(scene: Phaser.Scene) {

        this.map = new ngMap(scene, this.mapConfig);
        this.map.loadAssets();
        
        BombGroup.loadAssets(scene);
        Player.loadAssets(scene);

        ngStars.loadAssets(scene);
    }

    create(scene: Phaser.Scene) {

        // load the map 
        this.map.create();
        
        this.map.pathLayer.setCollisionByProperty({ collides: true });
        
        this.gameData.score.text = scene.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.platforms = this.map.platformGroups;

        this.stars = new ngStars(scene);
        this.stars.create(5);
        this.stars.collideWith([this.map.pathLayer, ...this.platforms]);

        this.bombs = new BombGroup(scene);
        this.bombs.collideWith([this.map.pathLayer, this.stars, this.bombs.group]);

        // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
        const spawnPoint:any = this.map.getSpawnPoint();

        this.player = new Player(scene, spawnPoint.x, spawnPoint.y);
        this.player.addAnimations();

        // collide with main path layer, and moving (dynamic) platforms
        this.player.collideWith([this.map.pathLayer, ...this.platforms], (player, platform) => this.map.platformCollide(player, platform));
        
        // collide with spikes and bombs
        this.player.collideWith([this.map.dynamicsSpikesGroup, this.map.staticSpikesGroup, this.bombs.group], () => {
            this.gameData.over = true;
            this.player.kill();
        });

        // collect the stars
        this.player.overlapWith(this.stars.group, (sprite, star) => {
            star.disableBody(true, true);
            this.gameData.score.value += 10;
            this.gameData.score.text.setText('Score: ' + this.gameData.score.value);

            if (this.stars.group.countActive(true) === 0)
            {
                this.stars.group.children.iterate(function (child) {
                    child.enableBody(true, Phaser.Math.Between(5, 775), 0, true, true);
                    child.setVelocityX(Phaser.Math.Between(-10, 10));
                });

                for (let i=0; i < 3; i++)
                {
                    this.bombs.addBomb(16, this.player.sprite.x);
                }
            }
        });

        // projectiles collide w/ bombs
        this.player.projectilesOverlapWith(this.bombs.group, (projectile, bomb) => this.bombs.projectileCollide(projectile, bomb));
        
        // projectiles collide with pathlayer
        this.player.projectilesOverlapWith([this.map.pathLayer, ...this.platforms, this.map.staticSpikesGroup, this.map.dynamicsSpikesGroup], (projectile, platform) => { 
            projectile.destroy();
        });

    }

    update(scene: Phaser.Scene) {

        if (this.gameData.over) 
        {
            const cam = scene.cameras.main;
            cam.shake(100, 0.05);
            cam.fade(250, 0, 0, 0);

            // Freeze the player to leave them on screen while fading but remove the marker immediately
            // this.player.sprite.fr.freeze();
            // this.marker.destroy();

            cam.once("camerafadeoutcomplete", () => {
                scene.scene.restart();
                this.player.sprite.destroy();
                this.gameData.over = false;
            });
        };

        this.map.update();

        this.player.update();
        this.bombs.update();

    }

    render() {
    }
}
