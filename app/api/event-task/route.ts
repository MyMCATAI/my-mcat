import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { parseDefaultTasks, TaskMapping } from '@/lib/utils';

const MAPPING_FILE_PATH = path.join(process.cwd(), 'app', 'api', 'event-task', 'taskMapping.json');

// Add function to read/write mapping
async function getStoredMapping(): Promise<TaskMapping> {
  try {
    const content = await fs.readFile(MAPPING_FILE_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    // If file doesn't exist, create new mapping
    const csvPath = path.join(process.cwd(), 'app', 'api', 'event-task', 'taskList.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const mapping = parseDefaultTasks(csvContent);
    await fs.writeFile(MAPPING_FILE_PATH, JSON.stringify(mapping, null, 2));
    return mapping;
  }
}

async function updateStoredMapping(mapping: TaskMapping): Promise<void> {
  await fs.writeFile(MAPPING_FILE_PATH, JSON.stringify(mapping, null, 2));
}

export async function GET(request: Request) {
  try {
    const taskMapping = await getStoredMapping();
    
    const { searchParams } = new URL(request.url);
    const eventTitle = searchParams.get('eventTitle');
    
    if (!eventTitle) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    const tasks = taskMapping[eventTitle] || [];
    
    if (tasks.length === 0) {
      return NextResponse.json([]);
    } else {
      const task = tasks[0];
      // TODO: Probably update the logic here
      if (tasks.length !== 1) {
        taskMapping[eventTitle] = tasks.slice(1);
        await updateStoredMapping(taskMapping);
      }
      
      return NextResponse.json(task);
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}