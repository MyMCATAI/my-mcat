export type DispersionConfig = {
    particles: string[];
    dispersion: 'burst' | 'float';
};

export const CUSTOM_PARTICLES: { [key: string]: DispersionConfig } = {
    'schoolgirl.png': { particles: ['🌸'], dispersion: 'burst' },
    'dino.png': { particles: ['🔥'], dispersion: 'float' },
    'raincoat.png': { particles: ['💧'], dispersion: 'burst' },
    'ski.png': { particles: ['❄️'], dispersion: 'burst' },
    'cool.png': { particles: ['✨'], dispersion: 'burst' }
}; 