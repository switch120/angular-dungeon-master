export interface IGameObject
{
    create();
}
export class ngGameObject implements IGameObject
{
    protected _scene:Phaser.Scene;

    public get scene():Phaser.Scene {
        return this._scene;
    }

    constructor(scene:Phaser.Scene)
    {
        this._scene = scene;
    }

    public create() {

    }
}
export class ngArcadeSprite extends ngGameObject
{
    public spriteConfig = {
        x: 0,
        y: 0,
        texture: "",
        frame: 0,
        health: 0
    };

    protected _sprite:Phaser.Physics.Arcade.Sprite;

    public get sprite():Phaser.Physics.Arcade.Sprite {
        return this._sprite;
    }

    protected _isAlive:boolean = true;

    public get isAlive():boolean {
        return this._isAlive;
    }

    public get visible():boolean {
        return this._sprite ? this._sprite.visible : false;
    }

    protected _healthBar:Phaser.GameObjects.Graphics;
    public get healthBar():Phaser.GameObjects.Graphics {
        return this._healthBar;
    }

    constructor(scene:Phaser.Scene, x:number, y:number, texture?:string, frame?:number, health?:number)
    {
        super(scene);
        this.spriteConfig = {x, y, texture, frame, health};
    }

    public create(x?:number, y?:number)
    {
        this._sprite = this.scene.physics.add.sprite(x || this.spriteConfig.x, y || this.spriteConfig.y, this.spriteConfig.texture, this.spriteConfig.frame);
        
        if (this.spriteConfig.health)
        {
            this._healthBar = this.scene.add.graphics();
            
            this._healthBar.lineStyle(2, 0xFFFFFF, 1.0);
            this._healthBar.fillStyle(0xFF0000, .8);
            this._healthBar.fillRect(0, 0, 60, 10);
            this._healthBar.strokeRect(0, 0, 60, 10);
            this._healthBar.setDepth(5);

            this._healthBar.setData("max-health", this.spriteConfig.health);
            this._healthBar.setData("current-health", this.spriteConfig.health);

            /*
            var color = 0xffff00;
            var thickness = 4;
            var alpha = 1;

            graphics.lineStyle(thickness, color, alpha);

            graphics.beginPath();

            graphics.moveTo(400, 100);
            graphics.lineTo(200, 278);
            graphics.lineTo(340, 430);
            graphics.lineTo(650, 80);

            graphics.closePath();
            graphics.strokePath();
            */
        }
    }

    public kill() {
        this._isAlive = false;
    }

    public collideWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.collider(this._sprite, object, callback);
    }

    public overlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.overlap(this._sprite, object, callback);
    }
}
export class ngGroup extends ngGameObject
{
    protected _group:Phaser.Physics.Arcade.Group;
    protected _groupConfig:GroupCreateConfig;

    public get group():Phaser.Physics.Arcade.Group {
        return this._group;
    }

    public create(config?:GroupConfig) {
        this._group = this._scene.physics.add.group(config);
    }

    public collideWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.collider(this._group, object, callback);
    }

    public overlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.overlap(this._group, object, callback);
    }
}