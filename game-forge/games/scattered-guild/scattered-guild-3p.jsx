import { useState, useCallback, useEffect, useRef } from "react";

// ——— CHARACTER DATA ———
const CHARACTERS = {
  rachael: {
    name: "Rachael",
    title: "Artificer / Bard",
    level: 12,
    hp: 88,
    maxHp: 88,
    stats: { STR: 8, DEX: 14, CON: 13, INT: 17, WIS: 15, CHA: 15 },
    skills: ["persuasion","insight","investigation","sleightOfHand","arcana","performance","animalHandling","history","nature"],
    tools: ["Herbalism kit","Calligrapher's supplies","Weaver's tools","Tinker's tools"],
    flaw: "Undercharges for services",
    bond: "The Delegation. The garden.",
    color: "#7b8fc9",
    pixel: [
      "..1111..",
      ".111111.",
      "11133111",
      "11133111",
      ".112211.",
      "..1221..",
      ".144441.",
      "14444441",
      "14444441",
      ".144441.",
      "..4444..",
      ".44..44.",
    ],
    palette: { "1": "#4a3728", "2": "#e8d4b8", "3": "#5588bb", "4": "#2d4a7a" },
  },
  liz: {
    name: "Liz",
    title: "Artificer / Bard",
    level: 12,
    hp: 82,
    maxHp: 82,
    stats: { STR: 9, DEX: 12, CON: 11, INT: 20, WIS: 14, CHA: 18 },
    skills: ["investigation","persuasion","arcana","history","insight","perception","performance","sleightOfHand","intimidation"],
    tools: ["Tinker's tools","Smith's tools","Carpenter's tools","Thieves' tools","Alchemist's supplies","Calligrapher's supplies"],
    flaw: "Every solved problem reveals three projects that would be incredibly cool and technically feasible",
    bond: "The institution. The infrastructure.",
    color: "#c9a87b",
    pixel: [
      "..1111..",
      ".111111.",
      "11133111",
      "11133111",
      ".112211.",
      "..1221..",
      ".144441.",
      "14444441",
      "14444441",
      ".144441.",
      "..4444..",
      ".44..44.",
    ],
    palette: { "1": "#2a1a0a", "2": "#e8d4b8", "3": "#4488aa", "4": "#8b6b4a" },
  },
  sophia: {
    name: "Sophia",
    title: "Bard (Whispers)",
    level: 5,
    hp: 33,
    maxHp: 33,
    stats: { STR: 16, DEX: 15, CON: 13, INT: 10, WIS: 12, CHA: 18 },
    skills: ["persuasion","performance","intimidation","insight","sleightOfHand","deception","perception","acrobatics"],
    tools: ["Leatherworker's tools","Disguise kit","Musical instrument (drum)"],
    flaw: "Will absolutely take on one more platform, one more project, one more thing that's 'technically feasible'",
    bond: "The guild hall she built by hand.",
    color: "#c97ba8",
    pixel: [
      "1.1111.1",
      ".111111.",
      "11122111",
      "11122111",
      ".112211.",
      "..1221..",
      ".133331.",
      "13333331",
      "13333331",
      ".133331.",
      "..3333..",
      ".33..33.",
    ],
    palette: { "1": "#2a0a1a", "2": "#b86850", "3": "#4a2060" },
  },
  kai: {
    name: "Kai",
    title: "Ranger (Horizon Walker)",
    level: 7,
    hp: 58,
    maxHp: 58,
    stats: { STR: 14, DEX: 16, CON: 14, INT: 10, WIS: 16, CHA: 8 },
    skills: ["nature","survival","perception","stealth","athletics","animalHandling"],
    tools: ["Navigator's tools","Herbalism kit","Cartographer's tools"],
    flaw: "Trusts the land more than people; vanishes when conversations get complicated",
    bond: "The coastline. The mangroves.",
    color: "#7bc9a8",
    pixel: [
      "..1111..",
      ".111111.",
      "11122111",
      "11122111",
      ".112211.",
      "..1221..",
      ".133331.",
      "13333331",
      "13333331",
      ".133331.",
      "..3333..",
      ".33..33.",
    ],
    palette: { "1": "#3a3020", "2": "#c8a882", "3": "#2d4a2d" },
  },
};

const SKILL_STATS = {
  persuasion:"CHA", insight:"WIS", nature:"WIS", investigation:"INT",
  sleightOfHand:"DEX", arcana:"INT", performance:"CHA", animalHandling:"WIS",
  history:"INT", athletics:"STR", intimidation:"CHA", perception:"WIS",
  stealth:"DEX", survival:"WIS", acrobatics:"DEX", medicine:"WIS",
  religion:"INT", deception:"CHA",
};

function getMod(val) { return Math.floor((val - 10) / 2); }
function getProf(level) { return Math.ceil(level / 4) + 1; }

function rollFor(charId, skillName) {
  const char = CHARACTERS[charId];
  const stat = SKILL_STATS[skillName];
  const mod = getMod(char.stats[stat]);
  const prof = getProf(char.level);
  const isProficient = char.skills.includes(skillName);
  const bonus = mod + (isProficient ? prof : Math.floor(prof / 2));
  const d20 = Math.floor(Math.random() * 20) + 1;
  return { d20, bonus, total: d20 + bonus, nat20: d20 === 20, nat1: d20 === 1, charId, skillName };
}

// ——— PIXEL SPRITE ———
function PixelSprite({ charId, size = 4, style: extraStyle }) {
  const char = CHARACTERS[charId];
  if (!char) return null;
  return (
    <div style={{ display: "inline-block", lineHeight: 0, ...extraStyle }}>
      {char.pixel.map((row, y) => (
        <div key={y} style={{ display: "flex" }}>
          {row.split("").map((c, x) => (
            <div key={x} style={{
              width: size, height: size,
              background: c === "." ? "transparent" : (char.palette[c] || "#888"),
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ——— SCENES ———
const SCENES = {
  intro: {
    title: "The Concord's Summons",
    text: `Dawn breaks over Floridae. Salt air, jasmine, the distant percussion of surf on mangrove roots.

Four people converge on the town square fountain — each holding an identical letter, each wearing the same expression: curiosity sharpened by skepticism.

The letters arrived differently. Rachael's was tucked inside a bolt of indigo linen at her workshop. Liz found hers folded into the schematics of a half-finished prototype. Sophia's was stitched — actually stitched — into a leather pattern at her booth. Kai's was pinned to a mangrove branch at their usual lookout, held in place with a bone needle.

All four bear the sigil of the old Weavers' Concord.

The message is the same: "The looms fall silent. The dyes fade. No one remembers the patterns. Come to the fountain at dawn."

You're here. So are they.`,
    choices: [
      { text: "Check the party's character sheets", next: "party_view", icon: "📋" },
      { text: "Look around — what's the situation?", next: "start", icon: "👀" },
    ],
  },

  party_view: {
    title: "The Party",
    text: `The fountain's water catches the dawn light. Something about this place makes the truth visible — each of you can suddenly read the others like character sheets.

Rachael — Builder. Connector. Sees systems where others see chaos. Undercharges for everything because she hasn't yet realized her instinct IS the service.

Liz — Engineer. Debugger. Walks into unfamiliar rooms and becomes dangerous within the hour. Has twelve brilliant ideas and bandwidth for three. The other nine become someone else's infrastructure.

Sophia — Performer. Strategist. Reads a room before the room knows it's being read. Built her guild hall with her own hands, runs it with her own voice, and will absolutely say yes to one more thing.

Kai — Scout. Listener. Trusts tide tables more than contracts. Knows every trail in Floridae and vanishes the moment small talk starts.

Review the party, then begin.`,
    choices: [
      { text: "Begin the quest", next: "start", icon: "⚔️" },
    ],
    showPartyDetail: true,
  },

  start: {
    title: "The Scattered Guild",
    text: `The port town of Floridae sprawls along a coast of white sand and mangrove roots. The air is thick with salt and jasmine.

Liz is already cataloguing the architecture — load-bearing arches, repurposed warehouse framing, someone who knew what they were doing built this town. Sophia watches the foot traffic, counting storefronts, reading the economics of a market before she's walked through it. Kai tilts their head at the wind, checking something only they understand.

You're holding the Concord letter. It bears the sigil of a guild of textile artisans that fractured years ago when the masters scattered.

Three paths lead from the square.`,
    choices: [
      { text: "Head to the Indigo Market — investigate before the crowds", next: "market_early", icon: "🔍" },
      { text: "Visit Rachael's workshop for guild records", next: "workshop", icon: "📜" },
      { text: "Hit the docks — Kai knows a reptile keeper", next: "docks", icon: "🐍" },
    ],
  },

  market_early: {
    title: "The Indigo Market",
    text: `The market is half-shuttered in the afternoon heat. Stalls of dyed fabric hang limp in the humidity.

Liz stops at a stall selling hardware — "These are hand-forged. Someone's still doing this by hand while the workshops mass-produce." Sophia clocks the vendor pricing in two seconds flat: "Undercharging. Classic independent-artisan death spiral." Kai drifts toward the perimeter, reading sight lines.

One stall catches YOUR eye: bolts of cloth in patterns you recognize from old guild catalogues. The vendor is an elderly woman mending a seam with thread so fine it's almost invisible.

She hasn't noticed your party yet.`,
    choices: [
      { text: "Approach and compliment her needlework", next: "vendor_charm", check: "persuasion", dc: 12, icon: "💬" },
      { text: "Study the patterns from a distance first", next: "vendor_study", check: "investigation", dc: 10, icon: "🔎" },
      { text: "Buy something small to start a conversation", next: "vendor_buy", icon: "🪙" },
      { text: "Send Kai to scout the market perimeter", next: "kai_scout", check: "perception", dc: 11, preferChar: "kai", icon: "👁️" },
    ],
  },

  kai_scout: {
    title: "Eyes on the Market",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 11) {
        return {
          text: `${name} circles the market perimeter. Three things stand out:

First — a man in expensive clothes is visiting every fabric stall, writing in a ledger. Not shopping. Cataloguing. That's competitive intelligence.

Second — the old weaver's stall is the ONLY one selling hand-dyed fabric. Everything else is workshop-produced. Sophia would call that a monopoly forming in real time.

Third — there's a narrow alley behind the market leading to a district with indigo-stained cobblestones. The Dyer's Quarter.

Intel gathered. The party regroups.`,
          choices: [
            { text: "Approach the old weaver now", next: "vendor_buy", icon: "🪙" },
            { text: "Follow the man with the ledger", next: "follow_corso_agent", icon: "🕵️" },
            { text: "Check out the Dyer's Quarter", next: "dyers_quarter", icon: "🏃" },
          ],
          addItem: "Market Intel",
        };
      } else {
        return {
          text: `${name} circles the perimeter but the market's layout makes clean observation difficult. Too many stalls, too many blind spots.

"Nothing obvious," ${name} reports. "But the old weaver's stall is worth a look."`,
          choices: [
            { text: "Try talking to the old weaver", next: "vendor_buy", icon: "🪙" },
          ],
        };
      }
    },
  },

  follow_corso_agent: {
    title: "The Man with the Ledger",
    resolve: (_, inventory) => {
      return {
        text: `The party tails the ledger man at a distance. Sophia takes point — following someone while looking like you belong is essentially her skill set.

He visits three stalls. At each one, the same pitch: exclusive supply contracts. Good rates. "My employer values consistency."

At the fourth stall, a vendor refuses. "Tell Corso I said no. Again."

The man makes a note and exits toward Vermillion Street.

Liz: "Corso. That's a name worth remembering."
Kai: "Vermillion Street is merchant territory. Big workshops."
Sophia: "The vendor who refused — she looked scared, not angry."`,
        choices: [
          { text: "Follow him to Vermillion Street", next: "corso_scout", check: "stealth", dc: 13, icon: "🕵️" },
          { text: "Go back to the old weaver", next: "vendor_buy", icon: "🪙" },
        ],
        addItem: "Corso Lead",
      };
    },
  },

  vendor_charm: {
    title: "Thread and Trust",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 12) {
        return {
          text: `${name} approaches the old woman and gestures at her mending: "That's a floating selvage stitch. Nobody teaches that anymore."

The woman's eyes sharpen. "You know textiles."

"Enough to know you're underpricing that bolt by half."

She actually laughs. "My name is Yuki. And you just said the first interesting thing I've heard in this market in three years."

She gives you six spools of silk thread that shifts color in the light. "Go to the Dyer's Quarter. Ask for Hana. Tell her 'the loom remembers.'"`,
          choices: [
            { text: "Head to the Dyer's Quarter", next: "dyers_quarter", icon: "🏃" },
            { text: "Stay and learn more from Yuki", next: "yuki_lore", icon: "📖" },
          ],
          addItem: "Silken Threads",
        };
      } else {
        return {
          text: `${name} compliments the work. Yuki nods politely but her guard stays up. She's heard flattery before.

"Nice of you to say," she murmurs, returning to her mending. Not hostile. Just... careful.`,
          choices: [
            { text: "Show her the Concord letter", next: "vendor_direct", icon: "✉️" },
            { text: "Buy something to build trust", next: "vendor_buy", icon: "🪙" },
          ],
        };
      }
    },
  },

  vendor_study: {
    title: "Pattern Recognition",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 10) {
        return {
          text: `${name} studies the fabric from a careful distance. The patterns aren't decorative — they're encoded.

Liz would call it a data structure. Each repeat contains subtle variations that map to... constellations? No. Locations. The weave pattern is a map encoded in cloth.

Four locations, each marked with a different guild symbol. The Concord left a trail in their own textiles.

Rachael: "That's not a pattern. That's an address book."
Liz: "Distributed storage. In fabric. These people were serious."`,
          choices: [
            { text: "Ask the weaver to decode all four locations", next: "four_locations", icon: "🗺️" },
            { text: "Show her the Concord letter", next: "vendor_direct", icon: "✉️" },
          ],
          addItem: "Pattern Map",
        };
      } else {
        return {
          text: `The patterns are dense — clearly meaningful, but the encoding is too complex to crack from this distance. You'd need to handle the fabric, or find someone who can read the technique.

Liz: "There's a system here but I need closer access."`,
          choices: [
            { text: "Buy something to get closer", next: "vendor_buy", icon: "🪙" },
            { text: "Check Rachael's workshop first", next: "workshop", icon: "📜" },
          ],
        };
      }
    },
  },

  vendor_buy: {
    title: "Commerce as Introduction",
    text: `Rachael picks up a square of indigo linen. Checks the weave. Checks the dye penetration. Looks at the price.

"This is worth three times what you're asking."

The old woman — Yuki — stares. "Nobody has EVER told me to charge more."

Rachael: "Yeah, well. It's a flaw I'm working on too."

Sophia, quietly: "She's not wrong about the pricing. I see this with every independent artisan who competes against workshops."

Something shifts. Yuki's guard drops. Just a fraction.`,
    choices: [
      { text: "Show her the Concord letter", next: "vendor_direct", icon: "✉️" },
      { text: "Ask about her craft", next: "yuki_lore", icon: "📖" },
    ],
    addItem: "Indigo Linen Square",
  },

  vendor_direct: {
    title: "The Letter",
    text: `Rachael shows the sealed letter. Yuki's hands tremble.

"I wrote this."

The silence stretches. Liz leans in. Sophia watches Yuki's face. Kai stands guard without being asked.

Yuki explains: The Weavers' Concord had five masters, each holding one piece of an irreducible collaborative technique. She is the last in Floridae. The others fled when the Merchant Council — pressured by a man named Corso — taxed independent artisans out of business.

"Hana the Dyer is hiding in the Dyer's Quarter. Kenji the Embroiderer went north. Sora the Loom-Singer retreated to the Singing Caves. Tadashi the Pattern-Keeper locked himself in the Archive Tower."

She looks at the four of you. "I wrote fifty letters. You're the only ones who came."`,
    choices: [
      { text: "\"We'll find all four.\"", next: "accept_quest", icon: "⚔️" },
      { text: "\"Why us?\"", next: "why_us", icon: "❓" },
    ],
  },

  why_us: {
    title: "Why Us?",
    text: `Yuki studies each of you.

"Because the Concord doesn't need warriors. It needs builders."

She points at Rachael: "You see systems. Herbalism, weaving, calligraphy — you understand that crafts are connected."

At Liz: "You take apart machines to understand them. You'll take apart Corso's operation the same way."

At Sophia: "You hold rooms. You hold attention. You hold a business together with your voice and your hands. That's what a guild needs."

At Kai: "You know this coast better than anyone alive. The masters hid in places only someone who reads the land could find."

She folds her hands. "I don't need heroes. I need people who fix broken things because they can't not."`,
    choices: [
      { text: "Accept the quest", next: "accept_quest", icon: "⚔️" },
    ],
  },

  yuki_lore: {
    title: "The Old Ways",
    text: `Yuki explains what the Concord really was.

"Not a guild. A network. Each master held one piece of the process: spinning, dyeing, pattern-keeping, loom-singing, embroidery. No single person could replicate the whole technique."

Liz: "Distributed architecture. No single point of failure — except you all had to cooperate."

"Exactly. Corso can't replicate what requires five people working in concert. So he's trying to eliminate us instead."

She pauses. "We had an unfinished masterwork — a tapestry meant to encode all five techniques as a teaching legacy. The loom is in the Dyer's Quarter. The pattern is in the Archive Tower. The song is in the Caves."

Sophia: "And the embroidery?"
Yuki: "With Kenji. Wherever he is."`,
    choices: [
      { text: "Accept the quest", next: "accept_quest", icon: "⚔️" },
    ],
    addItem: "Yuki's Knowledge",
  },

  workshop: {
    title: "Rachael's Workshop",
    text: `Rachael's workshop is organized chaos that somehow functions.

Liz immediately gravitates to the tool wall: "You have a Bambu Lab AND hand tools? This is my kind of workspace."

Sophia examines leather scraps mixed with fabric samples: "You do leatherwork too?"

Kai stands in the doorway.

In the back, buried under botanical sketches and weaving samples, you find a leather-bound guild registry — fifteen years old. Names, techniques, addresses. And a note clipped to the last page:

"The tapestry is the key. Without it, we're just five people who remember."`,
    choices: [
      { text: "Cross-reference names with the market stalls", next: "market_early", icon: "🔍" },
      { text: "Decipher the tapestry pattern notation", next: "arcana_check", check: "arcana", dc: 14, icon: "🔮" },
    ],
    addItem: "Guild Registry",
  },

  arcana_check: {
    title: "Reading the Pattern",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 14) {
        return {
          text: `${name} spreads the notation across the workshop table. It looks like chaos at first — interlocking symbols, thread counts, color codes.

Then the system clicks.

"It's not a pattern," ${name} says. "It's an algorithm. A set of distributed instructions for five artisans working in parallel. Each person's technique is a function call — the tapestry is the compiled output."

Liz, if she's not the one holding it: "That's... genuinely beautiful engineering."

The notation references something called "the indigo anchor" — a specific dye technique that serves as the synchronization point. Hana's technique.`,
          choices: [
            { text: "Head to the market to find Hana's location", next: "market_early", icon: "🔍" },
          ],
          addItem: "Pattern Algorithm",
        };
      } else {
        return {
          text: `The notation is dense — clearly systematic, but the encoding requires domain knowledge nobody in the party has yet. You'd need a master weaver to decode it.

Liz: "I can see the structure, but the vocabulary is specialized. We need a translator."`,
          choices: [
            { text: "Head to the market — find a weaver", next: "market_early", icon: "🔍" },
            { text: "Try the docks instead", next: "docks", icon: "🐍" },
          ],
        };
      }
    },
  },

  docks: {
    title: "The Docks",
    text: `Kai leads the party to the waterfront — their territory.

"Mara," Kai says, approaching a sun-weathered woman surrounded by terrariums and aquarium tanks. She runs the reptile operation at the far end of the docks. She sees everything.

Mara lights up: "Kai! And friends. Unusual."

Kai: "They're asking about the Concord."

Mara's expression shifts. "Two things. First — someone's been stockpiling hand-dyed fabric. Buying it faster than the independents can make it. Second — a ship arrived last week with crew wearing old guild marks. Embroidered into their collars."

She glances at a juvenile mangrove snake coiled around a dock piling. "Also, that one needs relocating before it scares the fishermen again."`,
    choices: [
      { text: "Ask about the stockpiler", next: "stockpiler", icon: "📊" },
      { text: "Ask about the guild-marked ship", next: "guild_ship", icon: "⛵" },
      { text: "Help with the snake first", next: "snake_help", check: "animalHandling", dc: 11, icon: "🐍" },
    ],
  },

  snake_help: {
    title: "The Mangrove Snake",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 11) {
        return {
          text: `${name} approaches the juvenile mangrove snake calmly. Slow hands. Low center of gravity. The snake tastes the air, considers, and allows itself to be lifted.

"Nonvenomous," ${name} says, relocating it to a shaded root structure.

Mara is impressed. She reaches under her counter and produces a folded piece of heavy silk — embroidered, clearly old, clearly valuable.

"Took this off a drunk sailor last month. Said it was a map to 'where thread becomes gold.' Figured it was nonsense but the needlework is real."`,
          choices: [
            { text: "Study the embroidered map", next: "embroidered_map", check: "investigation", dc: 12, icon: "🗺️" },
            { text: "Thank Mara and head to the market", next: "market_early", icon: "🔍" },
          ],
          addItem: "Embroidered Map",
        };
      } else {
        return {
          text: `The snake has other plans. It strikes — nonvenomous, but startling enough that ${name} jerks back and knocks over a terrarium lid.

"Happens to everyone," Mara says, not unkindly. She handles the snake herself.

Kai, quietly: "I would have gotten it."

Sophia: "Next time lead with that."`,
          choices: [
            { text: "Ask about the stockpiler", next: "stockpiler", icon: "📊" },
            { text: "Ask about the guild ship", next: "guild_ship", icon: "⛵" },
          ],
        };
      }
    },
  },

  embroidered_map: {
    title: "Decoding the Silk",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 12) {
        return {
          text: `${name} spreads the embroidered silk across a dock crate. The stitching is extraordinary — wave patterns that encode the coastline, loom symbols marking specific locations.

Four marks on the peninsula. A fifth in town — an indigo circle. The Dyer's Quarter.

Liz: "Whoever made this turned embroidery into cartography."
Sophia: "That's Kenji's work. Has to be. Nobody else thinks in symbols like this."
Kai traces the coastline stitches: "These tidal markers are accurate. Whoever made this knows these waters."`,
          choices: [
            { text: "Head to the Dyer's Quarter first", next: "dyers_quarter", icon: "🏃" },
            { text: "Go to the market for more context", next: "market_early", icon: "🔍" },
          ],
        };
      } else {
        return {
          text: `Beautiful work, but the encoding is too specialized to crack without a weaver's eye. The silk clearly means something — it's too precise to be decorative — but the key is missing.

Liz: "We need someone who speaks textile."`,
          choices: [
            { text: "Find a weaver at the market", next: "market_early", icon: "🔍" },
          ],
        };
      }
    },
  },

  stockpiler: {
    title: "The Stockpiler",
    text: `Mara lowers her voice.

"Corso. Runs the biggest workshop on Vermillion Street. He's buying every bolt of hand-dyed fabric he can get — not to sell. To reverse-engineer. His alchemists are trying to replicate the Concord's techniques with shortcuts."

Sophia: "Classic platform play. Acquire the supply, copy the product, undercut the original."

"Worse," Mara says. "He's pressuring the Merchant Council to raise guild registration fees. Pricing the independents out."

Kai: "Vermillion Street is two blocks north. Big warehouse. Guards."

Liz: "Guards means something worth guarding."`,
    choices: [
      { text: "Scout Corso's workshop", next: "corso_scout", check: "stealth", dc: 13, icon: "🕵️" },
      { text: "Forget Corso — focus on finding the masters", next: "accept_quest", icon: "⚔️" },
      { text: "Head to the market first", next: "market_early", icon: "🔍" },
    ],
  },

  corso_scout: {
    title: "Vermillion Street",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 13) {
        return {
          text: `${name} moves along Vermillion Street, staying in the shadows of the warehouse overhangs.

Corso's operation is bigger than expected. Rows of mechanical looms staffed by tired workers. No artisans — operators. Through a side window: a desk covered in fabric samples next to chemical apparatus. Someone is literally trying to reverse-engineer dye formulas.

And on the desk — a ledger. Open to a page with five names circled in red. The Concord masters. Addresses, last known locations, and one word next to each: "ACQUIRE."

Sophia: "He's not just competing. He's hunting them."
Liz: "Then we need to find them first."`,
          choices: [
            { text: "Find the masters — now", next: "accept_quest", icon: "⚔️" },
          ],
          addItem: "Corso Intel",
        };
      } else {
        return {
          text: `A guard spots ${name} before they clear the second warehouse. Nothing hostile — just a firm "This is private property" — but the reconnaissance is blown.

No intel gathered. But the guards themselves are telling: Corso's operation is large enough to need security.

Kai: "Too many eyes. Different approach needed."`,
          choices: [
            { text: "Focus on finding the masters instead", next: "accept_quest", icon: "⚔️" },
            { text: "Regroup at the market", next: "market_early", icon: "🔍" },
          ],
        };
      }
    },
  },

  guild_ship: {
    title: "The Northern Ship",
    text: `The Painted Shuttle sits at the far dock — a cargo vessel with hand-embroidered guild marks stitched into the sail patches. Old marks. Real ones.

The captain — lean, weathered, needle-calloused hands — spots your party examining the stitching. "You're either Concord or you're about to have a very short conversation. Which?"

Liz: "Direct. I like her."
Sophia: "She's protecting someone."`,
    choices: [
      { text: "Show her the Concord letter", next: "captain_ally", icon: "✉️" },
      { text: "Read her first — is she trustworthy?", next: "captain_insight", check: "insight", dc: 11, icon: "🔎" },
    ],
  },

  captain_insight: {
    title: "Reading the Captain",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 11) {
        return {
          text: `${name} studies the captain. Calluses on her hands — rope AND needle. The guild marks on her sail aren't decoration; they're earned. Her stance is protective, not aggressive.

And there's grief in her voice when she says "Concord." Old grief. Personal.

"She's genuine," ${name} says. "She lost something when the guild fractured."

Sophia: "The grief is real. You can't fake that cadence."`,
          choices: [
            { text: "Share the letter", next: "captain_ally", icon: "✉️" },
          ],
        };
      } else {
        return {
          text: `Hard to read. She's guarded — professionally so. Could be protective, could be suspicious.

Kai: "She smells like open water and clean rope. That's honest work."

Not exactly evidence. But not nothing.`,
          choices: [
            { text: "Share the letter anyway", next: "captain_ally", icon: "✉️" },
            { text: "Make excuses — try other leads", next: "market_early", icon: "🔍" },
          ],
        };
      }
    },
  },

  captain_ally: {
    title: "Captain Tomoe",
    text: `The captain reads the Concord letter. Her expression shifts from suspicion to something raw.

"Tomoe. Captain Tomoe. I was an apprentice embroiderer before I went to sea."

She folds the letter carefully. "Kenji is alive. He's in my home port — up north. Working under a different name, but the stitching gives him away every time."

She can take you north. Two days — the tide's wrong for today.

Liz: "Two days. We can use that."
Sophia: "The Dyer's Quarter is here in town. Start local."
Kai nods at the mangrove line: "Weather holds for forty-eight hours. After that, uncertain."`,
    choices: [
      { text: "Head to the market to find Yuki first", next: "market_early", icon: "🔍" },
      { text: "Search town for more leads while we wait", next: "town_search", check: "investigation", dc: 13, icon: "🏘️" },
    ],
    addItem: "Captain Tomoe's Promise",
  },

  town_search: {
    title: "Searching Floridae",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 13) {
        return {
          text: `${name} searches methodically. The town hall notice board yields gold: a "Cultural Preservation Hearing" notice. The petition was filed by one Hana Aoki of the Dyer's Quarter.

Liz: "She's not just hiding. She's fighting back through legal channels."
Sophia: "That takes resources and nerve. She's still operational."

The hearing is scheduled for next month. If Corso's people see this notice...`,
          choices: [
            { text: "Go to the Dyer's Quarter — find Hana", next: "dyers_quarter", icon: "🏃" },
          ],
          addItem: "Preservation Petition Info",
        };
      } else {
        return {
          text: `The search turns up mostly dead ends. Town offices are closed, notice boards weathered. Floridae's bureaucracy runs on island time.

Kai: "The buildings won't tell you anything. The water might."`,
          choices: [
            { text: "Go to the market", next: "market_early", icon: "🔍" },
            { text: "Go to the docks", next: "docks", icon: "🐍" },
          ],
        };
      }
    },
  },

  four_locations: {
    title: "The Pattern Map",
    text: `Yuki spreads the fabric across her stall and traces the encoded pattern with practiced fingers.

"Four masters. Four locations."

She points to each symbol: "Hana the Dyer — the Dyer's Quarter, here in Floridae. She's hiding but she's close."

"Kenji the Embroiderer — a northern port. He went to sea."

"Sora the Loom-Singer — the Singing Caves, up the coast. She said the acoustics were better than any workshop."

"Tadashi the Pattern-Keeper — the Archive Tower. He took all the written records."

Liz: "And Corso is tracking all of them."
Yuki: "Which is why you need to be faster."

Four masters. Four locations. And Corso hunting them all.`,
    choices: [
      { text: "Start with the Dyer's Quarter — closest", next: "dyers_quarter", icon: "🏃" },
      { text: "Accept the full quest", next: "accept_quest", icon: "⚔️" },
    ],
  },

  dyers_quarter: {
    title: "The Dyer's Quarter",
    text: `Ghost of a neighborhood. The old dye houses are Corso's storage now, based on the signage.

But in a narrow alley between two warehouses: a door painted indigo, with a small loom carved into the wood. Smoke from a chimney behind it.

Someone is still here.

Rachael knocks. A woman's voice: "We're closed."

Liz examines the door frame — reinforced. Whoever's inside planned to stay. Kai watches both ends of the alley. Sophia reads the silence behind the door.`,
    choices: [
      { text: "\"The loom remembers.\"", next: "hana_found", condition: (inv) => inv.includes("Silken Threads"), icon: "🧵" },
      { text: "\"I'm looking for Hana. Yuki sent us.\"", next: "hana_found", icon: "🚪" },
      { text: "Sing something — a rhythm like a shuttle on a loom", next: "hana_song", check: "performance", dc: 12, icon: "🎵" },
      { text: "Let Sophia try — she reads people through doors", next: "sophia_approach", check: "persuasion", dc: 10, preferChar: "sophia", icon: "💜" },
    ],
  },

  sophia_approach: {
    title: "Words Through Doors",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 10) {
        return {
          text: `${name} speaks through the door. Not pleading. Not explaining. Just the truth, delivered with the precision of someone who's spent a decade reading rooms.

"We're not here to take anything from you. We're here because Yuki is worried, and because four strangers read a letter and showed up at dawn, and because the alternative is letting Corso win."

Long pause.

"And honestly? I run an independent guild too. I know what it costs to keep the door open when everyone else is closing theirs."

The door opens. Hana's eyes are red but her jaw is set. "You run a guild?"

"Built it myself."

"...Come in."`,
          choices: [
            { text: "Enter and introduce the party", next: "hana_found", icon: "🚪" },
          ],
        };
      } else {
        return {
          text: `The words are right but the door stays closed. Whatever Hana's been through, she needs more than empathy — she needs proof.

"Tell Yuki to come herself," Hana says through the door. "I don't know you."`,
          choices: [
            { text: "\"Yuki gave us silken threads.\"", next: "hana_found", condition: (inv) => inv.includes("Silken Threads"), icon: "🧵" },
            { text: "Show the letter under the door", next: "hana_found", icon: "✉️" },
          ],
        };
      }
    },
  },

  hana_song: {
    title: "A Bard's Knock",
    resolve: (result) => {
      const name = CHARACTERS[result.charId].name;
      if (result.nat20 || result.total >= 12) {
        return {
          text: `${name} hums — a rhythm that mimics a shuttle on a loom. Not music exactly. Texture. The sound of thread becoming fabric.

The door opens slowly. Indigo-stained hands. Wide eyes.

"That rhythm. Where did you learn that?"

"Didn't learn it," ${name} says. "Felt it."

She almost smiles. "Come in."`,
          choices: [
            { text: "Enter", next: "hana_found", icon: "🚪" },
          ],
        };
      } else {
        return {
          text: `The melody is good but not specific enough. "I said CLOSED."

More emphatic now. Different approach needed.`,
          choices: [
            { text: "\"Yuki sent us.\"", next: "hana_found", icon: "🚪" },
          ],
        };
      }
    },
  },

  hana_found: {
    title: "Hana the Dyer",
    text: `The door opens. Hana is younger than expected — hands stained indigo to the elbows.

"Yuki's alive?" Relief. "I thought Corso had gotten to everyone."

The space is tiny: dye vats, mordant solutions, test fabrics. She's been working in hiding.

"I can still dye. But without the others — the pattern-keeper, the singer, the embroiderer — my dyes are just... colors. Beautiful, but incomplete."

She looks at the four of you. "You're building something, aren't you? Not just finding us. You want to put us back together."

Sophia: "That's exactly it."
Liz: "And reverse-engineer Corso's operation while we're at it."
Kai: "I know the coast. I can find the others."
Rachael: "...I have a plan."`,
    choices: [
      { text: "\"We're going to finish the tapestry.\"", next: "ending_good", icon: "✨" },
    ],
    addItem: "Hana's Alliance",
  },

  accept_quest: {
    title: "The Concord Reborn",
    resolve: (_, inventory) => {
      const hasLedger = inventory.includes("Corso Intel") || inventory.includes("Corso Lead");
      const hasCaptain = inventory.includes("Captain Tomoe's Promise");
      const hasHana = inventory.includes("Hana's Alliance");
      const items = inventory.length;

      let text = `Dusk falls. Vermillion and gold paint the sky over Floridae.\n\nThe party regroups at the fountain in the town square.\n\n`;

      if (items >= 5) {
        text += `Yuki finds you there. She studies what you've gathered — the allies, the intelligence, the picture forming — and nods.\n\n"I wrote fifty letters. Fifty. And four people actually came." She adjusts her glasses. "A-minus."\n\nSophia: "Why minus?"\n\nYuki: "Because you haven't eaten anything and self-care is not optional in a long campaign."\n\n`;
      } else if (items >= 3) {
        text += `Yuki finds you there. She reviews your progress with the critical eye of a master artisan.\n\n"Solid foundation. B-plus. You have the shape of it, though there's more thread to gather."\n\nLiz: "B-plus is a starting position, not a result."\nYuki: "Exactly the attitude I was hoping for."\n\n`;
      } else {
        text += `Yuki finds you there. She reads the situation in your faces.\n\n"Every guild starts with one person deciding it matters. C-plus — but you're trending up."\n\nSophia: "C-PLUS?"\nKai: "She's not wrong."\n\n`;
      }

      text += `— QUEST LOG —\n`;
      if (hasHana) text += `✅ Hana the Dyer — Allied\n`;
      else text += `⬜ Hana the Dyer — Dyer's Quarter, Floridae\n`;
      if (hasCaptain) text += `✅ Kenji the Embroiderer — Transport secured\n`;
      else text += `⬜ Kenji the Embroiderer — Northern port\n`;
      text += `⬜ Sora the Loom-Singer — The Singing Caves\n`;
      text += `⬜ Tadashi the Pattern-Keeper — The Archive Tower\n`;
      if (hasLedger) text += `⚠️ Corso is actively hunting the masters\n`;
      else text += `⚠️ Corso threatens the Concord\n`;

      text += `\n📦 ${inventory.join(", ")}\n`;
      text += `\n— END OF CHAPTER ONE —\nThe Scattered Guild will continue...`;

      return {
        text,
        choices: [
          { text: "Play again", next: "intro", icon: "🔄", restart: true },
        ],
      };
    },
  },

  ending_good: {
    title: "A Thread Restrung",
    resolve: (_, inventory) => {
      const hasCaptain = inventory.includes("Captain Tomoe's Promise");
      let text = `Hana extends her indigo-stained hand. Rachael takes it.

"I'll dye," Hana says. "Yuki will spin. You find the others."

Not a reconstruction of the old Concord — something new. A network built by people who understand that the value isn't in any single technique, but in the connections between them.

`;
      text += `Liz: "Distributed systems. Resilient by design. I've been saying this for years."
Sophia: "You have literally been saying this for years."
Kai says nothing. But they're smiling.
Rachael: "Chapter two starts when the tide turns."

`;
      text += `— END OF CHAPTER ONE —\n\n`;
      text += `📦 ${inventory.join(", ")}\n`;
      text += `🤝 Allies: Yuki, Hana${hasCaptain ? ", Captain Tomoe" : ""}\n`;
      text += `⬜ Remaining: Kenji, Sora, Tadashi\n`;
      text += `⚠️ Threat: Corso & the Merchant Council\n\n`;
      text += `The Scattered Guild will continue...`;

      return {
        text,
        choices: [
          { text: "Play again", next: "intro", icon: "🔄", restart: true },
        ],
      };
    },
  },
};

// ——— UI COMPONENTS ———

function PixelDie({ rolling, onClick, size = 5, result }) {
  const [frame, setFrame] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (rolling) {
      let f = 0;
      animRef.current = setInterval(() => { f++; setFrame(f); }, 60);
      return () => clearInterval(animRef.current);
    } else {
      if (animRef.current) clearInterval(animRef.current);
    }
  }, [rolling]);

  const displayNum = rolling ? (Math.floor(Math.random() * 20) + 1) : (result?.d20 || "?");
  const isNat20 = !rolling && result?.nat20;
  const isNat1 = !rolling && result?.nat1;
  const borderColor = isNat20 ? "#4a4" : isNat1 ? "#a44" : rolling ? "#c9b87b" : "#555";
  const bgColor = isNat20 ? "#1a2e1a" : isNat1 ? "#2e1a1a" : "#111118";
  const numColor = isNat20 ? "#4a4" : isNat1 ? "#a44" : rolling ? "#c9b87b" : "#888";

  const shape = [
    "...d.d.d...",
    "..ddddddd..",
    ".ddddddddd.",
    "ddddddddddd",
    "ddddddddddd",
    "ddddddddddd",
    "ddddddddddd",
    ".ddddddddd.",
    "..ddddddd..",
    "...ddddd...",
    "....ddd....",
  ];

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        transform: rolling ? `rotate(${(frame * 37) % 360}deg)` : "rotate(0deg)",
        transition: rolling ? "none" : "transform 0.3s ease-out",
        userSelect: "none",
      }}
    >
      <div style={{
        position: "relative", width: 11 * size, height: 11 * size,
        imageRendering: "pixelated",
      }}>
        {shape.map((row, y) => (
          <div key={y} style={{ display: "flex" }}>
            {row.split("").map((c, x) => (
              <div key={x} style={{
                width: size, height: size,
                background: c === "d" ? bgColor : "transparent",
                border: c === "d" ? `1px solid ${borderColor}22` : "none",
                boxSizing: "border-box",
              }} />
            ))}
          </div>
        ))}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: size * 2.2,
          color: numColor,
          textShadow: `0 0 ${size}px ${numColor}44`,
          pointerEvents: "none",
        }}>
          {displayNum}
        </div>
      </div>
    </div>
  );
}

function DiceRollPanel({ charId, skillName, dc, onRoll, result, rolling }) {
  const char = CHARACTERS[charId];
  const stat = SKILL_STATS[skillName];
  const mod = getMod(char.stats[stat]);
  const prof = getProf(char.level);
  const isProficient = char.skills.includes(skillName);
  const bonus = mod + (isProficient ? prof : Math.floor(prof / 2));

  return (
    <div style={{
      margin: "16px 0", padding: "16px",
      background: "#0a0a14", border: "2px solid #2a2a3a",
      borderRadius: "4px", textAlign: "center",
    }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: "8px",
        color: "#888", marginBottom: "12px",
      }}>
        <span style={{ color: char.color }}>{char.name}</span>
        {" → "}
        <span style={{ color: "#c9b87b" }}>{skillName}</span>
        <span style={{ color: "#555" }}> (DC {dc})</span>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "20px", marginBottom: "12px",
      }}>
        <PixelDie
          rolling={rolling}
          onClick={!result && !rolling ? onRoll : undefined}
          size={5}
          result={result}
        />
      </div>

      {!result && !rolling && (
        <div style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: "8px",
          color: "#c9b87b", animation: "blink 1s infinite step-end",
        }}>
          ▶ CLICK TO ROLL ◀
        </div>
      )}
      {rolling && (
        <div style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: "7px", color: "#666",
        }}>
          rolling...
        </div>
      )}
      {result && (
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px", marginTop: "4px" }}>
          <span style={{ color: "#ccc" }}>d20: {result.d20}</span>
          <span style={{ color: "#666" }}> + {bonus} = </span>
          <span style={{
            color: result.nat20 ? "#4a4" : result.nat1 ? "#a44" : (result.total >= dc ? "#8b8" : "#a88"),
            fontWeight: "bold",
          }}>
            {result.total}
            {result.nat20 ? "  NAT 20!" : result.nat1 ? "  CRIT FAIL!" : result.total >= dc ? "  PASS" : "  FAIL"}
          </span>
        </div>
      )}
    </div>
  );
}

function DiceResultBadge({ result }) {
  if (!result) return null;
  const char = CHARACTERS[result.charId];
  return (
    <div style={{
      margin: "8px 0", padding: "6px 10px", display: "inline-block",
      background: result.nat20 ? "#1a2e1a" : result.nat1 ? "#2e1a1a" : "#111118",
      border: `2px solid ${result.nat20 ? "#4a8c4a" : result.nat1 ? "#8c4a4a" : "#2a2a3a"}`,
      fontFamily: "'Press Start 2P', monospace", fontSize: "8px",
    }}>
      <span style={{ color: char?.color || "#aaa" }}>{char?.name}</span>
      <span style={{ color: "#666" }}> {result.skillName} </span>
      <span style={{ color: result.nat20 ? "#4a4" : result.nat1 ? "#a44" : "#aaa" }}>
        {result.total}{result.nat20 ? " ★" : result.nat1 ? " ✗" : ""}
      </span>
    </div>
  );
}

function PartyBar({ party, onSelect, selectedChar, compact }) {
  return (
    <div style={{
      display: "flex", gap: compact ? "6px" : "10px",
      padding: "8px", background: "#111118",
      borderBottom: "2px solid #2a2a3a",
      overflowX: "auto",
    }}>
      {party.map(id => {
        const c = CHARACTERS[id];
        return (
          <div key={id} onClick={() => onSelect?.(id)} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "6px 10px", borderRadius: "4px", cursor: onSelect ? "pointer" : "default",
            background: selectedChar === id ? "rgba(120,120,200,0.15)" : "transparent",
            border: selectedChar === id ? `2px solid ${c.color}` : "2px solid transparent",
            transition: "all 0.15s", minWidth: "fit-content",
          }}>
            <PixelSprite charId={id} size={compact ? 3 : 4} />
            <div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: "8px",
                color: c.color, marginBottom: "2px",
              }}>{c.name}</div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: "6px",
                color: "#666",
              }}>HP {c.hp}/{c.maxHp}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PartyDetail({ party }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "8px", padding: "8px", maxWidth: "680px",
    }}>
      {party.map(id => {
        const c = CHARACTERS[id];
        return (
          <div key={id} style={{
            background: "#111118", border: `2px solid ${c.color}33`,
            padding: "12px", borderRadius: "4px",
          }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <PixelSprite charId={id} size={4} />
              <div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px", color: c.color }}>{c.name}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px", color: "#888" }}>
                  Lvl {c.level} {c.title}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
              {Object.entries(c.stats).map(([s, v]) => (
                <div key={s} style={{
                  background: "#0a0a12", padding: "3px 6px", borderRadius: "2px",
                  fontFamily: "'Press Start 2P', monospace", fontSize: "7px", textAlign: "center",
                  border: "1px solid #222",
                }}>
                  <div style={{ color: "#aaa" }}>{v}</div>
                  <div style={{ color: "#555", fontSize: "6px" }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: "6px",
              color: "#666", lineHeight: 1.8,
            }}>
              Flaw: {c.flaw}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CharPicker({ party, skill, onPick }) {
  return (
    <div style={{
      background: "#0a0a14", border: "2px solid #3a3a5a",
      padding: "14px", borderRadius: "4px", margin: "12px 0",
    }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: "9px",
        color: "#aaa", marginBottom: "10px",
      }}>
        Who attempts the <span style={{ color: "#c9b87b" }}>{skill}</span> check?
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {party.map(id => {
          const c = CHARACTERS[id];
          const stat = SKILL_STATS[skill];
          const mod = getMod(c.stats[stat]);
          const prof = getProf(c.level);
          const isProficient = c.skills.includes(skill);
          const bonus = mod + (isProficient ? prof : Math.floor(prof / 2));
          return (
            <button key={id} onClick={() => onPick(id)} style={{
              background: "#151520", border: `2px solid ${c.color}55`,
              padding: "10px 14px", borderRadius: "4px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "border-color 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = c.color}
            onMouseOut={e => e.currentTarget.style.borderColor = c.color + "55"}
            >
              <PixelSprite charId={id} size={3} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px", color: c.color }}>{c.name}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px", color: isProficient ? "#8b8" : "#888" }}>
                  +{bonus} {isProficient ? "★" : ""}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ——— MAIN ———
function Game() {
  const [sceneId, setSceneId] = useState("intro");
  const [inventory, setInventory] = useState([]);
  const [displayedText, setDisplayedText] = useState("");
  const [resolvedScene, setResolvedScene] = useState(null);
  const [rollResult, setRollResult] = useState(null);
  const [showChoices, setShowChoices] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pickingChar, setPickingChar] = useState(null);
  const [pendingChoice, setPendingChoice] = useState(null);
  const [dicePhase, setDicePhase] = useState(null);
  const [diceCharId, setDiceCharId] = useState(null);
  const [diceDc, setDiceDc] = useState(0);
  const [diceSkill, setDiceSkill] = useState(null);
  const intervalRef = useRef(null);
  const checkedResolveRef = useRef(null);
  const party = ["rachael", "liz", "sophia", "kai"];

  const scene = SCENES[sceneId];

  function typeText(text, onDone) {
    let i = 0;
    setDisplayedText("");
    setIsTyping(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i += 3;
      if (i >= text.length) {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(intervalRef.current);
        onDone?.();
      } else {
        setDisplayedText(text.slice(0, i));
      }
    }, 10);
  }

  useEffect(() => {
    setShowChoices(false);
    setPickingChar(null);
    setPendingChoice(null);
    setDicePhase(null);
    setDiceCharId(null);
    setDiceSkill(null);

    if (checkedResolveRef.current) {
      const preResolved = checkedResolveRef.current;
      checkedResolveRef.current = null;
      setResolvedScene(preResolved);
      const text = preResolved.text || "";
      if (scene.addItem && !inventory.includes(scene.addItem)) {
        setInventory(prev => prev.includes(scene.addItem) ? prev : [...prev, scene.addItem]);
      }
      typeText(text, () => setShowChoices(true));
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }

    setRollResult(null);

    let resolved = null;
    if (scene.resolve && !scene.choices?.some(c => c.check)) {
      resolved = scene.resolve(null, inventory);
      setResolvedScene(resolved);
    } else {
      setResolvedScene(null);
    }

    const text = resolved ? resolved.text : scene.text;

    if (scene.addItem && !inventory.includes(scene.addItem)) {
      setInventory(prev => prev.includes(scene.addItem) ? prev : [...prev, scene.addItem]);
    }
    if (resolved?.addItem && !inventory.includes(resolved.addItem)) {
      setInventory(prev => prev.includes(resolved.addItem) ? prev : [...prev, resolved.addItem]);
    }

    typeText(text || "", () => setShowChoices(true));

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sceneId]);

  const skipTyping = useCallback(() => {
    if (isTyping) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const text = resolvedScene ? resolvedScene.text : scene.text;
      setDisplayedText(text || "");
      setIsTyping(false);
      setShowChoices(true);
    }
  }, [isTyping, resolvedScene, scene]);

  const handleChoice = useCallback((choice) => {
    if (choice.restart) {
      setInventory([]);
      setDicePhase(null);
      setSceneId("intro");
      return;
    }
    if (choice.condition && !choice.condition(inventory)) return;
    if (choice.addItem && !inventory.includes(choice.addItem)) {
      setInventory(prev => [...prev, choice.addItem]);
    }

    if (choice.check) {
      if (choice.preferChar) {
        prepareDice(choice, choice.preferChar);
      } else {
        setPendingChoice(choice);
        setPickingChar(choice.check);
        setShowChoices(false);
      }
    } else {
      setSceneId(choice.next);
    }
  }, [inventory]);

  function prepareDice(choice, charId) {
    setPickingChar(null);
    setPendingChoice(choice);
    setDiceCharId(charId);
    setDiceSkill(choice.check);
    setDiceDc(choice.dc || 10);
    setDicePhase("ready");
    setShowChoices(false);
    setRollResult(null);
  }

  function handleDiceClick() {
    setDicePhase("rolling");

    setTimeout(() => {
      const result = rollFor(diceCharId, pendingChoice.check);
      setRollResult(result);
      setDicePhase("done");

      setTimeout(() => {
        const choice = pendingChoice;
        const nextScene = SCENES[choice.next];
        if (nextScene.resolve) {
          const resolved = nextScene.resolve(result, inventory);
          setResolvedScene(resolved);
          if (resolved.addItem && !inventory.includes(resolved.addItem)) {
            setInventory(prev => prev.includes(resolved.addItem) ? prev : [...prev, resolved.addItem]);
          }
          setDicePhase(null);
          setPendingChoice(null);
          setDiceCharId(null);
          checkedResolveRef.current = resolved;
          setSceneId(choice.next);
        } else {
          setDicePhase(null);
          setPendingChoice(null);
          setDiceCharId(null);
          setTimeout(() => setSceneId(choice.next), 200);
        }
      }, 1200);
    }, 800);
  }

  const currentChoices = resolvedScene?.choices || scene.choices || [];
  const showPartyDetail = scene.showPartyDetail;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a12",
      color: "#d4d0c8",
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: "pixelated",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      {/* Title Bar */}
      <div style={{
        background: "#08080e", padding: "10px 14px",
        borderBottom: "2px solid #1a1a2e",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: "8px", color: "#c9b87b", letterSpacing: "1px" }}>
          THE SCATTERED GUILD
        </div>
        <div style={{ fontSize: "6px", color: "#555" }}>
          3-Player Campaign
        </div>
      </div>

      {/* Party Bar */}
      <PartyBar party={party} compact />

      {/* Inventory */}
      {inventory.length > 0 && (
        <div style={{
          padding: "6px 14px", background: "#0c0c16",
          borderBottom: "1px solid #1a1a2e", display: "flex",
          gap: "6px", flexWrap: "wrap", alignItems: "center",
        }}>
          <span style={{ fontSize: "6px", color: "#555" }}>📦</span>
          {inventory.map((item, i) => (
            <span key={i} style={{
              fontSize: "6px", color: "#8a8a6a",
              background: "#14141e", padding: "2px 6px",
              border: "1px solid #2a2a3a", borderRadius: "2px",
            }}>{item}</span>
          ))}
        </div>
      )}

      {/* Scene */}
      <div style={{ padding: "20px 16px", maxWidth: "700px" }}>
        <h2 style={{
          fontSize: "12px", color: "#c9b87b",
          marginBottom: "16px", fontWeight: "normal",
        }}>
          {scene.title}
        </h2>

        <div
          onClick={skipTyping}
          style={{
            fontSize: "10px", lineHeight: 2.2, whiteSpace: "pre-wrap",
            cursor: isTyping ? "pointer" : "default",
            minHeight: "100px", color: "#c8c4bc",
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          {displayedText}
          {isTyping && <span style={{ color: "#c9b87b", animation: "blink 0.6s infinite step-end" }}>_</span>}
        </div>

        {showPartyDetail && showChoices && <PartyDetail party={party} />}

        {rollResult && !dicePhase && <DiceResultBadge result={rollResult} />}

        {pickingChar && !dicePhase && (
          <CharPicker
            party={party}
            skill={pickingChar}
            onPick={(charId) => prepareDice(pendingChoice, charId)}
          />
        )}

        {dicePhase && diceCharId && (
          <DiceRollPanel
            charId={diceCharId}
            skillName={diceSkill}
            dc={diceDc}
            onRoll={handleDiceClick}
            result={dicePhase === "done" ? rollResult : null}
            rolling={dicePhase === "rolling"}
          />
        )}

        {showChoices && !pickingChar && !dicePhase && (
          <div style={{
            marginTop: "20px",
            display: "flex", flexDirection: "column", gap: "6px",
            maxWidth: "640px",
          }}>
            {currentChoices.map((choice, i) => {
              if (choice.condition && !choice.condition(inventory)) return null;
              return (
                <button
                  key={i}
                  onClick={() => handleChoice(choice)}
                  style={{
                    background: "#111118",
                    border: "2px solid #2a2a3a",
                    padding: "12px 14px",
                    color: "#c8c4bc",
                    fontSize: "9px",
                    fontFamily: "'Press Start 2P', monospace",
                    cursor: "pointer",
                    textAlign: "left",
                    lineHeight: 1.8,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = "#c9b87b";
                    e.currentTarget.style.background = "#16161e";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = "#2a2a3a";
                    e.currentTarget.style.background = "#111118";
                  }}
                >
                  {choice.icon && <span style={{ marginRight: "8px" }}>{choice.icon}</span>}
                  {choice.text}
                  {choice.check && (
                    <span style={{ color: "#666", fontSize: "7px", marginLeft: "8px" }}>
                      [{choice.check}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        button:active { transform: scale(0.98); }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a12; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; }
      `}</style>
    </div>
  );
}
