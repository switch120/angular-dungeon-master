import { ngArcadeSprite } from "./gameObjects";
import { IHealConfig } from "../interfaces/generic";

export namespace WorldObjects {
    export abstract class ngWorldObject extends ngArcadeSprite {    
        public tilemapProperties?:any;
        public healConfig?:IHealConfig;
    
        constructor(scene: Phaser.Scene, x: number, y: number, texture?: string, frame?: number, tilemapProperties?:any) {
            super(scene, x, y, texture || "tiles", frame);

            this.spriteConfig = { x, y, texture: texture || "tiles", frame };
            this.tilemapProperties = tilemapProperties;
        }
        public create(x?:number, y?:number)
        {
            super.create(x, y);

            this.sprite.body.allowGravity = false;
            this.sprite.depth = 0;
        }
        public update() {
            return;
        }
    }
    export class healthFont extends ngWorldObject {
        constructor (scene: Phaser.Scene, x: number, y: number) {
            super(scene, x, y, null, 1);
            this.healConfig = { 
                hitPoints: 1 
            };
        }
    }
}