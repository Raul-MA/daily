import { exerciseSchema } from './schema.js';

export const exerciseTypes = Object.freeze({ Exercise: exerciseSchema, ...exerciseSchema.$defs });
