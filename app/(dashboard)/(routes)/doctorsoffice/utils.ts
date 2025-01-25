import { tileWidth, tileHeight } from './constants';

export function screenX(worldX: number, worldY: number): number {
  return (worldX - worldY) * (tileWidth / 2);
}

export function screenY(worldX: number, worldY: number): number {
  return (worldX + worldY) * (tileHeight / 2);
}

export const getAccentColor = () => {
  const themeElement =
    document.querySelector('.theme-sunsetCity') ||
    document.querySelector('.theme-sakuraTrees') ||
    document.querySelector('.theme-cyberSpace') ||
    document.querySelector('.theme-mykonosBlue') ||
    document.documentElement;
  const computedStyle = getComputedStyle(themeElement!);
  const accentColor = computedStyle.getPropertyValue('--theme-doctorsoffice-accent').trim();
  return accentColor || '#001226';
}; 