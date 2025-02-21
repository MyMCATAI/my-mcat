import { render, screen } from '@testing-library/react';
import StreakDisplay from '../StreakDisplay';
import useAudioManager from '@/hooks/useAudioManager';
import { useUserInfo } from '@/hooks/useUserInfo';

// Mock the UI components we don't want to test
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the hooks
jest.mock('@/hooks/useAudioManager');
jest.mock('@/hooks/useUserInfo');

// Add this mock at the top with other mocks
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('StreakDisplay Audio Tests', () => {
  const mockPlaySound = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAudioManager as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
    
    (useUserInfo as jest.Mock).mockReturnValue({
      userInfo: { id: '123' },
      isLoading: false
    });
  });

  it('plays streakmonth sound when streak reaches 30', () => {
    const { rerender } = render(
      <StreakDisplay 
        streak={29} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Increase streak to 30
    rerender(
      <StreakDisplay 
        streak={30} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(mockPlaySound).toHaveBeenCalledWith('streakmonth');
  });

  it('plays streakdaily sound when streak increases but is less than 30', () => {
    const { rerender } = render(
      <StreakDisplay 
        streak={6} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Increase streak to 7
    rerender(
      <StreakDisplay 
        streak={7} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(mockPlaySound).toHaveBeenCalledWith('streakdaily');
  });

  it('does not play sound when streak is 1 or less', () => {
    render(
      <StreakDisplay 
        streak={1} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(mockPlaySound).not.toHaveBeenCalled();
  });

  it('does not play sound when streak decreases', () => {
    const { rerender } = render(
      <StreakDisplay 
        streak={5} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Reset mock to check next render
    mockPlaySound.mockClear();

    // Rerender with lower streak
    rerender(
      <StreakDisplay 
        streak={3} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(mockPlaySound).not.toHaveBeenCalled();
  });

  it('displays correct message and image based on streak level', () => {
    const { rerender } = render(
      <StreakDisplay 
        streak={30} 
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('30 DAY STREAK!')).toBeInTheDocument();
    expect(screen.getByText("You're a rockstar!")).toBeInTheDocument();
    expect(screen.getByAltText('Kalypso')).toHaveAttribute('src', '/kalypsodancing.gif');

    // Test different streak levels
    rerender(<StreakDisplay streak={14} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('14 DAY STREAK!')).toBeInTheDocument();
    expect(screen.getByAltText('Kalypso')).toHaveAttribute('src', '/kalypsofloatinghappy.gif');
  });
}); 