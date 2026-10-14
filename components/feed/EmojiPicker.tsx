"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, X, Smile, ThumbsUp, Briefcase, Heart, Leaf, Coffee, Trophy, Clock } from "lucide-react";

interface EmojiItem {
  emoji: string;
  name: string;
  category: string;
}

export const EMOJI_CATEGORIES: { id: string; name: string; icon: React.ElementType }[] = [
  { id: "all", name: "All", icon: Smile },
  { id: "smileys", name: "Smileys", icon: Smile },
  { id: "people", name: "People", icon: ThumbsUp },
  { id: "work", name: "Work & Celebration", icon: Briefcase },
  { id: "symbols", name: "Symbols & Hearts", icon: Heart },
  { id: "nature", name: "Nature & Animals", icon: Leaf },
  { id: "food", name: "Food & Drinks", icon: Coffee },
  { id: "activity", name: "Activities & Objects", icon: Trophy },
];

export const ALL_EMOJIS: EmojiItem[] = [
  // SMILEYS & EMOTIONS
  { emoji: "😀", name: "grinning face happy smile", category: "smileys" },
  { emoji: "😃", name: "smiling face with big eyes happy", category: "smileys" },
  { emoji: "😄", name: "grinning face with smiling eyes joy", category: "smileys" },
  { emoji: "😁", name: "beaming face with smiling eyes grin", category: "smileys" },
  { emoji: "😆", name: "grinning squinting face haha", category: "smileys" },
  { emoji: "😅", name: "grinning face with sweat phew", category: "smileys" },
  { emoji: "🤣", name: "rolling on the floor laughing rofl", category: "smileys" },
  { emoji: "😂", name: "face with tears of joy lol haha", category: "smileys" },
  { emoji: "🙂", name: "slightly smiling face pleasant", category: "smileys" },
  { emoji: "🙃", name: "upside down face silly sarcasm", category: "smileys" },
  { emoji: "😉", name: "winking face wink playful", category: "smileys" },
  { emoji: "😊", name: "smiling face with smiling eyes blush", category: "smileys" },
  { emoji: "😇", name: "smiling face with halo angel innocent", category: "smileys" },
  { emoji: "🥰", name: "smiling face with hearts love adore", category: "smileys" },
  { emoji: "😍", name: "smiling face with heart eyes in love", category: "smileys" },
  { emoji: "🤩", name: "star struck excited wow", category: "smileys" },
  { emoji: "😘", name: "face blowing a kiss love kiss", category: "smileys" },
  { emoji: "😗", name: "kissing face kiss", category: "smileys" },
  { emoji: "😚", name: "kissing face with closed eyes", category: "smileys" },
  { emoji: "😙", name: "kissing face with smiling eyes", category: "smileys" },
  { emoji: "😋", name: "face savoring food delicious yum", category: "smileys" },
  { emoji: "😛", name: "face with tongue playful", category: "smileys" },
  { emoji: "😜", name: "winking face with tongue crazy", category: "smileys" },
  { emoji: "🤪", name: "zany face wild goofy", category: "smileys" },
  { emoji: "😝", name: "squinting face with tongue pranking", category: "smileys" },
  { emoji: "🤑", name: "money mouth face rich dollars cash", category: "smileys" },
  { emoji: "🤗", name: "smiling face with open hands hug", category: "smileys" },
  { emoji: "🤭", name: "face with hand over mouth oops giggle", category: "smileys" },
  { emoji: "🤫", name: "shushing face quiet secret hush", category: "smileys" },
  { emoji: "🤔", name: "thinking face ponder hmm wonder", category: "smileys" },
  { emoji: "🤐", name: "zipper mouth face silent shut", category: "smileys" },
  { emoji: "🤨", name: "face with raised eyebrow suspicious", category: "smileys" },
  { emoji: "😐", name: "neutral face meh", category: "smileys" },
  { emoji: "😑", name: "expressionless face unamused", category: "smileys" },
  { emoji: "😶", name: "face without mouth silence blank", category: "smileys" },
  { emoji: "😏", name: "smirking face smirk smug flirt", category: "smileys" },
  { emoji: "😒", name: "unamused face unhappy bored", category: "smileys" },
  { emoji: "🙄", name: "face with rolling eyes eye roll whatever", category: "smileys" },
  { emoji: "😬", name: "grimacing face awkward yikes nervous", category: "smileys" },
  { emoji: "🤥", name: "lying face pinocchio liar", category: "smileys" },
  { emoji: "😌", name: "relieved face peaceful calm", category: "smileys" },
  { emoji: "😔", name: "pensive face sad dejected", category: "smileys" },
  { emoji: "😪", name: "sleepy face tired rest", category: "smileys" },
  { emoji: "🤤", name: "drooling face hungry asleep", category: "smileys" },
  { emoji: "😴", name: "sleeping face zzz snore", category: "smileys" },
  { emoji: "😷", name: "face with medical mask sick doctor", category: "smileys" },
  { emoji: "🤒", name: "face with thermometer ill fever", category: "smileys" },
  { emoji: "🤕", name: "face with head bandage hurt injured", category: "smileys" },
  { emoji: "🤢", name: "nauseated face sick gross", category: "smileys" },
  { emoji: "🤮", name: "face vomiting barf puke", category: "smileys" },
  { emoji: "🤧", name: "sneezing face sneeze tissue", category: "smileys" },
  { emoji: "🥵", name: "hot face sweating summer heat", category: "smileys" },
  { emoji: "🥶", name: "cold face freezing frost winter", category: "smileys" },
  { emoji: "🥴", name: "woozy face dizzy drunk", category: "smileys" },
  { emoji: "😵", name: "knocked-out face dizzy stunned", category: "smileys" },
  { emoji: "🤯", name: "exploding head mind blown shocked", category: "smileys" },
  { emoji: "🤠", name: "cowboy hat face western", category: "smileys" },
  { emoji: "🥳", name: "partying face celebrate birthday confetti", category: "smileys" },
  { emoji: "😎", name: "smiling face with sunglasses cool boss", category: "smileys" },
  { emoji: "🤓", name: "nerd face smart geek glasses", category: "smileys" },
  { emoji: "🧐", name: "face with monocle detective inspect", category: "smileys" },
  { emoji: "😕", name: "confused face puzzled", category: "smileys" },
  { emoji: "😟", name: "worried face concerned", category: "smileys" },
  { emoji: "🙁", name: "slightly frowning face sad", category: "smileys" },
  { emoji: "😮", name: "face with open mouth surprised whoa", category: "smileys" },
  { emoji: "😯", name: "hushed face stunned", category: "smileys" },
  { emoji: "😲", name: "astonished face shocked gasping", category: "smileys" },
  { emoji: "😳", name: "flushed face blush embarrassed", category: "smileys" },
  { emoji: "🥺", name: "pleading face puppy eyes please", category: "smileys" },
  { emoji: "😦", name: "frowning face with open mouth", category: "smileys" },
  { emoji: "😧", name: "anguished face upset", category: "smileys" },
  { emoji: "😨", name: "fearful face scared frightened", category: "smileys" },
  { emoji: "😰", name: "anxious face with sweat stressed", category: "smileys" },
  { emoji: "😥", name: "sad but relieved face whew", category: "smileys" },
  { emoji: "😢", name: "crying face tear sad", category: "smileys" },
  { emoji: "😭", name: "loudly crying face bawling sobbing", category: "smileys" },
  { emoji: "😱", name: "face screaming in fear scream horror", category: "smileys" },
  { emoji: "😖", name: "confounded face distressed", category: "smileys" },
  { emoji: "😣", name: "persevering face struggling", category: "smileys" },
  { emoji: "😞", name: "disappointed face sorrow", category: "smileys" },
  { emoji: "😓", name: "downcast face with sweat upset", category: "smileys" },
  { emoji: "😩", name: "weary face tired exhausted", category: "smileys" },
  { emoji: "😫", name: "tired face frustrated", category: "smileys" },
  { emoji: "🥱", name: "yawning face sleepy bore", category: "smileys" },
  { emoji: "😤", name: "face with steam from nose proud angry", category: "smileys" },
  { emoji: "😡", name: "enraged face angry mad red", category: "smileys" },
  { emoji: "😠", name: "angry face mad grumpy", category: "smileys" },
  { emoji: "🤬", name: "face with symbols on mouth swear cuss", category: "smileys" },
  { emoji: "😈", name: "smiling face with horns devil evil", category: "smileys" },
  { emoji: "👿", name: "angry face with horns demon devil", category: "smileys" },
  { emoji: "💀", name: "skull dead skeleton laughter", category: "smileys" },
  { emoji: "☠️", name: "skull and crossbones pirate danger", category: "smileys" },
  { emoji: "💩", name: "pile of poo poop funny", category: "smileys" },
  { emoji: "🤡", name: "clown face circus joke", category: "smileys" },
  { emoji: "👻", name: "ghost spooky halloween", category: "smileys" },
  { emoji: "👽", name: "alien extraterrestrial ufo", category: "smileys" },
  { emoji: "🤖", name: "robot face tech bot ai", category: "smileys" },

  // GESTURES & PEOPLE
  { emoji: "👋", name: "waving hand wave hello hi goodbye", category: "people" },
  { emoji: "🤚", name: "raised back of hand stop", category: "people" },
  { emoji: "🖐️", name: "hand with fingers splayed high five", category: "people" },
  { emoji: "✋", name: "raised hand stop high five", category: "people" },
  { emoji: "🖖", name: "vulcan salute spock star trek", category: "people" },
  { emoji: "👌", name: "ok hand okay perfect agree", category: "people" },
  { emoji: "🤌", name: "pinched fingers italian chef kiss", category: "people" },
  { emoji: "🤏", name: "pinching hand small little tiny bit", category: "people" },
  { emoji: "✌️", name: "victory hand peace two v sign", category: "people" },
  { emoji: "🤞", name: "crossed fingers luck hope fingers crossed", category: "people" },
  { emoji: "🤟", name: "love-you gesture ily sign", category: "people" },
  { emoji: "🤘", name: "sign of the horns rock metal concert", category: "people" },
  { emoji: "🤙", name: "call me hand shaka hang loose", category: "people" },
  { emoji: "👈", name: "backhand index pointing left point", category: "people" },
  { emoji: "👉", name: "backhand index pointing right point", category: "people" },
  { emoji: "👆", name: "backhand index pointing up point above", category: "people" },
  { emoji: "👇", name: "backhand index pointing down point below", category: "people" },
  { emoji: "☝️", name: "index pointing up one wait look", category: "people" },
  { emoji: "👍", name: "thumbs up approve yes good agree like", category: "people" },
  { emoji: "👎", name: "thumbs down disapprove no bad dislike", category: "people" },
  { emoji: "✊", name: "raised fist power punch solidarity", category: "people" },
  { emoji: "👊", name: "oncoming fist fist bump punch bro", category: "people" },
  { emoji: "🤛", name: "left-facing fist bump", category: "people" },
  { emoji: "🤜", name: "right-facing fist bump", category: "people" },
  { emoji: "👏", name: "clapping hands applause kudos cheer congrats", category: "people" },
  { emoji: "🙌", name: "raising hands praise hooray celebration", category: "people" },
  { emoji: "👐", name: "open hands hug welcome", category: "people" },
  { emoji: "🤲", name: "palms up together pray blessing", category: "people" },
  { emoji: "🤝", name: "handshake deal agreement partnership partner", category: "people" },
  { emoji: "🙏", name: "folded hands prayer thank you please namaste", category: "people" },
  { emoji: "✍️", name: "writing hand write memo take notes sign", category: "people" },
  { emoji: "💪", name: "flexed biceps muscle strong power fitness", category: "people" },
  { emoji: "🦾", name: "mechanical arm bionic cyborg", category: "people" },
  { emoji: "🤳", name: "selfie photo camera smartphone", category: "people" },
  { emoji: "👀", name: "eyes look see watch peek investigate", category: "people" },
  { emoji: "👁️", name: "eye look vision see", category: "people" },
  { emoji: "🧠", name: "brain intellect smart think mind", category: "people" },
  { emoji: "🧑‍💻", name: "technologist programmer coder developer laptop", category: "people" },
  { emoji: "👨‍💼", name: "office worker businessman executive manager", category: "people" },
  { emoji: "👩‍💼", name: "office worker businesswoman executive manager", category: "people" },
  { emoji: "🧑‍🏫", name: "teacher mentor tutor professor", category: "people" },
  { emoji: "🧑‍🎓", name: "student graduate education university", category: "people" },
  { emoji: "🧑‍🚀", name: "astronaut space mission rocket", category: "people" },

  // WORK, OFFICE & CELEBRATION
  { emoji: "💼", name: "briefcase work business portfolio career", category: "work" },
  { emoji: "📁", name: "file folder document organization", category: "work" },
  { emoji: "📂", name: "open file folder directory documents", category: "work" },
  { emoji: "📄", name: "page facing up document paper text", category: "work" },
  { emoji: "📃", name: "page with curl document certificate", category: "work" },
  { emoji: "📊", name: "bar chart statistics analytics metrics data", category: "work" },
  { emoji: "📈", name: "chart increasing growth sales trending profit", category: "work" },
  { emoji: "📉", name: "chart decreasing drop decline loss", category: "work" },
  { emoji: "📋", name: "clipboard checklist task audit review", category: "work" },
  { emoji: "📌", name: "pushpin pin important note sticky notice", category: "work" },
  { emoji: "📍", name: "round pushpin pin location spot map", category: "work" },
  { emoji: "📎", name: "paperclip attachment attach file clip", category: "work" },
  { emoji: "🖇️", name: "linked paperclips connect attach files", category: "work" },
  { emoji: "📏", name: "straight ruler measure length dimension", category: "work" },
  { emoji: "📐", name: "triangular ruler engineering geometry", category: "work" },
  { emoji: "✂️", name: "scissors cut edit crop tool", category: "work" },
  { emoji: "🗂️", name: "card index dividers archive filing organize", category: "work" },
  { emoji: "🗑️", name: "wastebasket trash bin delete remove", category: "work" },
  { emoji: "🔒", name: "locked lock secure security privacy safety", category: "work" },
  { emoji: "🔓", name: "unlocked unlock open access authorize", category: "work" },
  { emoji: "🔑", name: "key access password authentication login", category: "work" },
  { emoji: "🗝️", name: "old key secret access unlock", category: "work" },
  { emoji: "🔨", name: "hammer tool build construction fix", category: "work" },
  { emoji: "🔧", name: "wrench tool repair settings maintenance", category: "work" },
  { emoji: "⚙️", name: "gear cog settings configure engine", category: "work" },
  { emoji: "💻", name: "laptop computer tech workstation macbook", category: "work" },
  { emoji: "🖥️", name: "desktop computer screen monitor pc", category: "work" },
  { emoji: "🖨️", name: "printer print document copy", category: "work" },
  { emoji: "⌨️", name: "keyboard type input terminal", category: "work" },
  { emoji: "🖱️", name: "computer mouse click cursor navigate", category: "work" },
  { emoji: "📱", name: "mobile phone smartphone iphone android device", category: "work" },
  { emoji: "📞", name: "telephone receiver call ring contact", category: "work" },
  { emoji: "💡", name: "light bulb idea creative insight smart innovate", category: "work" },
  { emoji: "🔦", name: "flashlight torch search explore spotlight", category: "work" },
  { emoji: "💵", name: "dollar banknote money cash currency payment", category: "work" },
  { emoji: "💰", name: "money bag rich fortune wealth funding budget", category: "work" },
  { emoji: "💳", name: "credit card banking purchase checkout salary", category: "work" },
  { emoji: "💎", name: "gem stone diamond premium luxury valuable", category: "work" },
  { emoji: "⚖️", name: "balance scale law justice legal compliant", category: "work" },
  { emoji: "🚀", name: "rocket ship launch product release startup fast", category: "work" },
  { emoji: "🎯", name: "direct hit target goal bullseye objective kpi", category: "work" },
  { emoji: "🎉", name: "party popper celebration congrats celebrate milestone", category: "work" },
  { emoji: "🎊", name: "confetti ball party celebrate festive", category: "work" },
  { emoji: "🎈", name: "balloon birthday celebration party", category: "work" },
  { emoji: "🎂", name: "birthday cake celebration happy birthday", category: "work" },
  { emoji: "🎁", name: "wrapped gift present reward bonus prize", category: "work" },
  { emoji: "🏆", name: "trophy winner award first place champion", category: "work" },
  { emoji: "🥇", name: "1st place medal gold medal champion first", category: "work" },
  { emoji: "🥈", name: "2nd place medal silver second runner-up", category: "work" },
  { emoji: "🥉", name: "3rd place medal bronze third place", category: "work" },
  { emoji: "🏅", name: "sports medal achievement award honor", category: "work" },
  { emoji: "🎖️", name: "military medal decoration honor reward", category: "work" },
  { emoji: "✨", name: "sparkles shine magic special clean polished", category: "work" },
  { emoji: "🔥", name: "fire flame hot trending streak exciting", category: "work" },
  { emoji: "📢", name: "loudspeaker announcement notice alert broadcast news", category: "work" },
  { emoji: "📣", name: "megaphone cheer announce megaphone notice", category: "work" },
  { emoji: "🔔", name: "bell notification alert ring reminder", category: "work" },

  // SYMBOLS & HEARTS
  { emoji: "❤️", name: "red heart love favorite passion", category: "symbols" },
  { emoji: "🧡", name: "orange heart warm love friendship", category: "symbols" },
  { emoji: "💛", name: "yellow heart bright sunny joy", category: "symbols" },
  { emoji: "💚", name: "green heart nature organic health", category: "symbols" },
  { emoji: "💙", name: "blue heart trust peace loyalty", category: "symbols" },
  { emoji: "💜", name: "purple heart luxury respect royalty", category: "symbols" },
  { emoji: "🤎", name: "brown heart comfort solid", category: "symbols" },
  { emoji: "🖤", name: "black heart dark gothic sleek", category: "symbols" },
  { emoji: "🤍", name: "white heart pure clean peace", category: "symbols" },
  { emoji: "💔", name: "broken heart heartbreak grief sad", category: "symbols" },
  { emoji: "❣️", name: "heart exclamation punctuation emphasis love", category: "symbols" },
  { emoji: "💕", name: "two hearts love affection floating", category: "symbols" },
  { emoji: "💞", name: "revolving hearts romance sweet", category: "symbols" },
  { emoji: "💓", name: "beating heart pulse alive love", category: "symbols" },
  { emoji: "💗", name: "growing heart affection expanding", category: "symbols" },
  { emoji: "💖", name: "sparkling heart shiny love special", category: "symbols" },
  { emoji: "💘", name: "heart with arrow cupid romance love", category: "symbols" },
  { emoji: "💝", name: "heart with ribbon gift package valentine", category: "symbols" },
  { emoji: "✅", name: "check mark button verified done complete approved yes", category: "symbols" },
  { emoji: "✔️", name: "check mark check tick ok passed", category: "symbols" },
  { emoji: "☑️", name: "ballot box with check checkbox complete marked", category: "symbols" },
  { emoji: "❌", name: "cross mark delete cancel no reject fail error", category: "symbols" },
  { emoji: "❎", name: "cross mark button cancel no close", category: "symbols" },
  { emoji: "➕", name: "plus sign add create new increase", category: "symbols" },
  { emoji: "➖", name: "minus sign subtract remove reduce decrease", category: "symbols" },
  { emoji: "⭐", name: "star favorite rating review top excellence", category: "symbols" },
  { emoji: "🌟", name: "glowing star bright shining spotlight", category: "symbols" },
  { emoji: "⚡", name: "high voltage lightning electric power fast flash", category: "symbols" },
  { emoji: "💥", name: "collision boom bang explosion impact", category: "symbols" },
  { emoji: "💯", name: "hundred points perfect score complete excellence", category: "symbols" },
  { emoji: "⚠️", name: "warning caution danger notice caution alert", category: "symbols" },
  { emoji: "⛔", name: "no entry forbidden stop restricted blocked", category: "symbols" },
  { emoji: "🚫", name: "prohibited forbidden banned disallow", category: "symbols" },
  { emoji: "🛑", name: "stop sign halt cease pause", category: "symbols" },
  { emoji: "❓", name: "question mark query help ask info", category: "symbols" },
  { emoji: "❗", name: "exclamation mark important attention priority note", category: "symbols" },
  { emoji: "‼️", name: "double exclamation mark urgent high priority alert", category: "symbols" },
  { emoji: "ℹ️", name: "information info help guide tip details", category: "symbols" },
  { emoji: "🌐", name: "globe with meridians internet web global worldwide", category: "symbols" },
  { emoji: "🔗", name: "link url hyperlink connect address", category: "symbols" },
  { emoji: "🔄", name: "counterclockwise arrows repeat sync refresh loop", category: "symbols" },
  { emoji: "🔁", name: "repeat button replay sync cycle", category: "symbols" },
  { emoji: "🔀", name: "shuffle tracks random mix", category: "symbols" },
  { emoji: "📶", name: "antenna bars signal connection cellular wifi", category: "symbols" },
  { emoji: "🔋", name: "battery charge energy full power", category: "symbols" },
  { emoji: "⏳", name: "hourglass not done loading wait pending time", category: "symbols" },
  { emoji: "⌛", name: "hourglass done finished timeout deadline", category: "symbols" },
  { emoji: "⏰", name: "alarm clock morning time wake reminder schedule", category: "symbols" },
  { emoji: "⏱️", name: "stopwatch timer counter benchmark duration", category: "symbols" },
  { emoji: "📆", name: "tear-off calendar date appointment day", category: "symbols" },
  { emoji: "📅", name: "calendar date month schedule event planner", category: "symbols" },
  { emoji: "🏷️", name: "label tag price category metadata badge", category: "symbols" },

  // NATURE & ANIMALS
  { emoji: "🐶", name: "dog face puppy pet animal friend", category: "nature" },
  { emoji: "🐱", name: "cat face kitten kitty pet feline", category: "nature" },
  { emoji: "🐭", name: "mouse face rodent cute", category: "nature" },
  { emoji: "🐹", name: "hamster face pet cute rodent", category: "nature" },
  { emoji: "🐰", name: "rabbit face bunny easter cute", category: "nature" },
  { emoji: "🦊", name: "fox face clever wild red", category: "nature" },
  { emoji: "🐻", name: "bear face teddy wild animal", category: "nature" },
  { emoji: "🐼", name: "panda face giant cute china", category: "nature" },
  { emoji: "🐨", name: "koala face australia cute marsupial", category: "nature" },
  { emoji: "🐯", name: "tiger face wild cat predator jungle", category: "nature" },
  { emoji: "🦁", name: "lion face king of the jungle brave leader", category: "nature" },
  { emoji: "🐮", name: "cow face dairy cattle farm", category: "nature" },
  { emoji: "🐷", name: "pig face farm animal pork", category: "nature" },
  { emoji: "🐸", name: "frog face amphibian toad hop", category: "nature" },
  { emoji: "🐵", name: "monkey face primate playful banana", category: "nature" },
  { emoji: "🐔", name: "chicken rooster hen poultry farm", category: "nature" },
  { emoji: "🐧", name: "penguin bird cold antarctica tux", category: "nature" },
  { emoji: "🐦", name: "bird fly tweet avian", category: "nature" },
  { emoji: "🦅", name: "eagle raptor bird predator fly freedom", category: "nature" },
  { emoji: "🦉", name: "owl nocturnal bird wise wisdom night", category: "nature" },
  { emoji: "🐺", name: "wolf face howling pack wild", category: "nature" },
  { emoji: "🐴", name: "horse face stallion farm ride equine", category: "nature" },
  { emoji: "🦄", name: "unicorn face magical fantasy startup special", category: "nature" },
  { emoji: "🐝", name: "honeybee bee insect honey buzz pollinate", category: "nature" },
  { emoji: "🦋", name: "butterfly insect wings beautiful metamorphosis", category: "nature" },
  { emoji: "🐢", name: "turtle reptile slow shell sea", category: "nature" },
  { emoji: "🐍", name: "snake python reptile serpent danger", category: "nature" },
  { emoji: "🐬", name: "dolphin sea mammal ocean aquatic smart", category: "nature" },
  { emoji: "🐳", name: "spouting whale ocean giant mammal marine", category: "nature" },
  { emoji: "🦈", name: "shark ocean predator fish teeth jaws", category: "nature" },
  { emoji: "🌱", name: "seedling plant sprout growth new beginner", category: "nature" },
  { emoji: "🌿", name: "herb plant leaf organic botanic greenery", category: "nature" },
  { emoji: "🍀", name: "four leaf clover lucky fortune st patricks", category: "nature" },
  { emoji: "🍁", name: "maple leaf autumn fall foliage canada", category: "nature" },
  { emoji: "🍂", name: "fallen leaf autumn seasonal leaves", category: "nature" },
  { emoji: "🍃", name: "leaf fluttering in wind breeze fresh flora", category: "nature" },
  { emoji: "🌺", name: "hibiscus flower tropical bloom aloha", category: "nature" },
  { emoji: "🌸", name: "cherry blossom sakura spring flower bloom", category: "nature" },
  { emoji: "🌹", name: "rose flower red romance love petal", category: "nature" },
  { emoji: "🌻", name: "sunflower yellow summer bloom sunny", category: "nature" },
  { emoji: "🌼", name: "blossom yellow daisy spring flower", category: "nature" },
  { emoji: "🌷", name: "tulip spring flower garden holland", category: "nature" },
  { emoji: "🌞", name: "sun with face bright shine morning daylight", category: "nature" },
  { emoji: "🌙", name: "crescent moon night evening dark dream", category: "nature" },
  { emoji: "🌈", name: "rainbow weather colors sky pride hope", category: "nature" },
  { emoji: "🌧️", name: "cloud with rain rainy wet weather shower", category: "nature" },
  { emoji: "❄️", name: "snowflake snow winter ice cold frost", category: "nature" },

  // FOOD & DRINKS
  { emoji: "☕", name: "hot beverage coffee tea morning cafe espresso latte", category: "food" },
  { emoji: "🍵", name: "teacup without handle green tea matcha", category: "food" },
  { emoji: "🧋", name: "bubble tea boba milk tea drink tapioca", category: "food" },
  { emoji: "🥤", name: "cup with straw soft drink soda cola beverage", category: "food" },
  { emoji: "🧃", name: "beverage box juice straw box", category: "food" },
  { emoji: "🍺", name: "beer mug drink alcohol bar pub cheers", category: "food" },
  { emoji: "🍻", name: "clinking beer mugs cheers party celebration drinks", category: "food" },
  { emoji: "🍷", name: "wine glass red wine alcohol dinner cheers", category: "food" },
  { emoji: "🍸", name: "cocktail glass martini alcohol party", category: "food" },
  { emoji: "🍹", name: "tropical drink cocktail summer beach holiday", category: "food" },
  { emoji: "🍾", name: "bottle with popping cork champagne celebration toast", category: "food" },
  { emoji: "🍕", name: "pizza slice cheese pepperoni italian fast food", category: "food" },
  { emoji: "🍔", name: "hamburger burger fast food beef cheeseburger", category: "food" },
  { emoji: "🍟", name: "french fries potato fast food snack", category: "food" },
  { emoji: "🥪", name: "sandwich lunch sub bread meal", category: "food" },
  { emoji: "🌮", name: "taco mexican street food meal", category: "food" },
  { emoji: "🌯", name: "burrito wrap mexican food roll", category: "food" },
  { emoji: "🥗", name: "green salad healthy diet vegetables bowl", category: "food" },
  { emoji: "🍝", name: "spaghetti pasta noodles italian dinner", category: "food" },
  { emoji: "🍜", name: "steaming bowl ramen soup noodles asian", category: "food" },
  { emoji: "🍣", name: "sushi japanese seafood raw fish roll", category: "food" },
  { emoji: "🍱", name: "bento box japanese lunch meal set", category: "food" },
  { emoji: "🍛", name: "curry rice indian japanese meal dinner", category: "food" },
  { emoji: "🍚", name: "cooked rice bowl white grain staple", category: "food" },
  { emoji: "🍿", name: "popcorn cinema movie theater snack", category: "food" },
  { emoji: "🍩", name: "doughnut donut dessert sweet glaze bakery", category: "food" },
  { emoji: "🍪", name: "cookie biscuit chocolate chip sweet bakery", category: "food" },
  { emoji: "🍫", name: "chocolate bar candy sweet dessert", category: "food" },
  { emoji: "🍬", name: "candy sweet treat sugar confectionery", category: "food" },
  { emoji: "🍭", name: "lollipop candy sweet suck sucker", category: "food" },
  { emoji: "🧁", name: "cupcake dessert bakery sweet frosting", category: "food" },
  { emoji: "🍰", name: "shortcake slice cake dessert birthday sweet", category: "food" },
  { emoji: "🍎", name: "red apple fruit healthy fresh teacher snack", category: "food" },
  { emoji: "🍌", name: "banana fruit yellow potassium monkey snack", category: "food" },
  { emoji: "🍉", name: "watermelon fruit melon summer refreshing slice", category: "food" },
  { emoji: "🍇", name: "grapes fruit vine wine bunch purple", category: "food" },
  { emoji: "🍓", name: "strawberry fruit red berry sweet dessert", category: "food" },
  { emoji: "🥑", name: "avocado guacamole healthy green toast", category: "food" },

  // ACTIVITIES, SPORTS & OBJECTS
  { emoji: "⚽", name: "soccer ball football sport match fifa", category: "activity" },
  { emoji: "🏀", name: "basketball ball sport hoop nba", category: "activity" },
  { emoji: "🏈", name: "american football sport nfl superbowl", category: "activity" },
  { emoji: "⚾", name: "baseball ball sport mlb home run", category: "activity" },
  { emoji: "🎾", name: "tennis ball racket grand slam match", category: "activity" },
  { emoji: "🏐", name: "volleyball sport beach court game", category: "activity" },
  { emoji: "🏓", name: "ping pong table tennis paddle match", category: "activity" },
  { emoji: "🏸", name: "badminton racket shuttlecock game", category: "activity" },
  { emoji: "🥊", name: "boxing glove fight punch combat fitness", category: "activity" },
  { emoji: "🥋", name: "martial arts uniform karate judo taekwondo", category: "activity" },
  { emoji: "🎮", name: "video game controller console play gaming joystick", category: "activity" },
  { emoji: "🎲", name: "game die dice board game gambling roll luck", category: "activity" },
  { emoji: "🧩", name: "puzzle piece jigsaw problem solution riddle", category: "activity" },
  { emoji: "🎨", name: "artist palette art design paint create creative", category: "activity" },
  { emoji: "🎭", name: "performing arts drama theater acting masks", category: "activity" },
  { emoji: "🎤", name: "microphone sing karaoke voice speech podcast audio", category: "activity" },
  { emoji: "🎧", name: "headphone music audio listen sound podcast", category: "activity" },
  { emoji: "🎼", name: "musical score notes sheet music melody", category: "activity" },
  { emoji: "🎸", name: "guitar music rock acoustic electric instrument", category: "activity" },
  { emoji: "🎹", name: "musical keyboard piano keys synthesizer", category: "activity" },
  { emoji: "🥁", name: "drum music beat percussion rhythm", category: "activity" },
  { emoji: "📸", name: "camera with flash photograph picture snapshot photo", category: "activity" },
  { emoji: "🎬", name: "clapper board movie cinema film director video", category: "activity" },
  { emoji: "📚", name: "books reading study library education learn literature", category: "activity" },
  { emoji: "✈️", name: "airplane flight travel journey trip vacation fly", category: "activity" },
  { emoji: "🚗", name: "automobile car drive vehicle transport commute", category: "activity" },
  { emoji: "🚕", name: "taxi cab ride passenger transport", category: "activity" },
  { emoji: "🚲", name: "bicycle bike cycling ride eco travel pedal", category: "activity" },
  { emoji: "🚂", name: "locomotive steam train railroad transport track", category: "activity" },
];

const RECENT_KEY = "teamzen_recent_emojis";

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
}

export function EmojiPicker({ onSelectEmoji, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  // Load recent emojis on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentEmojis(JSON.parse(stored).slice(0, 16));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    try {
      const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 16);
      setRecentEmojis(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  // Filter emojis based on search and category
  const filteredEmojis = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_EMOJIS.filter((item) => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.emoji.includes(q);
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="w-[340px] sm:w-[360px] flex flex-col bg-popover text-popover-foreground rounded-xl shadow-xl border border-border overflow-hidden">
      {/* Search Input Bar */}
      <div className="p-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search all emojis (e.g. smile, clap, rocket, heart)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/10 overflow-x-auto no-scrollbar gap-1">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors shrink-0 flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={cat.name}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Scroll Area */}
      <div className="h-[280px] overflow-y-auto p-2.5 space-y-3">
        {/* Recently Used Section (only if not searching and has recents) */}
        {!search && activeCategory === "all" && recentEmojis.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
              <Clock className="w-3 h-3" />
              <span>Recently Used</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {recentEmojis.map((emoji, idx) => (
                <button
                  key={`recent-${idx}`}
                  type="button"
                  onClick={() => handleSelect(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-md hover:bg-muted hover:scale-110 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Emojis */}
        <div>
          {!search && (
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
              {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.name || "All Emojis"} ({filteredEmojis.length})
            </div>
          )}

          {filteredEmojis.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-2xl mb-1">🔍</p>
              <p className="text-xs font-medium">No emojis match &ldquo;{search}&rdquo;</p>
              <p className="text-[10px] text-gray-400 mt-1">Try another keyword</p>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((item, idx) => (
                <button
                  key={`${item.emoji}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item.emoji)}
                  title={item.name}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-md hover:bg-muted hover:scale-110 active:scale-95 transition-transform"
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 border-t border-border bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Click an emoji to insert</span>
        <span>{ALL_EMOJIS.length}+ Emojis</span>
      </div>
    </div>
  );
}

export default EmojiPicker;
