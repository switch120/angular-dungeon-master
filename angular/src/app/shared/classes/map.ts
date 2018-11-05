export interface IMapConfig
{
    tilemap?: {
        tilesetName:string;
        mapData?:Phaser.Tilemaps.MapData|any,
        jsonPath:string;    
        pathLayer?:string;
        backgroundLayer?:string;
        foregroundLayer?:string;
        deceleration?:number
    }
    spritesheetPath:string;
    spritesheetConfig?: {
        frameWidth:number,
        frameHeight:number
    },
}
export class MapConfigDefaults
{
    public static config:IMapConfig = {
        tilemap: {
            tilesetName: "",
            mapData: { key: "map", name: "" },
            jsonPath: null,
            pathLayer: "Ground",
            backgroundLayer: "Background",
            foregroundLayer: "Foreground",
            deceleration: 20
        },
        spritesheetPath: null,
        spritesheetConfig: {
            frameWidth: 32, 
            frameHeight: 32
        },
    }
}
export class ngMap
{
    private _map:Phaser.Tilemaps.Tilemap;
    private _scene:Phaser.Scene;
    private _pathLayer:Phaser.Tilemaps.DynamicTilemapLayer;
    private _foregroundLayer:Phaser.Tilemaps.DynamicTilemapLayer;
    private _backgroundLayer:Phaser.Tilemaps.DynamicTilemapLayer;
    private _config:IMapConfig;
    private _cursors:Phaser.Input.Keyboard.CursorKeys;

    private _staticSpikesGroup:Phaser.Physics.Arcade.StaticGroup;
    private _dynamicSpikesGroup:Phaser.Physics.Arcade.Group;

    private _platformGroups:Phaser.Physics.Arcade.Group[] = [];

    public get map():Phaser.Tilemaps.Tilemap {
        return this._map;
    }

    public get pathLayer():Phaser.Tilemaps.DynamicTilemapLayer {
        return this._pathLayer;
    }

    public get backgroundLayer():Phaser.Tilemaps.DynamicTilemapLayer {
        return this._backgroundLayer;
    }

    public get foregroundLayer():Phaser.Tilemaps.DynamicTilemapLayer {
        return this._foregroundLayer;
    }

    public get staticSpikesGroup():Phaser.Physics.Arcade.StaticGroup {
        return this._staticSpikesGroup;
    }

    public get dynamicsSpikesGroup():Phaser.Physics.Arcade.Group {
        return this._dynamicSpikesGroup;
    }

    public get platformGroups():Phaser.Physics.Arcade.Group[] {
        return this._platformGroups;
    }
    
    constructor(scene:Phaser.Scene, mapConfig:IMapConfig) {

        // clone defaults
        let config:any = {...MapConfigDefaults.config};

        // spread operator fun ... apply defaults plus overrides to config object
        config = { ...config, ...mapConfig, tilemap: { ...config.tilemap, ...mapConfig.tilemap } };
        
        // map made with Tiled in JSON format
        scene.load.tilemapTiledJSON(config.tilemap.mapData.key, config.tilemap.jsonPath);
        
        // tiles in spritesheet 
        scene.load.spritesheet('tiles', config.spritesheetPath, config.spritesheetConfig);
        
        this._scene = scene;
        this._config = config;
    }
    create()
    {
        this._map = this._scene.make.tilemap({key: this._config.tilemap.mapData.key});

        let tiles = this._map.addTilesetImage(this._config.tilemap.tilesetName, 'tiles');

        this._backgroundLayer = this._map.createDynamicLayer(this._config.tilemap.backgroundLayer, tiles, 0, 0);
        this._pathLayer = this._map.createDynamicLayer(this._config.tilemap.pathLayer, tiles, 0, 0);
        this._foregroundLayer = this._map.createDynamicLayer(this._config.tilemap.foregroundLayer, tiles, 0, 0);

         // set the boundaries of our game world
        this._scene.physics.world.bounds.width = this._pathLayer.width;
        this._scene.physics.world.bounds.height = this._pathLayer.height;

        // set bounds so the camera won't go outside the game world
        this._scene.cameras.main.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels);

        this._cursors = this._scene.input.keyboard.createCursorKeys();

        this.createMovingSpikes();
        this.replaceTileSpikes();
    }
    private createMovingSpikes()
    {
        this._dynamicSpikesGroup = this._scene.physics.add.group();
        
        this.map.objects[0].objects.filter(obj => obj.type == "Platform-X").forEach((obj:any) => {
            
            let group = this._scene.physics.add.group({
                key: 'tiles',
                frame: 15,
                repeat: obj.properties.width,
                setXY: {
                    x: obj.x,
                    y: obj.y,
                    stepX: 32
                }
            });

            let tmp = [];
            
            group.getChildren().forEach((child:Phaser.Physics.Arcade.Sprite) => {
                // don't let it fall down, or move on collision
                child.body.allowGravity = false;
                child.body.immovable = true;
                child.setFrictionX(obj.properties.friction || 1);
                child.setVelocityX(0);
                child.setVelocityY(0);
                child.setBounce(0,0);
                child.setData("marginX", obj.properties.marginX || 16);
                child.setData("originX", child.x);
                child.setData("distanceX", obj.properties.distance);

                //cover it in spikes!
                const pos = child.getTopLeft();
                const spike = this._dynamicSpikesGroup.create(pos.x, pos.y - 15, "spike");
                spike.body.allowGravity = false;
                spike.body.immovable = true;

                child.setData("spikeSprite", spike);

                tmp.push(spike);
                // group.add(spike);

            }, null);

            // TODO
            // scene.physics.add.collider(this.player.bullets, group, (bullet, platform) => { 
            //     bullet.destroy();
            // });

            this._platformGroups.push(group);
        });
    }
    private replaceTileSpikes()
    {
        this._staticSpikesGroup = this._scene.physics.add.staticGroup();
        
        // convert the spikes into smaller sprites so the hitbox is more accurate
        this.pathLayer.forEachTile(tile => {
            if (tile.index === 77) {
                // A sprite has its origin at the center, so place the sprite at the center of the tile
                const spike = this._staticSpikesGroup.create(tile.getCenterX(), tile.getCenterY(), "spike");

                // The map has spike tiles that have been rotated in Tiled ("z" key), so parse out that angle to the correct body placement
                spike.rotation = tile.rotation;
                if (spike.angle === 0) spike.body.setSize(32, 6).setOffset(0, 26);
                else if (spike.angle === -90) spike.body.setSize(6, 32).setOffset(26, 0);
                else if (spike.angle === 90) spike.body.setSize(6, 32).setOffset(0, 0);
                
                // And lastly, remove the spike tile from the layer
                this.pathLayer.removeTileAt(tile.x, tile.y);
            }
        });
    }
    loadAssets()
    {
        // TODO - abstract away
        this._scene.load.image("spike", "assets/0x72-industrial-spike.png");
    }
    getSpawnPoint(index:number = -1) : Phaser.GameObjects.GameObject | any {
        
        const objects = this.map.objects.find(layer => layer.name == "Objects");
        if (!objects) return { x: 0, y: 0 };

        const pts = objects.objects.filter(obj => obj.name == "Spawn Point");
        
        if (index == -1)
        {
            return pts[Math.floor(Math.random() * pts.length)];
        }
        else
        {
            return pts[index];
        }
    }
    update()
    {
        this._platformGroups.forEach(platform => {
            let prevSprite:Phaser.Physics.Arcade.Sprite;
            platform.children.each((sprite:Phaser.Physics.Arcade.Sprite) => {
                const accel = 50;
                const origin = sprite.getData("originX");
                const offsetDist = (origin + sprite.getData("distanceX"));
                
                if (sprite.x >= offsetDist) sprite.setData("flipped", true);
                else if (sprite.x <= origin) sprite.setData("flipped", false);

                // align the group items to stop the strange pixel shift at slow speeds
                if (prevSprite) sprite.x = prevSprite.getTopRight().x + sprite.getData("marginX");
                
                const val = (sprite.getData("flipped") ? -accel : accel);
    
                sprite.setVelocityX(val);

                let spike;
                if (spike = sprite.getData("spikeSprite"))
                {
                    spike.setX(sprite.x);
                    spike.setVelocityX(val);
                }

                prevSprite = sprite;
            }, this)
        });
    }

    platformCollide(player:Phaser.Physics.Arcade.Sprite, platform:any)
    {
        player.body.touching.down = true;

        // don't modify anything if the arrow keys are engaged
        if (this._cursors.left.isDown || this._cursors.right.isDown) return;

        // immediately remove any acceleration (not velocity) so friction can be applied
        player.setAcceleration(0);

        const platformVelocity = platform.body ? platform.body.velocity.x : 0;
        const absPlatformVelocity = Math.abs(platformVelocity);
        const playerVelocity = Math.abs(player.body.velocity.x);

        // apply manual drag if no directional keys are being pressed; couldn't get Friction working
        if (playerVelocity > absPlatformVelocity)
        {
            if (player.body.velocity.x < 0)
            {
                player.body.velocity.x += this._config.tilemap.deceleration;
            }
            else
            {
                player.body.velocity.x -= this._config.tilemap.deceleration;
            }

            if (this._config.tilemap.deceleration >= playerVelocity || playerVelocity < absPlatformVelocity)
            {
                player.setVelocityX(0);
            }
        }
        else
        {
            player.setVelocityX(0);
        }
    }
}