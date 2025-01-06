import { motion } from 'framer-motion';
import { useState } from 'react';
import { UserResponseWithCategory } from './AfterTestFeed';
import { cleanQuestion } from './FlashcardDeck';

interface WrongAnswerCardProps {
  response: UserResponseWithCategory;
  index: number;
  onFlip: () => void;
  getAnswerContent: (response: UserResponseWithCategory) => string;
}

const WrongAnswerCard: React.FC<WrongAnswerCardProps> = ({ response, index, onFlip, getAnswerContent }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onFlip();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-4 border border-[--theme-border-color] rounded-md 
        bg-[--theme-gradient-end] cursor-pointer 
        transition-all duration-300 hover:shadow-lg
        min-h-[12rem] max-h-[27rem]
        ${isFlipped ? 'bg-opacity-90' : ''}
      `}
      onClick={handleClick}
    >
      <div className="h-full flex flex-col">
        <div className="text-xs text-[--theme-text-color] opacity-50 mb-2">
          {new Date(response.answeredAt).toLocaleString()}
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {!isFlipped ? (
            <div className={`font-semibold mb-2 text-[--theme-text-color] ${response.question.types !== 'normal' ? 'text-center' : ''}`}>
              {cleanQuestion(response.question?.questionContent || '')}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="text-sm mb-1 text-[--theme-text-color] opacity-70">Correct Answer:</div>
              <div className="text-green-500 font-semibold mb-4">{getAnswerContent(response)}</div>
              {response.question?.questionAnswerNotes && (
                <div className="mt-4 text-sm text-[--theme-text-color] opacity-80">
                  <strong>Explanation:</strong>
                  <div 
                    className="mt-2 overflow-y-auto max-h-[10rem] scrollbar-none"
                    dangerouslySetInnerHTML={{ 
                      __html: response.question.questionAnswerNotes[0] 
                    }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-[--theme-text-color] opacity-40 mt-4 pt-2 border-t border-[--theme-border-color]">
          {isFlipped ? 'Click to hide answer' : 'Click to show answer'}
        </div>
      </div>
    </motion.div>
  );
};

export default WrongAnswerCard;