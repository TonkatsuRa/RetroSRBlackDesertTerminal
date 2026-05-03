# Terminal Content

// This file controls editable text for index.html.
// HOW TO EDIT THIS FILE
// The terminal ignores comments like these.
// Simple settings use:
// key = value
//
// Long visible text uses blocks between ```terminal and ```.
// You do NOT need to write line1, line2, line3, etc.
// In those blocks you can write normal text exactly as it should appear.
// Do not put ``` inside visible text; it marks the end of a block.
// Optional color hints go at the start of a line:
// @dim, @bright, @cyan, @amber, @red, @magenta
// Use @pagebreak on its own line to force the next text onto a new page.
//
// Example:
// ## welcome
// ```terminal
// @bright BIG TITLE
// Normal text line
// @amber Warning text
// ```

## terminal
title = BLACK DESERT RESEARCH TERMINAL
name = BLACK DESERT RESEARCH TERMINAL
build = 4.7.2
corporation = ARES MACROTECHNOLOGY

## commands
welcome = WELCOME
help = HELP
diagnostic = DIAGNOSTIC
facility = FACILITY STATUS
load = LOAD DATABASE
search = SEARCH
categories = CATEGORIES
clear = CLEAR
access = ACCESS
loadStatus = LOAD STATUS
list = LIST ALL
fsearch = FUZZY SEARCH
logout = LOGOUT
loadDatabase = LOAD DATABASE
loadFile = LOAD FILE
ejectAllDatabase = EJECT ALL DATABASE
ejectDatabaseSlot1 = EJECT DATABASE SLOT 1
ejectDatabaseSlot2 = EJECT DATABASE SLOT 2
ejectDatabaseSlot3 = EJECT DATABASE SLOT 3
statusLoad = STATUS LOAD
statusClear = STATUS CLEAR
statusFormat = STATUS FORMAT
soundOn = SOUND ON
soundOff = SOUND OFF

## welcome
```terminal
@dim ═══════════════════════════════════════════════════════
@bright               ARES MACROTECHNOLOGY
@dim ═══════════════════════════════════════════════════════

@amber WELCOME, AUTHORIZED PERSONNEL ASSET.

@amber All activity is monitored for security, compliance, and performance optimization.
@amber Report all anomalies before they escalate into liabilities. Unreported incidents will be interpreted as negligence and disloyalty.

@amber Rest periods are authorized only when they preserve long-term output. Emotional distress should be logged through the appropriate channel and resolved without impact to mission deliverables.

@red Great companies are built by people who understand that
@red purpose begins where personal comfort ends.

@red Every task completed, every break shortened, every concern set aside
@red moves us closer to a stronger, leaner, more confident future.

@red Your work creates value.
@red Your value creates trust.
@red Your trust sustains the shareholders who sustain the mission.

@red Together, we do not merely work.

@red We deliver tomorrow.

@bright WELCOME BACK.
@bright RESUME YOUR FUNCTION IMMEDIATELY.

@dim Use HELP for command guidance.
@dim ═══════════════════════════════════════════════════════
```

## help
```terminal
@dim ═══════════════════════════════════════════════════════
@bright                     SYSTEM MANUAL
@dim ═══════════════════════════════════════════════════════

@cyan ACCESS
  Request elevated administrator privileges.

@cyan CATEGORIES
  Show categories and visible entry counts.

@cyan CLEAR
  Clear screen; loaded data remains mounted.

@cyan DIAGNOSTIC
  Open current base diagnostic dashboard.

@cyan EJECT ALL DATABASE
  Eject every mounted database package.

@cyan EJECT DATABASE SLOT 1 / 2 / 3
  Eject one slot so another package can load.

@cyan FACILITY STATUS
  Open abstract wireframe facility overview.

@cyan LOAD DATABASE
  Open the in-terminal database selector.
  Select a package, then enter its password.
  Up to three packages can be mounted.

@cyan LOAD FILE
  Open a local .md, .txt, or .dat database file.

@cyan SEARCH
  Query by exact entry title or entry id.
  Example: SEARCH perimeter-drone

@cyan SOUND ON / SOUND OFF
  Toggle optional terminal audio.

@cyan STATUS FORMAT
  Print the editable status profile format.

@cyan WELCOME
  Display the corporate welcome notice.

@pagebreak
@dim ───────────────────────────────────────────────────────
@red ADMIN COMMANDS (requires ACCESS)
@dim ───────────────────────────────────────────────────────

@red FUZZY SEARCH - Partial match search.

@red LIST ALL - Complete database index.

@red LOAD STATUS / STATUS LOAD - Load status profile.

@red LOGOUT - Terminate administrator session.

@red STATUS CLEAR - Restore default status data.

@dim Navigation: ↑↓ Menu | ←→ Pages | Enter Select
@dim ═══════════════════════════════════════════════════════
```

## errors
no_database = ERROR: No database loaded.
no_database_hint = Use LOAD DATABASE to select a package first.
search_no_result = SEARCH QUERY RETURNED NO RESULT
unknown_command_hint = Use the menu to navigate commands.
database_manifest_fail = DATABASE MANIFEST UNAVAILABLE.
database_package_fail = DATABASE PACKAGE FAILED TO LOAD.
database_password_fail = ACCESS DENIED - INVALID DATABASE PASSWORD

## admin
required_hint = Use ACCESS to authenticate before modifying status systems.
access_granted = ADMINISTRATOR ACCESS GRANTED
access_denied = ACCESS DENIED
logout = ADMINISTRATOR SESSION TERMINATED

## boot.logo
```terminal
@amber    █████╗ ██████╗ ███████╗███████╗
@amber    ██╔══██╗██╔══██╗██╔════╝██╔════╝
@amber    ███████║██████╔╝█████╗  ███████╗
@amber    ██╔══██║██╔══██╗██╔══╝  ╚════██║
@amber    ██║  ██║██║  ██║███████╗███████║
@amber    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
@dim      M A C R O T E C H N O L O G Y

@dim ════════════════════════════════════

@cyan   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗
@cyan   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝
@cyan   ██████╔╝██║     ███████║██║     █████╔╝
@cyan   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗
@cyan   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗
@cyan   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝

@cyan   ██████╗ ███████╗███████╗███████╗██████╗ ████████╗
@cyan   ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗╚══██╔══╝
@cyan   ██║  ██║█████╗  ███████╗█████╗  ██████╔╝   ██║
@cyan   ██║  ██║██╔══╝  ╚════██║██╔══╝  ██╔══██╗   ██║
@cyan   ██████╔╝███████╗███████║███████╗██║  ██║   ██║
@cyan   ╚═════╝ ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝

@bright   R E S E A R C H   T E R M I N A L

@dim ════════════════════════════════════

@red  ╔═══════════════════════════════════════╗
@red  ║  W A R N I N G :  AUTHORIZED ONLY     ║
@red  ║  All activity monitored and logged.   ║
@red  ╚═══════════════════════════════════════╝

```

// Boot steps can be edited or reordered by changing the numeric section ids.
// type can be line, blank, pause, section, or check.
// check entries use label, result, and status. final = true marks the last check.

## boot.step.001
type = line
text = ╔════════════════════════════════════════════╗
class = t-dim

## boot.step.002
type = line
text = ║    ARES MACROTECHNOLOGY SYSTEMS v4.7.2     ║
class = t-dim

## boot.step.003
type = line
text = ║       INITIALIZING BOOT SEQUENCE...        ║
class = t-dim

## boot.step.004
type = line
text = ╚════════════════════════════════════════════╝
class = t-dim

## boot.step.005
type = pause
duration = 160

## boot.step.006
type = blank

## boot.step.007
type = section
text = POWER AND FIRMWARE BUS

## boot.step.008
type = check
label = BIOS INIT
result = OK
status = loaded

## boot.step.009
type = check
label = MEMORY 640K BASE
result = OK
status = ok

## boot.step.010
type = check
label = EXT MEMORY 262144K
result = OK
status = ok

## boot.step.011
type = check
label = MEMORY INTEGRITY
result = OK
status = ok

## boot.step.012
type = check
label = CPU CORES
result = OK
status = operational

## boot.step.013
type = check
label = GPU ENGINE
result = OK
status = rendering

## boot.step.014
type = blank

## boot.step.015
type = section
text = KERNEL AND DEVICE CONTROL

## boot.step.016
type = check
label = KERNEL LOAD
result = OK
status = loaded

## boot.step.017
type = check
label = DEVICE DRIVERS
result = OK
status = loaded

## boot.step.018
type = check
label = FILESYSTEM MOUNT
result = OK
status = loaded

## boot.step.019
type = check
label = VIRTUAL MEMORY
result = OK
status = operational

## boot.step.020
type = blank

## boot.step.021
type = section
text = NETWORK CONNECTIONS

## boot.step.022
type = check
label = NET INTERFACE eth0
result = DISCONNECTED
status = malfunction

## boot.step.023
type = check
label = NET INTERFACE eth1
result = OFFLINE
status = unknown

## boot.step.024
type = check
label = EXTERNAL RELAY
result = FAILED
status = unknown

## boot.step.025
type = check
label = DRONE UPLINK
result = DEGRADED 77%
status = warn

## boot.step.026
type = check
label = MESH NETWORK
result = WEAK SIGNAL
status = operational

## boot.step.027
type = blank

## boot.step.028
type = section
text = DATABASE SYSTEMS

## boot.step.029
type = check
label = DATABASE MODULE
result = OK
status = operational

## boot.step.030
type = check
label = INDEX PARSER
result = OK
status = operational

## boot.step.031
type = check
label = INTEGRITY CHECK
result = OK
status = secure

## boot.step.032
type = check
label = QUERY ENGINE
result = OK
status = operational

## boot.step.033
type = blank

## boot.step.034
type = section
text = SECURITY PROTOCOLS

## boot.step.035
type = check
label = SECURITY PROTOCOL
result = ENGAGED
status = active

## boot.step.036
type = check
label = CLEARANCE LEVEL
result = RESTRICTED
status = warn

## boot.step.037
type = check
label = ENCRYPTION MODULE
result = ACTIVE
status = operational

## boot.step.038
type = check
label = CONFIDENTIAL FILES
result = LOCKED
status = warn

## boot.step.039
type = check
label = INTRUSION DETECTION
result = ARMED
status = operational

## boot.step.040
type = check
label = AUTONOMOUS DEFENSE SYSTEMS
result = ARMED
status = operational

## boot.step.041
type = check
label = DIS DETECTION SENSORS
result = DEGRADED
status = malfunction

## boot.step.042
type = blank

## boot.step.043
type = section
text = DISPLAY HANDOFF

## boot.step.044
type = check
label = PHOSPHOR GRID ALIGNMENT
result = SYNC
status = ok

## boot.step.045
type = check
label = TERMINAL READY
result = DONE
status = ok
final = true

## diagnostic
title = BASE DIAGNOSTIC
ticker = FACILITY PASS: EXTERNAL COMMS DOWN // DEFENSE ARMED // DIS SENSORS DEGRADED // UNKNOWN LIFE SIGNS {spinner} {sweep:20}

## diagnostic.label
network = NETWORK STATUS
security = SECURITY INTEGRITY
outposts = OUTPOST LINKS
generator = POWER GENERATOR
power = POWER RESERVES
alarm = ALARM STATUS
life = LIFE SIGNS

## diagnostic.network
state = alert
status = DISCONNECTED
level = 69
surface = DISCONNECTED
relay = FAILED / NO CARRIER
drone = DEGRADED 77%
```terminal
FACILITY BUS : LOCAL ONLY {spinner}
LOCAL MESH   : {bar:diagnostic.network.level:18}
SURFACE NET  : DISCONNECTED
EXT RELAY    : FAILED / NO CARRIER
DRONE UPLINK : DEGRADED 77%
```

## diagnostic.security
state = warn
status = ARMED
level = 81
protocol = ENGAGED
defense = ARMED
intrusion = ARMED / NO BREACH
vault = SEALED / SERVO-3 SLOW
```terminal
PERIMETER    : {bar:diagnostic.security.level:18}
SEC PROTOCOL : ENGAGED
AUTO DEFENSE : ARMED
INTRUSION    : ARMED / NO BREACH
VAULT DOORS  : SEALED / SERVO-3 SLOW
```

## diagnostic.outposts
state = warn
status = LINK DEGRADED
drone = DEGRADED 77%
mesh = WEAK SIGNAL
outpost1 = PARTIAL MESH  188ms
outpost4 = NO CARRIER    ----
```terminal
LINK SWEEP   : {sweep:22}
DRONE UPLINK : DEGRADED 77%
MESH NETWORK : WEAK SIGNAL
OUTPOST-01   : PARTIAL MESH  188ms
OUTPOST-04   : NO CARRIER    ----
```

## diagnostic.generator
state = warn
status = SERVICE DUE
level = 62
core = RUNNING HOT
temp = 451K ABOVE NOMINAL
coolant = FLOW LOW / FILTER CLOG
```terminal
CORE-A {spinner}      : RUNNING HOT
TURBINE RPM  : {bar:diagnostic.generator.level:18}
TEMP         : 451K ABOVE NOMINAL
LOAD BUS     : {sweep:22}
COOLANT      : FLOW LOW / FILTER CLOG
```

## diagnostic.power
state = warn
status = LOW RESERVE
main = 61
reserve = 34
bat_a = [####------] 3.2h
bat_b = [###-------] 2.6h
capacitor = UNEVEN CHARGE ...
```terminal
MAIN GRID    : {bar:diagnostic.power.main:20}
RESERVE CELL : {bar:diagnostic.power.reserve:20}
BAT-A        : [####------] 3.2h
BAT-B        : [###-------] 2.6h
CAPACITOR    : UNEVEN CHARGE ...
```

## diagnostic.alarm
state = malfunction
status = DIS DEGRADED
station = AMBER MAINTENANCE
dis = DEGRADED / 02 BLIND
biohazard = CLEAR / SAMPLE LOCK DUE
containment = ZONE C-12 SEAL DRIFT
```terminal
STATION ALARM: AMBER MAINTENANCE
DIS SENSORS  : DEGRADED / 02 BLIND
BIOHAZARD    : CLEAR / SAMPLE LOCK DUE
CONTAINMENT  : ZONE C-12 SEAL DRIFT
SIREN BUS    : {sweep:22}
```

## diagnostic.life
state = alert
status = 3 UNKNOWN
known = 14
unstable = 2
unknown = 3
```terminal
BIO COUNT    : 14 CONFIRMED / 02 UNSTABLE / 03 UNKNOWN
HEARTBEAT    : {heartbeat:38}
UNKNOWN TRACE: SERVICE TUNNEL / CONTAINMENT ACCESS
```

## facility
title = FACILITY STATUS
ticker = MAINTENANCE REQUIRED // ABSTRACT GRID ONLY // UNKNOWN LIFE SIGNS DETECTED {spinner}

## facility.label
overview = GRID OVERVIEW
zones = ZONE READOUT
contacts = BIO / FAULT TRACE

## facility.grid
id = BDR-01
structure = 77
power = 61
reserve = 34
repair = 06 OPEN

## facility.overview
```terminal
GRID ID     : BDR-01
STRUCTURE   : {bar:facility.grid.structure:12}
POWER BUS   : {bar:facility.grid.power:12}
RESERVE     : {bar:facility.grid.reserve:12}
REPAIR IDX  : 06 OPEN
```

## facility.zones
```terminal
CMD CORE   NOMINAL   78%
LAB ARC    SEAL DRFT 64%
GEN PLANT  SERVICE   61%
HAB RING   LOW HEAT  67%
CNTM CELL  WATCH     58%
SVC BUS    UNK TRACE 47%
```

## facility.contact_readout
```terminal
KNOWN BIO   : 14
UNKNOWN BIO : 03 MOVING
CAM GRID    : 05/12 DIRTY
FAULTS      : PUMP2 DOOR-C RLY04
TRACE       : {sweep:16}
```

## facility.contacts
known = 14
unknown = 3
camera = 05/12 DIRTY
faults = PUMP2 DOOR-C RLY04
routes = service->contain, lab->core, storage->gen
