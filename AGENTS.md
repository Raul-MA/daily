# Daily working rules

- Read [COMPASS.md](./COMPASS.md), [progress](./docs/progress.md) and the authoritative [implementation plan](./docs/pwa-consolidation-plan.md) before work.
- Work sequentially, one stage and one app at a time. Do not delegate or implement apps in parallel.
- Tests were copied before application logic. Preserve every source assertion; record replacement acceptance tests before deliberate behavior changes.
- Apply [shared ESLint policy](./docs/pwa-eslint-policy.md) to all authored/imported code and tests. No exclusions for legacy code, inline disables, skipped tests or weakened limits.
- Run general and affected module suites for shared changes; full verification before release. Expected red suites still fail.
- Preserve original repos, installations and personal data. Coffee Excel is excluded. Never track personal backups, credentials or authenticated API responses.
- Follow the accepted iOS dashboard design and module appearance rules. Dashboard cards navigate without domain mutations.
- Use [.codex/skills/compass-docs/SKILL.md](./.codex/skills/compass-docs/SKILL.md) for documentation; its Anori examples do not apply.
- Update `docs/progress.md` with evidence, unfinished work and the exact next step at each checkpoint. Keep source mapping in `reports/` current as tests move.
- Root/module Compass files route to focused docs. Keep one authoritative plan and policy; workspace copies are relocation pointers.
