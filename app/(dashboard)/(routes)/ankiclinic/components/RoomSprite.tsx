import React, { useMemo } from 'react';
import { Sprite } from '@pixi/react';
import { GridImage } from '../types';
import { roomToSubjectMap } from '../constants';
import QuestionPromptSprite from './QuestionPromptSprite';
import { screenX, screenY } from '../utils';
import { getTexture } from '../utils/textureCache';
import { useAudio } from '@/store/selectors';

interface RoomSpriteProps {
  img: GridImage;
  setFlashcardRoomId: (id: string) => void;
  activeRooms: Set<string>;
  setActiveRooms: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFlashcardsOpen: boolean;
  setIsFlashcardsOpen: (open: boolean) => void;
}

const RoomSprite = React.memo(({ 
  img, 
  setFlashcardRoomId, 
  activeRooms, 
  setActiveRooms, 
  isFlashcardsOpen, 
  setIsFlashcardsOpen 
}: RoomSpriteProps) => {
  const texture = useMemo(() => getTexture(img.src), [img.src]);
  const position = useMemo(() => ({
    x: screenX(img.x, img.y) - img.width / 4,
    y: screenY(img.x, img.y) - img.height / 2
  }), [img.x, img.y, img.width, img.height]);
  
  // Get audio from the store
  const audio = useAudio();

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
          onClick={() => {
            console.log('[DEBUG] Question sprite clicked, roomId:', img.id);
            console.log('[DEBUG] About to play door open sound');
            setFlashcardRoomId(img.id);
            // Play the door open sound before opening the flashcard dialog
            audio.playSound('flashcard-door-open');
            console.log('[DEBUG] After audio.playSound call with flashcard-door-open');
            
            // Add a small delay to ensure the sound plays before the dialog opens
            // This prevents the ambient sound effect from stopping the door sound
            setTimeout(() => {
              setIsFlashcardsOpen(true);
            }, 100);
          }}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.img.id === nextProps.img.id &&
    prevProps.img.src === nextProps.img.src &&
    prevProps.img.x === nextProps.img.x &&
    prevProps.img.y === nextProps.img.y &&
    prevProps.activeRooms.has(prevProps.img.id) === nextProps.activeRooms.has(nextProps.img.id) &&
    prevProps.isFlashcardsOpen === nextProps.isFlashcardsOpen
  );
});

RoomSprite.displayName = 'RoomSprite';

export default RoomSprite; 