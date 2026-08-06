# Animation Behavior Specification

## Scope and evidence sources

- Updated:
- Owner:
- Source implementation(s) inspected:
- Recordings, screenshots, or historical references inspected:
- Confirmed product intent:
- Open blocking questions:

## Comparison environment

- Browser and version:
- Viewport and DPR:
- Color scheme and reduced-motion setting:
- Network and font readiness condition:
- Route, route state, and authenticated state:
- Randomness/time controls:
- WebGL comparison region or excluded decorative region:

## Flows

### `<flow-name>`

**Purpose**

**Trigger and preconditions**

- Route:
- Initial state:
- User action or automatic trigger:
- Automation procedure:

**Expected timeline**

| Timestamp | Phase | Visual behavior | Structural/accessibility behavior |
| --- | --- | --- | --- |
| 0ms | initial |  |  |
|  |  |  |  |

**Timing**

- Duration:
- Delay:
- Easing:
- Start and end tolerance:

**Lifecycle and interruption rules**

- Cold load:
- Return navigation:
- Repeated trigger:
- Interrupted interaction:
- Reduced motion:

**Assertions**

- Required final state:
- Required intermediate state:
- Forbidden transient states:
- Required DOM/accessibility assertions:

**Verification**

- Original URL:
- Migrated URL:
- Artifact directory:
- UI mismatch threshold:
- Critical frames for human review:

## Approval

- [ ] Each affected flow is complete, observed, and free of template markers.
- [ ] Blocking questions are resolved before parity testing.
- [ ] Thresholds and excluded regions have an explicit rationale.
