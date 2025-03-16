import { GridImage, Waypoint } from './types';

export const tileWidth = 128;
export const tileHeight = 64;
export const gridWidth = 10;
export const gridHeight = 10;

export const roomToSubjectMap: Record<string, string[]> = {
  'WaitingRoom0': ['Tutorial'],
  'WaitingRoom1': ['Sociology'],
  'ExaminationRoom1': ['Psychology'],
  'ExaminationRoom2': ['Psychology'],
  'DoctorsOffice1': ['Sociology'],
  'Bathroom1': [''],
  'Lab1': ['Biology', 'Biochemistry'],
  'HighCare1': ['Biology'],
  'HighCare2': ['Biology', 'Biochemistry'],
  'OperatingRoom1': ['Biochemistry'],
  'MedicalCloset1': ['Chemistry'],
  'MRIMachine1': ['Chemistry', 'Physics'],
  'MRIMachine2': ['Physics', 'Chemistry'],
  'CATScan1': ['Physics'],
  'CATScan2': ['Physics'],
};

export const roomToContentMap: Record<string, string[]> = {
  'WaitingRoom0': ['Tutorial'],
  'WaitingRoom1': ['8A', '8B', '8C'],
  'ExaminationRoom1': ['6A', '6B', '6C'],
  'ExaminationRoom2': ['7A', '7B', '7C'],
  'DoctorsOffice1': ['9A', '9B', '10A'],
  'Bathroom1': [],
  'Lab1': ['2A', '2B', '2C', '1C'],
  'HighCare1': ['3A', '3B'],
  'HighCare2': ['1A', '1B', '5E'],
  'OperatingRoom1': ['1D'],
  'MedicalCloset1': ['5C', '5D'],
  'MRIMachine1': ['4E', '5A', '5B'],
  'MRIMachine2': ['4C', '4D'],
  'CATScan1': ['4B'],
  'CATScan2': ['4A']
};

// Update the spriteWaypoints to include paths for different levels
export const spriteWaypoints: Record<number, Waypoint[]> = {
  0: [
    { x: 9.5, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 9.5, y: 8, direction: 'NE' },  // Move up
    { x: 10, y: 8, direction: 'SE' }, // Move right
    { x: 10, y: 9, direction: 'SW' }, // Move down
  ],
  1: [
    { x: 8, y: 9, direction: 'SW' },  // Start at waiting room
    { x: 5, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 5, y: 8, direction: 'NE' },  // Move SE back to waiting room
    { x: 8, y: 8, direction: 'SE' },  // Move SE back to waiting room

  ],
  2: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 3, direction: 'NE' },  // Move NE to top left
    { x: 4, y: 3, direction: 'NW' },  // Move NW to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SW to bottom left
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  3: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 4, direction: 'NE' },  // Move NE to middle left
    { x: 2.5, y: 4, direction: 'NW' },  // Move SE back to waiting room
    { x: 2.5, y: 6.5, direction: 'SW' },  // Move NE to middle left
    { x: 5, y: 9, direction: 'S' },  // Move SE back to waiting room
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  4: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 3, direction: 'NE' },  // Move NE to middle left
    { x: 2.5, y: 1.3, direction: 'N' },  // Move SE back to waiting room
    { x: 2.5, y: 7, direction: 'SW' },  // Move NE to middle left
    { x: 4.5, y: 9, direction: 'S' },  // Move SE back to waiting room
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  5: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 1.5, direction: 'NE' },  // Move NE to top left
    { x: 8, y: 1.5, direction: 'SE' },  // Move SE to top right
    { x: 3, y: 1.5, direction: 'NW' },  // Move NE to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SE back to waiting room
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  6: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 2, direction: 'NE' },  // Move NE to top left
    { x: 10, y: 2, direction: 'SE' },  // Move SE to top right
    { x: 10, y: 9, direction: 'SW' },  // Move SE back to waiting room
  ],
};


export const levelConfigurations: Record<number, {
  canvasSize: { width: number, height: number },
  rooms: GridImage[]
}> = {
  0: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom0', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.04, width: 280, height: 268, zIndex: 2, opacity: 1.0 },
    ]
  },
  1: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.04, width: 280, height: 268, zIndex: 10, opacity: 1.0 },
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 5.94, width: 300, height: 278, zIndex: 6 },
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 5.88, width: 300, height: 278, zIndex: 7, opacity: 1.0 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 2.06, y: 7.99, width: 296, height: 290, zIndex: 5 },
    ]
  },
  2: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0 },
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11 },
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0 },
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 299, height: 278, zIndex: 9 },
      { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 292, height: 270, zIndex: 10 },
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 12 },
    ]
  },
  3: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0 },
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11 },
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0 },
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 299, height: 278, zIndex: 9 },
      { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 292, height: 270, zIndex: 10 },
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 12 },
    ]
  },
  4: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.0, width: 284, height: 272, zIndex: 12, opacity: 1.0 },
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 10 },
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 10, opacity: 1.0 },
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 296, height: 278, zIndex: 9 },
      { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 285, height: 273, zIndex: 9 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8 },
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
      { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
      { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
    ]
  },
  5: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0 },
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11 },
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0 },
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 296, height: 278, zIndex: 10 },
      { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 285, height: 273, zIndex: 10 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8 },
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
      { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
      { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
      { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
    ]
  },
  6: {
    canvasSize: { width: 10, height: 10 },
    rooms: [
      { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0 },
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 260, zIndex: 11 },
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 262, zIndex: 11, opacity: 1.0 },
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 4.02, width: 294, height: 278, zIndex: 10 },
      { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.98, y: 4, width: 285, height: 263, zIndex: 10 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 290, zIndex: 8 },
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
      { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
      { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
      { id: 'CATScan1', src: '/game-components/CATScan1.png', x: 8.1, y: 0.15, width: 270, height: 240, zIndex: 7 },
      { id: 'CATScan2', src: '/game-components/CATScan1.png', x: 6.1, y: 0.15, width: 270, height: 240, zIndex: 6 },
      { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
    ]
  },
};


// Define zoom levels for each test level
export const zoomLevels: Record<number, { scale: number, offsetX: number, offsetY: number }> = {
  0: { scale: 2, offsetX: -100, offsetY: -580 },
  1: { scale: 1.3, offsetX: 70, offsetY: -370 },
  2: { scale: 1.1, offsetX: 100, offsetY: -220 },
  3: { scale: 1.18, offsetX: 120, offsetY: -200 },
  4: { scale: 1.1, offsetX: 20, offsetY: -60 },
  5: { scale: 1.2, offsetX: 0, offsetY: -29 },
  6: { scale: 1.4, offsetX: 0, offsetY: -20 },
};