---
id: database2
title: Security Incidents
description: Patrol reports, alarm events, and defense-grid irregularities.
password: database2
---

<!-- See database1.md for editing notes. Comments are hidden from terminal display. -->

## Category: INCIDENTS

### Entry: Perimeter Drone Loop
id: perimeter-drone
title: Perimeter Drone Loop
category: INCIDENTS
tags: drone, uplink, degraded, perimeter
clearance: 2
related: drone-uplink, security-chief-vale
body:
Drone patrol route repeats a six-minute loop around the east service trench.
Telemetry is degraded but weapons interlocks remain active.
Recommendation: do not cross open ground without spoofed Ares maintenance credentials.

### Entry: Vault Servo Three
id: vault-servo-3
title: Vault Servo Three
category: INCIDENTS
tags: vault, servo, door, slow
clearance: 2
related: defense-grid, sealed-case
body:
Vault door actuator reports delayed response and current spikes.
Failure is not total, but manual override may jam after two cycles.
Security Chief Vale denied the repair request until relay confirmation returns.

### Entry: DIS Sensor Blind Spots
id: dis-sensor-blind
title: DIS Sensor Blind Spots
category: INCIDENTS
tags: dis, sensors, alarm, degraded
clearance: 2
related: unknown-life-signs, containment-drift
body:
Distributed Intrusion Sensor nodes D-4 and S-11 report degraded pattern matching.
Blind spots overlap with service tunnel junction and lower containment access.
Alarm status remains amber maintenance instead of breach.

## Category: ALARMS

### Entry: Amber Maintenance Alarm
id: amber-maintenance
title: Amber Maintenance Alarm
category: ALARMS
tags: alarm, maintenance, amber, station
clearance: 1
related: maintenance-queue, dis-sensor-blind
body:
Facility alarm bus is locked in amber maintenance state.
Local overrides report accepted, but state returns after seven seconds.
Corporate safety notice: amber is an acceptable productivity condition.

### Entry: Biohazard Sample Lock
id: sample-lock
title: Biohazard Sample Lock
category: ALARMS
tags: biohazard, sample, lock, lab
clearance: 3
related: specimen-c12, lab-seal-drift
body:
Biohazard panel shows clear status but sample locker C-12 has not completed seal verification.
Sensor confidence is below Ares legal threshold for employee reassurance.

## Category: CONFIDENTIAL

### Entry: Autonomous Defense Exception
id: defense-exception
title: Autonomous Defense Exception
category: CONFIDENTIAL
tags: autonomous, defense, exception, lethal
clearance: 4
related: perimeter-drone, security-chief-vale
redacted: Engagement rules partially overwritten by remote executive token.
body:
Defense grid is authorized to treat unknown life signs as hostile after verbal warning packet.
Warning packet transmitter is offline.
This creates a compliance ambiguity favorable to facility asset retention.
