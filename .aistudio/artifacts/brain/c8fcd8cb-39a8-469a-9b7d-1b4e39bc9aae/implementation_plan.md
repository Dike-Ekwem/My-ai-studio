# TerraSkills 3D — Opening Experience, Customization, Hostel Ownership & Campus Systems

A production-grade architectural and gameplay implementation plan for TerraSkills 3D, elevating the university life simulator into an authentic, immersive, and logically coherent campus experience with persistent student identity, structured academic schedules, and physical environmental constraints.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following foundational design choices in Phase 1:
> - **Main Menu Presentation**: Live 3D elevated drone camera looking over the university entrance gate and campus boulevard with a gentle, majestic cinematic orbit.
> - **Timetable & Class Schedule**: Dynamic in-game clock with punctual smartphone lecture alerts and realistic lecture attendance windows tied strictly to the student's department courses.
> - **Hostel Room Interactivity**: Core room essentials focused on bed rest (100% stamina recovery), personal study desk (course revision & continuous assessment GPA booster), and wardrobe mirror (inspecting and re-styling unlocked drip).

- **Confirmed Decision 1**: Main menu renders a Three.js live drone view of the university entrance gate with green-and-gold institutional branding and clean action buttons (Start New Game with overwrite guard, Continue Game, Settings).
- **Confirmed Decision 2**: Character creation flow follows `Main Menu → Choose Student (Male / Female 3D models) → Deep Customization (complexion, hair, clothing, shoes, bags, accessories) → Family Background & JAMB UTME → Parents Arrival Gate Cutscene (with Ghana-Must-Go bags, traffic, father/mother dialogue) → Spawn in Designated Hostel Room`.
- **Confirmed Decision 3**: Hostel ownership is enforced in engine logic. Entering your own room provides Sleep, Study, Wardrobe, and Storage. Entering another hostel provides only social visitor actions (Visit Friend, Resident Gist, Common Area).
- **Confirmed Decision 4**: Academic classes are restricted to registered courses in the student's selected department. Attending classes in other departments awards exploration XP, never course credits or CGPA. Classes only award attendance when attended during scheduled timetable windows.
- **Confirmed Decision 5**: Road network, pond basin, footbridge, and vehicular transportation are physical entities: NPCs yield and cross pond only via bridge; kekes, shuttles, and taxis convey the player in real-time along actual roads with a chase camera.

---

## 1. Overview & Core Concept

### What It Does
TerraSkills 3D is a full 3D Nigerian university life simulation set in the Federal University of Omo (FUO Surulere Campus). The player creates their student avatar, arrives with family at the university gate, receives an institutional accommodation assignment, and navigates authentic daily student life: attending scheduled lectures, managing Omo-Pay bank allowances, taking campus kekes and shuttles, studying for high GPA, and socializing across hostels, eateries, and sports arenas.

### Target Audience & Persona
Students, gamers, and university alumni who want an authentic, rich simulation of Nigerian campus culture—complete with realistic academic pressures, hostel banter, institutional architecture, and vibrant urban campus logistics.

### Key Value
Transforms a previously scattered sandbox into a deeply immersive, structured simulation where choices have permanent consequences: your department dictates your classes, your timetable determines your day, your room is your actual home, and the campus adheres to realistic spatial and physical rules.

---

## 2. User Experience & Visual Design

### Key User Flows

#### A. Main Menu Experience
```
┌─────────────────────────────────────────────────────────────┐
│  LIVE 3D CAMPUS DRONE VIEW (Entrance Gate, Roads, Palms)     │
│                                                             │
│       [ FUO Official Gold Crest & Institutional Seal ]      │
│                     FEDERAL UNIVERSITY OF OMO               │
│                  3D University Life Simulator               │
│                                                             │
│      ┌────────────────────────────────────────────────┐     │
│      │ ▶  Resume University Career (Saved Profile)   │     │
│      │ 🎓 Start New Admission (Character Creator)     │     │
│      │ ⚙  Audio & Gameplay Settings                   │     │
│      └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```
1. **Title Screen Reveal**: The player is greeted by a high-angle drone camera looking over the grand green-and-gold university entrance gate, with palm trees, curbs, and campus boulevards stretching toward Senate Tower.
2. **Continue Game**: Directly loads saved player state without re-running onboarding.
3. **Start New Game**: Warns player if an existing save will be overwritten, then launches the dedicated Character Selection stage.

#### B. Character Selection & Avatar Customizer
1. **Choose Your Student**:
   - Two large interactive cards: **Male Student** and **Female Student**, each showcasing a distinct, fully-rendered 3D character preview that can be rotated.
2. **Avatar Customization Screen**:
   - **Complexion & Face**: Skin tones (deep melanin, warm cocoa, caramel bronze, golden honey), facial shapes, and facial hair/features.
   - **Hairstyle & Headwear**: Low fade, afros, dreadlocks with gold rings, box braids, twin puffs, sky-blue hijab, golden gele, and graduation mortarboards.
   - **Wardrobe**: T-shirts with Nigerian university graphics, Oxford shirts, casual shorts, chinos, dresses, and skirts.
   - **Footwear**: Retro sneakers, formal Oxford brogues, and slide sandals.
   - **Bags & Accessories**: Ghana-Must-Go bags, student backpacks, gold necklaces, silver Cuban chains, wristwatches, and optical glasses.
   - **Live 3D Viewport**: Left-hand full-body interactive turntable with responsive zoom and rotate controls.

#### C. Parents' Arrival Gate Cutscene
1. **Setting the Scene**: The family stands on the paved pedestrian sidewalk in front of the grand entrance gate: *"Welcome to Federal University of Omo Surulere Campus"*.
2. **Belongings & Luggage**: Authentic 3D Ghana-Must-Go plaid bags, travel suitcases, cardboard carton boxes, and provisions placed neatly beside the curb.
3. **Living Foreground Road**: A campus keke and coaster shuttle periodically drive past on the foreground asphalt road; campus students walk along the sidewalk.
4. **Dialogue Sequence**:
   - **Father's Blessing**: Encourages hard work, integrity, and keeping the family name proud.
   - **Mother's Advice**: Reminds student to eat well, pray, avoid bad company, and call home.
   - **Student's Response**: Respectful promise to achieve first-class honors.
   - **Transition**: Family waves farewell as the student collects luggage and heads to the housing portal.

#### D. Hostel Ownership & Daily Living
1. **Room Allocation**: Booking a hostel assigns a specific room number (e.g. Hall A, Room 204).
2. **First Spawn**: The player wakes up in their designated room next to their bed and study desk.
3. **Owner Activities (Own Room Only)**:
   - **Rest / Sleep**: Full stamina restoration to 100%, advances time to 08:00 AM.
   - **Study Desk**: Course revision boosting GPA and continuous assessment scores.
   - **Wardrobe Mirror**: Re-styling clothes and checking appearance.
   - **Roommate Gist**: Interactive dialogue with assigned roommate.
4. **Visitor Activities (Other Hostels)**:
   - Visiting other halls permits visiting friends and common rooms; private study and sleep are locked with clear institutional notices.

#### E. Timetable & Dynamic Lecture System
1. **Class Timetable**: Stored per student department (e.g. Electrical Engineering: ECE 101 Mon 08:00–10:00, MAT 101 Tue 10:00–12:00, PHY 101 Wed 14:00–16:00).
2. **Phone Notifications**: Punctual in-game push notification arrives 30 simulated minutes prior to lecture start.
3. **Attendance Validation**:
   - Entering own department during class window allows checking into class and taking continuous assessment quizzes.
   - Arriving outside scheduled lecture hours or entering an unrelated department provides exploration and study options, strictly separating academic credits from casual exploration XP.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Unified 3D Drone Main Menu
- **Chosen Approach**: Build the Title Screen with a live Three.js viewport rendering the redesigned entrance gate and campus boulevard in a slow, majestic orbit, overlaying minimal green-and-gold typography.
- **Why**: Immediately communicates that the game takes place in an expansive, living 3D world, replacing the plain flat green backdrop while maintaining 60fps performance through low-draw-call procedural meshes.
- **Alternatives Considered**: Pre-rendered static video/images (larger bundle size, non-interactive, fails to reflect the player's actual in-game world).

### Decision 2: Single Source of Truth for Character Customization
- **Chosen Approach**: Save all customization parameters (`gender`, `complexion`, `faceVariant`, `hairStyle`, `outfitId`, `shirtColor`, `pantsColor`, `shoesId`, `backpackId`, `accessories`) directly into `PlayerState.customization`.
- **Why**: Guarantees that the exact customized avatar appears seamlessly in the main menu creator, the parents' arrival cutscene, the open campus world, keke passenger seats, and hostel mirrors without model desynchronization.

### Decision 3: Engine-Enforced Hostel Ownership
- **Chosen Approach**: Verify `player.selectedAccommodationId === currentPOI.id` in `HostelModal` and `CampusCanvas`.
- **Why**: Prevents students from treating every building on campus as their private bedroom. Visiting friends remains social and open, while resting and academic desk work remain tied to their owned room.

### Decision 4: Department-Locked Academic Progression & Timetable
- **Chosen Approach**: Validate `player.courseId` and course code matching against the active timetable clock (`timeOfDay`, `dayOfWeek`) before awarding attendance or GPA adjustments.
- **Why**: Protects academic integrity in the simulation. Attending law lectures as an engineering student yields fun campus knowledge and social XP, but does not falsely inflate your engineering GPA.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│            (Screen Router, Clock Manager & Global Game State)          │
└────────┬───────────────────┬───────────────────┬───────────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐
│  TitleScreen.tsx │ │ AdmissionFlow  │ │ Campus World (Playing Screen) │
│ (Live Drone 3D)  │ │ (Customizer &  │ │                               │
│ - Orbit Camera   │ │  Parents Gate) │ │  ┌──────────────────────────┐ │
│ - Save Guardian  │ └────────────────┘ │  │ CampusCanvas.tsx         │ │
│ - Start/Resume   │                    │  │ - Physical Colliders     │ │
└──────────────────┘                    │  │ - Road Route Navigator   │ │
                                        │  │ - Pond & Footbridge Arch │ │
                                        │  │ - Visible Keke Conveyor  │ │
                                        │  └──────────────────────────┘ │
                                        │                               │
                                        │  ┌──────────────────────────┐ │
                                        │  │ HUD & PhoneModal.tsx     │ │
                                        │  │ - Punctual Lecture Alerts│ │
                                        │  │ - Timetable Inspector    │ │
                                        │  │ - Collapsed Motives Dock │ │
                                        │  └──────────────────────────┘ │
                                        │                               │
                                        │  ┌──────────────────────────┐ │
                                        │  │ Context Modals           │ │
                                        │  │ - HostelModal (Ownership)│ │
                                        │  │ - ClassroomScene3D       │ │
                                        │  │   (Eligibility Gate)     │ │
                                        │  └──────────────────────────┘ │
                                        └───────────────────────────────┘
```

### Core State Models

```typescript
export interface CharacterCustomization {
  gender: 'boy' | 'girl' | 'non_binary';
  complexion: string; // e.g. '#3b2314', '#5c3826', '#875338', '#b87c56'
  personality: PersonalityArchetype;
  faceVariant: string;
  hairStyle: string;
  hairColor?: string;
  outfitId: string;
  shirtColor: string;
  pantsColor: string;
  shoesId: string;
  backpackId: string;
  accessoryId: string;
  slangCatchphrase: string;
}

export interface PlayerState {
  id: string;
  name: string;
  matricNo: string;
  level: number;
  gender: 'boy' | 'girl' | 'non_binary';
  customization: CharacterCustomization;
  faculty: string;
  courseId: string;
  departmentName: string;
  registeredCourses: string[];
  timetable: TimetableEntry[];
  selectedAccommodationId: string;
  roomNumber: string;
  balance: number;
  stamina: number;
  hunger: number;
  gpa: number;
  day: number;
  dayOfWeek: number; // 1 = Mon, ..., 7 = Sun
  timeOfDay: number; // Minutes from midnight (480 = 08:00 AM)
  position: { x: number; y: number; z: number };
  attendance: Record<string, { attended: number; total: number; lastAttendedDay?: number }>;
  roommate: Roommate | null;
}
```

### Interactive Component & State Mapping

| Component | Trigger / Event | Engine Validation & State Mutation | Resulting UX / Scene State |
|---|---|---|---|
| `TitleScreen.tsx` | Click "Start New Admission" | If `savedGame` exists, trigger confirm dialog; transition `screen = 'admission'` | Opens character gender selection without deleting prior save prematurely |
| `TitleScreen.tsx` | Click "Resume Career" | Load `savedGame` directly into `player`; transition `screen = 'playing'` | Returns student directly to their assigned hostel room or saved campus location |
| `AdmissionFlow.tsx` | Select Gender & Customize | Mutates `CharacterCustomization` with live 3D preview turntable | Player creates unique male/female student with matching clothing and accessories |
| `ArrivalScene3D.tsx` | Mount & Dialogue Progress | Receives `customization`; renders student, parents, Ghana-Must-Go bags, road traffic | Cinematic emotional arrival at FUO entrance gate; dialogue sequence advances |
| `HostelModal.tsx` | Enter Hostel Room | Compares `player.selectedAccommodationId === hostel.id` | Shows full Sleep/Study/Wardrobe for owner; shows social visitor options for others |
| `CampusCanvas.tsx` | Approach Building Door | Calculates distance to designated entrance coordinate; suppresses side/back walls | Displays "Press E to Enter" only when facing the front door |
| `ClassroomScene3D.tsx` | Enter Lecture Theatre | Verifies course eligibility in `player.registeredCourses` and active timetable window | Grants attendance credit & GPA boost if eligible; gives guest exploration XP if outside course |
| `PhoneModal.tsx` | Time tick (clock update) | Compares `player.timeOfDay` against upcoming lecture start times | Sends in-game SMS push notification 30 minutes before lecture begins |
| `CampusCanvas.tsx` | Board Keke / Shuttle | Snaps route to road nodes, spawns vehicle, mounts player, chases camera along road | Player observes full real-time journey through campus, disembarking at destination |

---

## 5. Verification & Testing Strategy

1. **Main Menu**: Verify Three.js live drone view renders smoothly in background; test Start New Game confirmation modal and Continue Game resume.
2. **Character Creation**: Verify male vs. female choice yields distinct 3D models; test skin tones, hairstyles, shirts, shoes, and bags on turntable.
3. **Arrival Cutscene**: Verify customized avatar appears beside parents with visible Ghana-Must-Go luggage; confirm foreground traffic and dialogue order (father → mother → student).
4. **Hostel Ownership**: Verify player spawns in owned room; verify sleep/study works in owned room but is restricted when visiting other hostels.
5. **Department & Timetable**: Verify phone alerts arrive for scheduled lectures; confirm only registered department courses award CGPA; verify exploration of other faculties gives non-academic XP.
6. **Campus Physics & Transport**: Confirm player and NPCs cannot walk on pond water except via footbridge; verify keke travels along connected road network with chase camera.
7. **Compilation & Health**: Run `compile_applet` and test clean console execution with zero breaking errors.

---

## 6. Batch 1: Campus Reconstruction, Architecture, Collision & Navigation (COMPLETED)

### Key Architectural Upgrades Implemented:
1. **Mathematical BufferGeometry Roof Generators**:
   - Replaced all 3-sided rotated cylinder approximations with true symmetrical isosceles prisms (`createGableRoofGeometry`), 4-sided trapezoidal hipped roofs (`createHippedRoofGeometry`), pyramidal spires (`createPyramidalRoofGeometry`), classical ribbed domes with cupolas, and flat parapet roofs with roof deck penthouses and AC units.
   - Symmetrical pitch angles, eaves overhangs, and soffit closures eliminate all warping and gaps.

2. **Master Plan Road Network Integrity**:
   - Coherent hierarchy: Main Entrance Avenue, Central Roundabout Ring ($R = 14\text{m} - 24\text{m}$), North Senate Boulevard to Senate Plaza loop, Pond bypass roads ($x = \pm 26\text{m}$), West Academic Loop ($z = -48$), West Hostels Loop ($z = 55$), East Service Loop ($z = -48$, extended to $x = 182$), and East Commercial Loop ($z = 52$, extended to $x = 182$).
   - Closed road grid with dual eastern connector lanes at $x = 175$ and intermediate connectors at $x = 60, 100, 105, 145$.
   - Roads NEVER intersect building footprints, walls, or pond water.

3. **Master Plan Paved Pedestrian Walkway Network & Crosswalks**:
   - Dedicated stone walkways ($2.8\text{m} - 3.6\text{m}$ wide) linking the road network directly to every building entrance portico (Library, Engineering, Science, Commerce, Arts, Medicine, TETFund, Hostels, Supermarket, Eateries, Services, Health Centre, Interfaith Chapel/Mosque, Senate Esplanade).
   - Raised stone curb edging and zebra crosswalks across major campus intersections.

4. **Collision & Doorway Integrity Audit**:
   - Colliders strictly fitted to exact building dimensions without oversized phantom padding. Players can walk directly onto front porticos and trigger `[E] Enter` without being blocked by invisible physics walls.
   - Main Gate colliders restricted to towers and sentry island; vehicular lanes ($x \in [-8.5, -0.8]$ and $x \in [0.8, 8.5]$) are 100% open.
   - Walkable arched footbridge elevates characters cleanly ($y = 0.08 + (1 - |z - 80| / 18.2) \times 0.42$), while surrounding pond water blocks traversal.
   - Continuous perimeter fence with gatehouse and solid colliders encloses on-campus grounds; off-campus lodges are outside the perimeter.

5. **Vehicular Routing & Drop-off Precision**:
   - Keke and shuttle conveyance rides navigate road nodes and terminate precisely at the roadside passenger curb facing the building's pedestrian entrance walkway.
   - When disembarking, players are placed cleanly outside the front door threshold within the interaction zone.

6. **Campus Landmarks & Student Village Expansion**:
   - **The Omo Tower**: 36m landmark clock and bell tower at central roundabout with commemorative bronze plaques and 4 upward spotlights.
   - **Main Gate**: Dual gatehouse towers with battlements, Nigerian flag and FUO banner, 6.0m vehicular archway clearance, and exact institutional inscription.
   - **Mascot Statues**: 4 solid Monopoly gentleman statues on tiered pedestals at Gate, Roundabout, Academic Quad, and Commercial Promenade.
   - **Student Village Services**: 5 real gameplay services (Cybercafé & Print Hub, Executive Barber, Laundromat, Phone Gadgets Hub, Village Mini-Mart) plus Akara Stand and Campus Oasis Café.
