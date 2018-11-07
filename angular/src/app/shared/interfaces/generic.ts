import { MeleeWeapons } from "../classes/meleeWeapons";
import { Projectiles } from "../classes/projectiles";

export interface IHasHealth {
    healthBar: Phaser.GameObjects.Container
    health: number
    maxHealth: number
    hit(IImpactConfig)
    heal(IHealConfig)
}
export interface IHealConfig {
    hitPoints: number;
    timeout?: number | any;
    duration?: number;
}
export interface IHasWeapons {
    weaponState: IWeaponState
    meleeWeapon: MeleeWeapons.ngMeleeWeapon;
    rangedWeapon: Projectiles.ngProjectileGroup;
    addWeapons()
}
export interface IImpactConfig {
    hitPoints: number;
    durability?: number;
    staggerVelocity?: number;
    staggerVector?: number;
    staggerDuration?: number;
}
export interface IHasImpact {
    impactConfig:IImpactConfig
}
export interface IHasMovement {
    movementSettings: IMovementSettings
    movementState: IMovementState
}
export interface IWeaponState {
    meleeWeapons: MeleeWeapons.ngMeleeWeapon[],
    activeMelee?: MeleeWeapons.ngMeleeWeapon,
    activeMeleeHitConfig?: IImpactConfig,
    rangedWeapons: Projectiles.ngProjectileGroup[],
    activeRanged?: Projectiles.ngProjectileGroup,
    activeRangedHitConfig?: IImpactConfig,
}
export interface IMovementState {
    vector?: number;
    idleTimeout?: number | any;
}
export interface IMovementSettings {
    drag?: number,
    bounce?: number
    turboCoefficient?: number
    maxVelocityX: number
    maxVelocityY: number
    accelerationX: number
    accelerationY: number
    idleTimeoutMs?: number
}
export interface IHasAnimations {
    animationsComplete?: (animation, frame) => {}
    addAnimations()
}