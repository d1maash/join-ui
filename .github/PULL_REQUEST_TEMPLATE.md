<!--
The PR title becomes the squashed commit on main. Write it in the imperative
mood, describing the change: "Add Focus Stack", not "update components.ts".
-->

## What this changes

<!-- One or two sentences. Link the issue it closes: Closes #123 -->

## Why

<!-- The problem it solves. Skip if the title already says it. -->

## Checks

- [ ] `pnpm check` passes — validation, types and lint
- [ ] `pnpm build` succeeds
- [ ] `pnpm format` has been run

## If this adds or changes a component

- [ ] It works with a keyboard alone
- [ ] It behaves correctly with Reduce Motion enabled at the OS level
- [ ] Both preview themes look right — checked with the sun and moon buttons on
      the preview frame, not just by switching the site theme
- [ ] No `dark:` variants in `registry/` or `components/previews/`
- [ ] No hard-coded colours, no gradients, no invented shadows; corners round
      through `rounded-soft*`
- [ ] Metadata added to `lib/registry/components.ts`, and `registry.json` is
      regenerated rather than hand-edited
- [ ] The preview is registered in `components/previews/registry.tsx`
- [ ] No `any`, and no `TODO` left in place of an implementation

## Screenshots or recording

<!-- For anything visual. A short recording beats a still for motion work. -->
