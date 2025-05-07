// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}]

        interface Waypoint {
            x: number;
            y: number;
        }

        interface Ray {
            ttl: number;
            life: number;
            path: Waypoint[];
            baseAlpha: number;
            width: number;
            hue: number;
            phase: number;
        }
    }
}

export {};
