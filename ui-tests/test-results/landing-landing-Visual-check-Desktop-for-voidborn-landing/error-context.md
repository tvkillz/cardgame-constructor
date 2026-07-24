# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing/landing.spec.ts >> Visual check [Desktop] for voidborn
- Location: tests/landing/landing.spec.ts:12:7

# Error details

```
Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/voidborn-desktop-landing-linux.png, writing actual.
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
                - generic [ref=e43]:
                  - heading "Granite Warden" [level=3] [ref=e44]
                  - list "Keywords" [ref=e45]:
                    - listitem [ref=e46]: Taunt
                    - listitem [ref=e47]: Ward
            - article [ref=e48] [cursor=pointer]:
              - generic [ref=e49]:
                - generic "Mana 5" [ref=e50]:
                  - generic [ref=e51]: "5"
                - generic "Thalassa domain" [ref=e52]
                - generic "Attack 2" [ref=e53]:
                  - generic [ref=e54]: "2"
                - generic "Health 6" [ref=e55]:
                  - generic [ref=e56]: "6"
                - generic [ref=e57]:
                  - heading "Tidebound Priestess" [level=3] [ref=e58]
                  - list "Keywords" [ref=e59]:
                    - listitem [ref=e60]: Freeze
            - article [ref=e61] [cursor=pointer]:
              - generic [ref=e62]:
                - generic "Mana 7" [ref=e63]:
                  - generic [ref=e64]: "7"
                - generic "Infernus domain" [ref=e65]
                - generic "Attack 4" [ref=e66]:
                  - generic [ref=e67]: "4"
                - generic "Health 5" [ref=e68]:
                  - generic [ref=e69]: "5"
                - generic [ref=e70]:
                  - heading "Lava-Born" [level=3] [ref=e71]
                  - list "Keywords" [ref=e72]:
                    - listitem [ref=e73]: Charge
            - article [ref=e74] [cursor=pointer]:
              - generic [ref=e75]:
                - generic "Mana 4" [ref=e76]:
                  - generic [ref=e77]: "4"
                - generic "Anemos domain" [ref=e78]
                - generic "Attack 4" [ref=e79]:
                  - generic [ref=e80]: "4"
                - generic "Health 3" [ref=e81]:
                  - generic [ref=e82]: "3"
                - generic [ref=e83]:
                  - heading "Void Stalker" [level=3] [ref=e84]
                  - list "Keywords" [ref=e85]:
                    - listitem [ref=e86]: Stealth
                    - listitem [ref=e87]: Charge
      - region "Locations" [ref=e88]:
        - generic [ref=e90]:
          - generic [ref=e91]:
            - generic [ref=e92]:
              - heading "Face the Abyss" [level=3] [ref=e93]
              - generic [ref=e94]:
                - paragraph [ref=e95]:
                  - text: The delicate equilibrium of the domains is shattering. A catastrophic phenomenon known as the
                  - strong [ref=e96]: Aether Bleed
                  - text: is draining the lifeblood from the elemental realms, leaving behind volatile
                  - strong [ref=e97]: Null Zones
                  - text: where magic backfires and the laws of physics collapse.
                - paragraph [ref=e98]: As the Void infects the land, wild elemental spirits are twisting into maddened behemoths. Deck wielders must not only fight for territory, but stabilize these reality tears before their chosen domains dissolve into absolute nothingness.
            - list [ref=e99]:
              - listitem [ref=e100]:
                - button "Kronos" [ref=e101] [cursor=pointer]:
                  - generic [ref=e102]: Kronos
              - listitem [ref=e103]:
                - button "Thalassa" [ref=e104] [cursor=pointer]:
                  - generic [ref=e105]: Thalassa
              - listitem [ref=e106]:
                - button "Infernus" [ref=e107] [cursor=pointer]:
                  - generic [ref=e108]: Infernus
              - listitem [ref=e109]:
                - button "Anemos" [ref=e110] [cursor=pointer]:
                  - generic [ref=e111]: Anemos
          - generic "Location preview" [ref=e112]
      - region "Dominions" [ref=e115]:
        - generic [ref=e116]:
          - generic [ref=e117]:
            - heading "The Elemental Quadrant" [level=2] [ref=e118]
            - paragraph [ref=e119]: At the precipice of the Void, four elemental realms fight a losing battle against oblivion. These shattered worlds of stone, wave, flame, and wind are home to remnants of civilization, powerful decks, and ancient devastation. Explore the bastions before the Aether Bleed consumes the last of reality.
          - list [ref=e120]:
            - listitem [ref=e121]:
              - article [ref=e122]:
                - generic [ref=e124]:
                  - heading "Kronos" [level=3] [ref=e125]
                  - paragraph [ref=e126]: Earth Dominion
                  - generic [ref=e127]:
                    - heading "The Great Bastion" [level=4] [ref=e128]
                    - paragraph [ref=e129]: A massive fortress-city carved into a colossal mountain — grand stone arches, tiered terraces, and monolithic towers of granite.
                - generic [ref=e130]:
                  - tablist "Kronos sites" [ref=e131]:
                    - tab "The Great Bastion (1 of 3)" [selected] [ref=e132] [cursor=pointer]
                    - tab "Obsidian Deep (2 of 3)" [ref=e133] [cursor=pointer]
                    - tab "The Weeping Grove (3 of 3)" [ref=e134] [cursor=pointer]
                  - generic [ref=e135]:
                    - button "Previous site in Kronos" [ref=e136] [cursor=pointer]:
                      - generic [ref=e137]: ‹
                    - button "Next site in Kronos" [ref=e138] [cursor=pointer]:
                      - generic [ref=e139]: ›
            - listitem [ref=e140]:
              - article [ref=e141]:
                - generic [ref=e143]:
                  - heading "Thalassa" [level=3] [ref=e144]
                  - paragraph [ref=e145]: Water Dominion
                  - generic [ref=e146]:
                    - heading "Sunken Oakhaven" [level=4] [ref=e147]
                    - paragraph [ref=e148]: Half-drowned halls of oak and coral where tide-priests commune with leviathans in chambers flooded by moonlit seawater.
                - generic [ref=e149]:
                  - tablist "Thalassa sites" [ref=e150]:
                    - tab "Sunken Oakhaven (1 of 3)" [selected] [ref=e151] [cursor=pointer]
                    - tab "The Abyssal Citadel (2 of 3)" [ref=e152] [cursor=pointer]
                    - tab "Siren's Hollow (3 of 3)" [ref=e153] [cursor=pointer]
                  - generic [ref=e154]:
                    - button "Previous site in Thalassa" [ref=e155] [cursor=pointer]:
                      - generic [ref=e156]: ‹
                    - button "Next site in Thalassa" [ref=e157] [cursor=pointer]:
                      - generic [ref=e158]: ›
            - listitem [ref=e159]:
              - article [ref=e160]:
                - generic [ref=e162]:
                  - heading "Infernus" [level=3] [ref=e163]
                  - paragraph [ref=e164]: Fire Dominion
                  - generic [ref=e165]:
                    - heading "Brimstone Hold" [level=4] [ref=e166]
                    - paragraph [ref=e167]: Basalt ramparts ring a caldera lake of molten sulfur, where forge-clans temper weapons in rivers that never cool.
                - generic [ref=e168]:
                  - tablist "Infernus sites" [ref=e169]:
                    - tab "Brimstone Hold (1 of 3)" [selected] [ref=e170] [cursor=pointer]
                    - tab "Cinderfall (2 of 3)" [ref=e171] [cursor=pointer]
                    - tab "The Iron Foundry (3 of 3)" [ref=e172] [cursor=pointer]
                  - generic [ref=e173]:
                    - button "Previous site in Infernus" [ref=e174] [cursor=pointer]:
                      - generic [ref=e175]: ‹
                    - button "Next site in Infernus" [ref=e176] [cursor=pointer]:
                      - generic [ref=e177]: ›
            - listitem [ref=e178]:
              - article [ref=e179]:
                - generic [ref=e181]:
                  - heading "Anemos" [level=3] [ref=e182]
                  - paragraph [ref=e183]: Air Dominion
                  - generic [ref=e184]:
                    - heading "The Eyrie of Whispers" [level=4] [ref=e185]
                    - paragraph [ref=e186]: Floating monoliths tethered by storm chains; wind-mages trade secrets that can unravel a deck before the first card is drawn.
                - generic [ref=e187]:
                  - tablist "Anemos sites" [ref=e188]:
                    - tab "The Eyrie of Whispers (1 of 3)" [selected] [ref=e189] [cursor=pointer]
                    - tab "Zephyr's End (2 of 3)" [ref=e190] [cursor=pointer]
                    - tab "The Cloud Sanctuary (3 of 3)" [ref=e191] [cursor=pointer]
                  - generic [ref=e192]:
                    - button "Previous site in Anemos" [ref=e193] [cursor=pointer]:
                      - generic [ref=e194]: ‹
                    - button "Next site in Anemos" [ref=e195] [cursor=pointer]:
                      - generic [ref=e196]: ›
      - region "Game model" [ref=e197]:
        - generic [ref=e198]:
          - generic [ref=e199]:
            - heading "How Voidborn Plays" [level=2] [ref=e200]
            - paragraph [ref=e201]: Four elemental dominions, one fractured battlefield—assemble a warband, outmaneuver rivals in tense turn duels, and chase standing on the seasonal ladder.
          - list [ref=e202]:
            - listitem [ref=e203]:
              - article [ref=e204]:
                - generic [ref=e206]:
                  - heading "Field Command" [level=3] [ref=e207]
                  - paragraph [ref=e208]: Trade blows on a living board where lane pressure, bait lines, and burst windows matter more than raw stats. Win the turn before you win the match.
            - listitem [ref=e209]:
              - article [ref=e210]:
                - generic [ref=e212]:
                  - heading "Relic Hunting" [level=3] [ref=e213]
                  - paragraph [ref=e214]: Pull signatures from Kronos, Thalassa, Infernus, and Anemos—then stitch keywords, curves, and finishers into a list that punishes predictable play.
            - listitem [ref=e215]:
              - article [ref=e216]:
                - generic [ref=e218]:
                  - heading "Void Ladder" [level=3] [ref=e219]
                  - paragraph [ref=e220]: Climb seasonal tiers, absorb losses into sharper lines, and leave a trail of wrecked meta decks. The summit rewards pilots who adapt mid-series.
          - list [ref=e221]:
            - listitem [ref=e222]:
              - generic [ref=e223]:
                - generic [ref=e224]: ◆
                - text: Warband Tuning
            - listitem [ref=e225]:
              - generic [ref=e226]:
                - generic [ref=e227]: ◆
                - text: Dominion Affinities
            - listitem [ref=e228]:
              - generic [ref=e229]:
                - generic [ref=e230]: ◆
                - text: Shifting Metas
      - region "Card collection" [ref=e231]:
        - generic [ref=e232]:
          - generic [ref=e233]:
            - heading "The Voidborn Archive" [level=2] [ref=e234]
            - paragraph [ref=e235]: Every card is a tactical choice — forged across elemental realms, tuned for competitive play, and expanded every month. Explore a living collection built for deck architects and arena veterans alike.
          - list [ref=e236]:
            - listitem [ref=e237]:
              - generic [ref=e238]: 600+
              - generic [ref=e239]: Unique Cards
            - listitem [ref=e240]:
              - generic [ref=e241]: "4"
              - generic [ref=e242]: Rarity Tiers
            - listitem [ref=e243]:
              - generic [ref=e244]: ∞
              - generic [ref=e245]: Deck Strategies
            - listitem [ref=e246]:
              - generic [ref=e247]: 25+
              - generic [ref=e248]: New Cards Monthly
          - generic [ref=e249]:
            - generic [ref=e251]:
              - generic [ref=e252]:
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
              - paragraph [ref=e253]:
                - generic [ref=e254]: Kronos
                - generic [ref=e255]: Petrified Colossus
            - list [ref=e256]:
              - listitem [ref=e257]:
                - button "Preview Petrified Colossus" [pressed] [ref=e258] [cursor=pointer]:
                  - article [ref=e259]:
                    - generic [ref=e260]:
                      - generic "Mana 7" [ref=e261]:
                        - generic [ref=e262]: "7"
                      - generic "Kronos domain" [ref=e263]
                      - generic "Attack 5" [ref=e264]:
                        - generic [ref=e265]: "5"
                      - generic "Health 7" [ref=e266]:
                        - generic [ref=e267]: "7"
                      - heading "Petrified Colossus" [level=3] [ref=e269]
              - listitem [ref=e270]:
                - button "Preview Abyss Devourer" [ref=e271] [cursor=pointer]:
                  - article [ref=e272]:
                    - generic [ref=e273]:
                      - generic "Mana 6" [ref=e274]:
                        - generic [ref=e275]: "6"
                      - generic "Thalassa domain" [ref=e276]
                      - generic "Attack 4" [ref=e277]:
                        - generic [ref=e278]: "4"
                      - generic "Health 7" [ref=e279]:
                        - generic [ref=e280]: "7"
                      - heading "Abyss Devourer" [level=3] [ref=e282]
              - listitem [ref=e283]:
                - button "Preview Fire-Smith Devastator" [ref=e284] [cursor=pointer]:
                  - article [ref=e285]:
                    - generic [ref=e286]:
                      - generic "Mana 6" [ref=e287]:
                        - generic [ref=e288]: "6"
                      - generic "Infernus domain" [ref=e289]
                      - generic "Attack 3" [ref=e290]:
                        - generic [ref=e291]: "3"
                      - generic "Health 7" [ref=e292]:
                        - generic [ref=e293]: "7"
                      - heading "Fire-Smith Devastator" [level=3] [ref=e295]
              - listitem [ref=e296]:
                - button "Preview Cloud Colossus" [ref=e297] [cursor=pointer]:
                  - article [ref=e298]:
                    - generic [ref=e299]:
                      - generic "Mana 7" [ref=e300]:
                        - generic [ref=e301]: "7"
                      - generic "Anemos domain" [ref=e302]
                      - generic "Attack 4" [ref=e303]:
                        - generic [ref=e304]: "4"
                      - generic "Health 8" [ref=e305]:
                        - generic [ref=e306]: "8"
                      - heading "Cloud Colossus" [level=3] [ref=e308]
              - listitem [ref=e309]:
                - button "Preview Mossfang Ravager" [ref=e310] [cursor=pointer]:
                  - article [ref=e311]:
                    - generic [ref=e312]:
                      - generic "Mana 4" [ref=e313]:
                        - generic [ref=e314]: "4"
                      - generic "Kronos domain" [ref=e315]
                      - generic "Attack 4" [ref=e316]:
                        - generic [ref=e317]: "4"
                      - generic "Health 3" [ref=e318]:
                        - generic [ref=e319]: "3"
                      - heading "Mossfang Ravager" [level=3] [ref=e321]
              - listitem [ref=e322]:
                - button "Preview Blackwater Siren" [ref=e323] [cursor=pointer]:
                  - article [ref=e324]:
                    - generic [ref=e325]:
                      - generic "Mana 4" [ref=e326]:
                        - generic [ref=e327]: "4"
                      - generic "Thalassa domain" [ref=e328]
                      - generic "Attack 3" [ref=e329]:
                        - generic [ref=e330]: "3"
                      - generic "Health 4" [ref=e331]:
                        - generic [ref=e332]: "4"
                      - heading "Blackwater Siren" [level=3] [ref=e334]
              - listitem [ref=e335]:
                - button "Preview Chain Lord" [ref=e336] [cursor=pointer]:
                  - article [ref=e337]:
                    - generic [ref=e338]:
                      - generic "Mana 5" [ref=e339]:
                        - generic [ref=e340]: "5"
                      - generic "Infernus domain" [ref=e341]
                      - generic "Attack 2" [ref=e342]:
                        - generic [ref=e343]: "2"
                      - generic "Health 6" [ref=e344]:
                        - generic [ref=e345]: "6"
                      - heading "Chain Lord" [level=3] [ref=e347]
              - listitem [ref=e348]:
                - button "Preview Hurricane Weaver" [ref=e349] [cursor=pointer]:
                  - article [ref=e350]:
                    - generic [ref=e351]:
                      - generic "Mana 6" [ref=e352]:
                        - generic [ref=e353]: "6"
                      - generic "Anemos domain" [ref=e354]
                      - generic "Attack 3" [ref=e355]:
                        - generic [ref=e356]: "3"
                      - generic "Health 5" [ref=e357]:
                        - generic [ref=e358]: "5"
                      - heading "Hurricane Weaver" [level=3] [ref=e360]
      - region "Collect, trade, and conquer" [ref=e361]:
        - generic [ref=e362]:
          - generic [ref=e363]:
            - heading "Scour. Broker. Ascend." [level=2] [ref=e364]
            - paragraph [ref=e365]: The void does not hand out trophies—it rents them. Stock your warband from sealed caches and open listings, flip surplus into credits, and harden a list that survives the ladder's grind.
          - list [ref=e366]:
            - listitem [ref=e367]:
              - article [ref=e368]:
                - generic [ref=e370]:
                  - heading "Grow Your Arsenal" [level=3] [ref=e371]
                  - paragraph [ref=e372]: Stack depth across releases and seasonal drops. Every new pull widens the lines you can run when the meta tilts overnight.
            - listitem [ref=e373]:
              - article [ref=e374]:
                - generic [ref=e376]:
                  - heading "Surgical Shopping" [level=3] [ref=e377]
                  - paragraph [ref=e378]: Skip the noise. Filter the catalog, zero in on the missing link, and buy exactly the piece your curve has been begging for.
            - listitem [ref=e379]:
              - article [ref=e380]:
                - generic [ref=e382]:
                  - heading "Crack the Vaults" [level=3] [ref=e383]
                  - paragraph [ref=e384]: Rip sealed products and chase the spike. Each unopened cache is a dice roll toward a chase card or a bulk haul you can trade away.
            - listitem [ref=e385]:
              - article [ref=e386]:
                - generic [ref=e388]:
                  - heading "Chase the Apex" [level=3] [ref=e389]
                  - paragraph [ref=e390]: Hunt foils, epics, and signature prints—the kind of pull that rewrites a deck overnight and makes opponents pause on turn one.
            - listitem [ref=e391]:
              - article [ref=e392]:
                - generic [ref=e394]:
                  - heading "Cash the Excess" [level=3] [ref=e395]
                  - paragraph [ref=e396]: Duplicates and dead slots still have value. List them, fund the next upgrade, and keep your binder lean for the decks you actually play.
            - listitem [ref=e397]:
              - article [ref=e398]:
                - generic [ref=e400]:
                  - heading "Tune the Warband" [level=3] [ref=e401]
                  - paragraph [ref=e402]: Prototype lists in the deck lab—test counters, stress synergies, and lock a 30-card answer to the ladder's current bullies.
          - list [ref=e404]:
            - listitem [ref=e405]:
              - article [ref=e406]:
                - generic [ref=e407]: UNCOMMON
                - heading "Foundation Pieces" [level=3] [ref=e408]
                - paragraph [ref=e409]: Workhorse units and utility spells that glue a list together—cheap enough to craft around, flexible enough to slot into multiple strategies.
            - listitem [ref=e410]:
              - article [ref=e411]:
                - generic [ref=e412]: RARE
                - heading "Pivot Cards" [level=3] [ref=e413]
                - paragraph [ref=e414]: Standout prints with real board impact—alternate arts, foil shine, and effects that reward players who build around them.
            - listitem [ref=e415]:
              - article [ref=e416]:
                - generic [ref=e417]: EPIC
                - heading "Finishers" [level=3] [ref=e418]
                - paragraph [ref=e419]: High-impact bombs and combo engines that close games or flip a losing board. One well-timed cast can end the duel.
          - generic [ref=e420]:
            - paragraph [ref=e421]: Thousands of listings live right now—find the card that completes your next list.
            - button "Browse the Market" [ref=e422] [cursor=pointer]
      - region "FAQ" [ref=e423]:
        - generic [ref=e424]:
          - heading "Frequently Asked Questions" [level=2] [ref=e426]
          - list [ref=e427]:
            - listitem [ref=e428]:
              - button "What is Voidborn?" [ref=e429] [cursor=pointer]:
                - generic [ref=e430]: What is Voidborn?
            - listitem [ref=e432]:
              - button "How do I start playing?" [ref=e433] [cursor=pointer]:
                - generic [ref=e434]: How do I start playing?
            - listitem [ref=e436]:
              - button "What are credits used for?" [ref=e437] [cursor=pointer]:
                - generic [ref=e438]: What are credits used for?
            - listitem [ref=e440]:
              - button "Can I trade or sell my cards?" [ref=e441] [cursor=pointer]:
                - generic [ref=e442]: Can I trade or sell my cards?
            - listitem [ref=e444]:
              - button "Is Voidborn free to play?" [ref=e445] [cursor=pointer]:
                - generic [ref=e446]: Is Voidborn free to play?
      - region "Join the void" [ref=e448]:
        - generic [ref=e449]:
          - generic [ref=e450]:
            - heading "Embrace the Corruption" [level=2] [ref=e451]
            - paragraph [ref=e452]: Enter the Abyss. Master the Void.
            - paragraph [ref=e453]: Join a relentless covenant of tacticians, soul-harvesters, and tattered champions. Forge your deck from the dark, command forbidden energies, and carve your legacy into the dying embers of the Dominion.
            - button "Claim Your Power" [ref=e454] [cursor=pointer]
          - generic [ref=e455]:
            - heading "The Eternal Siege" [level=3] [ref=e456]
            - list [ref=e457]:
              - listitem [ref=e458]:
                - generic [ref=e459]: 50K+
                - generic [ref=e460]: Wretched Souls Aligned
              - listitem [ref=e461]:
                - generic [ref=e462]: 200K+
                - generic [ref=e463]: Daily Skirmishes
              - listitem [ref=e464]:
                - generic [ref=e465]: 10M+
                - generic [ref=e466]: Relics Unearthed
    - contentinfo "Site footer" [ref=e467]:
      - generic [ref=e468]:
        - generic [ref=e469]:
          - generic [ref=e470]:
            - link [ref=e472] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e473]: Forge your deck. Rule the realm.
          - generic [ref=e474]:
            - heading "Legal" [level=3] [ref=e475]
            - list [ref=e476]:
              - listitem [ref=e477]:
                - link "Terms of Service" [ref=e478] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e479]:
                - link "Privacy Notice" [ref=e480] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e481]:
                - link "Cancellation & Refund Policy" [ref=e482] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e483]:
                - link "Disclaimer" [ref=e484] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e485]:
                - link "Cookie Policy" [ref=e486] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e487]:
            - heading "Contact" [level=3] [ref=e488]
            - list [ref=e489]:
              - listitem [ref=e490]: "Company name: Baltius, UAB"
              - listitem [ref=e491]: "Company number: 307485071"
              - listitem [ref=e492]: "Registered address: Klaipėdos g. 4A, Jokūbavo k., LT-97210 Kretingos r., LITHUANIA"
              - listitem [ref=e493]:
                - link "support@voidborn.fun" [ref=e494] [cursor=pointer]:
                  - /url: mailto:support@voidborn.fun
            - list "Social media" [ref=e495]:
              - listitem [ref=e496]:
                - link "Telegram" [ref=e497] [cursor=pointer]:
                  - /url: https://t.me/voidbornfun
              - listitem [ref=e499]:
                - link "Instagram" [ref=e500] [cursor=pointer]:
                  - /url: https://www.instagram.com/voidborn.fun/
              - listitem [ref=e502]:
                - link "Facebook" [ref=e503] [cursor=pointer]:
                  - /url: https://www.facebook.com/profile.php?id=61591572371089
              - listitem [ref=e505]:
                - link "Discord" [ref=e506] [cursor=pointer]:
                  - /url: https://discord.gg/bEnJAMkhk
            - generic "Accepted payment methods" [ref=e508]
        - generic [ref=e509]:
          - paragraph [ref=e510]: © 2026 Voidborn. All rights reserved.
          - button "Cookie Settings" [ref=e511] [cursor=pointer]
  - alert [ref=e512]
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
      |     ^ Error: A snapshot doesn't exist at /home/any/Desktop/constructor-mount/ui-tests/tests/landing/landing.spec.ts-snapshots/voidborn-desktop-landing-linux.png, writing actual.
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