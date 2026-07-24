# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing/landing.spec.ts >> Visual check [Mobile] for komorebi
- Location: tests/landing/landing.spec.ts:64:7

# Error details

```
Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/komorebi-mobile-landing-linux.png, writing actual.
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
          - paragraph [ref=e26]: 木漏れ日 · Komorebi
          - heading "Find the Quiet. Collect Gentle Moments." [level=1] [ref=e27]:
            - text: Find the Quiet.
            - generic [ref=e28]: Collect Gentle Moments.
          - paragraph [ref=e29]: Past the last train stop, four countryside wards still breathe slowly — cedar shade, tide hush, hearth glow, and highland breeze. Collect their gentle spirits, build thoughtful decks, and wander a calm market without breaking the stillness.
      - region "Locations" [ref=e30]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]:
              - heading "Wander the Wards" [level=3] [ref=e35]
              - paragraph [ref=e37]:
                - text: The old balance of the countryside is thinning. A restless current called the
                - strong [ref=e38]: Haru-kaze
                - text: carries too many hurried footsteps through places that once knew only stillness, eroding the
                - strong [ref=e39]: Shizukesa
                - text: — the sacred quiet that lets moss grow, tides breathe, and lanterns glow at their own pace.
            - list [ref=e40]:
              - listitem [ref=e41]:
                - button "Shinrin" [ref=e42] [cursor=pointer]:
                  - generic [ref=e43]: Shinrin
              - listitem [ref=e44]:
                - button "Naminami" [ref=e45] [cursor=pointer]:
                  - generic [ref=e46]: Naminami
              - listitem [ref=e47]:
                - button "Akari" [ref=e48] [cursor=pointer]:
                  - generic [ref=e49]: Akari
              - listitem [ref=e50]:
                - button "Takane" [ref=e51] [cursor=pointer]:
                  - generic [ref=e52]: Takane
          - generic "Location preview" [ref=e53]
      - region "Locations" [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - heading "The Four Quiet Wards" [level=2] [ref=e59]
            - paragraph [ref=e60]: Past the last train stop, four countryside wards still remember how to breathe slowly. Shinrin's cedar shade, Naminami's tide hush, Akari's golden hearth, and Takane's highland breeze are home to gentle spirits, thoughtful decks, and players who compete without breaking the calm. Wander the wards before the Haru-kaze carries the last stillness away.
          - list [ref=e61]:
            - listitem [ref=e62]:
              - article [ref=e63]:
                - generic [ref=e65]:
                  - heading "Shinrin" [level=3] [ref=e66]
                  - paragraph [ref=e67]: Forest Location
                  - generic [ref=e68]:
                    - heading "Moss Lantern Shrine" [level=4] [ref=e69]
                    - paragraph [ref=e70]: A hillside shrine wrapped in velvet moss, where stone lanterns glow faintly through cedar mist and the air smells of wet bark and green tea.
                - generic [ref=e71]:
                  - tablist "Shinrin sites" [ref=e72]:
                    - tab "Moss Lantern Shrine (1 of 3)" [selected] [ref=e73] [cursor=pointer]
                    - tab "Dew Terrace (2 of 3)" [ref=e74] [cursor=pointer]
                    - tab "Cedar Pass (3 of 3)" [ref=e75] [cursor=pointer]
                  - generic [ref=e76]:
                    - button "Previous site in Shinrin" [ref=e77] [cursor=pointer]:
                      - generic [ref=e78]: ‹
                    - button "Next site in Shinrin" [ref=e79] [cursor=pointer]:
                      - generic [ref=e80]: ›
            - listitem [ref=e81]:
              - article [ref=e82]:
                - generic [ref=e84]:
                  - heading "Naminami" [level=3] [ref=e85]
                  - paragraph [ref=e86]: Coast Location
                  - generic [ref=e87]:
                    - heading "Morning Pier" [level=4] [ref=e88]
                    - paragraph [ref=e89]: A weathered wooden pier stretches into calm inlet water; fishing boats rest at anchor while gulls circle and the horizon blushes pink before sunrise.
                - generic [ref=e90]:
                  - tablist "Naminami sites" [ref=e91]:
                    - tab "Morning Pier (1 of 3)" [selected] [ref=e92] [cursor=pointer]
                    - tab "Tidal Rock Garden (2 of 3)" [ref=e93] [cursor=pointer]
                    - tab "Lantern Bay (3 of 3)" [ref=e94] [cursor=pointer]
                  - generic [ref=e95]:
                    - button "Previous site in Naminami" [ref=e96] [cursor=pointer]:
                      - generic [ref=e97]: ‹
                    - button "Next site in Naminami" [ref=e98] [cursor=pointer]:
                      - generic [ref=e99]: ›
            - listitem [ref=e100]:
              - article [ref=e101]:
                - generic [ref=e103]:
                  - heading "Akari" [level=3] [ref=e104]
                  - paragraph [ref=e105]: Hearth Location
                  - generic [ref=e106]:
                    - heading "Harvest Hill" [level=4] [ref=e107]
                    - paragraph [ref=e108]: Golden orchards crown a gentle hill at late afternoon; ladders lean against laden branches and long shadows stripe the grass like woven tatami.
                - generic [ref=e109]:
                  - tablist "Akari sites" [ref=e110]:
                    - tab "Harvest Hill (1 of 3)" [selected] [ref=e111] [cursor=pointer]
                    - tab "Festival Lantern Lane (2 of 3)" [ref=e112] [cursor=pointer]
                    - tab "Onsen Valley Outlook (3 of 3)" [ref=e113] [cursor=pointer]
                  - generic [ref=e114]:
                    - button "Previous site in Akari" [ref=e115] [cursor=pointer]:
                      - generic [ref=e116]: ‹
                    - button "Next site in Akari" [ref=e117] [cursor=pointer]:
                      - generic [ref=e118]: ›
            - listitem [ref=e119]:
              - article [ref=e120]:
                - generic [ref=e122]:
                  - heading "Takane" [level=3] [ref=e123]
                  - paragraph [ref=e124]: Highland Location
                  - generic [ref=e125]:
                    - heading "Windmill Ridge" [level=4] [ref=e126]
                    - paragraph [ref=e127]: Old windmills turn slowly along a highland ridge; wildflowers bend in steady breeze while cloud shadows drift across sunlit pasture below.
                - generic [ref=e128]:
                  - tablist "Takane sites" [ref=e129]:
                    - tab "Windmill Ridge (1 of 3)" [selected] [ref=e130] [cursor=pointer]
                    - tab "Cloud Pasture (2 of 3)" [ref=e131] [cursor=pointer]
                    - tab "Wind Chime Summit (3 of 3)" [ref=e132] [cursor=pointer]
                  - generic [ref=e133]:
                    - button "Previous site in Takane" [ref=e134] [cursor=pointer]:
                      - generic [ref=e135]: ‹
                    - button "Next site in Takane" [ref=e136] [cursor=pointer]:
                      - generic [ref=e137]: ›
      - region "Game model" [ref=e138]:
        - generic [ref=e139]:
          - generic [ref=e140]:
            - heading "How Komorebi Plays" [level=2] [ref=e141]
            - paragraph [ref=e142]: Four pastoral wards, one thoughtful battlefield — assemble a deck, outmaneuver rivals in turn-based duels, and climb the seasonal ladder at your own pace.
          - list [ref=e143]:
            - listitem [ref=e144]:
              - article [ref=e145]:
                - generic [ref=e147]:
                  - heading "Calm Tactics" [level=3] [ref=e148]
                  - paragraph [ref=e149]: Trade blows on a living board where timing, lane pressure, and burst windows matter more than raw stats. Win the turn before you win the match.
            - listitem [ref=e150]:
              - article [ref=e151]:
                - generic [ref=e153]:
                  - heading "Ward Collecting" [level=3] [ref=e154]
                  - paragraph [ref=e155]: Pull spirits from Shinrin, Naminami, Akari, and Takane — then stitch keywords, curves, and finishers into a list that rewards patient play.
            - listitem [ref=e156]:
              - article [ref=e157]:
                - generic [ref=e159]:
                  - heading "Seasonal Ladder" [level=3] [ref=e160]
                  - paragraph [ref=e161]: Climb seasonal tiers, learn from losses, and refine your lines. The summit rewards players who adapt without losing their composure.
      - region "Card collection" [ref=e162]:
        - generic [ref=e163]:
          - generic [ref=e164]:
            - heading "Komorebi's Library" [level=2] [ref=e165]
            - paragraph [ref=e166]: Every card is a quiet choice — drawn from forest, coast, hearth, and highland, tuned for thoughtful play, and expanded every season. Explore a living collection built for patient deck builders and ladder climbers alike.
          - generic [ref=e167]:
            - generic [ref=e169]:
              - generic [ref=e170]:
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
              - paragraph [ref=e171]:
                - generic [ref=e172]: Shinrin
                - generic [ref=e173]: Mosswalker
            - list [ref=e174]:
              - listitem [ref=e175]:
                - button "Preview Mosswalker" [pressed] [ref=e176] [cursor=pointer]:
                  - article [ref=e177]:
                    - generic [ref=e178]:
                      - generic "Mana 3" [ref=e179]:
                        - generic [ref=e180]: 三
                      - generic "Shinrin domain" [ref=e181]
                      - generic "Spirit 3" [ref=e182]:
                        - generic [ref=e183]: 三
                      - generic "Calm 3" [ref=e184]:
                        - generic [ref=e185]: 三
                      - heading "Mosswalker" [level=3] [ref=e187]
              - listitem [ref=e188]:
                - button "Preview Pearl Diver" [ref=e189] [cursor=pointer]:
                  - article [ref=e190]:
                    - generic [ref=e191]:
                      - generic "Mana 2" [ref=e192]:
                        - generic [ref=e193]: 二
                      - generic "Naminami domain" [ref=e194]
                      - generic "Spirit 2" [ref=e195]:
                        - generic [ref=e196]: 二
                      - generic "Calm 2" [ref=e197]:
                        - generic [ref=e198]: 二
                      - heading "Pearl Diver" [level=3] [ref=e200]
              - listitem [ref=e201]:
                - button "Preview Embersmith" [ref=e202] [cursor=pointer]:
                  - article [ref=e203]:
                    - generic [ref=e204]:
                      - generic "Mana 4" [ref=e205]:
                        - generic [ref=e206]: 四
                      - generic "Akari domain" [ref=e207]
                      - generic "Spirit 4" [ref=e208]:
                        - generic [ref=e209]: 四
                      - generic "Calm 3" [ref=e210]:
                        - generic [ref=e211]: 三
                      - heading "Embersmith" [level=3] [ref=e213]
              - listitem [ref=e214]:
                - button "Preview Cloud Reader" [ref=e215] [cursor=pointer]:
                  - article [ref=e216]:
                    - generic [ref=e217]:
                      - generic "Mana 5" [ref=e218]:
                        - generic [ref=e219]: 五
                      - generic "Takane domain" [ref=e220]
                      - generic "Spirit 2" [ref=e221]:
                        - generic [ref=e222]: 二
                      - generic "Calm 5" [ref=e223]:
                        - generic [ref=e224]: 五
                      - heading "Cloud Reader" [level=3] [ref=e226]
              - listitem [ref=e227]:
                - button "Preview Fern Sage" [ref=e228] [cursor=pointer]:
                  - article [ref=e229]:
                    - generic [ref=e230]:
                      - generic "Mana 3" [ref=e231]:
                        - generic [ref=e232]: 三
                      - generic "Shinrin domain" [ref=e233]
                      - generic "Spirit 1" [ref=e234]:
                        - generic [ref=e235]: 一
                      - generic "Calm 5" [ref=e236]:
                        - generic [ref=e237]: 五
                      - heading "Fern Sage" [level=3] [ref=e239]
              - listitem [ref=e240]:
                - button "Preview Coral Whisper" [ref=e241] [cursor=pointer]:
                  - article [ref=e242]:
                    - generic [ref=e243]:
                      - generic "Mana 5" [ref=e244]:
                        - generic [ref=e245]: 五
                      - generic "Naminami domain" [ref=e246]
                      - generic "Spirit 3" [ref=e247]:
                        - generic [ref=e248]: 三
                      - generic "Calm 4" [ref=e249]:
                        - generic [ref=e250]: 四
                      - heading "Coral Whisper" [level=3] [ref=e252]
              - listitem [ref=e253]:
                - button "Preview Festival Dancer" [ref=e254] [cursor=pointer]:
                  - article [ref=e255]:
                    - generic [ref=e256]:
                      - generic "Mana 3" [ref=e257]:
                        - generic [ref=e258]: 三
                      - generic "Akari domain" [ref=e259]
                      - generic "Spirit 2" [ref=e260]:
                        - generic [ref=e261]: 二
                      - generic "Calm 4" [ref=e262]:
                        - generic [ref=e263]: 四
                      - heading "Festival Dancer" [level=3] [ref=e265]
              - listitem [ref=e266]:
                - button "Preview Summit Guide" [ref=e267] [cursor=pointer]:
                  - article [ref=e268]:
                    - generic [ref=e269]:
                      - generic "Mana 6" [ref=e270]:
                        - generic [ref=e271]: 六
                      - generic "Takane domain" [ref=e272]
                      - generic "Spirit 3" [ref=e273]:
                        - generic [ref=e274]: 三
                      - generic "Calm 7" [ref=e275]:
                        - generic [ref=e276]: 七
                      - heading "Summit Guide" [level=3] [ref=e278]
      - region "Collect, trade, and conquer" [ref=e279]:
        - generic [ref=e280]:
          - generic [ref=e281]:
            - heading "Gather. Trade. Tend." [level=2] [ref=e282]
            - paragraph [ref=e283]: Komorebi rewards patience — stock your binder from sealed bundles and open listings, pass along duplicates for credits, and shape a deck that wins quietly but convincingly.
          - list [ref=e284]:
            - listitem [ref=e285]:
              - article [ref=e286]:
                - generic [ref=e288]:
                  - heading "Grow Your Binder" [level=3] [ref=e289]
                  - paragraph [ref=e290]: Add depth across wards and seasonal releases. Every new pull opens another line you can run when the ladder shifts.
            - listitem [ref=e291]:
              - article [ref=e292]:
                - generic [ref=e294]:
                  - heading "Thoughtful Shopping" [level=3] [ref=e295]
                  - paragraph [ref=e296]: Filter the catalog, find the missing piece, and buy exactly what your curve has been waiting for — no rush, no noise.
            - listitem [ref=e297]:
              - article [ref=e298]:
                - generic [ref=e300]:
                  - heading "Open Sealed Bundles" [level=3] [ref=e301]
                  - paragraph [ref=e302]: Crack sealed products and chase a standout pull. Each unopened bundle is a small surprise — chase card or trade bait.
            - listitem [ref=e303]:
              - article [ref=e304]:
                - generic [ref=e306]:
                  - heading "Chase Sacred Prints" [level=3] [ref=e307]
                  - paragraph [ref=e308]: Hunt foils, Sacred tier spirits, and signature prints — the kind of card that rewrites a deck and makes opponents pause to admire it.
            - listitem [ref=e309]:
              - article [ref=e310]:
                - generic [ref=e312]:
                  - heading "Pass Along Duplicates" [level=3] [ref=e313]
                  - paragraph [ref=e314]: Extras still have value. List them, fund the next upgrade, and keep your binder lean for the decks you actually play.
            - listitem [ref=e315]:
              - article [ref=e316]:
                - generic [ref=e318]:
                  - heading "Tune Your Deck" [level=3] [ref=e319]
                  - paragraph [ref=e320]: Prototype lists in the deck lab — test counters, stress synergies, and lock a 30-card answer to the ladder's current pace.
          - list [ref=e322]:
            - listitem [ref=e323]:
              - article [ref=e324]:
                - generic [ref=e325]: GENTLE
                - heading "Everyday Finds" [level=3] [ref=e326]
                - paragraph [ref=e327]: Reliable spirits and utility pieces that glue a list together — flexible enough to slot into multiple strategies.
            - listitem [ref=e328]:
              - article [ref=e329]:
                - generic [ref=e330]: RADIANT
                - heading "Lantern Prints" [level=3] [ref=e331]
                - paragraph [ref=e332]: Standout prints with real board presence — alternate art, foil shine, and effects that reward thoughtful building.
            - listitem [ref=e333]:
              - article [ref=e334]:
                - generic [ref=e335]: SACRED
                - heading "Ward Guardians" [level=3] [ref=e336]
                - paragraph [ref=e337]: High-impact spirits and gentle engines that can close a match with patience. One well-timed play can settle the board.
          - generic [ref=e338]:
            - paragraph [ref=e339]: Hundreds of listings live right now — find the card that completes your next deck.
            - button "Browse the Market" [ref=e340] [cursor=pointer]
      - region "FAQ" [ref=e341]:
        - generic [ref=e342]:
          - heading "Frequently Asked Questions" [level=2] [ref=e344]
          - list [ref=e345]:
            - listitem [ref=e346]:
              - button "What is Komorebi?" [ref=e347] [cursor=pointer]:
                - generic [ref=e348]: What is Komorebi?
            - listitem [ref=e350]:
              - button "How do I start playing?" [ref=e351] [cursor=pointer]:
                - generic [ref=e352]: How do I start playing?
            - listitem [ref=e354]:
              - button "What are credits used for?" [ref=e355] [cursor=pointer]:
                - generic [ref=e356]: What are credits used for?
            - listitem [ref=e358]:
              - button "Can I trade or sell my cards?" [ref=e359] [cursor=pointer]:
                - generic [ref=e360]: Can I trade or sell my cards?
            - listitem [ref=e362]:
              - button "Is Komorebi free to play?" [ref=e363] [cursor=pointer]:
                - generic [ref=e364]: Is Komorebi free to play?
      - region "Join the void" [ref=e366]:
        - generic [ref=e367]:
          - generic [ref=e368]:
            - heading "Step Into the Light" [level=2] [ref=e369]
            - paragraph [ref=e370]: Wander the wards. Tend the quiet.
            - paragraph [ref=e371]: Join a community of deck keepers, market traders, and ladder climbers who compete without hurry. Collect countryside spirits, shape gentle strategies, and leave your mark on the four wards of Komorebi.
            - button "Play Now" [ref=e372] [cursor=pointer]
          - generic [ref=e373]:
            - heading "The Gentle Season" [level=3] [ref=e374]
            - list [ref=e375]:
              - listitem [ref=e376]:
                - generic [ref=e377]: 12K+
                - generic [ref=e378]: Ward Keepers
              - listitem [ref=e379]:
                - generic [ref=e380]: 48K+
                - generic [ref=e381]: Daily Matches
              - listitem [ref=e382]:
                - generic [ref=e383]: 2M+
                - generic [ref=e384]: Spirits Collected
    - contentinfo "Site footer" [ref=e385]:
      - generic [ref=e386]:
        - generic [ref=e387]:
          - generic [ref=e388]:
            - link [ref=e390] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e391]: Find the quiet. Collect gentle moments.
          - generic [ref=e392]:
            - heading "Legal" [level=3] [ref=e393]
            - list [ref=e394]:
              - listitem [ref=e395]:
                - link "Terms of Service" [ref=e396] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e397]:
                - link "Privacy Notice" [ref=e398] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e399]:
                - link "Cancellation & Refund Policy" [ref=e400] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e401]:
                - link "Disclaimer" [ref=e402] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e403]:
                - link "Cookie Policy" [ref=e404] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e405]:
            - heading "Contact" [level=3] [ref=e406]
            - list [ref=e407]:
              - listitem [ref=e408]: "Company name: Test LTD"
              - listitem [ref=e409]: "Company number: 00000000"
              - listitem [ref=e410]: "Registered address: 123 Example Street, Testville, TE1 1ST, United Kingdom"
              - listitem [ref=e411]:
                - link "play@komorebi.club" [ref=e412] [cursor=pointer]:
                  - /url: mailto:play@komorebi.club
            - list "Social media" [ref=e413]:
              - listitem [ref=e414]:
                - generic "Telegram" [ref=e415]
              - listitem [ref=e417]:
                - generic "Instagram" [ref=e418]
              - listitem [ref=e420]:
                - generic "Facebook" [ref=e421]
              - listitem [ref=e423]:
                - generic "Discord" [ref=e424]
            - generic "Accepted payment methods" [ref=e426]
        - generic [ref=e427]:
          - paragraph [ref=e428]: © 2026 Komorebi. All rights reserved.
          - button "Cookie Settings" [ref=e429] [cursor=pointer]
  - alert [ref=e430]
```

# Test source

```ts
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
  60  |     await expect(page).toHaveScreenshot(`${site.name}-desktop.png`, screenshotOptions);
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
> 110 |     await expect(page).toHaveScreenshot(`${site.name}-mobile.png`, screenshotOptions);
      |     ^ Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/komorebi-mobile-landing-linux.png, writing actual.
  111 |   });
  112 | }
```