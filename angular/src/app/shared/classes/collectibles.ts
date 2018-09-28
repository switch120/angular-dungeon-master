import { ngGroup } from './gameObjects';

export class ngCollectible extends ngGroup {

}
export class ngStars extends ngCollectible {

    // public create(repeat:number = 2, step?:number)
    // {
    //     this._group = this.scene.physics.add.group({
    //         key: 'star',
    //         repeat: repeat,
    //         setXY: { x: Math.floor(Math.random() * 300 + 150), y: 0, stepX: step || Phaser.Math.Between(50, 175) }
    //     });

    //     this.group.children.iterate(function (child) {
    //         child.setAcceleration(0,200);
    //         child.body.allowGravity = false;
    //         // child.setDrag(300);
    //         child.body.damping = 0;
    //         child.setCollideWorldBounds(true);
    //         // child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    //         child.setBounceY(1);
    //         child.setMass(500);
    //     });
    // }

    public static loadAssets(scene:Phaser.Scene)
    {
        scene.load.image('star', 'assets/games/starstruck/star.png');
    }
}