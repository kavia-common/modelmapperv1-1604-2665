import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Configure MSW worker with our handlers.
export const worker = setupWorker(...handlers);
