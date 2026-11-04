/* Mock exam: config + DEMO question bank.
   Asol project-e eta server theke ashbe, ar sothik answer (a) browser-e pathano hobe na. */
(function () {
    "use strict";

    // MCQ: t = topic, q = question, o = options, a = sothik option-er index, e = explanation
    function Q(t, q, o, a, e) { return { t: t, q: q, o: o, a: a, e: e || "" }; }
    // Reading question (explanation nai)
    function R(q, o, a) { return { q: q, o: o, a: a }; }

    window.MOCK_CONFIG = {
        order: ["english", "math", "reading", "essay"],

        sections: {
            english: { name: "English Grammar and Vocabulary", short: "English", type: "mcq", count: 40, minutes: 25 },
            math:    { name: "Quantitative Aptitude (Math)",   short: "Math",    type: "mcq", count: 50, minutes: 75 },
            reading: { name: "Reading Comprehension",          short: "Reading", type: "reading", count: 20, minutes: 30 },
            essay:   { name: "Essay Writing",                  short: "Essay",   type: "essay", minutes: 20, minWords: 250, maxWords: 400, marks: 10 }
        },

        // mock-exam.html-er checkbox value-r sathe mile thakte hobe
        topics: {
            english: [
                { v: "english-tenses", n: "Tenses" },
                { v: "english-articles", n: "Articles" },
                { v: "english-prepositions", n: "Prepositions" },
                { v: "english-subject-verb", n: "Subject-Verb Agreement" },
                { v: "english-voice", n: "Voice Change" },
                { v: "english-synonyms-antonyms", n: "Synonyms & Antonyms" },
                { v: "english-idioms", n: "Idioms & Phrases" },
                { v: "english-one-word", n: "One-word Substitution" }
            ],
            math: [
                { v: "math-ratio-fraction", n: "Ratio-Fraction & Proportion" },
                { v: "math-work-time", n: "Work-Time" },
                { v: "math-loss-profit", n: "Loss-Profit & Percentage" },
                { v: "math-distance-speed-time", n: "Distance, Speed & Time" },
                { v: "math-average-median-mode", n: "Average, Median & Mode" },
                { v: "math-algebra", n: "Algebra & Equations" },
                { v: "math-geometry", n: "Geometry & Mensuration" },
                { v: "math-number-system", n: "Number System" }
            ]
        },

        // Student duto-r moddhe ekটা choose kore likhbe
        essayPrompts: [
            "Should students be allowed to use mobile phones in school? Write an essay giving your opinion.",
            "Describe a place you have visited that you will always remember."
        ]
    };

    window.MOCK_BANK = {

        /* ---------------- English (40) ---------------- */
        english: [
            Q("english-tenses", "She ___ to school every day.", ["go", "goes", "going", "gone"], 1, "With a third-person singular subject, the simple present verb takes -s."),
            Q("english-tenses", "By the time we arrived, the movie ___.", ["has already started", "started already", "was starting already", "had already started"], 3, "An action finished before another past action uses the past perfect."),
            Q("english-tenses", "I ___ my homework when the lights went out.", ["did", "have done", "was doing", "am doing"], 2, "The past continuous shows an action in progress when another action interrupted it."),
            Q("english-tenses", "They ___ in Dhaka since 2018.", ["have lived", "live", "lived", "are living"], 0, "The present perfect is used with 'since' for something that started in the past and continues now."),
            Q("english-tenses", "By next year, she ___ her degree.", ["will complete", "completes", "has completed", "will have completed"], 3, "The future perfect shows an action that will be finished before a future time."),

            Q("english-articles", "He is ___ honest man.", ["a", "an", "the", "no article"], 1, "'Honest' starts with a vowel sound, so we use 'an'."),
            Q("english-articles", "___ sun rises in the east.", ["A", "The", "An", "No article"], 1, "We use 'the' with things that are unique."),
            Q("english-articles", "She plays ___ violin beautifully.", ["a", "an", "no article", "the"], 3, "We use 'the' with musical instruments."),
            Q("english-articles", "My brother is ___ university student.", ["an", "the", "a", "no article"], 2, "'University' begins with a 'yoo' sound, so we use 'a'."),
            Q("english-articles", "___ honesty is the best policy.", ["No article", "The", "A", "An"], 0, "No article is used with an abstract noun in a general sense."),

            Q("english-prepositions", "She is good ___ mathematics.", ["in", "with", "at", "on"], 2, "'Good at' is the correct collocation."),
            Q("english-prepositions", "He has been living here ___ 2015.", ["for", "since", "from", "in"], 1, "'Since' is used with a point in time."),
            Q("english-prepositions", "The meeting is scheduled ___ Monday.", ["on", "in", "at", "by"], 0, "We use 'on' with days of the week."),
            Q("english-prepositions", "He is afraid ___ dogs.", ["from", "with", "at", "of"], 3, "'Afraid of' is the correct collocation."),
            Q("english-prepositions", "We walked ___ the bridge to reach the other side.", ["between", "among", "across", "beside"], 2, "'Across' means from one side to the other."),

            Q("english-subject-verb", "The list of items ___ on the desk.", ["are", "were", "is", "be"], 2, "The subject is 'list', which is singular."),
            Q("english-subject-verb", "Neither the teacher nor the students ___ present.", ["are", "was", "is", "has"], 0, "With neither/nor, the verb agrees with the nearer subject, 'students'."),
            Q("english-subject-verb", "Each of the boys ___ a book.", ["have", "are having", "has", "were"], 2, "'Each' is singular, so it takes 'has'."),
            Q("english-subject-verb", "The news ___ very surprising.", ["were", "are", "have been", "is"], 3, "'News' is an uncountable noun and takes a singular verb."),
            Q("english-subject-verb", "A number of students ___ absent today.", ["is", "are", "was", "has"], 1, "'A number of' means 'several', so it takes a plural verb."),

            Q("english-voice", "Choose the passive form of: “The chef cooked the meal.”", ["The meal is cooked by the chef.", "The meal has cooked by the chef.", "The meal was cooked by the chef.", "The meal was cooking by the chef."], 2, "Simple past becomes was/were + past participle."),
            Q("english-voice", "Choose the passive form of: “They are painting the wall.”", ["The wall is painted by them.", "The wall was being painted by them.", "The wall has been painted by them.", "The wall is being painted by them."], 3, "Present continuous becomes is/are being + past participle."),
            Q("english-voice", "Choose the passive form of: “Someone has stolen my bike.”", ["My bike was stolen by someone.", "My bike has been stolen by someone.", "My bike is stolen by someone.", "My bike had been stolen by someone."], 1, "Present perfect becomes has/have been + past participle."),
            Q("english-voice", "Choose the passive form of: “Who wrote this letter?”", ["Who was this letter written?", "Whom this letter was written?", "By whom was this letter written?", "By who this letter was written?"], 2, "The passive of a 'Who' question is 'By whom was ... written?'."),
            Q("english-voice", "Choose the active form of: “The cake was eaten by the children.”", ["The children ate the cake.", "The children eat the cake.", "The children have eaten the cake.", "The children were eating the cake."], 0, "Past passive 'was eaten' becomes the simple past 'ate' in the active voice."),

            Q("english-synonyms-antonyms", "Choose the synonym of <strong>rapid</strong>.", ["Slow", "Quick", "Weak", "Calm"], 1, "'Rapid' means fast, so 'quick' is its synonym."),
            Q("english-synonyms-antonyms", "Choose the antonym of <strong>generous</strong>.", ["Kind", "Brave", "Honest", "Selfish"], 3, "'Generous' means giving freely; the opposite is 'selfish'."),
            Q("english-synonyms-antonyms", "Choose the synonym of <strong>abundant</strong>.", ["Plentiful", "Scarce", "Tiny", "Fragile"], 0, "'Abundant' means existing in large quantities."),
            Q("english-synonyms-antonyms", "Choose the antonym of <strong>ancient</strong>.", ["Old", "Historic", "Modern", "Ruined"], 2, "'Ancient' means very old; the opposite is 'modern'."),
            Q("english-synonyms-antonyms", "Choose the synonym of <strong>reluctant</strong>.", ["Eager", "Cheerful", "Unwilling", "Ready"], 2, "'Reluctant' means not wanting to do something, so 'unwilling' is its synonym."),

            Q("english-idioms", "What does “break the ice” mean?", ["To break something frozen", "To start a conversation in a social situation", "To end an argument", "To feel very cold"], 1, "It means to make people feel relaxed at the start of a meeting."),
            Q("english-idioms", "What does “a piece of cake” mean?", ["A small dessert", "A rare chance", "A tasty reward", "Something very easy"], 3, "It describes something that is very easy to do."),
            Q("english-idioms", "What does “once in a blue moon” mean?", ["Very rarely", "Very often", "Only at night", "Every month"], 0, "It means something that happens very rarely."),
            Q("english-idioms", "What does “hit the nail on the head” mean?", ["Make a mistake", "Start building", "Say exactly the right thing", "Get angry"], 2, "It means to be exactly right about something."),
            Q("english-idioms", "What does “under the weather” mean?", ["Standing in the rain", "Very happy", "Lost in a storm", "Feeling slightly ill"], 3, "It means feeling a little sick."),

            Q("english-one-word", "One word for: a person who can speak two languages.", ["Bilingual", "Monolingual", "Linguist", "Translator"], 0, "Bilingual means able to speak two languages."),
            Q("english-one-word", "One word for: a government run by the people.", ["Monarchy", "Democracy", "Autocracy", "Aristocracy"], 1, "Democracy means rule by the people."),
            Q("english-one-word", "One word for: a person who loves books.", ["Philanthropist", "Misanthrope", "Bibliophile", "Pedant"], 2, "A bibliophile is a lover of books."),
            Q("english-one-word", "One word for: a place where birds are kept.", ["Apiary", "Aquarium", "Nursery", "Aviary"], 3, "An aviary is a large cage or building for birds."),
            Q("english-one-word", "One word for: the study of stars and planets.", ["Geology", "Astronomy", "Biology", "Zoology"], 1, "Astronomy is the study of celestial objects.")
        ],

        /* ---------------- Math (50) ---------------- */
        math: [
            // Ratio-Fraction & Proportion (7)
            Q("math-ratio-fraction", "If a : b = 2 : 3 and b : c = 4 : 5, find a : c.", ["8 : 15", "2 : 5", "6 : 5", "3 : 4"], 0, "Make b equal in both ratios: a : b = 8 : 12 and b : c = 12 : 15, so a : c = 8 : 15."),
            Q("math-ratio-fraction", "Simplify \\(\\dfrac{2}{3}+\\dfrac{1}{4}\\).", ["\\(\\dfrac{3}{7}\\)", "\\(\\dfrac{11}{12}\\)", "\\(\\dfrac{3}{12}\\)", "\\(\\dfrac{5}{6}\\)"], 1, "$$\\dfrac{2}{3}+\\dfrac{1}{4}=\\dfrac{8}{12}+\\dfrac{3}{12}=\\dfrac{11}{12}$$"),
            Q("math-ratio-fraction", "Divide ৳720 in the ratio 5 : 7. What is the smaller share?", ["৳250", "৳350", "৳420", "৳300"], 3, "Total parts = 12, so one part = 720 ÷ 12 = ৳60 and the smaller share = 5 × 60 = ৳300."),
            Q("math-ratio-fraction", "If 8 pens cost ৳96, what is the cost of 15 pens?", ["৳160", "৳170", "৳180", "৳190"], 2, "One pen costs 96 ÷ 8 = ৳12, so 15 pens cost 15 × 12 = ৳180."),
            Q("math-ratio-fraction", "What fraction of 2 hours is 40 minutes?", ["\\(\\dfrac{1}{2}\\)", "\\(\\dfrac{1}{3}\\)", "\\(\\dfrac{1}{4}\\)", "\\(\\dfrac{2}{5}\\)"], 1, "2 hours = 120 minutes, so $$\\dfrac{40}{120}=\\dfrac{1}{3}$$"),
            Q("math-ratio-fraction", "Find x if 3 : 5 = x : 40.", ["15", "20", "24", "30"], 2, "$$x=\\dfrac{3\\times 40}{5}=24$$"),
            Q("math-ratio-fraction", "A tank is \\(\\dfrac{3}{5}\\) full. After adding 20 litres it becomes \\(\\dfrac{4}{5}\\) full. What is the capacity of the tank?", ["80 L", "120 L", "150 L", "100 L"], 3, "\\(\\dfrac{1}{5}\\) of the tank is 20 L, so the full capacity is 5 × 20 = 100 L."),

            // Work-Time (6)
            Q("math-work-time", "A can do a job in 10 days and B in 15 days. Working together, how many days will they take?", ["8 days", "6 days", "5 days", "12 days"], 1, "$$\\dfrac{1}{10}+\\dfrac{1}{15}=\\dfrac{1}{6}$$ so they finish in 6 days."),
            Q("math-work-time", "6 workers finish a job in 12 days. How many days will 9 workers take?", ["6 days", "8 days", "9 days", "18 days"], 1, "Total work = 6 × 12 = 72 worker-days, and 72 ÷ 9 = 8 days."),
            Q("math-work-time", "A pipe fills a tank in 6 hours and another pipe empties it in 12 hours. If both are open, how long will it take to fill the tank?", ["8 hours", "10 hours", "12 hours", "18 hours"], 2, "$$\\dfrac{1}{6}-\\dfrac{1}{12}=\\dfrac{1}{12}$$ so the tank fills in 12 hours."),
            Q("math-work-time", "A can do a piece of work in 20 days. He works for 5 days. What fraction of the work remains?", ["\\(\\dfrac{1}{4}\\)", "\\(\\dfrac{1}{2}\\)", "\\(\\dfrac{4}{5}\\)", "\\(\\dfrac{3}{4}\\)"], 3, "In 5 days he finishes \\(\\dfrac{5}{20}=\\dfrac{1}{4}\\), so \\(\\dfrac{3}{4}\\) remains."),
            Q("math-work-time", "12 men can build a wall in 15 days. How many men are needed to build it in 9 days?", ["18", "20", "24", "30"], 1, "Total work = 12 × 15 = 180 man-days, and 180 ÷ 9 = 20 men."),
            Q("math-work-time", "A and B together finish a job in 8 days. A alone takes 12 days. How many days will B alone take?", ["16 days", "20 days", "24 days", "32 days"], 2, "$$\\dfrac{1}{8}-\\dfrac{1}{12}=\\dfrac{1}{24}$$ so B alone takes 24 days."),

            // Loss-Profit & Percentage (7)
            Q("math-loss-profit", "An item bought for ৳400 is sold for ৳500. What is the profit percentage?", ["20%", "25%", "30%", "15%"], 1, "$$\\dfrac{100}{400}\\times 100=25\\%$$"),
            Q("math-loss-profit", "What is 15% of 240?", ["32", "40", "24", "36"], 3, "$$240\\times\\dfrac{15}{100}=36$$"),
            Q("math-loss-profit", "A shirt marked at ৳800 is sold at a 25% discount. What is the selling price?", ["৳550", "৳600", "৳640", "৳700"], 1, "Discount = 25% of 800 = ৳200, so the selling price is 800 − 200 = ৳600."),
            Q("math-loss-profit", "A trader sells an item for ৳540 and makes a 10% loss. What was the cost price?", ["৳580", "৳594", "৳650", "৳600"], 3, "Selling price = 90% of cost price, so cost price = 540 ÷ 0.9 = ৳600."),
            Q("math-loss-profit", "The price of rice rises from ৳50 to ৳60 per kg. What is the percentage increase?", ["10%", "15%", "20%", "25%"], 2, "$$\\dfrac{10}{50}\\times 100=20\\%$$"),
            Q("math-loss-profit", "The population of a village is 20,000. It increases by 10% in a year. What is the population after one year?", ["21,000", "22,000", "22,500", "24,000"], 1, "10% of 20,000 = 2,000, so the new population is 22,000."),
            Q("math-loss-profit", "A man buys 10 oranges for ৳100 and sells them at ৳12 each. What is his profit percentage?", ["10%", "12%", "20%", "25%"], 2, "Cost = ৳100 and selling price = 10 × 12 = ৳120, so the profit is 20%."),

            // Distance, Speed & Time (6)
            Q("math-distance-speed-time", "A car travels 150 km in 3 hours. What is its speed?", ["40 km/h", "45 km/h", "50 km/h", "60 km/h"], 2, "Speed = distance ÷ time = 150 ÷ 3 = 50 km/h."),
            Q("math-distance-speed-time", "A train 120 m long passes a pole in 6 seconds. What is its speed in m/s?", ["15", "18", "20", "24"], 2, "Speed = 120 ÷ 6 = 20 m/s."),
            Q("math-distance-speed-time", "A cyclist rides at 12 km/h for 2.5 hours. What distance does he cover?", ["24 km", "28 km", "32 km", "30 km"], 3, "Distance = speed × time = 12 × 2.5 = 30 km."),
            Q("math-distance-speed-time", "Convert 54 km/h into m/s.", ["10 m/s", "15 m/s", "12 m/s", "18 m/s"], 1, "$$54\\times\\dfrac{5}{18}=15\\text{ m/s}$$"),
            Q("math-distance-speed-time", "A man walks 6 km at 3 km/h and returns the same way at 6 km/h. What is his total travelling time?", ["2 hours", "2.5 hours", "3 hours", "4 hours"], 2, "Going takes 6 ÷ 3 = 2 hours and returning takes 6 ÷ 6 = 1 hour, so the total is 3 hours."),
            Q("math-distance-speed-time", "Two trains are 100 km apart and move towards each other at 40 km/h and 60 km/h. After how long will they meet?", ["30 minutes", "45 minutes", "1.5 hours", "1 hour"], 3, "Relative speed = 40 + 60 = 100 km/h, so they meet after 100 ÷ 100 = 1 hour."),

            // Average, Median & Mode (6)
            Q("math-average-median-mode", "What is the average of 4, 8, 12 and 16?", ["8", "10", "12", "14"], 1, "(4 + 8 + 12 + 16) ÷ 4 = 40 ÷ 4 = 10."),
            Q("math-average-median-mode", "Find the median of 3, 9, 5, 7, 1.", ["3", "7", "5", "9"], 2, "In order: 1, 3, 5, 7, 9. The middle value is 5."),
            Q("math-average-median-mode", "Find the mode of 2, 3, 3, 4, 5, 3, 6.", ["2", "4", "3", "5"], 2, "The number 3 appears most often (three times)."),
            Q("math-average-median-mode", "The average of five numbers is 20. If the number 30 is removed, what is the average of the remaining four?", ["15", "17.5", "18", "20"], 1, "Total = 5 × 20 = 100. After removing 30 the total is 70, and 70 ÷ 4 = 17.5."),
            Q("math-average-median-mode", "The average age of 4 friends is 18 years. A fifth friend aged 28 joins them. What is the new average age?", ["19", "21", "20", "22"], 2, "Old total = 72. New total = 72 + 28 = 100, and 100 ÷ 5 = 20."),
            Q("math-average-median-mode", "Find the median of 12, 7, 9, 15.", ["9", "11", "12", "10.5"], 3, "In order: 7, 9, 12, 15. The median is (9 + 12) ÷ 2 = 10.5."),

            // Algebra & Equations (6)
            Q("math-algebra", "Solve \\(2x+5=17\\).", ["5", "6", "7", "11"], 1, "$$2x=12\\;\\Rightarrow\\;x=6$$"),
            Q("math-algebra", "If \\(x+y=10\\) and \\(x-y=4\\), find \\(x\\).", ["3", "6", "14", "7"], 3, "Adding the two equations gives \\(2x=14\\), so \\(x=7\\)."),
            Q("math-algebra", "Find the roots of \\(x^{2}-5x+6=0\\).", ["2 and 3", "\\(-2\\) and \\(-3\\)", "1 and 6", "\\(-1\\) and 6"], 0, "$$x^{2}-5x+6=(x-2)(x-3)=0$$ so \\(x=2\\) or \\(x=3\\)."),
            Q("math-algebra", "Solve \\(5x-3=22\\).", ["4", "6", "5", "7"], 2, "$$5x=25\\;\\Rightarrow\\;x=5$$"),
            Q("math-algebra", "Expand \\((x+3)(x-3)\\).", ["\\(x^{2}+9\\)", "\\(x^{2}-9\\)", "\\(x^{2}-6x+9\\)", "\\(x^{2}+6x-9\\)"], 1, "Using the difference of squares: $$(x+3)(x-3)=x^{2}-9$$"),
            Q("math-algebra", "If \\(x^{2}=49\\) and \\(x>0\\), find \\(x^{2}-2x\\).", ["21", "42", "56", "35"], 3, "Since \\(x=7\\), we get \\(49-14=35\\)."),

            // Geometry & Mensuration (6)
            Q("math-geometry", "Find the area of a circle with radius 7 cm. (Take \\(\\pi=\\dfrac{22}{7}\\))", ["44 cm²", "49 cm²", "154 cm²", "308 cm²"], 2, "$$A=\\pi r^{2}=\\dfrac{22}{7}\\times 49=154\\text{ cm}^{2}$$"),
            Q("math-geometry", "What is the perimeter of a rectangle with length 12 cm and width 5 cm?", ["17 cm", "60 cm", "34 cm", "29 cm"], 2, "Perimeter = 2 × (12 + 5) = 34 cm."),
            Q("math-geometry", "What is the length of the hypotenuse of a right triangle with sides 6 cm and 8 cm?", ["9 cm", "10 cm", "12 cm", "14 cm"], 1, "$$\\sqrt{6^{2}+8^{2}}=\\sqrt{100}=10$$"),
            Q("math-geometry", "Find the volume of a cube whose side is 4 cm.", ["16 cm³", "48 cm³", "96 cm³", "64 cm³"], 3, "$$V=4^{3}=64\\text{ cm}^{3}$$"),
            Q("math-geometry", "Two angles of a triangle are 50° and 60°. Find the third angle.", ["60°", "70°", "80°", "90°"], 1, "The angles of a triangle add up to 180°, so the third angle is 180° − 50° − 60° = 70°."),
            Q("math-geometry", "Find the area of a triangle with base 10 cm and height 6 cm.", ["16 cm²", "60 cm²", "30 cm²", "36 cm²"], 2, "$$A=\\dfrac{1}{2}\\times 10\\times 6=30\\text{ cm}^{2}$$"),

            // Number System (6)
            Q("math-number-system", "What is the LCM of 12 and 18?", ["6", "36", "72", "216"], 1, "12 = 2² × 3 and 18 = 2 × 3², so the LCM = 2² × 3² = 36."),
            Q("math-number-system", "Which of the following is a prime number?", ["21", "27", "29", "33"], 2, "29 has no divisor other than 1 and itself."),
            Q("math-number-system", "What is the HCF of 24 and 36?", ["6", "8", "72", "12"], 3, "24 = 2³ × 3 and 36 = 2² × 3², so the HCF = 2² × 3 = 12."),
            Q("math-number-system", "What is the smallest 3-digit number divisible by 7?", ["98", "105", "100", "112"], 1, "7 × 14 = 98 has two digits, and 7 × 15 = 105 is the first 3-digit multiple."),
            Q("math-number-system", "Which of the following numbers is divisible by 9?", ["4,562", "4,564", "4,563", "4,565"], 2, "A number is divisible by 9 if its digit sum is. 4 + 5 + 6 + 3 = 18, so 4,563 works."),
            Q("math-number-system", "What is the sum of the first 10 natural numbers?", ["45", "50", "55", "60"], 2, "$$\\dfrac{10\\times 11}{2}=55$$")
        ],

        /* ---------------- Reading (passage + 20 questions) ---------------- */
        passage: {
            title: "The Sundarbans",
            paras: [
                "The Sundarbans are the largest littoral mangrove belt in the world, stretching 80 km (50 miles) into the Bangladeshi hinterland from the coast. The forests are not only mangrove swamps, but they also include some of the last remaining stands of the mighty jungles which once covered the Gangetic plain. The Sundarbans cover an area of 38,500 square kilometers, of which about one-third is covered in water. Since 1966, the Sundarbans have been a wildlife sanctuary, and it is estimated that there are now four hundred Royal Bengal Tigers and about thirty thousand spotted deer in the area.",
                "The Sundarbans are home to many different species of birds, mammals, insects, reptiles and fish. Over 120 species of fish and over 260 species of birds have been recorded in the Sundarbans. The Gangetic River Dolphin (Platanista gangetica) is common in the rivers. No less than 50 species of reptiles and eight species of amphibians are known to exist. The Sundarbans now support the only population of Saltwater Crocodiles (Crocodylus porosus) in Bangladesh, and that population is estimated at less than two hundred individuals."
            ]
        },

        reading: [
            R("The Sundarbans is the largest littoral ___ belt in the world.", ["coral", "pine", "mangrove", "grassland"], 2),
            R("How far do the forests stretch into the Bangladeshi hinterland from the coast?", ["80 km", "20 km", "50 km", "120 km"], 0),
            R("The Sundarbans cover an area of about", ["3,850 square kilometers", "85,300 square kilometers", "385,000 square kilometers", "38,500 square kilometers"], 3),
            R("About how much of the Sundarbans is covered in water?", ["One-half", "One-third", "One-fourth", "Two-thirds"], 1),
            R("Since when has the Sundarbans been a wildlife sanctuary?", ["1947", "1971", "1966", "1999"], 2),
            R("How many Royal Bengal Tigers are estimated to live in the Sundarbans?", ["About 40", "About 4,000", "About 40,000", "About 400"], 3),
            R("About how many spotted deer are estimated to live there?", ["About 30,000", "About 3,000", "About 300,000", "About 3 million"], 0),
            R("Which animal is described as common in the rivers?", ["Saltwater Crocodile", "Gangetic River Dolphin", "Royal Bengal Tiger", "Spotted deer"], 1),
            R("How many species of fish have been recorded in the Sundarbans?", ["Under 60", "Exactly 100", "Over 120", "Over 600"], 2),
            R("Over 260 species of ___ have been recorded in the Sundarbans.", ["birds", "reptiles", "insects", "amphibians"], 0),
            R("No less than how many species of reptiles are known to exist there?", ["8", "20", "120", "50"], 3),
            R("How many species of amphibians are known to exist there?", ["Five", "Eight", "Eighteen", "Eighty"], 1),
            R("What does the passage say about Saltwater Crocodiles in Bangladesh?", ["They live in every river of the country", "They are no longer found anywhere", "The Sundarbans supports their only population", "They outnumber the tigers"], 2),
            R("The population of Saltwater Crocodiles is estimated at", ["fewer than 200", "about 2,000", "more than 20,000", "exactly 200"], 0),
            R("The “mighty jungles” once covered which plain?", ["Deccan plain", "Indus plain", "Punjab plain", "Gangetic plain"], 3),
            R("In the passage, the word “hinterland” most nearly means", ["the open sea", "the land lying inland from a coast", "a type of forest", "a river delta"], 1),
            R("The word “sanctuary” is closest in meaning to", ["a prison", "a market", "a protected area", "a farm"], 2),
            R("Which of these is NOT mentioned as living in the Sundarbans?", ["Polar bears", "Fish", "Insects", "Reptiles"], 0),
            R("Which statement is true according to the passage?", ["The Sundarbans has no mangrove swamps.", "The Sundarbans became a sanctuary after the year 2000.", "Most of the Sundarbans is covered in water.", "The forests include more than mangrove swamps."], 3),
            R("What is the main idea of the passage?", ["The history of Bangladesh's rivers", "The size and rich wildlife of the Sundarbans", "How to protect tigers from hunters", "Tourism in coastal cities"], 1)
        ]
    };
})();