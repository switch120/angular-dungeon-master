# Angular Dungeon Master
### Top-down dungeon scroller built on [Phaser 3](https://photonstorm.github.io/phaser3-docs/index.html)

## Environment Setup

There is an `environment.ts.sample` file in `/src/environments`. Copy this file to `environment.ts` and replace the values inside with your FireBase information. When you are ready to build and deploy your app, copy the `environment.ts` file to `environment.prod.ts` and then modify any detail that will be different for the live deployed site.

> Note: Both environment.ts and environment.prod.ts are intentionally ignored in .gitignore so as not to store sensitive API keys/data in the source repository. **You need to make sure to keep track of these files yourself**!!

## Development server

This entire folder is shared at `/var/www` on the VM.

Run `/var/www/npm start` for a dev server. Navigate to `http://host-name/` (or ip; configure in `vagrantfile`). 

> Note: The app will automatically reload if you change any of the source files as long as the `fs-notify` and `fs-notify-forwarder` plugins are successfully registered with Vagrant (located in `vagrantfile`).

## Game Controls
* Movement
    * `up`
    * `down`
    * `left`
    * `right`
* Melee Weapon - `shift`
* Ranged Weapon
    * Fire - `space`
    * Switch projectile - `x`

## TileMaps
Each "level" is built using a Tilemap editor, which embeds a spritesheet used to render the tiles or individual sprites/frames. The demo Tilemap ( [dungeon_1.tmx](../tilemaps/dungeon_1.tmx) ) was built using [Tiled Tilemap Editor](https://www.mapeditor.org/) and embeds an open-source spritesheet that was downloaded from [Open Game Art](https://opengameart.org/content/dungeon-crawl-32x32-tiles). Use in production at your own risk!

## Building the App

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Deploying the App

SSH into VM and install [Firebase CLI](https://github.com/firebase/firebase-tools). This cannot be done at provision time due to permissions issues.

```
$ sudo npm install -g firebase-tools
```

> Note: The first time you deploy you will need to log in to Firebase, and also connect the app to a Firebase project. To do this, use these commands:

```
$ firebase login
$ firebase use --add
```

> Note: `firebase login` will provide you a URL to load on another device. After authenticating you'll be redirected to a `localhost` url that will fail if you're using a VM. You'll want to change `localhost` to your VM's hostname or ip address and reload the page. Authentication should succeed and the VM is forever more authenticated to your account.

Next, build the app following the instructions above. Once the app has compiled, you can deploy to FireBase:

```
$ firebase deploy
```

---
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.4.
