# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing/landing.spec.ts >> Visual check [Desktop] for helix
- Location: tests/landing/landing.spec.ts:12:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 1280px by 7762px, received 1280px by 7735px. 311171 pixels (ratio 0.04 of all image pixels) are different.

  Snapshot: helix-desktop.png

Call log:
  - Expect "toHaveScreenshot(helix-desktop.png)" with timeout 80000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 7762px, received 1280px by 7735px. 311171 pixels (ratio 0.04 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 7762px, received 1280px by 7735px. 311171 pixels (ratio 0.04 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e5]:
        - button "Sign In" [ref=e6] [cursor=pointer]
        - button "Toggle navigation menu" [ref=e7] [cursor=pointer]
      - list [ref=e11]:
        - listitem [ref=e12]:
          - link [ref=e13] [cursor=pointer]:
            - /url: /play
            - text: Play Now
        - listitem [ref=e14]:
          - link [ref=e15] [cursor=pointer]:
            - /url: /portal/market
            - text: Market
        - listitem [ref=e16]:
          - link [ref=e17] [cursor=pointer]:
            - /url: /leaderboard
            - text: Leaderboard
    - main [ref=e18]:
      - region "Hero" [ref=e19]:
        - generic [ref=e25]:
          - paragraph [ref=e26]: HELIX · SIGNAL GRID
          - heading "Keep the Signal. Field the Frames." [level=1] [ref=e27]:
            - text: Keep the Signal.
            - generic [ref=e28]: Field the Frames.
          - paragraph [ref=e29]: Aboard the Spire, four labs still hold a clean link — Hab, Cryo, Reactor, and Relay. Collect robot Frames, tune precise decks, and trade on a bright market before Static eats the grid.
        - list [ref=e30]:
          - listitem [ref=e31]:
            - article [ref=e32] [cursor=pointer]:
              - generic [ref=e33]:
                - generic "Mana 2" [ref=e34]:
                  - generic [ref=e35]: "2"
                - generic "Atrium lab" [ref=e36]
                - generic "Signal 1" [ref=e37]:
                  - generic [ref=e38]: "1"
                - generic "Integrity 2" [ref=e39]:
                  - generic [ref=e40]: "2"
                - heading "Hab Tender" [level=3] [ref=e42]
          - listitem [ref=e43]:
            - article [ref=e44] [cursor=pointer]:
              - generic [ref=e45]:
                - generic "Mana 2" [ref=e46]:
                  - generic [ref=e47]: "2"
                - generic "Reservoir lab" [ref=e48]
                - generic "Signal 1" [ref=e49]:
                  - generic [ref=e50]: "1"
                - generic "Integrity 3" [ref=e51]:
                  - generic [ref=e52]: "3"
                - heading "Cryo Tender" [level=3] [ref=e54]
          - listitem [ref=e55]:
            - article [ref=e56] [cursor=pointer]:
              - generic [ref=e57]:
                - generic "Mana 2" [ref=e58]:
                  - generic [ref=e59]: "2"
                - generic "Core lab" [ref=e60]
                - generic "Signal 1" [ref=e61]:
                  - generic [ref=e62]: "1"
                - generic "Integrity 3" [ref=e63]:
                  - generic [ref=e64]: "3"
                - heading "Ring Keeper" [level=3] [ref=e66]
          - listitem [ref=e67]:
            - article [ref=e68] [cursor=pointer]:
              - generic [ref=e69]:
                - generic "Mana 2" [ref=e70]:
                  - generic [ref=e71]: "2"
                - generic "Antenna lab" [ref=e72]
                - generic "Signal 1" [ref=e73]:
                  - generic [ref=e74]: "1"
                - generic "Integrity 2" [ref=e75]:
                  - generic [ref=e76]: "2"
                - heading "Relay Ghost" [level=3] [ref=e78]
          - listitem [ref=e79]:
            - article [ref=e80] [cursor=pointer]:
              - generic [ref=e81]:
                - generic "Mana 4" [ref=e82]:
                  - generic [ref=e83]: "4"
                - generic "Atrium lab" [ref=e84]
                - generic "Signal 2" [ref=e85]:
                  - generic [ref=e86]: "2"
                - generic "Integrity 4" [ref=e87]:
                  - generic [ref=e88]: "4"
                - heading "Root Cable Walker" [level=3] [ref=e90]
          - listitem [ref=e91]:
            - article [ref=e92] [cursor=pointer]:
              - generic [ref=e93]:
                - generic "Mana 4" [ref=e94]:
                  - generic [ref=e95]: "4"
                - generic "Antenna lab" [ref=e96]
                - generic "Signal 2" [ref=e97]:
                  - generic [ref=e98]: "2"
                - generic "Integrity 4" [ref=e99]:
                  - generic [ref=e100]: "4"
                - heading "Dish Walker" [level=3] [ref=e102]
      - region "Labs" [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e105]:
            - paragraph [ref=e106]: GRID INDEX // 01
            - heading "Tour the Labs" [level=3] [ref=e107]
            - paragraph [ref=e108]:
              - text: The Spire's Relay Grid is thinning. A noise called
              - strong [ref=e109]: Static
              - text: crawls through conduits and frost glass, eroding the
              - strong [ref=e110]: Signal
              - text: — the coherent link that lets Hab grow, Cryo hold, Core warm, and Antenna listen.
          - generic [ref=e111]:
            - complementary "Lab channels" [ref=e112]:
              - button "01 Atrium" [pressed] [ref=e113] [cursor=pointer]:
                - generic [ref=e114]: "01"
                - generic [ref=e115]: Atrium
              - button "02 Reservoir" [ref=e117] [cursor=pointer]:
                - generic [ref=e118]: "02"
                - generic [ref=e119]: Reservoir
              - button "03 Core" [ref=e121] [cursor=pointer]:
                - generic [ref=e122]: "03"
                - generic [ref=e123]: Core
              - button "04 Antenna" [ref=e125] [cursor=pointer]:
                - generic [ref=e126]: "04"
                - generic [ref=e127]: Antenna
            - generic [ref=e131]:
              - generic [ref=e132]: CHANNEL
              - strong [ref=e133]: Atrium
              - generic [ref=e134]: The Living Hab
      - region "Labs" [ref=e135]:
        - generic [ref=e136]:
          - generic [ref=e137]:
            - heading "The Four Labs" [level=2] [ref=e138]
            - paragraph [ref=e139]: Aboard the Spire, four labs still keep a clean link. Atrium's living Hab, Reservoir's frost circuit, Core's warm engine, and Antenna's open relay are home to Frames, thoughtful decks, and players who compete without drowning in Static. Tour the labs before the last Signal dissolves into noise.
          - list [ref=e140]:
            - listitem [ref=e141]:
              - article [ref=e142]:
                - generic: BAY 01
                - generic [ref=e144]:
                  - heading "Atrium" [level=3] [ref=e145]
                  - paragraph [ref=e146]: Hab Lab
                  - generic [ref=e147]:
                    - heading "Hydroponic Hall" [level=4] [ref=e148]
                    - paragraph [ref=e149]: Tall glass planters climb the Atrium ribs; soft canopy light filters through leaf and cable while condensation beads on clean steel rails.
                - generic [ref=e150]:
                  - tablist "Atrium sites" [ref=e151]:
                    - tab "Hydroponic Hall (1 of 3)" [selected] [ref=e152] [cursor=pointer]
                    - tab "Root-Cable Garden (2 of 3)" [ref=e153] [cursor=pointer]
                    - tab "Canopy Observatory (3 of 3)" [ref=e154] [cursor=pointer]
                  - generic [ref=e155]:
                    - button "Previous site in Atrium" [ref=e156] [cursor=pointer]:
                      - generic [ref=e157]: ‹
                    - button "Next site in Atrium" [ref=e158] [cursor=pointer]:
                      - generic [ref=e159]: ›
            - listitem [ref=e160]:
              - article [ref=e161]:
                - generic: BAY 02
                - generic [ref=e163]:
                  - heading "Reservoir" [level=3] [ref=e164]
                  - paragraph [ref=e165]: Cryo Lab
                  - generic [ref=e166]:
                    - heading "Frost Glass Bay" [level=4] [ref=e167]
                    - paragraph [ref=e168]: A wide bay of frosted panes overlooks stacked cryo tanks; pale cyan reflections slide across the floor like slow tides.
                - generic [ref=e169]:
                  - tablist "Reservoir sites" [ref=e170]:
                    - tab "Frost Glass Bay (1 of 3)" [selected] [ref=e171] [cursor=pointer]
                    - tab "Coolant River (2 of 3)" [ref=e172] [cursor=pointer]
                    - tab "Cryo Vault Terrace (3 of 3)" [ref=e173] [cursor=pointer]
                  - generic [ref=e174]:
                    - button "Previous site in Reservoir" [ref=e175] [cursor=pointer]:
                      - generic [ref=e176]: ‹
                    - button "Next site in Reservoir" [ref=e177] [cursor=pointer]:
                      - generic [ref=e178]: ›
            - listitem [ref=e179]:
              - article [ref=e180]:
                - generic: BAY 03
                - generic [ref=e182]:
                  - heading "Core" [level=3] [ref=e183]
                  - paragraph [ref=e184]: Reactor Lab
                  - generic [ref=e185]:
                    - heading "Reactor Ring" [level=4] [ref=e186]
                    - paragraph [ref=e187]: A circular reactor gallery glows with warm instrument amber; railings and conduits form clean geometric arcs under lab lighting.
                - generic [ref=e188]:
                  - tablist "Core sites" [ref=e189]:
                    - tab "Reactor Ring (1 of 3)" [selected] [ref=e190] [cursor=pointer]
                    - tab "Plasma Conduit Walk (2 of 3)" [ref=e191] [cursor=pointer]
                    - tab "Instrument Amber Hall (3 of 3)" [ref=e192] [cursor=pointer]
                  - generic [ref=e193]:
                    - button "Previous site in Core" [ref=e194] [cursor=pointer]:
                      - generic [ref=e195]: ‹
                    - button "Next site in Core" [ref=e196] [cursor=pointer]:
                      - generic [ref=e197]: ›
            - listitem [ref=e198]:
              - article [ref=e199]:
                - generic: BAY 04
                - generic [ref=e201]:
                  - heading "Antenna" [level=3] [ref=e202]
                  - paragraph [ref=e203]: Relay Lab
                  - generic [ref=e204]:
                    - heading "Observation Spine" [level=4] [ref=e205]
                    - paragraph [ref=e206]: A long spine of viewports looks into deep space; violet signal haze drifts past antenna lattices outside the glass.
                - generic [ref=e207]:
                  - tablist "Antenna sites" [ref=e208]:
                    - tab "Observation Spine (1 of 3)" [selected] [ref=e209] [cursor=pointer]
                    - tab "Void Dish Field (2 of 3)" [ref=e210] [cursor=pointer]
                    - tab "Signal Mist Gallery (3 of 3)" [ref=e211] [cursor=pointer]
                  - generic [ref=e212]:
                    - button "Previous site in Antenna" [ref=e213] [cursor=pointer]:
                      - generic [ref=e214]: ‹
                    - button "Next site in Antenna" [ref=e215] [cursor=pointer]:
                      - generic [ref=e216]: ›
      - region "Ops protocol" [ref=e217]:
        - generic [ref=e218]:
          - generic [ref=e219]:
            - paragraph [ref=e220]: OPS PROTOCOL // SIGNAL LOOP
            - heading "How Helix Plays" [level=2] [ref=e221]
            - paragraph [ref=e222]: Four labs, one precise battlefield — assemble a deck, outmaneuver rivals in turn-based duels, and climb the seasonal ladder with a clean Signal.
          - list [ref=e223]:
            - listitem [ref=e224]:
              - article [ref=e225]:
                - generic [ref=e226]: STEP 01
                - generic [ref=e228]:
                  - heading "Lab Tactics" [level=3] [ref=e229]
                  - paragraph [ref=e230]: Trade lines on a living board where timing, lane pressure, and burst windows matter more than raw stats. Win the turn before you win the match.
            - listitem [ref=e231]:
              - article [ref=e232]:
                - generic [ref=e233]: STEP 02
                - generic [ref=e235]:
                  - heading "Frame Collecting" [level=3] [ref=e236]
                  - paragraph [ref=e237]: Pull Frames from Atrium, Reservoir, Core, and Antenna — then stitch keywords, curves, and finishers into a list that rewards precision.
            - listitem [ref=e238]:
              - article [ref=e239]:
                - generic [ref=e240]: STEP 03
                - generic [ref=e242]:
                  - heading "Seasonal Ladder" [level=3] [ref=e243]
                  - paragraph [ref=e244]: Climb seasonal tiers, learn from losses, and refine your lines. The summit rewards players who adapt without losing the Signal.
          - list [ref=e245]:
            - listitem [ref=e246]:
              - generic [ref=e247]:
                - generic [ref=e248]: ◇
                - text: Deck Tuning
            - listitem [ref=e249]:
              - generic [ref=e250]:
                - generic [ref=e251]: ◇
                - text: Lab Affinities
            - listitem [ref=e252]:
              - generic [ref=e253]:
                - generic [ref=e254]: ◇
                - text: Shifting Metas
      - region "Frame catalog" [ref=e255]:
        - generic [ref=e256]:
          - generic [ref=e257]:
            - paragraph [ref=e258]: CATALOG // FRAME INDEX
            - heading "Helix Catalog" [level=2] [ref=e259]
            - paragraph [ref=e260]: Every card is a calibrated choice — drawn from Hab, Cryo, Reactor, and Relay, tuned for precise play, and expanded every season. Explore a living collection built for operators and ladder climbers alike.
          - list [ref=e261]:
            - listitem [ref=e262]:
              - generic [ref=e263]: 600+
              - generic [ref=e264]: Unique Cards
            - listitem [ref=e265]:
              - generic [ref=e266]: "5"
              - generic [ref=e267]: Print Tiers
            - listitem [ref=e268]:
              - generic [ref=e269]: ∞
              - generic [ref=e270]: Deck Strategies
            - listitem [ref=e271]:
              - generic [ref=e272]: 25+
              - generic [ref=e273]: New Cards Monthly
          - generic [ref=e274]:
            - generic [ref=e275]:
              - paragraph: SPECIMEN SCAN
              - generic [ref=e276]:
                - generic [ref=e277]:
                  - generic:
                    - generic:
                      - article:
                        - generic:
                          - generic "Mana 4":
                            - generic: "4"
                          - generic "Atrium lab"
                          - generic:
                            - generic:
                              - generic "Signal 2":
                                - generic: "2"
                              - generic "Integrity 4":
                                - generic: "4"
                            - generic:
                              - heading "Root Cable Walker" [level=3]
                              - generic:
                                - strong: Root-Network Stasis
                                - paragraph: "Hardline: Opponents must engage this Frame before others when able. Shield: The next harm this Frame would take is redirected to the Shield buffer instead."
                              - list "Keywords":
                                - listitem: Shield
                                - listitem: Hardline
                - paragraph [ref=e278]:
                  - generic [ref=e279]: Atrium Lab
                  - generic [ref=e280]: Root Cable Walker
            - list [ref=e281]:
              - listitem [ref=e282]:
                - button "Preview Root Cable Walker" [pressed] [ref=e283] [cursor=pointer]:
                  - article [ref=e284]:
                    - generic [ref=e285]:
                      - generic "Mana 4" [ref=e286]:
                        - generic [ref=e287]: "4"
                      - generic "Atrium lab" [ref=e288]
                      - generic "Signal 2" [ref=e289]:
                        - generic [ref=e290]: "2"
                      - generic "Integrity 4" [ref=e291]:
                        - generic [ref=e292]: "4"
                      - heading "Root Cable Walker" [level=3] [ref=e294]
              - listitem [ref=e295]:
                - button "Preview Frost Glass Drone" [ref=e296] [cursor=pointer]:
                  - article [ref=e297]:
                    - generic [ref=e298]:
                      - generic "Mana 4" [ref=e299]:
                        - generic [ref=e300]: "4"
                      - generic "Reservoir lab" [ref=e301]
                      - generic "Signal 2" [ref=e302]:
                        - generic [ref=e303]: "2"
                      - generic "Integrity 4" [ref=e304]:
                        - generic [ref=e305]: "4"
                      - heading "Frost Glass Drone" [level=3] [ref=e307]
              - listitem [ref=e308]:
                - button "Preview Conduit Frame" [ref=e309] [cursor=pointer]:
                  - article [ref=e310]:
                    - generic [ref=e311]:
                      - generic "Mana 4" [ref=e312]:
                        - generic [ref=e313]: "4"
                      - generic "Core lab" [ref=e314]
                      - generic "Signal 2" [ref=e315]:
                        - generic [ref=e316]: "2"
                      - generic "Integrity 4" [ref=e317]:
                        - generic [ref=e318]: "4"
                      - heading "Conduit Frame" [level=3] [ref=e320]
              - listitem [ref=e321]:
                - button "Preview Dish Walker" [ref=e322] [cursor=pointer]:
                  - article [ref=e323]:
                    - generic [ref=e324]:
                      - generic "Mana 4" [ref=e325]:
                        - generic [ref=e326]: "4"
                      - generic "Antenna lab" [ref=e327]
                      - generic "Signal 2" [ref=e328]:
                        - generic [ref=e329]: "2"
                      - generic "Integrity 4" [ref=e330]:
                        - generic [ref=e331]: "4"
                      - heading "Dish Walker" [level=3] [ref=e333]
              - listitem [ref=e334]:
                - button "Preview Canopy Drone" [ref=e335] [cursor=pointer]:
                  - article [ref=e336]:
                    - generic [ref=e337]:
                      - generic "Mana 6" [ref=e338]:
                        - generic [ref=e339]: "6"
                      - generic "Atrium lab" [ref=e340]
                      - generic "Signal 3" [ref=e341]:
                        - generic [ref=e342]: "3"
                      - generic "Integrity 5" [ref=e343]:
                        - generic [ref=e344]: "5"
                      - heading "Canopy Drone" [level=3] [ref=e346]
              - listitem [ref=e347]:
                - button "Preview Coolant Runner" [ref=e348] [cursor=pointer]:
                  - article [ref=e349]:
                    - generic [ref=e350]:
                      - generic "Mana 6" [ref=e351]:
                        - generic [ref=e352]: "6"
                      - generic "Reservoir lab" [ref=e353]
                      - generic "Signal 4" [ref=e354]:
                        - generic [ref=e355]: "4"
                      - generic "Integrity 5" [ref=e356]:
                        - generic [ref=e357]: "5"
                      - heading "Coolant Runner" [level=3] [ref=e359]
              - listitem [ref=e360]:
                - button "Preview Amber Pilot" [ref=e361] [cursor=pointer]:
                  - article [ref=e362]:
                    - generic [ref=e363]:
                      - generic "Mana 6" [ref=e364]:
                        - generic [ref=e365]: "6"
                      - generic "Core lab" [ref=e366]
                      - generic "Signal 3" [ref=e367]:
                        - generic [ref=e368]: "3"
                      - generic "Integrity 6" [ref=e369]:
                        - generic [ref=e370]: "6"
                      - heading "Amber Pilot" [level=3] [ref=e372]
              - listitem [ref=e373]:
                - button "Preview Signal Mist Frame" [ref=e374] [cursor=pointer]:
                  - article [ref=e375]:
                    - generic [ref=e376]:
                      - generic "Mana 6" [ref=e377]:
                        - generic [ref=e378]: "6"
                      - generic "Antenna lab" [ref=e379]
                      - generic "Signal 3" [ref=e380]:
                        - generic [ref=e381]: "3"
                      - generic "Integrity 6" [ref=e382]:
                        - generic [ref=e383]: "6"
                      - heading "Signal Mist Frame" [level=3] [ref=e385]
      - region "Market ops" [ref=e386]:
        - generic [ref=e387]:
          - generic [ref=e388]:
            - paragraph [ref=e389]: MARKET OPS // TRADE PROTOCOL
            - heading "Collect. Trade. Calibrate." [level=2] [ref=e390]
            - paragraph [ref=e391]: Helix rewards precision — stock your binder from sealed bundles and open listings, pass along duplicates for credits, and shape a deck that wins cleanly.
          - list [ref=e392]:
            - listitem [ref=e393]:
              - article [ref=e394]:
                - generic [ref=e395]: CH-01
                - generic [ref=e397]:
                  - heading "Grow Your Binder" [level=3] [ref=e398]
                  - paragraph [ref=e399]: Add depth across labs and seasonal releases. Every new pull opens another line you can run when the ladder shifts.
            - listitem [ref=e400]:
              - article [ref=e401]:
                - generic [ref=e402]: CH-02
                - generic [ref=e404]:
                  - heading "Precise Shopping" [level=3] [ref=e405]
                  - paragraph [ref=e406]: Filter the catalog, find the missing Frame, and buy exactly what your curve has been waiting for — clean signal, no noise.
            - listitem [ref=e407]:
              - article [ref=e408]:
                - generic [ref=e409]: CH-03
                - generic [ref=e411]:
                  - heading "Open Sealed Bundles" [level=3] [ref=e412]
                  - paragraph [ref=e413]: Crack sealed products and chase a standout pull. Each unopened bundle is a small surprise — chase card or trade bait.
            - listitem [ref=e414]:
              - article [ref=e415]:
                - generic [ref=e416]: CH-04
                - generic [ref=e418]:
                  - heading "Chase Prime Prints" [level=3] [ref=e419]
                  - paragraph [ref=e420]: Hunt foils, Singularity Frames, and signature prints — the kind of card that rewrites a deck and makes opponents pause.
            - listitem [ref=e421]:
              - article [ref=e422]:
                - generic [ref=e423]: CH-05
                - generic [ref=e425]:
                  - heading "Pass Along Duplicates" [level=3] [ref=e426]
                  - paragraph [ref=e427]: Extras still have value. List them, fund the next upgrade, and keep your binder lean for the decks you actually play.
            - listitem [ref=e428]:
              - article [ref=e429]:
                - generic [ref=e430]: CH-06
                - generic [ref=e432]:
                  - heading "Tune Your Deck" [level=3] [ref=e433]
                  - paragraph [ref=e434]: Prototype lists in the deck lab — test counters, stress synergies, and lock a 30-card answer to the ladder's current pace.
          - paragraph [ref=e435]: PRINT GRADE // SPECTRUM
          - list [ref=e436]:
            - listitem [ref=e437]:
              - article [ref=e438]:
                - generic [ref=e439]: CALIBRATED
                - heading "Everyday Frames" [level=3] [ref=e440]
                - paragraph [ref=e441]: Reliable units and utility pieces that glue a list together — flexible enough to slot into multiple strategies.
            - listitem [ref=e442]:
              - article [ref=e443]:
                - generic [ref=e444]: PRIME
                - heading "Lab Prints" [level=3] [ref=e445]
                - paragraph [ref=e446]: Standout prints with real board presence — alternate art, foil shine, and effects that reward thoughtful building.
            - listitem [ref=e447]:
              - article [ref=e448]:
                - generic [ref=e449]: SINGULARITY
                - heading "Spire Guardians" [level=3] [ref=e450]
                - paragraph [ref=e451]: High-impact Frames and engines that can close a match with precision. One well-timed play can settle the board.
          - generic [ref=e452]:
            - generic [ref=e453]: LIVE FEED
            - paragraph [ref=e454]: Hundreds of listings live right now — find the Frame that completes your next deck.
            - button "Browse the Market" [ref=e455] [cursor=pointer]
      - region "FAQ" [ref=e456]:
        - generic [ref=e457]:
          - heading "Frequently Asked Questions" [level=2] [ref=e459]
          - list [ref=e460]:
            - listitem [ref=e461]:
              - button "What is Helix?" [ref=e462] [cursor=pointer]:
                - generic [ref=e463]: What is Helix?
            - listitem [ref=e465]:
              - button "How do I start playing?" [ref=e466] [cursor=pointer]:
                - generic [ref=e467]: How do I start playing?
            - listitem [ref=e469]:
              - button "What are credits used for?" [ref=e470] [cursor=pointer]:
                - generic [ref=e471]: What are credits used for?
            - listitem [ref=e473]:
              - button "Can I trade or sell my cards?" [ref=e474] [cursor=pointer]:
                - generic [ref=e475]: Can I trade or sell my cards?
            - listitem [ref=e477]:
              - button "Is Helix free to play?" [ref=e478] [cursor=pointer]:
                - generic [ref=e479]: Is Helix free to play?
      - region "Deploy gate" [ref=e481]:
        - generic [ref=e483]:
          - paragraph [ref=e484]: DEPLOY // MATCH READY
          - generic [ref=e485]:
            - heading "Hold the Link" [level=2] [ref=e486]
            - paragraph [ref=e487]: Tour the labs. Keep the Signal.
            - paragraph [ref=e488]: Join a community of operators, market traders, and ladder climbers who compete with precision. Collect Frames, shape clean strategies, and leave your mark on the four labs of Helix.
          - generic [ref=e489]:
            - heading "The Signal Season" [level=3] [ref=e490]
            - list [ref=e491]:
              - listitem [ref=e492]:
                - generic [ref=e493]: "01"
                - generic [ref=e494]: Operators
                - generic [ref=e495]: 12K+
              - listitem [ref=e496]:
                - generic [ref=e497]: "02"
                - generic [ref=e498]: Daily Matches
                - generic [ref=e499]: 48K+
              - listitem [ref=e500]:
                - generic [ref=e501]: "03"
                - generic [ref=e502]: Frames Collected
                - generic [ref=e503]: 2M+
          - generic [ref=e504]:
            - generic [ref=e505]: READY
            - paragraph [ref=e506]: Open a match and hold the Signal.
            - button "Play Now" [ref=e507] [cursor=pointer]
    - contentinfo "Site footer" [ref=e508]:
      - generic [ref=e509]:
        - generic [ref=e510]:
          - generic [ref=e511]:
            - link [ref=e513] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e514]: Keep the Signal. Field the Frames.
          - generic [ref=e515]:
            - heading "Legal" [level=3] [ref=e516]
            - list [ref=e517]:
              - listitem [ref=e518]:
                - link "Terms of Service" [ref=e519] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e520]:
                - link "Privacy Notice" [ref=e521] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e522]:
                - link "Cancellation & Refund Policy" [ref=e523] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e524]:
                - link "Disclaimer" [ref=e525] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e526]:
                - link "Cookie Policy" [ref=e527] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e528]:
            - heading "Contact" [level=3] [ref=e529]
            - list [ref=e530]:
              - listitem [ref=e531]: "Company name: Test LTD"
              - listitem [ref=e532]: "Company number: 00000000"
              - listitem [ref=e533]: "Registered address: 123 Example Street, Testville, TE1 1ST, United Kingdom"
              - listitem [ref=e534]:
                - link "support@helixsignal.online" [ref=e535] [cursor=pointer]:
                  - /url: mailto:support@helixsignal.online
            - list "Social media" [ref=e536]:
              - listitem [ref=e537]:
                - generic "Telegram" [ref=e538]
              - listitem [ref=e540]:
                - generic "Instagram" [ref=e541]
              - listitem [ref=e543]:
                - generic "Facebook" [ref=e544]
              - listitem [ref=e546]:
                - generic "Discord" [ref=e547]
            - generic "Accepted payment methods" [ref=e549]
        - generic [ref=e550]:
          - paragraph [ref=e551]: © 2026 Helix. All rights reserved.
          - button "Cookie Settings" [ref=e552] [cursor=pointer]
  - alert [ref=e553]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { UI_TEST_SITES } from '../../helpers/sites';
  3   | 
  4   | // Увеличиваем общий таймаут для тестов (особенно полезно для Firefox)
  5   | test.setTimeout(120000);
  6   | 
  7   | /** Sites come from helpers/sites.ts (shared with portal). */
  8   | const sites = UI_TEST_SITES;
  9   | 
  10  | for (const site of sites) {
  11  |   // 1) Десктопный тест
  12  |   test(`Visual check [Desktop] for ${site.name}`, async ({ page }) => {
  13  |     await page.setViewportSize({ width: 1280, height: 800 });
  14  |     await page.goto(site.url, { waitUntil: 'domcontentloaded' });
  15  | 
  16  |     // Отключаем анимации, переходы и ПОЛНОСТЬЮ убираем картинки/видео/фоны
  17  |     await page.addStyleTag({
  18  |       content: `
  19  |         *, *::before, *::after { 
  20  |           animation: none !important; 
  21  |           transition: none !important; 
  22  |           opacity: 1 !important; 
  23  |           transform: none !important; 
  24  |         }
  25  |         img, video, canvas {
  26  |           visibility: hidden !important; /* скрываем все картинки и видео, оставляя под них пустые места */
  27  |         }
  28  |         [style*="background-image"] {
  29  |           background-image: none !important; /* убираем рандомные фоновые картинки */
  30  |         }
  31  |       `
  32  |     });
  33  | 
  34  |     // Скроллим до низа, чтобы сработали все ленивые загрузки
  35  |     await page.evaluate(async () => {
  36  |       await new Promise<void>((resolve) => {
  37  |         let totalHeight = 0;
  38  |         const distance = 300;
  39  |         const timer = setInterval(() => {
  40  |           window.scrollBy(0, distance);
  41  |           totalHeight += distance;
  42  |           if (totalHeight >= document.body.scrollHeight) {
  43  |             clearInterval(timer);
  44  |             resolve();
  45  |           }
  46  |         }, 30);
  47  |       });
  48  |     });
  49  | 
  50  |     // Возвращаем скролл наверх и ждем стабилизации
  51  |     await page.evaluate(() => window.scrollTo(0, 0));
  52  |     await page.waitForTimeout(1000);
  53  | 
  54  |     const screenshotOptions = { 
  55  |       fullPage: true, 
  56  |       timeout: 80000,
  57  |       maxDiffPixelRatio: 0.01,
  58  |     };
  59  | 
> 60  |     await expect(page).toHaveScreenshot(`${site.name}-desktop.png`, screenshotOptions);
      |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  61  |   });
  62  | 
  63  |   // 2) Мобильный тест
  64  |   test(`Visual check [Mobile] for ${site.name}`, async ({ page }) => {
  65  |     await page.setViewportSize({ width: 390, height: 844 });
  66  |     await page.goto(site.url, { waitUntil: 'domcontentloaded' });
  67  | 
  68  |     // Тотальное отключение анимаций и медиа для мобилки
  69  |     await page.addStyleTag({
  70  |       content: `
  71  |         *, *::before, *::after { 
  72  |           animation: none !important; 
  73  |           transition: none !important; 
  74  |           opacity: 1 !important; 
  75  |           transform: none !important; 
  76  |         }
  77  |         img, video, canvas {
  78  |           visibility: hidden !important;
  79  |         }
  80  |         [style*="background-image"] {
  81  |           background-image: none !important;
  82  |         }
  83  |       `
  84  |     });
  85  | 
  86  |     await page.evaluate(async () => {
  87  |       await new Promise<void>((resolve) => {
  88  |         let totalHeight = 0;
  89  |         const distance = 300;
  90  |         const timer = setInterval(() => {
  91  |           window.scrollBy(0, distance);
  92  |           totalHeight += distance;
  93  |           if (totalHeight >= document.body.scrollHeight) {
  94  |             clearInterval(timer);
  95  |             resolve();
  96  |           }
  97  |         }, 30);
  98  |       });
  99  |     });
  100 | 
  101 |     await page.evaluate(() => window.scrollTo(0, 0));
  102 |     await page.waitForTimeout(1000);
  103 | 
  104 |     const screenshotOptions = { 
  105 |       fullPage: true, 
  106 |       timeout: 80000,
  107 |       maxDiffPixelRatio: 0.01,
  108 |     };
  109 | 
  110 |     await expect(page).toHaveScreenshot(`${site.name}-mobile.png`, screenshotOptions);
  111 |   });
  112 | }
```