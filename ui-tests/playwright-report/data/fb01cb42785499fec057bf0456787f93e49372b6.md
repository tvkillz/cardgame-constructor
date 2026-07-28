# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing/landing.spec.ts >> Visual check [Desktop] for voidborn
- Location: tests/landing/landing.spec.ts:12:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 1280px by 8002px, received 1280px by 7921px. 409335 pixels (ratio 0.04 of all image pixels) are different.

  Snapshot: voidborn-desktop.png

Call log:
  - Expect "toHaveScreenshot(voidborn-desktop.png)" with timeout 80000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 8002px, received 1280px by 7921px. 409335 pixels (ratio 0.04 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 8002px, received 1280px by 7921px. 409335 pixels (ratio 0.04 of all image pixels) are different.

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
        - generic [ref=e26]:
          - heading "Conquer the Void. Rule the Elemental Realms." [level=1] [ref=e27]:
            - text: Conquer the Void.
            - generic [ref=e28]: Rule the Elemental Realms.
          - paragraph [ref=e29]: Enter a shattered realm where cosmic corruption breeds legendary champions. Build your deck, harness the forbidden magic of the void, and dominate the battlefield.
          - generic [ref=e30]:
            - button "Play Now" [ref=e31] [cursor=pointer]
            - button "View Market" [ref=e32] [cursor=pointer]
            - button "Leaderboard" [ref=e33] [cursor=pointer]
          - generic "Card previews" [ref=e34]:
            - article [ref=e35] [cursor=pointer]:
              - generic [ref=e36]:
                - generic "Mana 6" [ref=e37]:
                  - generic [ref=e38]: "6"
                - generic "Kronos domain" [ref=e39]
                - generic "Attack 3" [ref=e40]:
                  - generic [ref=e41]: "3"
                - generic "Health 8" [ref=e42]:
                  - generic [ref=e43]: "8"
                - generic [ref=e44]:
                  - heading "Granite Warden" [level=3] [ref=e45]
                  - list "Keywords" [ref=e46]:
                    - listitem [ref=e47]: Taunt
                    - listitem [ref=e48]: Ward
            - article [ref=e49] [cursor=pointer]:
              - generic [ref=e50]:
                - generic "Mana 5" [ref=e51]:
                  - generic [ref=e52]: "5"
                - generic "Thalassa domain" [ref=e53]
                - generic "Attack 2" [ref=e54]:
                  - generic [ref=e55]: "2"
                - generic "Health 6" [ref=e56]:
                  - generic [ref=e57]: "6"
                - generic [ref=e58]:
                  - heading "Tidebound Priestess" [level=3] [ref=e59]
                  - list "Keywords" [ref=e60]:
                    - listitem [ref=e61]: Freeze
            - article [ref=e62] [cursor=pointer]:
              - generic [ref=e63]:
                - generic "Mana 7" [ref=e64]:
                  - generic [ref=e65]: "7"
                - generic "Infernus domain" [ref=e66]
                - generic "Attack 4" [ref=e67]:
                  - generic [ref=e68]: "4"
                - generic "Health 5" [ref=e69]:
                  - generic [ref=e70]: "5"
                - generic [ref=e71]:
                  - heading "Lava-Born" [level=3] [ref=e72]
                  - list "Keywords" [ref=e73]:
                    - listitem [ref=e74]: Charge
            - article [ref=e75] [cursor=pointer]:
              - generic [ref=e76]:
                - generic "Mana 4" [ref=e77]:
                  - generic [ref=e78]: "4"
                - generic "Anemos domain" [ref=e79]
                - generic "Attack 4" [ref=e80]:
                  - generic [ref=e81]: "4"
                - generic "Health 3" [ref=e82]:
                  - generic [ref=e83]: "3"
                - generic [ref=e84]:
                  - heading "Void Stalker" [level=3] [ref=e85]
                  - list "Keywords" [ref=e86]:
                    - listitem [ref=e87]: Stealth
                    - listitem [ref=e88]: Charge
      - region "Locations" [ref=e89]:
        - generic [ref=e91]:
          - generic [ref=e92]:
            - generic [ref=e93]:
              - heading "Face the Abyss" [level=3] [ref=e94]
              - generic [ref=e95]:
                - paragraph [ref=e96]:
                  - text: The delicate equilibrium of the domains is shattering. A catastrophic phenomenon known as the
                  - strong [ref=e97]: Aether Bleed
                  - text: is draining the lifeblood from the elemental realms, leaving behind volatile
                  - strong [ref=e98]: Null Zones
                  - text: where magic backfires and the laws of physics collapse.
                - paragraph [ref=e99]: As the Void infects the land, wild elemental spirits are twisting into maddened behemoths. Deck wielders must not only fight for territory, but stabilize these reality tears before their chosen domains dissolve into absolute nothingness.
            - list [ref=e100]:
              - listitem [ref=e101]:
                - button "Kronos" [ref=e102] [cursor=pointer]:
                  - generic [ref=e103]: Kronos
              - listitem [ref=e104]:
                - button "Thalassa" [ref=e105] [cursor=pointer]:
                  - generic [ref=e106]: Thalassa
              - listitem [ref=e107]:
                - button "Infernus" [ref=e108] [cursor=pointer]:
                  - generic [ref=e109]: Infernus
              - listitem [ref=e110]:
                - button "Anemos" [ref=e111] [cursor=pointer]:
                  - generic [ref=e112]: Anemos
          - generic "Location preview" [ref=e113]
      - region "Dominions" [ref=e116]:
        - generic [ref=e117]:
          - generic [ref=e118]:
            - heading "The Elemental Quadrant" [level=2] [ref=e119]
            - paragraph [ref=e120]: At the precipice of the Void, four elemental realms fight a losing battle against oblivion. These shattered worlds of stone, wave, flame, and wind are home to remnants of civilization, powerful decks, and ancient devastation. Explore the bastions before the Aether Bleed consumes the last of reality.
          - list [ref=e121]:
            - listitem [ref=e122]:
              - article [ref=e123]:
                - generic [ref=e125]:
                  - heading "Kronos" [level=3] [ref=e126]
                  - paragraph [ref=e127]: Earth Dominion
                  - generic [ref=e128]:
                    - heading "The Great Bastion" [level=4] [ref=e129]
                    - paragraph [ref=e130]: A massive fortress-city carved into a colossal mountain — grand stone arches, tiered terraces, and monolithic towers of granite.
                - generic [ref=e131]:
                  - tablist "Kronos sites" [ref=e132]:
                    - tab "The Great Bastion (1 of 3)" [selected] [ref=e133] [cursor=pointer]
                    - tab "Obsidian Deep (2 of 3)" [ref=e134] [cursor=pointer]
                    - tab "The Weeping Grove (3 of 3)" [ref=e135] [cursor=pointer]
                  - generic [ref=e136]:
                    - button "Previous site in Kronos" [ref=e137] [cursor=pointer]:
                      - generic [ref=e138]: ‹
                    - button "Next site in Kronos" [ref=e139] [cursor=pointer]:
                      - generic [ref=e140]: ›
            - listitem [ref=e141]:
              - article [ref=e142]:
                - generic [ref=e144]:
                  - heading "Thalassa" [level=3] [ref=e145]
                  - paragraph [ref=e146]: Water Dominion
                  - generic [ref=e147]:
                    - heading "Sunken Oakhaven" [level=4] [ref=e148]
                    - paragraph [ref=e149]: Half-drowned halls of oak and coral where tide-priests commune with leviathans in chambers flooded by moonlit seawater.
                - generic [ref=e150]:
                  - tablist "Thalassa sites" [ref=e151]:
                    - tab "Sunken Oakhaven (1 of 3)" [selected] [ref=e152] [cursor=pointer]
                    - tab "The Abyssal Citadel (2 of 3)" [ref=e153] [cursor=pointer]
                    - tab "Siren's Hollow (3 of 3)" [ref=e154] [cursor=pointer]
                  - generic [ref=e155]:
                    - button "Previous site in Thalassa" [ref=e156] [cursor=pointer]:
                      - generic [ref=e157]: ‹
                    - button "Next site in Thalassa" [ref=e158] [cursor=pointer]:
                      - generic [ref=e159]: ›
            - listitem [ref=e160]:
              - article [ref=e161]:
                - generic [ref=e163]:
                  - heading "Infernus" [level=3] [ref=e164]
                  - paragraph [ref=e165]: Fire Dominion
                  - generic [ref=e166]:
                    - heading "Brimstone Hold" [level=4] [ref=e167]
                    - paragraph [ref=e168]: Basalt ramparts ring a caldera lake of molten sulfur, where forge-clans temper weapons in rivers that never cool.
                - generic [ref=e169]:
                  - tablist "Infernus sites" [ref=e170]:
                    - tab "Brimstone Hold (1 of 3)" [selected] [ref=e171] [cursor=pointer]
                    - tab "Cinderfall (2 of 3)" [ref=e172] [cursor=pointer]
                    - tab "The Iron Foundry (3 of 3)" [ref=e173] [cursor=pointer]
                  - generic [ref=e174]:
                    - button "Previous site in Infernus" [ref=e175] [cursor=pointer]:
                      - generic [ref=e176]: ‹
                    - button "Next site in Infernus" [ref=e177] [cursor=pointer]:
                      - generic [ref=e178]: ›
            - listitem [ref=e179]:
              - article [ref=e180]:
                - generic [ref=e182]:
                  - heading "Anemos" [level=3] [ref=e183]
                  - paragraph [ref=e184]: Air Dominion
                  - generic [ref=e185]:
                    - heading "The Eyrie of Whispers" [level=4] [ref=e186]
                    - paragraph [ref=e187]: Floating monoliths tethered by storm chains; wind-mages trade secrets that can unravel a deck before the first card is drawn.
                - generic [ref=e188]:
                  - tablist "Anemos sites" [ref=e189]:
                    - tab "The Eyrie of Whispers (1 of 3)" [selected] [ref=e190] [cursor=pointer]
                    - tab "Zephyr's End (2 of 3)" [ref=e191] [cursor=pointer]
                    - tab "The Cloud Sanctuary (3 of 3)" [ref=e192] [cursor=pointer]
                  - generic [ref=e193]:
                    - button "Previous site in Anemos" [ref=e194] [cursor=pointer]:
                      - generic [ref=e195]: ‹
                    - button "Next site in Anemos" [ref=e196] [cursor=pointer]:
                      - generic [ref=e197]: ›
      - region "Game model" [ref=e198]:
        - generic [ref=e199]:
          - generic [ref=e200]:
            - heading "How Voidborn Plays" [level=2] [ref=e201]
            - paragraph [ref=e202]: Four elemental dominions, one fractured battlefield—assemble a warband, outmaneuver rivals in tense turn duels, and chase standing on the seasonal ladder.
          - list [ref=e203]:
            - listitem [ref=e204]:
              - article [ref=e205]:
                - generic [ref=e207]:
                  - heading "Field Command" [level=3] [ref=e208]
                  - paragraph [ref=e209]: Trade blows on a living board where lane pressure, bait lines, and burst windows matter more than raw stats. Win the turn before you win the match.
            - listitem [ref=e210]:
              - article [ref=e211]:
                - generic [ref=e213]:
                  - heading "Relic Hunting" [level=3] [ref=e214]
                  - paragraph [ref=e215]: Pull signatures from Kronos, Thalassa, Infernus, and Anemos—then stitch keywords, curves, and finishers into a list that punishes predictable play.
            - listitem [ref=e216]:
              - article [ref=e217]:
                - generic [ref=e219]:
                  - heading "Void Ladder" [level=3] [ref=e220]
                  - paragraph [ref=e221]: Climb seasonal tiers, absorb losses into sharper lines, and leave a trail of wrecked meta decks. The summit rewards pilots who adapt mid-series.
          - list [ref=e222]:
            - listitem [ref=e223]:
              - generic [ref=e224]:
                - generic [ref=e225]: ◆
                - text: Warband Tuning
            - listitem [ref=e226]:
              - generic [ref=e227]:
                - generic [ref=e228]: ◆
                - text: Dominion Affinities
            - listitem [ref=e229]:
              - generic [ref=e230]:
                - generic [ref=e231]: ◆
                - text: Shifting Metas
      - region "Card collection" [ref=e232]:
        - generic [ref=e233]:
          - generic [ref=e234]:
            - heading "The Voidborn Archive" [level=2] [ref=e235]
            - paragraph [ref=e236]: Every card is a tactical choice — forged across elemental realms, tuned for competitive play, and expanded every month. Explore a living collection built for deck architects and arena veterans alike.
          - list [ref=e237]:
            - listitem [ref=e238]:
              - generic [ref=e239]: 600+
              - generic [ref=e240]: Unique Cards
            - listitem [ref=e241]:
              - generic [ref=e242]: "4"
              - generic [ref=e243]: Rarity Tiers
            - listitem [ref=e244]:
              - generic [ref=e245]: ∞
              - generic [ref=e246]: Deck Strategies
            - listitem [ref=e247]:
              - generic [ref=e248]: 25+
              - generic [ref=e249]: New Cards Monthly
          - generic [ref=e250]:
            - generic [ref=e252]:
              - generic [ref=e253]:
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
              - paragraph [ref=e254]:
                - generic [ref=e255]: Kronos
                - generic [ref=e256]: Petrified Colossus
            - list [ref=e257]:
              - listitem [ref=e258]:
                - button "Preview Petrified Colossus" [pressed] [ref=e259] [cursor=pointer]:
                  - article [ref=e260]:
                    - generic [ref=e261]:
                      - generic "Mana 7" [ref=e262]:
                        - generic [ref=e263]: "7"
                      - generic "Kronos domain" [ref=e264]
                      - generic "Attack 5" [ref=e265]:
                        - generic [ref=e266]: "5"
                      - generic "Health 7" [ref=e267]:
                        - generic [ref=e268]: "7"
                      - heading "Petrified Colossus" [level=3] [ref=e270]
              - listitem [ref=e271]:
                - button "Preview Abyss Devourer" [ref=e272] [cursor=pointer]:
                  - article [ref=e273]:
                    - generic [ref=e274]:
                      - generic "Mana 6" [ref=e275]:
                        - generic [ref=e276]: "6"
                      - generic "Thalassa domain" [ref=e277]
                      - generic "Attack 4" [ref=e278]:
                        - generic [ref=e279]: "4"
                      - generic "Health 7" [ref=e280]:
                        - generic [ref=e281]: "7"
                      - heading "Abyss Devourer" [level=3] [ref=e283]
              - listitem [ref=e284]:
                - button "Preview Fire-Smith Devastator" [ref=e285] [cursor=pointer]:
                  - article [ref=e286]:
                    - generic [ref=e287]:
                      - generic "Mana 6" [ref=e288]:
                        - generic [ref=e289]: "6"
                      - generic "Infernus domain" [ref=e290]
                      - generic "Attack 3" [ref=e291]:
                        - generic [ref=e292]: "3"
                      - generic "Health 7" [ref=e293]:
                        - generic [ref=e294]: "7"
                      - heading "Fire-Smith Devastator" [level=3] [ref=e296]
              - listitem [ref=e297]:
                - button "Preview Cloud Colossus" [ref=e298] [cursor=pointer]:
                  - article [ref=e299]:
                    - generic [ref=e300]:
                      - generic "Mana 7" [ref=e301]:
                        - generic [ref=e302]: "7"
                      - generic "Anemos domain" [ref=e303]
                      - generic "Attack 4" [ref=e304]:
                        - generic [ref=e305]: "4"
                      - generic "Health 8" [ref=e306]:
                        - generic [ref=e307]: "8"
                      - heading "Cloud Colossus" [level=3] [ref=e309]
              - listitem [ref=e310]:
                - button "Preview Mossfang Ravager" [ref=e311] [cursor=pointer]:
                  - article [ref=e312]:
                    - generic [ref=e313]:
                      - generic "Mana 4" [ref=e314]:
                        - generic [ref=e315]: "4"
                      - generic "Kronos domain" [ref=e316]
                      - generic "Attack 4" [ref=e317]:
                        - generic [ref=e318]: "4"
                      - generic "Health 3" [ref=e319]:
                        - generic [ref=e320]: "3"
                      - heading "Mossfang Ravager" [level=3] [ref=e322]
              - listitem [ref=e323]:
                - button "Preview Blackwater Siren" [ref=e324] [cursor=pointer]:
                  - article [ref=e325]:
                    - generic [ref=e326]:
                      - generic "Mana 4" [ref=e327]:
                        - generic [ref=e328]: "4"
                      - generic "Thalassa domain" [ref=e329]
                      - generic "Attack 3" [ref=e330]:
                        - generic [ref=e331]: "3"
                      - generic "Health 4" [ref=e332]:
                        - generic [ref=e333]: "4"
                      - heading "Blackwater Siren" [level=3] [ref=e335]
              - listitem [ref=e336]:
                - button "Preview Chain Lord" [ref=e337] [cursor=pointer]:
                  - article [ref=e338]:
                    - generic [ref=e339]:
                      - generic "Mana 5" [ref=e340]:
                        - generic [ref=e341]: "5"
                      - generic "Infernus domain" [ref=e342]
                      - generic "Attack 2" [ref=e343]:
                        - generic [ref=e344]: "2"
                      - generic "Health 6" [ref=e345]:
                        - generic [ref=e346]: "6"
                      - heading "Chain Lord" [level=3] [ref=e348]
              - listitem [ref=e349]:
                - button "Preview Hurricane Weaver" [ref=e350] [cursor=pointer]:
                  - article [ref=e351]:
                    - generic [ref=e352]:
                      - generic "Mana 6" [ref=e353]:
                        - generic [ref=e354]: "6"
                      - generic "Anemos domain" [ref=e355]
                      - generic "Attack 3" [ref=e356]:
                        - generic [ref=e357]: "3"
                      - generic "Health 5" [ref=e358]:
                        - generic [ref=e359]: "5"
                      - heading "Hurricane Weaver" [level=3] [ref=e361]
      - region "Collect, trade, and conquer" [ref=e362]:
        - generic [ref=e363]:
          - generic [ref=e364]:
            - heading "Scour. Broker. Ascend." [level=2] [ref=e365]
            - paragraph [ref=e366]: The void does not hand out trophies—it rents them. Stock your warband from sealed caches and open listings, flip surplus into credits, and harden a list that survives the ladder's grind.
          - list [ref=e367]:
            - listitem [ref=e368]:
              - article [ref=e369]:
                - generic [ref=e371]:
                  - heading "Grow Your Arsenal" [level=3] [ref=e372]
                  - paragraph [ref=e373]: Stack depth across releases and seasonal drops. Every new pull widens the lines you can run when the meta tilts overnight.
            - listitem [ref=e374]:
              - article [ref=e375]:
                - generic [ref=e377]:
                  - heading "Surgical Shopping" [level=3] [ref=e378]
                  - paragraph [ref=e379]: Skip the noise. Filter the catalog, zero in on the missing link, and buy exactly the piece your curve has been begging for.
            - listitem [ref=e380]:
              - article [ref=e381]:
                - generic [ref=e383]:
                  - heading "Crack the Vaults" [level=3] [ref=e384]
                  - paragraph [ref=e385]: Rip sealed products and chase the spike. Each unopened cache is a dice roll toward a chase card or a bulk haul you can trade away.
            - listitem [ref=e386]:
              - article [ref=e387]:
                - generic [ref=e389]:
                  - heading "Chase the Apex" [level=3] [ref=e390]
                  - paragraph [ref=e391]: Hunt foils, epics, and signature prints—the kind of pull that rewrites a deck overnight and makes opponents pause on turn one.
            - listitem [ref=e392]:
              - article [ref=e393]:
                - generic [ref=e395]:
                  - heading "Cash the Excess" [level=3] [ref=e396]
                  - paragraph [ref=e397]: Duplicates and dead slots still have value. List them, fund the next upgrade, and keep your binder lean for the decks you actually play.
            - listitem [ref=e398]:
              - article [ref=e399]:
                - generic [ref=e401]:
                  - heading "Tune the Warband" [level=3] [ref=e402]
                  - paragraph [ref=e403]: Prototype lists in the deck lab—test counters, stress synergies, and lock a 30-card answer to the ladder's current bullies.
          - list [ref=e405]:
            - listitem [ref=e406]:
              - article [ref=e407]:
                - generic [ref=e408]: UNCOMMON
                - heading "Foundation Pieces" [level=3] [ref=e409]
                - paragraph [ref=e410]: Workhorse units and utility spells that glue a list together—cheap enough to craft around, flexible enough to slot into multiple strategies.
            - listitem [ref=e411]:
              - article [ref=e412]:
                - generic [ref=e413]: RARE
                - heading "Pivot Cards" [level=3] [ref=e414]
                - paragraph [ref=e415]: Standout prints with real board impact—alternate arts, foil shine, and effects that reward players who build around them.
            - listitem [ref=e416]:
              - article [ref=e417]:
                - generic [ref=e418]: EPIC
                - heading "Finishers" [level=3] [ref=e419]
                - paragraph [ref=e420]: High-impact bombs and combo engines that close games or flip a losing board. One well-timed cast can end the duel.
          - generic [ref=e421]:
            - paragraph [ref=e422]: Thousands of listings live right now—find the card that completes your next list.
            - button "Browse the Market" [ref=e423] [cursor=pointer]
      - region "FAQ" [ref=e424]:
        - generic [ref=e425]:
          - heading "Frequently Asked Questions" [level=2] [ref=e427]
          - list [ref=e428]:
            - listitem [ref=e429]:
              - button "What is Voidborn?" [ref=e430] [cursor=pointer]:
                - generic [ref=e431]: What is Voidborn?
            - listitem [ref=e433]:
              - button "How do I start playing?" [ref=e434] [cursor=pointer]:
                - generic [ref=e435]: How do I start playing?
            - listitem [ref=e437]:
              - button "What are credits used for?" [ref=e438] [cursor=pointer]:
                - generic [ref=e439]: What are credits used for?
            - listitem [ref=e441]:
              - button "Can I trade or sell my cards?" [ref=e442] [cursor=pointer]:
                - generic [ref=e443]: Can I trade or sell my cards?
            - listitem [ref=e445]:
              - button "Is Voidborn free to play?" [ref=e446] [cursor=pointer]:
                - generic [ref=e447]: Is Voidborn free to play?
      - region "Join the void" [ref=e449]:
        - generic [ref=e450]:
          - generic [ref=e451]:
            - heading "Embrace the Corruption" [level=2] [ref=e452]
            - paragraph [ref=e453]: Enter the Abyss. Master the Void.
            - paragraph [ref=e454]: Join a relentless covenant of tacticians, soul-harvesters, and tattered champions. Forge your deck from the dark, command forbidden energies, and carve your legacy into the dying embers of the Dominion.
            - button "Claim Your Power" [ref=e455] [cursor=pointer]
          - generic [ref=e456]:
            - heading "The Eternal Siege" [level=3] [ref=e457]
            - list [ref=e458]:
              - listitem [ref=e459]:
                - generic [ref=e460]: 50K+
                - generic [ref=e461]: Wretched Souls Aligned
              - listitem [ref=e462]:
                - generic [ref=e463]: 200K+
                - generic [ref=e464]: Daily Skirmishes
              - listitem [ref=e465]:
                - generic [ref=e466]: 10M+
                - generic [ref=e467]: Relics Unearthed
    - contentinfo "Site footer" [ref=e468]:
      - generic [ref=e469]:
        - generic [ref=e470]:
          - generic [ref=e471]:
            - link [ref=e473] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e474]: Forge your deck. Rule the realm.
          - generic [ref=e475]:
            - heading "Legal" [level=3] [ref=e476]
            - list [ref=e477]:
              - listitem [ref=e478]:
                - link "Terms of Service" [ref=e479] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e480]:
                - link "Privacy Notice" [ref=e481] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e482]:
                - link "Cancellation & Refund Policy" [ref=e483] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e484]:
                - link "Disclaimer" [ref=e485] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e486]:
                - link "Cookie Policy" [ref=e487] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e488]:
            - heading "Contact" [level=3] [ref=e489]
            - list [ref=e490]:
              - listitem [ref=e491]: "Company name: Baltius, UAB"
              - listitem [ref=e492]: "Company number: 307485071"
              - listitem [ref=e493]: "Registered address: Klaipėdos g. 4A, Jokūbavo k., LT-97210 Kretingos r., LITHUANIA"
              - listitem [ref=e494]:
                - link "support@voidborn.fun" [ref=e495] [cursor=pointer]:
                  - /url: mailto:support@voidborn.fun
            - list "Social media" [ref=e496]:
              - listitem [ref=e497]:
                - link "Telegram" [ref=e498] [cursor=pointer]:
                  - /url: https://t.me/voidbornfun
              - listitem [ref=e500]:
                - link "Instagram" [ref=e501] [cursor=pointer]:
                  - /url: https://www.instagram.com/voidborn.fun/
              - listitem [ref=e503]:
                - link "Facebook" [ref=e504] [cursor=pointer]:
                  - /url: https://www.facebook.com/profile.php?id=61591572371089
              - listitem [ref=e506]:
                - link "Discord" [ref=e507] [cursor=pointer]:
                  - /url: https://discord.gg/bEnJAMkhk
            - generic "Accepted payment methods" [ref=e509]
        - generic [ref=e510]:
          - paragraph [ref=e511]: © 2026 Voidborn. All rights reserved.
          - button "Cookie Settings" [ref=e512] [cursor=pointer]
  - alert [ref=e513]
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