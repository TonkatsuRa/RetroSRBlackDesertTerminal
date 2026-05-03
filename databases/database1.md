---
id: database1
title: Personnel Registry
description: Employee, contractor, and missing staff notes for Black Desert Research.
password: database1
---

<!--
DATABASE EDITING NOTES
Change password above to change the roleplay database password.
Add categories with: ## Category: CATEGORY NAME
Add entries with: ### Entry: Entry Title
Supported fields: id, title, category, tags, clearance, related, redacted, body.
Everything after body: belongs to the entry body until the next entry or category.
These comments are stripped before display.
-->

## Category: PERSONNEL

### Entry: Director Halden Voss
id: personnel-voss
title: Director Halden Voss
category: PERSONNEL
tags: director, command, ares, executive
clearance: 2
related: payroll-audit, executive-evacuation
body:
Facility Director assigned by Ares Macrotechnology Special Projects.
Last confirmed in Command Core during external relay failure.
Personnel compliance reports describe Voss as efficient, intolerant of delay, and unusually calm after Containment Cell alarms.

### Entry: Dr. Mara Kess
id: personnel-kess
title: Dr. Mara Kess
category: PERSONNEL
tags: xenobiology, lab arc, missing, biomonitor
clearance: 2
related: specimen-c12, medbay-quarantine
redacted: Last twenty minutes of biomonitor telemetry removed by administrator action.
body:
Senior researcher assigned to Lab Arc C-12.
Reported seal drift three times before the diagnostic bus marked the issue as non-critical.
Current location unknown. Life-sign system shows intermittent match in service tunnels.

### Entry: Security Chief Anika Vale
id: personnel-vale
title: Security Chief Anika Vale
category: PERSONNEL
tags: security, defense grid, armed, patrol
clearance: 2
related: perimeter-drone, vault-servo-3
body:
Responsible for autonomous defense oversight and physical security rotation.
Last filed an order to keep defense systems armed until off-site confirmation returns.
No off-site confirmation has been received.

## Category: CONTRACTORS

### Entry: Rourke Industrial Crew
id: contractor-rourke
title: Rourke Industrial Crew
category: CONTRACTORS
tags: generator, coolant, filters, maintenance
clearance: 1
related: coolant-filter, turbine-rpm
body:
Third-party maintenance crew hired for generator coolant filter replacement.
Work order remains open. Crew badges last pinged near Generator Plant service access.
One badge continues to move without a matching heartbeat signal.

### Entry: Jackpoint Courier Null-Slate
id: courier-null-slate
title: Jackpoint Courier Null-Slate
category: CONTRACTORS
tags: courier, sealed case, external relay
clearance: 3
related: relay-failure, sealed-case
body:
Courier listed under temporary Ares shell authorization.
Manifest indicates delivery of a sealed data case to Black Desert Research.
Security log shows the courier arrived nine minutes before external relay failure.

## Category: CONFIDENTIAL

### Entry: Executive Evacuation Hold
id: executive-evacuation
title: Executive Evacuation Hold
category: CONFIDENTIAL
tags: executive, evacuation, shareholder, directive
clearance: 4
related: personnel-voss
redacted: Names of evacuated personnel suppressed under Ares shareholder-risk protocol.
body:
Executive evacuation was authorized for command staff only.
Remaining personnel were instructed to preserve facility assets and await retrieval.
Retrieval window expired. Directive remains active.
