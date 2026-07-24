# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing/landing.spec.ts >> Visual check [Desktop] for komorebi
- Location: tests/landing/landing.spec.ts:12:7

# Error details

```
Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/komorebi-desktop-landing-linux.png, writing actual.
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
        - generic:
          - generic:
            - article [ref=e24] [cursor=pointer]:
              - generic [ref=e25]:
                - generic "Mana 4" [ref=e26]:
                  - generic [ref=e27]: 四
                - generic "Shinrin domain" [ref=e28]
                - generic "Spirit 2" [ref=e29]:
                  - generic [ref=e30]: 二
                - generic "Calm 6" [ref=e31]:
                  - generic [ref=e32]: 六
                - heading "Kodama Keeper" [level=3] [ref=e34]
            - article [ref=e36] [cursor=pointer]:
              - generic [ref=e37]:
                - generic "Mana 2" [ref=e38]:
                  - generic [ref=e39]: 二
                - generic "Shinrin domain" [ref=e40]
                - generic "Spirit 1" [ref=e41]:
                  - generic [ref=e42]: 一
                - generic "Calm 4" [ref=e43]:
                  - generic [ref=e44]: 四
                - heading "Maple Spirit" [level=3] [ref=e46]
            - article [ref=e48] [cursor=pointer]:
              - generic [ref=e49]:
                - generic "Mana 3" [ref=e50]:
                  - generic [ref=e51]: 三
                - generic "Naminami domain" [ref=e52]
                - generic "Spirit 2" [ref=e53]:
                  - generic [ref=e54]: 二
                - generic "Calm 3" [ref=e55]:
                  - generic [ref=e56]: 三
                - heading "Shore Heron" [level=3] [ref=e58]
          - generic:
            - article [ref=e60] [cursor=pointer]:
              - generic [ref=e61]:
                - generic "Mana 4" [ref=e62]:
                  - generic [ref=e63]: 四
                - generic "Naminami domain" [ref=e64]
                - generic "Spirit 2" [ref=e65]:
                  - generic [ref=e66]: 二
                - generic "Calm 5" [ref=e67]:
                  - generic [ref=e68]: 五
                - heading "Tide Listener" [level=3] [ref=e70]
            - article [ref=e72] [cursor=pointer]:
              - generic [ref=e73]:
                - generic "Mana 3" [ref=e74]:
                  - generic [ref=e75]: 三
                - generic "Akari domain" [ref=e76]
                - generic "Spirit 1" [ref=e77]:
                  - generic [ref=e78]: 一
                - generic "Calm 5" [ref=e79]:
                  - generic [ref=e80]: 五
                - heading "Lantern Tender" [level=3] [ref=e82]
            - article [ref=e84] [cursor=pointer]:
              - generic [ref=e85]:
                - generic "Mana 4" [ref=e86]:
                  - generic [ref=e87]: 四
                - generic "Takane domain" [ref=e88]
                - generic "Spirit 2" [ref=e89]:
                  - generic [ref=e90]: 二
                - generic "Calm 4" [ref=e91]:
                  - generic [ref=e92]: 四
                - heading "Breeze Shepherd" [level=3] [ref=e94]
        - generic [ref=e97]:
          - paragraph [ref=e98]: 木漏れ日 · Komorebi
          - heading "Find the Quiet. Collect Gentle Moments." [level=1] [ref=e99]:
            - text: Find the Quiet.
            - generic [ref=e100]: Collect Gentle Moments.
          - paragraph [ref=e101]: Past the last train stop, four countryside wards still breathe slowly — cedar shade, tide hush, hearth glow, and highland breeze. Collect their gentle spirits, build thoughtful decks, and wander a calm market without breaking the stillness.
      - region "Locations" [ref=e102]:
        - generic [ref=e104]:
          - generic [ref=e105]:
            - generic [ref=e106]:
              - heading "Wander the Wards" [level=3] [ref=e107]
              - paragraph [ref=e109]:
                - text: The old balance of the countryside is thinning. A restless current called the
                - strong [ref=e110]: Haru-kaze
                - text: carries too many hurried footsteps through places that once knew only stillness, eroding the
                - strong [ref=e111]: Shizukesa
                - text: — the sacred quiet that lets moss grow, tides breathe, and lanterns glow at their own pace.
            - list [ref=e112]:
              - listitem [ref=e113]:
                - button "Shinrin" [ref=e114] [cursor=pointer]:
                  - generic [ref=e115]: Shinrin
              - listitem [ref=e116]:
                - button "Naminami" [ref=e117] [cursor=pointer]:
                  - generic [ref=e118]: Naminami
              - listitem [ref=e119]:
                - button "Akari" [ref=e120] [cursor=pointer]:
                  - generic [ref=e121]: Akari
              - listitem [ref=e122]:
                - button "Takane" [ref=e123] [cursor=pointer]:
                  - generic [ref=e124]: Takane
          - generic "Location preview" [ref=e125]
      - region "Locations" [ref=e128]:
        - generic [ref=e129]:
          - generic [ref=e130]:
            - heading "The Four Quiet Wards" [level=2] [ref=e131]
            - paragraph [ref=e132]: Past the last train stop, four countryside wards still remember how to breathe slowly. Shinrin's cedar shade, Naminami's tide hush, Akari's golden hearth, and Takane's highland breeze are home to gentle spirits, thoughtful decks, and players who compete without breaking the calm. Wander the wards before the Haru-kaze carries the last stillness away.
          - list [ref=e133]:
            - listitem [ref=e134]:
              - article [ref=e135]:
                - generic [ref=e137]:
                  - heading "Shinrin" [level=3] [ref=e138]
                  - paragraph [ref=e139]: Forest Location
                  - generic [ref=e140]:
                    - heading "Moss Lantern Shrine" [level=4] [ref=e141]
                    - paragraph [ref=e142]: A hillside shrine wrapped in velvet moss, where stone lanterns glow faintly through cedar mist and the air smells of wet bark and green tea.
                - generic [ref=e143]:
                  - tablist "Shinrin sites" [ref=e144]:
                    - tab "Moss Lantern Shrine (1 of 3)" [selected] [ref=e145] [cursor=pointer]
                    - tab "Dew Terrace (2 of 3)" [ref=e146] [cursor=pointer]
                    - tab "Cedar Pass (3 of 3)" [ref=e147] [cursor=pointer]
                  - generic [ref=e148]:
                    - button "Previous site in Shinrin" [ref=e149] [cursor=pointer]:
                      - generic [ref=e150]: ‹
                    - button "Next site in Shinrin" [ref=e151] [cursor=pointer]:
                      - generic [ref=e152]: ›
            - listitem [ref=e153]:
              - article [ref=e154]:
                - generic [ref=e156]:
                  - heading "Naminami" [level=3] [ref=e157]
                  - paragraph [ref=e158]: Coast Location
                  - generic [ref=e159]:
                    - heading "Morning Pier" [level=4] [ref=e160]
                    - paragraph [ref=e161]: A weathered wooden pier stretches into calm inlet water; fishing boats rest at anchor while gulls circle and the horizon blushes pink before sunrise.
                - generic [ref=e162]:
                  - tablist "Naminami sites" [ref=e163]:
                    - tab "Morning Pier (1 of 3)" [selected] [ref=e164] [cursor=pointer]
                    - tab "Tidal Rock Garden (2 of 3)" [ref=e165] [cursor=pointer]
                    - tab "Lantern Bay (3 of 3)" [ref=e166] [cursor=pointer]
                  - generic [ref=e167]:
                    - button "Previous site in Naminami" [ref=e168] [cursor=pointer]:
                      - generic [ref=e169]: ‹
                    - button "Next site in Naminami" [ref=e170] [cursor=pointer]:
                      - generic [ref=e171]: ›
            - listitem [ref=e172]:
              - article [ref=e173]:
                - generic [ref=e175]:
                  - heading "Akari" [level=3] [ref=e176]
                  - paragraph [ref=e177]: Hearth Location
                  - generic [ref=e178]:
                    - heading "Harvest Hill" [level=4] [ref=e179]
                    - paragraph [ref=e180]: Golden orchards crown a gentle hill at late afternoon; ladders lean against laden branches and long shadows stripe the grass like woven tatami.
                - generic [ref=e181]:
                  - tablist "Akari sites" [ref=e182]:
                    - tab "Harvest Hill (1 of 3)" [selected] [ref=e183] [cursor=pointer]
                    - tab "Festival Lantern Lane (2 of 3)" [ref=e184] [cursor=pointer]
                    - tab "Onsen Valley Outlook (3 of 3)" [ref=e185] [cursor=pointer]
                  - generic [ref=e186]:
                    - button "Previous site in Akari" [ref=e187] [cursor=pointer]:
                      - generic [ref=e188]: ‹
                    - button "Next site in Akari" [ref=e189] [cursor=pointer]:
                      - generic [ref=e190]: ›
            - listitem [ref=e191]:
              - article [ref=e192]:
                - generic [ref=e194]:
                  - heading "Takane" [level=3] [ref=e195]
                  - paragraph [ref=e196]: Highland Location
                  - generic [ref=e197]:
                    - heading "Windmill Ridge" [level=4] [ref=e198]
                    - paragraph [ref=e199]: Old windmills turn slowly along a highland ridge; wildflowers bend in steady breeze while cloud shadows drift across sunlit pasture below.
                - generic [ref=e200]:
                  - tablist "Takane sites" [ref=e201]:
                    - tab "Windmill Ridge (1 of 3)" [selected] [ref=e202] [cursor=pointer]
                    - tab "Cloud Pasture (2 of 3)" [ref=e203] [cursor=pointer]
                    - tab "Wind Chime Summit (3 of 3)" [ref=e204] [cursor=pointer]
                  - generic [ref=e205]:
                    - button "Previous site in Takane" [ref=e206] [cursor=pointer]:
                      - generic [ref=e207]: ‹
                    - button "Next site in Takane" [ref=e208] [cursor=pointer]:
                      - generic [ref=e209]: ›
      - region "Game model" [ref=e210]:
        - generic [ref=e211]:
          - generic [ref=e212]:
            - heading "How Komorebi Plays" [level=2] [ref=e213]
            - paragraph [ref=e214]: Four pastoral wards, one thoughtful battlefield — assemble a deck, outmaneuver rivals in turn-based duels, and climb the seasonal ladder at your own pace.
          - list [ref=e215]:
            - listitem [ref=e216]:
              - article [ref=e217]:
                - generic [ref=e219]:
                  - heading "Calm Tactics" [level=3] [ref=e220]
                  - paragraph [ref=e221]: Trade blows on a living board where timing, lane pressure, and burst windows matter more than raw stats. Win the turn before you win the match.
            - listitem [ref=e222]:
              - article [ref=e223]:
                - generic [ref=e225]:
                  - heading "Ward Collecting" [level=3] [ref=e226]
                  - paragraph [ref=e227]: Pull spirits from Shinrin, Naminami, Akari, and Takane — then stitch keywords, curves, and finishers into a list that rewards patient play.
            - listitem [ref=e228]:
              - article [ref=e229]:
                - generic [ref=e231]:
                  - heading "Seasonal Ladder" [level=3] [ref=e232]
                  - paragraph [ref=e233]: Climb seasonal tiers, learn from losses, and refine your lines. The summit rewards players who adapt without losing their composure.
      - region "Card collection" [ref=e234]:
        - generic [ref=e235]:
          - generic [ref=e236]:
            - heading "Komorebi's Library" [level=2] [ref=e237]
            - paragraph [ref=e238]: Every card is a quiet choice — drawn from forest, coast, hearth, and highland, tuned for thoughtful play, and expanded every season. Explore a living collection built for patient deck builders and ladder climbers alike.
          - generic [ref=e239]:
            - generic [ref=e241]:
              - generic [ref=e242]:
                - generic:
                  - generic:
                    - article:
                      - generic:
                        - generic "Mana 3":
                          - generic: 三
                        - generic "Shinrin domain"
                        - generic:
                          - generic:
                            - generic "Spirit 3":
                              - generic: 三
                            - generic "Calm 3":
                              - generic: 三
                          - generic:
                            - heading "Mosswalker" [level=3]
                            - generic:
                              - paragraph: Mist until this spirit acts. Ease 2 composure from a weary opposing spirit.
                            - list "Keywords":
                              - listitem: Mist
              - paragraph [ref=e243]:
                - generic [ref=e244]: Shinrin
                - generic [ref=e245]: Mosswalker
            - list [ref=e246]:
              - listitem [ref=e247]:
                - button "Preview Mosswalker" [pressed] [ref=e248] [cursor=pointer]:
                  - article [ref=e249]:
                    - generic [ref=e250]:
                      - generic "Mana 3" [ref=e251]:
                        - generic [ref=e252]: 三
                      - generic "Shinrin domain" [ref=e253]
                      - generic "Spirit 3" [ref=e254]:
                        - generic [ref=e255]: 三
                      - generic "Calm 3" [ref=e256]:
                        - generic [ref=e257]: 三
                      - heading "Mosswalker" [level=3] [ref=e259]
              - listitem [ref=e260]:
                - button "Preview Pearl Diver" [ref=e261] [cursor=pointer]:
                  - article [ref=e262]:
                    - generic [ref=e263]:
                      - generic "Mana 2" [ref=e264]:
                        - generic [ref=e265]: 二
                      - generic "Naminami domain" [ref=e266]
                      - generic "Spirit 2" [ref=e267]:
                        - generic [ref=e268]: 二
                      - generic "Calm 2" [ref=e269]:
                        - generic [ref=e270]: 二
                      - heading "Pearl Diver" [level=3] [ref=e272]
              - listitem [ref=e273]:
                - button "Preview Embersmith" [ref=e274] [cursor=pointer]:
                  - article [ref=e275]:
                    - generic [ref=e276]:
                      - generic "Mana 4" [ref=e277]:
                        - generic [ref=e278]: 四
                      - generic "Akari domain" [ref=e279]
                      - generic "Spirit 4" [ref=e280]:
                        - generic [ref=e281]: 四
                      - generic "Calm 3" [ref=e282]:
                        - generic [ref=e283]: 三
                      - heading "Embersmith" [level=3] [ref=e285]
              - listitem [ref=e286]:
                - button "Preview Cloud Reader" [ref=e287] [cursor=pointer]:
                  - article [ref=e288]:
                    - generic [ref=e289]:
                      - generic "Mana 5" [ref=e290]:
                        - generic [ref=e291]: 五
                      - generic "Takane domain" [ref=e292]
                      - generic "Spirit 2" [ref=e293]:
                        - generic [ref=e294]: 二
                      - generic "Calm 5" [ref=e295]:
                        - generic [ref=e296]: 五
                      - heading "Cloud Reader" [level=3] [ref=e298]
              - listitem [ref=e299]:
                - button "Preview Fern Sage" [ref=e300] [cursor=pointer]:
                  - article [ref=e301]:
                    - generic [ref=e302]:
                      - generic "Mana 3" [ref=e303]:
                        - generic [ref=e304]: 三
                      - generic "Shinrin domain" [ref=e305]
                      - generic "Spirit 1" [ref=e306]:
                        - generic [ref=e307]: 一
                      - generic "Calm 5" [ref=e308]:
                        - generic [ref=e309]: 五
                      - heading "Fern Sage" [level=3] [ref=e311]
              - listitem [ref=e312]:
                - button "Preview Coral Whisper" [ref=e313] [cursor=pointer]:
                  - article [ref=e314]:
                    - generic [ref=e315]:
                      - generic "Mana 5" [ref=e316]:
                        - generic [ref=e317]: 五
                      - generic "Naminami domain" [ref=e318]
                      - generic "Spirit 3" [ref=e319]:
                        - generic [ref=e320]: 三
                      - generic "Calm 4" [ref=e321]:
                        - generic [ref=e322]: 四
                      - heading "Coral Whisper" [level=3] [ref=e324]
              - listitem [ref=e325]:
                - button "Preview Festival Dancer" [ref=e326] [cursor=pointer]:
                  - article [ref=e327]:
                    - generic [ref=e328]:
                      - generic "Mana 3" [ref=e329]:
                        - generic [ref=e330]: 三
                      - generic "Akari domain" [ref=e331]
                      - generic "Spirit 2" [ref=e332]:
                        - generic [ref=e333]: 二
                      - generic "Calm 4" [ref=e334]:
                        - generic [ref=e335]: 四
                      - heading "Festival Dancer" [level=3] [ref=e337]
              - listitem [ref=e338]:
                - button "Preview Summit Guide" [ref=e339] [cursor=pointer]:
                  - article [ref=e340]:
                    - generic [ref=e341]:
                      - generic "Mana 6" [ref=e342]:
                        - generic [ref=e343]: 六
                      - generic "Takane domain" [ref=e344]
                      - generic "Spirit 3" [ref=e345]:
                        - generic [ref=e346]: 三
                      - generic "Calm 7" [ref=e347]:
                        - generic [ref=e348]: 七
                      - heading "Summit Guide" [level=3] [ref=e350]
      - region "Collect, trade, and conquer" [ref=e351]:
        - generic [ref=e352]:
          - generic [ref=e353]:
            - heading "Gather. Trade. Tend." [level=2] [ref=e354]
            - paragraph [ref=e355]: Komorebi rewards patience — stock your binder from sealed bundles and open listings, pass along duplicates for credits, and shape a deck that wins quietly but convincingly.
          - list [ref=e356]:
            - listitem [ref=e357]:
              - article [ref=e358]:
                - generic [ref=e360]:
                  - heading "Grow Your Binder" [level=3] [ref=e361]
                  - paragraph [ref=e362]: Add depth across wards and seasonal releases. Every new pull opens another line you can run when the ladder shifts.
            - listitem [ref=e363]:
              - article [ref=e364]:
                - generic [ref=e366]:
                  - heading "Thoughtful Shopping" [level=3] [ref=e367]
                  - paragraph [ref=e368]: Filter the catalog, find the missing piece, and buy exactly what your curve has been waiting for — no rush, no noise.
            - listitem [ref=e369]:
              - article [ref=e370]:
                - generic [ref=e372]:
                  - heading "Open Sealed Bundles" [level=3] [ref=e373]
                  - paragraph [ref=e374]: Crack sealed products and chase a standout pull. Each unopened bundle is a small surprise — chase card or trade bait.
            - listitem [ref=e375]:
              - article [ref=e376]:
                - generic [ref=e378]:
                  - heading "Chase Sacred Prints" [level=3] [ref=e379]
                  - paragraph [ref=e380]: Hunt foils, Sacred tier spirits, and signature prints — the kind of card that rewrites a deck and makes opponents pause to admire it.
            - listitem [ref=e381]:
              - article [ref=e382]:
                - generic [ref=e384]:
                  - heading "Pass Along Duplicates" [level=3] [ref=e385]
                  - paragraph [ref=e386]: Extras still have value. List them, fund the next upgrade, and keep your binder lean for the decks you actually play.
            - listitem [ref=e387]:
              - article [ref=e388]:
                - generic [ref=e390]:
                  - heading "Tune Your Deck" [level=3] [ref=e391]
                  - paragraph [ref=e392]: Prototype lists in the deck lab — test counters, stress synergies, and lock a 30-card answer to the ladder's current pace.
          - list [ref=e394]:
            - listitem [ref=e395]:
              - article [ref=e396]:
                - generic [ref=e397]: GENTLE
                - heading "Everyday Finds" [level=3] [ref=e398]
                - paragraph [ref=e399]: Reliable spirits and utility pieces that glue a list together — flexible enough to slot into multiple strategies.
            - listitem [ref=e400]:
              - article [ref=e401]:
                - generic [ref=e402]: RADIANT
                - heading "Lantern Prints" [level=3] [ref=e403]
                - paragraph [ref=e404]: Standout prints with real board presence — alternate art, foil shine, and effects that reward thoughtful building.
            - listitem [ref=e405]:
              - article [ref=e406]:
                - generic [ref=e407]: SACRED
                - heading "Ward Guardians" [level=3] [ref=e408]
                - paragraph [ref=e409]: High-impact spirits and gentle engines that can close a match with patience. One well-timed play can settle the board.
          - generic [ref=e410]:
            - paragraph [ref=e411]: Hundreds of listings live right now — find the card that completes your next deck.
            - button "Browse the Market" [ref=e412] [cursor=pointer]
      - region "FAQ" [ref=e413]:
        - generic [ref=e414]:
          - heading "Frequently Asked Questions" [level=2] [ref=e416]
          - list [ref=e417]:
            - listitem [ref=e418]:
              - button "What is Komorebi?" [ref=e419] [cursor=pointer]:
                - generic [ref=e420]: What is Komorebi?
            - listitem [ref=e422]:
              - button "How do I start playing?" [ref=e423] [cursor=pointer]:
                - generic [ref=e424]: How do I start playing?
            - listitem [ref=e426]:
              - button "What are credits used for?" [ref=e427] [cursor=pointer]:
                - generic [ref=e428]: What are credits used for?
            - listitem [ref=e430]:
              - button "Can I trade or sell my cards?" [ref=e431] [cursor=pointer]:
                - generic [ref=e432]: Can I trade or sell my cards?
            - listitem [ref=e434]:
              - button "Is Komorebi free to play?" [ref=e435] [cursor=pointer]:
                - generic [ref=e436]: Is Komorebi free to play?
      - region "Join the void" [ref=e438]:
        - generic [ref=e439]:
          - generic [ref=e440]:
            - heading "Step Into the Light" [level=2] [ref=e441]
            - paragraph [ref=e442]: Wander the wards. Tend the quiet.
            - paragraph [ref=e443]: Join a community of deck keepers, market traders, and ladder climbers who compete without hurry. Collect countryside spirits, shape gentle strategies, and leave your mark on the four wards of Komorebi.
            - button "Play Now" [ref=e444] [cursor=pointer]
          - generic [ref=e445]:
            - heading "The Gentle Season" [level=3] [ref=e446]
            - list [ref=e447]:
              - listitem [ref=e448]:
                - generic [ref=e449]: 12K+
                - generic [ref=e450]: Ward Keepers
              - listitem [ref=e451]:
                - generic [ref=e452]: 48K+
                - generic [ref=e453]: Daily Matches
              - listitem [ref=e454]:
                - generic [ref=e455]: 2M+
                - generic [ref=e456]: Spirits Collected
    - contentinfo "Site footer" [ref=e457]:
      - generic [ref=e458]:
        - generic [ref=e459]:
          - generic [ref=e460]:
            - link [ref=e462] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e463]: Find the quiet. Collect gentle moments.
          - generic [ref=e464]:
            - heading "Legal" [level=3] [ref=e465]
            - list [ref=e466]:
              - listitem [ref=e467]:
                - link "Terms of Service" [ref=e468] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e469]:
                - link "Privacy Notice" [ref=e470] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e471]:
                - link "Cancellation & Refund Policy" [ref=e472] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e473]:
                - link "Disclaimer" [ref=e474] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e475]:
                - link "Cookie Policy" [ref=e476] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e477]:
            - heading "Contact" [level=3] [ref=e478]
            - list [ref=e479]:
              - listitem [ref=e480]: "Company name: Test LTD"
              - listitem [ref=e481]: "Company number: 00000000"
              - listitem [ref=e482]: "Registered address: 123 Example Street, Testville, TE1 1ST, United Kingdom"
              - listitem [ref=e483]:
                - link "play@komorebi.club" [ref=e484] [cursor=pointer]:
                  - /url: mailto:play@komorebi.club
            - list "Social media" [ref=e485]:
              - listitem [ref=e486]:
                - generic "Telegram" [ref=e487]
              - listitem [ref=e489]:
                - generic "Instagram" [ref=e490]
              - listitem [ref=e492]:
                - generic "Facebook" [ref=e493]
              - listitem [ref=e495]:
                - generic "Discord" [ref=e496]
            - generic "Accepted payment methods" [ref=e498]
        - generic [ref=e499]:
          - paragraph [ref=e500]: © 2026 Komorebi. All rights reserved.
          - button "Cookie Settings" [ref=e501] [cursor=pointer]
  - alert [ref=e502]
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
      |     ^ Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/komorebi-desktop-landing-linux.png, writing actual.
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