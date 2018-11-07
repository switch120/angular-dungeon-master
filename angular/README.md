# Angular Dungeon Master
### Top-down dungeon scroller built on [Phaser 3](https://photonstorm.github.io/phaser3-docs/index.html)

## Prerequisites
* VirtualBox
* Vagrant

## Environment Setup

There is an `environment.ts.sample` file in `/src/environments`. Copy this file to `environment.ts` and replace the values inside with your FireBase information. When you are ready to build and deploy your app, copy the `environment.ts` file to `environment.prod.ts` and then modify any detail that will be different for the live deployed site.

> Note: Both environment.ts and environment.prod.ts are intentionally ignored in .gitignore so as not to store sensitive API keys/data in the source repository. **You need to make sure to keep track of these files yourself**!!

## Development server

Start up the VM with `vagrant up`. First boot will take 2-5m as packages and images are downloaded. It's mormal to see *red text* scroll by.

> Note: If you want to install the [Angular CLI](https://github.com/angular/angular-cli) locally you may not need a VM; your mileage may vary.

The `angular` folder of this app is shared at `/var/www` on the VM.

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

## Building the App

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Deploying the App

SSH into VM and install Firebase CLI. This cannot be done at provision time due to permissions issues.

```
$ sudo npm install -g firebase-tools
```

> Note: The first time you deploy you will need to log in to Firebase, and also connect the app to a Firebase project. To do this, use these commands:

```
$ firebase login
$ firebase use --add
```

Next, build the app following the instructions above. Once the app has compiled, you can deploy to FireBase:

```
$ firebase deploy
```

---
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.4.
