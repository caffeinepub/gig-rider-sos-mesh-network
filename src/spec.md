# Specification

## Summary
**Goal:** Make crash/impact detection reliably active across the app, reduce false/spam triggers, and let users tune detection sensitivity in Settings.

**Planned changes:**
- Render the existing `CrashPromptDialog` globally (in the app shell/layout) so an impact can open the prompt from any page when crash detection is enabled.
- Update `useCrashDetection` to only listen when crash detection is enabled and motion permission is granted/available, add a short confirmation window/smoothing to reduce false positives, and add a cooldown to prevent rapid re-triggering.
- Add a Settings control to view and adjust `settings.crashThreshold`, with clear English helper text and a safe default range; apply changes immediately via the existing settings store.

**User-visible outcome:** When Crash Detection is enabled (and motion permission is granted), an impact can trigger the “Possible Impact Detected” dialog from anywhere in the app; the prompt won’t spam-trigger on normal bumps, and users can adjust sensitivity in Settings with immediate effect.
