import { ngGroup } from "./gameObjects";

// NOTE: Not currently being used
export class BombGroup extends ngGroup
{
    public texture = "tiles";
    public frame = 4955;

    constructor(scene:Phaser.Scene, texture?:string)
    {
        super(scene);
        if (texture) this.texture = texture;
        this.create();
    }

    addBomb(y:number, offsetPosition:number = 300, texture?:string, frame?:number)
    {
        const x = offsetPosition; // (offsetPosition < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        const bomb = this.group.create(x, y, texture || this.texture, frame || this.frame);

        const size = Phaser.Math.Between(5, 35);

        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.setMaxVelocity(250);
        bomb.setScale(Phaser.Math.Between(1.1, 2.5));
        bomb.body.allowGravity = false;

        this.scene.anims.create({
            key: 'go',
            frames: this.scene.anims.generateFrameNumbers('tiles', { start: 1615, end: 1618 }),
            frameRate: 10,
            repeat: -1
        });

        bomb.anims.play("go");

        return bomb;
    }

    public static loadAssets(scene:Phaser.Scene)
    {
        scene.load.image('bomb', 'assets/fireball.png');
    }

    update()
    {
        return;
        // bombs will screen-wrap
        /*this.group.children.iterate(sprite => {
            if (sprite.x < 0)
            {
                sprite.x = this._scene.game.canvas.width;
            }
            else if (sprite.x > this._scene.game.canvas.width)
            {
                sprite.x = 0;
            }
        
            if (sprite.y < 0)
            {
                sprite.y = 0;
            }
            else if (sprite.y > this._scene.game.canvas.height)
            {
                sprite.y = this._scene.game.canvas.height;
            }
        });*/
    }
    projectileCollide(bullet:Phaser.Physics.Arcade.Sprite, bomb:Phaser.Physics.Arcade.Sprite)
    {        
        // bullet impact - remove it
        bullet.disableBody(true, true);
        bullet.destroy();

        if (bomb.scaleX > .75)
        {
            bomb.setScale(bomb.scaleX / 2);
            bomb.setAccelerationX(bomb.body.velocity.x * 1.5);

            let newBomb = this.addBomb(bomb.y);
            newBomb.x = bomb.x;
            newBomb.setAccelerationX(-1 * bomb.body.velocity.x);
            newBomb.setScale(bomb.scaleX);
            
            return;
        }

        if (bomb.scaleX <= .75)
        {
            bomb.disableBody(true, true);
            bomb.destroy();
        }
    }
}