import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as Phaser from 'phaser';
import { Scenes } from './shared/classes/scenes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

    private gameData = {
        over: false,
        score: {
            text: null,
            value: 0
        }
    }

    private game: Phaser.Game;

    private config: any;

    constructor() {
        const _t = this;
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { y: 600 }
                }
            },
            scene: [Scenes.PlayerSelect, Scenes.Dungeon_1]
        };
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.game = new Phaser.Game(this.config);
    }
}
