import type { DailyState } from '../../../../packages/data/src/daily-state.ts';
import type { Route } from '../../../../packages/platform/src/router.ts';

export type ShellContext = { root: HTMLElement; base: string; state: DailyState; route: Route; error: boolean; saved: boolean };
