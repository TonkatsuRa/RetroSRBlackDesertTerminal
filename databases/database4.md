---
id: database4
title: Outpost Relay Logs
description: Remote station, drone uplink, and mesh-network records.
password: database4
---

<!-- See database1.md for editing notes. Comments are hidden from terminal display. -->

## Category: OUTPOSTS

### Entry: Outpost One Partial Mesh
id: outpost-01
title: Outpost One Partial Mesh
category: OUTPOSTS
tags: outpost, mesh, latency, partial
clearance: 1
related: mesh-network, drone-uplink
body:
Outpost One responds through local mesh with high latency.
Last clean packet reports weather mast damage and unknown dust contamination.
Remote camera feed unavailable.

### Entry: Outpost Four No Carrier
id: outpost-04
title: Outpost Four No Carrier
category: OUTPOSTS
tags: outpost, no carrier, relay, dark
clearance: 2
related: external-relay, relay-failure
body:
Outpost Four has not returned a carrier signal since the facility relay failure.
Power beacon intermittently appears on passive scan but does not authenticate.
Dispatch request remains queued.

## Category: NETWORK

### Entry: External Relay Failure
id: external-relay
title: External Relay Failure
category: NETWORK
tags: relay, failed, no carrier, surface net
clearance: 2
related: signal-coffin, outpost-04
body:
External relay reports failed carrier negotiation.
Local mesh remains active but cannot reach surface grid.
Manual tower access requires crossing the east service trench.

### Entry: Drone Uplink Degradation
id: drone-uplink
title: Drone Uplink Degradation
category: NETWORK
tags: drone, uplink, degraded, 77
clearance: 2
related: perimeter-drone
body:
Drone uplink currently holds at seventy-seven percent effective bandwidth.
Command latency creates short drift windows.
Weapons package still acknowledges security grid.

### Entry: Mesh Network Weak Signal
id: mesh-network
title: Mesh Network Weak Signal
category: NETWORK
tags: mesh, weak signal, local only
clearance: 1
related: outpost-01
body:
Facility mesh is weak but operational.
Signal favors service corridors and generator shielding gaps.
Long messages may fragment into invalid checksum noise.

## Category: CONFIDENTIAL

### Entry: Relay Failure Timing
id: relay-failure
title: Relay Failure Timing
category: CONFIDENTIAL
tags: relay, timing, courier, executive
clearance: 4
related: courier-null-slate, signal-coffin
redacted: Remote authorization token removed from local logs.
body:
External relay failed nine minutes after courier arrival and two minutes before sample-lock warning.
The timing is statistically unlikely under normal storm interference.
Executive review classifies correlation as non-actionable until profit impact is known.
