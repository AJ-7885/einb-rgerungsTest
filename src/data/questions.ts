import { Question } from '../types';
import rawQuestions from './questions/allQuestions.json';

// Complete official catalog of all 300 federal questions + 160 state questions (460 total)
export const OFFICIAL_QUESTIONS: Question[] = rawQuestions as Question[];
