import React, { useMemo } from 'react';
import { Graphics } from '@pixi/react';
import { Graphics as PIXIGraphics, utils as PIXIUtils } from 'pixi.js';
import { gridWidth, gridHeight, tileWidth, tileHeight } from '../constants';
import { screenX, screenY, getAccentColor } from '../utils';

interface IsometricGridProps {
  currentLevel: number;
}

const IsometricGrid = React.memo(({ currentLevel }: IsometricGridProps) => {
  const accentColor = useMemo(() => getAccentColor(), []);
  
  const drawGrid = useMemo(() => (g: PIXIGraphics) => {
    g.clear();

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const posX = screenX(x, y);
        const posY = screenY(x, y);

        let shouldFill = false;

        switch (currentLevel) {
          case 1:
            shouldFill = y >= gridHeight - 2 && x >= 2;
            break;
          case 2:
          case 3:
            shouldFill = y >= gridHeight - 2 || x < 2 || (x >= 2 && x <= 3 && y >= gridHeight - 6);
            shouldFill = shouldFill && y >= 3.3;
            break;
          case 4:
          case 5:
            shouldFill = (y >= gridHeight - 5 || x < 4 || y < 4) && x < gridWidth - 2;
            break;
          case 6:
            shouldFill = true;
            break;
        }

        if (shouldFill) {
          g.beginFill(PIXIUtils.string2hex(accentColor));
          g.moveTo(posX, posY + tileHeight / 2);
          g.lineTo(posX + tileWidth / 2, posY);
          g.lineTo(posX + tileWidth, posY + tileHeight / 2);
          g.lineTo(posX + tileWidth / 2, posY + tileHeight);
          g.lineTo(posX, posY + tileHeight / 2);
          g.endFill();
        }
      }
    }
  }, [accentColor, currentLevel]);

  return <Graphics draw={drawGrid} />;
});

IsometricGrid.displayName = 'IsometricGrid';

export default IsometricGrid; 