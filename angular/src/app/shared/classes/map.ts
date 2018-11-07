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
    public create()
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
    }
    public loadAssets()
    {
        return;
    }
    public getSpawnPoint(index:number = -1) : Phaser.GameObjects.GameObject | any {
        
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
    public update()
    {
        return;
    }
}