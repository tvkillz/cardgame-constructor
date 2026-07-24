# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing/landing.spec.ts >> Visual check [Mobile] for voidborn
- Location: tests/landing/landing.spec.ts:64:7

# Error details

```
Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/voidborn-mobile-landing-linux.png, writing actual.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e5]:
        - button "Sign In" [ref=e6] [cursor=pointer]:
          - img [ref=e8]
          - text: Sign In
        - button "Toggle navigation menu" [ref=e10] [cursor=pointer]
      - list [ref=e14]:
        - listitem [ref=e15]:
          - link [ref=e16] [cursor=pointer]:
            - /url: /play
            - text: Play Now
        - listitem [ref=e17]:
          - link [ref=e18] [cursor=pointer]:
            - /url: /portal/market
            - text: Market
        - listitem [ref=e19]:
          - link [ref=e20] [cursor=pointer]:
            - /url: /leaderboard
            - text: Leaderboard
    - main [ref=e21]:
      - region "Hero" [ref=e22]:
        - generic [ref=e25]:
          - heading "Conquer the Void. Rule the Elemental Realms." [level=1] [ref=e26]:
            - text: Conquer the Void.
            - generic [ref=e27]: Rule the Elemental Realms.
          - paragraph [ref=e28]: Enter a shattered realm where cosmic corruption breeds legendary champions. Build your deck, harness the forbidden magic of the void, and dominate the battlefield.
          - generic [ref=e29]:
            - button "Play Now" [ref=e30] [cursor=pointer]
            - button "View Market" [ref=e31] [cursor=pointer]
            - button "Leaderboard" [ref=e32] [cursor=pointer]
          - generic "Card previews" [ref=e33]:
            - article [ref=e34] [cursor=pointer]:
              - generic [ref=e35]:
                - generic "Mana 6" [ref=e36]:
                  - generic [ref=e37]: "6"
                - generic "Kronos domain" [ref=e38]
                - generic "Attack 3" [ref=e39]:
                  - generic [ref=e40]: "3"
                - generic "Health 8" [ref=e41]:
                  - generic [ref=e42]: "8"
                - heading "Granite Warden" [level=3] [ref=e44]
            - article [ref=e45] [cursor=pointer]:
              - generic [ref=e46]:
                - generic "Mana 5" [ref=e47]:
                  - generic [ref=e48]: "5"
                - generic "Thalassa domain" [ref=e49]
                - generic "Attack 2" [ref=e50]:
                  - generic [ref=e51]: "2"
                - generic "Health 6" [ref=e52]:
                  - generic [ref=e53]: "6"
                - heading "Tidebound Priestess" [level=3] [ref=e55]
            - article [ref=e56] [cursor=pointer]:
              - generic [ref=e57]:
                - generic "Mana 7" [ref=e58]:
                  - generic [ref=e59]: "7"
                - generic "Infernus domain" [ref=e60]
                - generic "Attack 4" [ref=e61]:
                  - generic [ref=e62]: "4"
                - generic "Health 5" [ref=e63]:
                  - generic [ref=e64]: "5"
                - heading "Lava-Born" [level=3] [ref=e66]
            - article [ref=e67] [cursor=pointer]:
              - generic [ref=e68]:
                - generic "Mana 4" [ref=e69]:
                  - generic [ref=e70]: "4"
                - generic "Anemos domain" [ref=e71]
                - generic "Attack 4" [ref=e72]:
                  - generic [ref=e73]: "4"
                - generic "Health 3" [ref=e74]:
                  - generic [ref=e75]: "3"
                - heading "Void Stalker" [level=3] [ref=e77]
      - region "Locations" [ref=e78]:
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]:
              - heading "Face the Abyss" [level=3] [ref=e83]
              - generic [ref=e84]:
                - paragraph [ref=e85]:
                  - text: The delicate equilibrium of the domains is shattering. A catastrophic phenomenon known as the
                  - strong [ref=e86]: Aether Bleed
                  - text: is draining the lifeblood from the elemental realms, leaving behind volatile
                  - strong [ref=e87]: Null Zones
                  - text: where magic backfires and the laws of physics collapse.
                - paragraph [ref=e88]: As the Void infects the land, wild elemental spirits are twisting into maddened behemoths. Deck wielders must not only fight for territory, but stabilize these reality tears before their chosen domains dissolve into absolute nothingness.
            - list [ref=e89]:
              - listitem [ref=e90]:
                - button "Kronos" [ref=e91] [cursor=pointer]:
                  - generic [ref=e92]: Kronos
              - listitem [ref=e93]:
                - button "Thalassa" [ref=e94] [cursor=pointer]:
                  - generic [ref=e95]: Thalassa
              - listitem [ref=e96]:
                - button "Infernus" [ref=e97] [cursor=pointer]:
                  - generic [ref=e98]: Infernus
              - listitem [ref=e99]:
                - button "Anemos" [ref=e100] [cursor=pointer]:
                  - generic [ref=e101]: Anemos
          - generic "Location preview" [ref=e102]
      - region "Dominions" [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e107]:
            - heading "The Elemental Quadrant" [level=2] [ref=e108]
            - paragraph [ref=e109]: At the precipice of the Void, four elemental realms fight a losing battle against oblivion. These shattered worlds of stone, wave, flame, and wind are home to remnants of civilization, powerful decks, and ancient devastation. Explore the bastions before the Aether Bleed consumes the last of reality.
          - list [ref=e110]:
            - listitem [ref=e111]:
              - article [ref=e112]:
                - generic [ref=e114]:
                  - heading "Kronos" [level=3] [ref=e115]
                  - paragraph [ref=e116]: Earth Dominion
                  - generic [ref=e117]:
                    - heading "The Great Bastion" [level=4] [ref=e118]
                    - paragraph [ref=e119]: A massive fortress-city carved into a colossal mountain — grand stone arches, tiered terraces, and monolithic towers of granite.
                - generic [ref=e120]:
                  - tablist "Kronos sites" [ref=e121]:
                    - tab "The Great Bastion (1 of 3)" [selected] [ref=e122] [cursor=pointer]
                    - tab "Obsidian Deep (2 of 3)" [ref=e123] [cursor=pointer]
                    - tab "The Weeping Grove (3 of 3)" [ref=e124] [cursor=pointer]
                  - generic [ref=e125]:
                    - button "Previous site in Kronos" [ref=e126] [cursor=pointer]:
                      - generic [ref=e127]: ‹
                    - button "Next site in Kronos" [ref=e128] [cursor=pointer]:
                      - generic [ref=e129]: ›
            - listitem [ref=e130]:
              - article [ref=e131]:
                - generic [ref=e133]:
                  - heading "Thalassa" [level=3] [ref=e134]
                  - paragraph [ref=e135]: Water Dominion
                  - generic [ref=e136]:
                    - heading "Sunken Oakhaven" [level=4] [ref=e137]
                    - paragraph [ref=e138]: Half-drowned halls of oak and coral where tide-priests commune with leviathans in chambers flooded by moonlit seawater.
                - generic [ref=e139]:
                  - tablist "Thalassa sites" [ref=e140]:
                    - tab "Sunken Oakhaven (1 of 3)" [selected] [ref=e141] [cursor=pointer]
                    - tab "The Abyssal Citadel (2 of 3)" [ref=e142] [cursor=pointer]
                    - tab "Siren's Hollow (3 of 3)" [ref=e143] [cursor=pointer]
                  - generic [ref=e144]:
                    - button "Previous site in Thalassa" [ref=e145] [cursor=pointer]:
                      - generic [ref=e146]: ‹
                    - button "Next site in Thalassa" [ref=e147] [cursor=pointer]:
                      - generic [ref=e148]: ›
            - listitem [ref=e149]:
              - article [ref=e150]:
                - generic [ref=e152]:
                  - heading "Infernus" [level=3] [ref=e153]
                  - paragraph [ref=e154]: Fire Dominion
                  - generic [ref=e155]:
                    - heading "Brimstone Hold" [level=4] [ref=e156]
                    - paragraph [ref=e157]: Basalt ramparts ring a caldera lake of molten sulfur, where forge-clans temper weapons in rivers that never cool.
                - generic [ref=e158]:
                  - tablist "Infernus sites" [ref=e159]:
                    - tab "Brimstone Hold (1 of 3)" [selected] [ref=e160] [cursor=pointer]
                    - tab "Cinderfall (2 of 3)" [ref=e161] [cursor=pointer]
                    - tab "The Iron Foundry (3 of 3)" [ref=e162] [cursor=pointer]
                  - generic [ref=e163]:
                    - button "Previous site in Infernus" [ref=e164] [cursor=pointer]:
                      - generic [ref=e165]: ‹
                    - button "Next site in Infernus" [ref=e166] [cursor=pointer]:
                      - generic [ref=e167]: ›
            - listitem [ref=e168]:
              - article [ref=e169]:
                - generic [ref=e171]:
                  - heading "Anemos" [level=3] [ref=e172]
                  - paragraph [ref=e173]: Air Dominion
                  - generic [ref=e174]:
                    - heading "The Eyrie of Whispers" [level=4] [ref=e175]
                    - paragraph [ref=e176]: Floating monoliths tethered by storm chains; wind-mages trade secrets that can unravel a deck before the first card is drawn.
                - generic [ref=e177]:
                  - tablist "Anemos sites" [ref=e178]:
                    - tab "The Eyrie of Whispers (1 of 3)" [selected] [ref=e179] [cursor=pointer]
                    - tab "Zephyr's End (2 of 3)" [ref=e180] [cursor=pointer]
                    - tab "The Cloud Sanctuary (3 of 3)" [ref=e181] [cursor=pointer]
                  - generic [ref=e182]:
                    - button "Previous site in Anemos" [ref=e183] [cursor=pointer]:
                      - generic [ref=e184]: ‹
                    - button "Next site in Anemos" [ref=e185] [cursor=pointer]:
                      - generic [ref=e186]: ›
      - region "Game model" [ref=e187]:
        - generic [ref=e188]:
          - generic [ref=e189]:
            - heading "How Voidborn Plays" [level=2] [ref=e190]
            - paragraph [ref=e191]: Four elemental dominions, one fractured battlefield—assemble a warband, outmaneuver rivals in tense turn duels, and chase standing on the seasonal ladder.
          - list [ref=e192]:
            - listitem [ref=e193]:
              - article [ref=e194]:
                - generic [ref=e196]:
                  - heading "Field Command" [level=3] [ref=e197]
                  - paragraph [ref=e198]: Trade blows on a living board where lane pressure, bait lines, and burst windows matter more than raw stats. Win the turn before you win the match.
            - listitem [ref=e199]:
              - article [ref=e200]:
                - generic [ref=e202]:
                  - heading "Relic Hunting" [level=3] [ref=e203]
                  - paragraph [ref=e204]: Pull signatures from Kronos, Thalassa, Infernus, and Anemos—then stitch keywords, curves, and finishers into a list that punishes predictable play.
            - listitem [ref=e205]:
              - article [ref=e206]:
                - generic [ref=e208]:
                  - heading "Void Ladder" [level=3] [ref=e209]
                  - paragraph [ref=e210]: Climb seasonal tiers, absorb losses into sharper lines, and leave a trail of wrecked meta decks. The summit rewards pilots who adapt mid-series.
          - list [ref=e211]:
            - listitem [ref=e212]:
              - generic [ref=e213]:
                - generic [ref=e214]: ◆
                - text: Warband Tuning
            - listitem [ref=e215]:
              - generic [ref=e216]:
                - generic [ref=e217]: ◆
                - text: Dominion Affinities
            - listitem [ref=e218]:
              - generic [ref=e219]:
                - generic [ref=e220]: ◆
                - text: Shifting Metas
      - region "Card collection" [ref=e221]:
        - generic [ref=e222]:
          - generic [ref=e223]:
            - heading "The Voidborn Archive" [level=2] [ref=e224]
            - paragraph [ref=e225]: Every card is a tactical choice — forged across elemental realms, tuned for competitive play, and expanded every month. Explore a living collection built for deck architects and arena veterans alike.
          - list [ref=e226]:
            - listitem [ref=e227]:
              - generic [ref=e228]: 600+
              - generic [ref=e229]: Unique Cards
            - listitem [ref=e230]:
              - generic [ref=e231]: "4"
              - generic [ref=e232]: Rarity Tiers
            - listitem [ref=e233]:
              - generic [ref=e234]: ∞
              - generic [ref=e235]: Deck Strategies
            - listitem [ref=e236]:
              - generic [ref=e237]: 25+
              - generic [ref=e238]: New Cards Monthly
          - generic [ref=e239]:
            - generic [ref=e241]:
              - generic [ref=e242]:
                - generic:
                  - generic:
                    - article:
                      - generic:
                        - generic "Mana 7":
                          - generic: "7"
                        - generic "Kronos domain"
                        - generic:
                          - generic:
                            - generic "Attack 5":
                              - generic: "5"
                            - generic "Health 7":
                              - generic: "7"
                          - generic:
                            - heading "Petrified Colossus" [level=3]
                            - generic:
                              - strong: Earthshatter March
                              - paragraph: Siege 2. When this unit attacks a player, deal 2 damage to all enemy units.
                            - list "Keywords":
                              - listitem: Siege
              - paragraph [ref=e243]:
                - generic [ref=e244]: Kronos
                - generic [ref=e245]: Petrified Colossus
            - list [ref=e246]:
              - listitem [ref=e247]:
                - button "Preview Petrified Colossus" [pressed] [ref=e248] [cursor=pointer]:
                  - article [ref=e249]:
                    - generic [ref=e250]:
                      - generic "Mana 7" [ref=e251]:
                        - generic [ref=e252]: "7"
                      - generic "Kronos domain" [ref=e253]
                      - generic "Attack 5" [ref=e254]:
                        - generic [ref=e255]: "5"
                      - generic "Health 7" [ref=e256]:
                        - generic [ref=e257]: "7"
                      - heading "Petrified Colossus" [level=3] [ref=e259]
              - listitem [ref=e260]:
                - button "Preview Abyss Devourer" [ref=e261] [cursor=pointer]:
                  - article [ref=e262]:
                    - generic [ref=e263]:
                      - generic "Mana 6" [ref=e264]:
                        - generic [ref=e265]: "6"
                      - generic "Thalassa domain" [ref=e266]
                      - generic "Attack 4" [ref=e267]:
                        - generic [ref=e268]: "4"
                      - generic "Health 7" [ref=e269]:
                        - generic [ref=e270]: "7"
                      - heading "Abyss Devourer" [level=3] [ref=e272]
              - listitem [ref=e273]:
                - button "Preview Fire-Smith Devastator" [ref=e274] [cursor=pointer]:
                  - article [ref=e275]:
                    - generic [ref=e276]:
                      - generic "Mana 6" [ref=e277]:
                        - generic [ref=e278]: "6"
                      - generic "Infernus domain" [ref=e279]
                      - generic "Attack 3" [ref=e280]:
                        - generic [ref=e281]: "3"
                      - generic "Health 7" [ref=e282]:
                        - generic [ref=e283]: "7"
                      - heading "Fire-Smith Devastator" [level=3] [ref=e285]
              - listitem [ref=e286]:
                - button "Preview Cloud Colossus" [ref=e287] [cursor=pointer]:
                  - article [ref=e288]:
                    - generic [ref=e289]:
                      - generic "Mana 7" [ref=e290]:
                        - generic [ref=e291]: "7"
                      - generic "Anemos domain" [ref=e292]
                      - generic "Attack 4" [ref=e293]:
                        - generic [ref=e294]: "4"
                      - generic "Health 8" [ref=e295]:
                        - generic [ref=e296]: "8"
                      - heading "Cloud Colossus" [level=3] [ref=e298]
              - listitem [ref=e299]:
                - button "Preview Mossfang Ravager" [ref=e300] [cursor=pointer]:
                  - article [ref=e301]:
                    - generic [ref=e302]:
                      - generic "Mana 4" [ref=e303]:
                        - generic [ref=e304]: "4"
                      - generic "Kronos domain" [ref=e305]
                      - generic "Attack 4" [ref=e306]:
                        - generic [ref=e307]: "4"
                      - generic "Health 3" [ref=e308]:
                        - generic [ref=e309]: "3"
                      - heading "Mossfang Ravager" [level=3] [ref=e311]
              - listitem [ref=e312]:
                - button "Preview Blackwater Siren" [ref=e313] [cursor=pointer]:
                  - article [ref=e314]:
                    - generic [ref=e315]:
                      - generic "Mana 4" [ref=e316]:
                        - generic [ref=e317]: "4"
                      - generic "Thalassa domain" [ref=e318]
                      - generic "Attack 3" [ref=e319]:
                        - generic [ref=e320]: "3"
                      - generic "Health 4" [ref=e321]:
                        - generic [ref=e322]: "4"
                      - heading "Blackwater Siren" [level=3] [ref=e324]
              - listitem [ref=e325]:
                - button "Preview Chain Lord" [ref=e326] [cursor=pointer]:
                  - article [ref=e327]:
                    - generic [ref=e328]:
                      - generic "Mana 5" [ref=e329]:
                        - generic [ref=e330]: "5"
                      - generic "Infernus domain" [ref=e331]
                      - generic "Attack 2" [ref=e332]:
                        - generic [ref=e333]: "2"
                      - generic "Health 6" [ref=e334]:
                        - generic [ref=e335]: "6"
                      - heading "Chain Lord" [level=3] [ref=e337]
              - listitem [ref=e338]:
                - button "Preview Hurricane Weaver" [ref=e339] [cursor=pointer]:
                  - article [ref=e340]:
                    - generic [ref=e341]:
                      - generic "Mana 6" [ref=e342]:
                        - generic [ref=e343]: "6"
                      - generic "Anemos domain" [ref=e344]
                      - generic "Attack 3" [ref=e345]:
                        - generic [ref=e346]: "3"
                      - generic "Health 5" [ref=e347]:
                        - generic [ref=e348]: "5"
                      - heading "Hurricane Weaver" [level=3] [ref=e350]
      - region "Collect, trade, and conquer" [ref=e351]:
        - generic [ref=e352]:
          - generic [ref=e353]:
            - heading "Scour. Broker. Ascend." [level=2] [ref=e354]
            - paragraph [ref=e355]: The void does not hand out trophies—it rents them. Stock your warband from sealed caches and open listings, flip surplus into credits, and harden a list that survives the ladder's grind.
          - list [ref=e356]:
            - listitem [ref=e357]:
              - article [ref=e358]:
                - generic [ref=e360]:
                  - heading "Grow Your Arsenal" [level=3] [ref=e361]
                  - paragraph [ref=e362]: Stack depth across releases and seasonal drops. Every new pull widens the lines you can run when the meta tilts overnight.
            - listitem [ref=e363]:
              - article [ref=e364]:
                - generic [ref=e366]:
                  - heading "Surgical Shopping" [level=3] [ref=e367]
                  - paragraph [ref=e368]: Skip the noise. Filter the catalog, zero in on the missing link, and buy exactly the piece your curve has been begging for.
            - listitem [ref=e369]:
              - article [ref=e370]:
                - generic [ref=e372]:
                  - heading "Crack the Vaults" [level=3] [ref=e373]
                  - paragraph [ref=e374]: Rip sealed products and chase the spike. Each unopened cache is a dice roll toward a chase card or a bulk haul you can trade away.
            - listitem [ref=e375]:
              - article [ref=e376]:
                - generic [ref=e378]:
                  - heading "Chase the Apex" [level=3] [ref=e379]
                  - paragraph [ref=e380]: Hunt foils, epics, and signature prints—the kind of pull that rewrites a deck overnight and makes opponents pause on turn one.
            - listitem [ref=e381]:
              - article [ref=e382]:
                - generic [ref=e384]:
                  - heading "Cash the Excess" [level=3] [ref=e385]
                  - paragraph [ref=e386]: Duplicates and dead slots still have value. List them, fund the next upgrade, and keep your binder lean for the decks you actually play.
            - listitem [ref=e387]:
              - article [ref=e388]:
                - generic [ref=e390]:
                  - heading "Tune the Warband" [level=3] [ref=e391]
                  - paragraph [ref=e392]: Prototype lists in the deck lab—test counters, stress synergies, and lock a 30-card answer to the ladder's current bullies.
          - list [ref=e394]:
            - listitem [ref=e395]:
              - article [ref=e396]:
                - generic [ref=e397]: UNCOMMON
                - heading "Foundation Pieces" [level=3] [ref=e398]
                - paragraph [ref=e399]: Workhorse units and utility spells that glue a list together—cheap enough to craft around, flexible enough to slot into multiple strategies.
            - listitem [ref=e400]:
              - article [ref=e401]:
                - generic [ref=e402]: RARE
                - heading "Pivot Cards" [level=3] [ref=e403]
                - paragraph [ref=e404]: Standout prints with real board impact—alternate arts, foil shine, and effects that reward players who build around them.
            - listitem [ref=e405]:
              - article [ref=e406]:
                - generic [ref=e407]: EPIC
                - heading "Finishers" [level=3] [ref=e408]
                - paragraph [ref=e409]: High-impact bombs and combo engines that close games or flip a losing board. One well-timed cast can end the duel.
          - generic [ref=e410]:
            - paragraph [ref=e411]: Thousands of listings live right now—find the card that completes your next list.
            - button "Browse the Market" [ref=e412] [cursor=pointer]
      - region "FAQ" [ref=e413]:
        - generic [ref=e414]:
          - heading "Frequently Asked Questions" [level=2] [ref=e416]
          - list [ref=e417]:
            - listitem [ref=e418]:
              - button "What is Voidborn?" [ref=e419] [cursor=pointer]:
                - generic [ref=e420]: What is Voidborn?
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
              - button "Is Voidborn free to play?" [ref=e435] [cursor=pointer]:
                - generic [ref=e436]: Is Voidborn free to play?
      - region "Join the void" [ref=e438]:
        - generic [ref=e439]:
          - generic [ref=e440]:
            - heading "Embrace the Corruption" [level=2] [ref=e441]
            - paragraph [ref=e442]: Enter the Abyss. Master the Void.
            - paragraph [ref=e443]: Join a relentless covenant of tacticians, soul-harvesters, and tattered champions. Forge your deck from the dark, command forbidden energies, and carve your legacy into the dying embers of the Dominion.
            - button "Claim Your Power" [ref=e444] [cursor=pointer]
          - generic [ref=e445]:
            - heading "The Eternal Siege" [level=3] [ref=e446]
            - list [ref=e447]:
              - listitem [ref=e448]:
                - generic [ref=e449]: 50K+
                - generic [ref=e450]: Wretched Souls Aligned
              - listitem [ref=e451]:
                - generic [ref=e452]: 200K+
                - generic [ref=e453]: Daily Skirmishes
              - listitem [ref=e454]:
                - generic [ref=e455]: 10M+
                - generic [ref=e456]: Relics Unearthed
    - contentinfo "Site footer" [ref=e457]:
      - generic [ref=e458]:
        - generic [ref=e459]:
          - generic [ref=e460]:
            - link [ref=e462] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e463]: Forge your deck. Rule the realm.
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
              - listitem [ref=e480]: "Company name: Baltius, UAB"
              - listitem [ref=e481]: "Company number: 307485071"
              - listitem [ref=e482]: "Registered address: Klaipėdos g. 4A, Jokūbavo k., LT-97210 Kretingos r., LITHUANIA"
              - listitem [ref=e483]:
                - link "support@voidborn.fun" [ref=e484] [cursor=pointer]:
                  - /url: mailto:support@voidborn.fun
            - list "Social media" [ref=e485]:
              - listitem [ref=e486]:
                - link "Telegram" [ref=e487] [cursor=pointer]:
                  - /url: https://t.me/voidbornfun
              - listitem [ref=e489]:
                - link "Instagram" [ref=e490] [cursor=pointer]:
                  - /url: https://www.instagram.com/voidborn.fun/
              - listitem [ref=e492]:
                - link "Facebook" [ref=e493] [cursor=pointer]:
                  - /url: https://www.facebook.com/profile.php?id=61591572371089
              - listitem [ref=e495]:
                - link "Discord" [ref=e496] [cursor=pointer]:
                  - /url: https://discord.gg/bEnJAMkhk
            - generic "Accepted payment methods" [ref=e498]
        - generic [ref=e499]:
          - paragraph [ref=e500]: © 2026 Voidborn. All rights reserved.
          - button "Cookie Settings" [ref=e501] [cursor=pointer]
  - alert [ref=e502]
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
      |     ^ Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/voidborn-mobile-landing-linux.png, writing actual.
  111 |   });
  112 | }
```