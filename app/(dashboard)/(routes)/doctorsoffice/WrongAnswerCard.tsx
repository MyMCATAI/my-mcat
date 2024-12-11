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
        min-h-[200px]
        ${isFlipped ? 'bg-opacity-90' : ''}
      `}
      onClick={handleClick}
    >
      <div className="h-full flex flex-col">
        <div className="text-sm text-gray-500 mb-2">
          {new Date(response.answeredAt).toLocaleString()}
        </div>
        
        <div className="flex-1">
          {!isFlipped ? (
            <div className="font-semibold">
              {cleanQuestion(response.question?.questionContent || '')}
            </div>
          ) : (
            <div className="text-green-600 font-medium">
              <div className="text-sm mb-1">Correct Answer:</div>
              <div>{getAnswerContent(response)}</div>
              {response.question?.questionAnswerNotes && (
                <div className="mt-4 text-sm text-gray-600">
                  <strong>Explanation:</strong>
                  <div dangerouslySetInnerHTML={{ 
                    __html: response.question.questionAnswerNotes[0] 
                  }} />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 mt-4 pt-2 border-t border-gray-200">
          {isFlipped ? 'Click to hide answer' : 'Click to show answer'}
        </div>
      </div>
    </motion.div>
  );
};

export default WrongAnswerCard;