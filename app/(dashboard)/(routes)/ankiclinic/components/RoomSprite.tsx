import React, { useMemo } from 'react';
import { Sprite } from '@pixi/react';
import { GridImage } from '../types';
import { roomToSubjectMap } from '../constants';
import QuestionPromptSprite from './QuestionPromptSprite';
import { screenX, screenY } from '../utils';
import { getTexture } from '../utils/textureCache';
import { useGame } from "@/store/selectors";

interface RoomSpriteProps {
  img: GridImage;
}

const RoomSprite = React.memo(({ img }: RoomSpriteProps) => {
  // Get state and actions directly from the store
  const { 
    activeRooms, 
    isFlashcardsOpen,
    setFlashcardRoomId,
    setIsFlashcardsOpen
  } = useGame();

  const texture = useMemo(() => getTexture(img.src), [img.src]);
  const position = useMemo(() => ({
    x: screenX(img.x, img.y) - img.width / 4,
    y: screenY(img.x, img.y) - img.height / 2
  }), [img.x, img.y, img.width, img.height]);

  const handleRoomClick = () => {
    console.log('🔍 [DEBUG] Room clicked:', img.id);
    console.log('🔍 [DEBUG] Current activeRooms:', Array.from(activeRooms));
    console.log('🔍 [DEBUG] Current isFlashcardsOpen:', isFlashcardsOpen);
    
    setFlashcardRoomId(img.id);
    console.log('🔍 [DEBUG] After setFlashcardRoomId');
    
    setIsFlashcardsOpen(true);
    console.log('🔍 [DEBUG] After setIsFlashcardsOpen');
  };

  return (
    <>
      <Sprite
        texture={texture}
        x={position.x}
        y={position.y}
        width={img.width}
        height={img.height}
        alpha={activeRooms.has(img.id) ? 1 : 0.7}
        zIndex={img.zIndex}
      />
      
      {activeRooms.has(img.id) && roomToSubjectMap[img.id][0] && (
        <QuestionPromptSprite
          src={`/game-components/questionPopup${roomToSubjectMap[img.id][0]}.png`}
          x={position.x + img.width / 2}
          y={position.y + img.height / 5}
          scaleConstant={4}  
          zIndex={img.zIndex+100}
          roomId={img.id}
          onClick={handleRoomClick}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.img.id === nextProps.img.id &&
         prevProps.img.src === nextProps.img.src &&
         prevProps.img.x === nextProps.img.x &&
         prevProps.img.y === nextProps.img.y;
  // We no longer need to compare activeRooms or isFlashcardsOpen here
  // since they come from the store and will trigger re-renders automatically
});

RoomSprite.displayName = 'RoomSprite';

export default RoomSprite; 