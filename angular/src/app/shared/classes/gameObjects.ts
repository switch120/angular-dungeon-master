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
    protected config = {
        x: 0,
        y: 0,
        texture: ""
    };

    protected _sprite:Phaser.Physics.Arcade.Sprite;

    public get sprite():Phaser.Physics.Arcade.Sprite {
        return this._sprite;
    }

    protected _isAlive:boolean = true;

    public get isAlive():boolean {
        return this._isAlive;
    }

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string)
    {
        super(scene);
        this.config = {x, y, texture};
    }

    public create()
    {
        this._sprite = this.scene.physics.add.sprite(this.config.x, this.config.y, this.config.texture);
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

    public get group():Phaser.Physics.Arcade.Group {
        return this._group;
    }

    public create() {
        this._group = this._scene.physics.add.group();
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