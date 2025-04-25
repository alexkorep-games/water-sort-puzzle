
**Game Title:** Color Liquid Sort Puzzle (or similar, e.g., Water Sort, Tube Sort Challenge)

**Platform:** Mobile (iOS, Android)

**Genre:** Puzzle, Logic, Casual

**Target Audience:** Casual gamers, puzzle enthusiasts, players looking for a relaxing yet mentally stimulating experience.

**Core Concept:**
A deceptively simple yet addictive logic puzzle game where players must sort colored liquids contained within multiple test tubes. The goal is to have each tube eventually contain only one distinct color by strategically pouring liquids between tubes.

**Game Objective:**
Rearrange the mixed colored liquids across the available test tubes so that each tube is filled entirely with a single color, or is completely empty.

**Gameplay Mechanics:**

1.  **Game Board:** The game presents the player with a set of test tubes (typically 6-12, increasing with difficulty). Each tube has a fixed capacity (e.g., 4 units of liquid). Some tubes start partially or fully filled with stacked layers of different colored liquids. Usually, one or more empty tubes are provided.
2.  **Pouring Action:**
    - **Selection:** The player taps on a tube they want to pour _from_. This tube is highlighted or slightly lifted to indicate selection.
    - **Destination:** The player then taps on a tube they want to pour _into_.
    - **Pouring Logic:** A pour is only possible if _all_ the following conditions are met:
      - The source tube is not empty.
      - The destination tube is not full.
      - The top-most color layer in the source tube matches the top-most color layer in the destination tube, OR the destination tube is completely empty.
    - **Liquid Transfer:** If the pour is valid, the top-most continuous block of the _same_ color from the source tube is transferred to the top of the liquid in the destination tube, until either the source tube's top color block is fully transferred, or the destination tube becomes full. Only the _top_ color can be poured.
3.  **Move Counter:** (As seen in the video) The game may track the number of pours (moves). Higher-level goals might involve solving the puzzle within a certain number of moves, or achieving the solution in the minimum possible moves. The video shows a "Moves Left" counter, suggesting a limit per level.
4.  **Winning Condition:** The level is successfully completed when every non-empty tube contains only a single color from bottom to top. A visual confirmation (like sparkles, a checkmark, or the tubes corking themselves, as seen in the video) and a "Level Complete" message are displayed.
5.  **Losing Condition (Optional):** If a "Moves Left" system is implemented, running out of moves before solving the puzzle results in a level failure. Alternatively, the game might simply let the player continue until solved or they choose to restart/undo.

**User Interface (UI) & User Experience (UX):**

1.  **Visuals:**
    - Clear, distinct colors for the liquids.
    - Visually appealing test tube designs.
    - Smooth pouring animation to provide feedback.
    - Clean background (the video shows a calming night road scene).
    - Progress bar/Star system at the top to indicate level progress or performance (e.g., 3 stars for optimal solution).
2.  **Controls:** Simple tap interface. Tap to select source, tap to select destination.
3.  **Feedback:**
    - Visual indication of the selected tube.
    - Animation of liquid pouring.
    - Sound effects for tapping and pouring (optional but recommended).
    - Clear indication of an invalid move (e.g., a slight shake, a sound effect, no action).
    - Celebratory animation/sound upon level completion.
4.  **Essential UI Elements (based on video):**
    - Game area with test tubes.
    - Moves Left counter.
    - Star display/Progress bar.
    - **Undo Button:** Reverts the last move. Often has a limited number of uses or is tied to a resource/ad view (Video shows `1879` available).
    - **Restart Button:** Resets the current level to its initial state (Video shows this on the win screen as "Retry").
    - **Hint Button:** Provides a suggestion for the next valid move (optional, potentially tied to a resource/ad view) (Video shows `1120` available).
    - **Add Tube Button:** Adds an extra empty tube to the board temporarily or permanently for the level, making it easier (optional, potentially tied to a resource/ad view) (Video shows `424` available).
    - Level Number indicator (usually implicit or shown on a level select screen).
    - Settings access (sound, music toggles, etc. - not shown but standard).
    - Win Screen: Shows "Amazing!", star rating, coins earned, "Retry" and "Next" buttons.

**Progression & Difficulty:**

1.  **Levels:** The game is level-based.
2.  **Difficulty Curve:** Difficulty increases gradually by:
    - Increasing the number of tubes.
    - Increasing the number of different colors.
    - Starting with more complex liquid arrangements requiring more steps.
    - Reducing the number of initial empty tubes.
    - Decreasing the "Moves Left" limit (if applicable).
3.  **Unlocking:** Levels are typically unlocked sequentially upon completing the previous one.

**Monetization (Inferred from UI elements):**

1.  **In-App Advertisements:**
    - Interstitial ads (shown between levels or after a certain number of moves/retries).
    - Rewarded ads: Players can watch ads to get free Undos, Hints, extra Tubes, or revive if they fail a level.
2.  **In-App Purchases (IAPs):**
    - Purchase currency (like the numbers shown on the buttons) to buy Undos, Hints, extra Tubes.
    - Purchase "Remove Ads" option.
    - Bundles (e.g., starter pack with currency and ad removal).

**Technical Considerations:**

- **Engine:** Unity, Godot, or native development.
- **Art Style:** Clean 2D vector art or simple, appealing 3D models.
- **Physics:** No complex physics needed, just animation logic for pouring.
- **Save System:** Needs to save player progress (current level, currency, purchased items).

**Potential Enhancements:**

- Themes/Skins: Allow players to change the appearance of tubes, liquids, or backgrounds.
- Daily Challenges: Special levels offered daily.
- Time Attack Mode: Solve levels as quickly as possible.
- Leaderboards: Rank players based on level completion time or moves used.

