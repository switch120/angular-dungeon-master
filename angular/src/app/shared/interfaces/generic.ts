import { MeleeWeapons } from "../classes/meleeWeapons";
import { Projectiles } from "../classes/projectiles";

export interface IHasHealth {
    healthBar:Phaser.GameObjects.Container
    health:number
    maxHealth:number
    hit(IImpactConfig)
    heal(IHealConfig)
}
export interface IHealConfig {
    hitPoints:number;
    timeout:number|any;
    duration:number;
}
export interface IHasWeapons {
    weaponState:IWeaponState
    meleeWeapon:MeleeWeapons.ngMeleeWeapon;
    rangedWeapon:Projectiles.ngProjectileGroup;
    addWeapons()
}
export interface IHasMovement {
    movementState:IMovementState
}
export interface IWeaponState {
    meleeWeapons:MeleeWeapons.ngMeleeWeapon[],
    activeMelee?:MeleeWeapons.ngMeleeWeapon,
    rangedWeapons:Projectiles.ngProjectileGroup[],
    activeRanged?:Projectiles.ngProjectileGroup,
}
export interface IMovementState {
    vector:number;
    idleTimeout:number;
}