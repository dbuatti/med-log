import { t as cs } from "../../../_libs/neondatabase__serverless.mjs";
//#region server/routes/api/plan/seed.post.ts
var sql = cs(process.env.DATABASE_URL);
var PLAN = [
	{
		month_number: 1,
		title: "Just Notice",
		focus_area: "Awareness",
		sub_area: "Food Tracking",
		description: "You don't need to change anything yet. Just notice what you eat and when. Take a photo of each meal. Write one word about how you felt after. That's it.",
		tips: [
			"Use your phone camera — no special app needed",
			"Don't judge, just observe",
			"Notice patterns: bored eating? stress eating? skipping meals?",
			"Even 3 days of tracking reveals more than you think"
		],
		review_questions: [
			"What did you notice about your eating patterns?",
			"Which meal do you tend to skip or rush?",
			"Do you eat differently when stressed vs calm?",
			"What time of day are you most hungry?"
		]
	},
	{
		month_number: 2,
		title: "Water First",
		focus_area: "Nutrition",
		sub_area: "Hydration",
		description: "Before changing what you eat, change what you drink. Aim for 2 litres of water daily. Keep a bottle visible. Drink one glass before each meal.",
		tips: [
			"Start the day with a glass of water before coffee",
			"Keep a bottle on your desk",
			"If you forget, set 3 phone reminders",
			"Sparkling water counts",
			"Bonus: youll snack less when hydrated"
		],
		review_questions: [
			"Did you hit 2L most days? What got in the way?",
			"Did you notice any change in energy or hunger?",
			"Is this now automatic, or still requires effort?",
			"What would make this easier to maintain?"
		]
	},
	{
		month_number: 3,
		title: "One Good Meal",
		focus_area: "Nutrition",
		sub_area: "Meal Quality",
		description: "Pick one meal per day to make nutritious. Just one. Add vegetables, protein, or whole grains to something you already eat. Small swaps, not overhauls.",
		tips: [
			"Add spinach to your pasta sauce",
			"Swap white rice for brown once a week",
			"Add an egg or tin of tuna to instant noodles",
			"Frozen vegetables are fine — theyre still vegetables",
			"Batch cook on Sunday for 3 weekday lunches"
		],
		review_questions: [
			"Which meal did you focus on? How did it go?",
			"Did you discover any simple swaps that worked?",
			"Did you actually enjoy the changes, or were they a chore?",
			"What is one thing you added that you want to keep?"
		]
	},
	{
		month_number: 4,
		title: "Prep One Day",
		focus_area: "Nutrition",
		sub_area: "Meal Prep",
		description: "Choose one day per week (Sunday works for most) to prep 3-4 lunches. Cook once, eat all week. Remove the daily decision of what to eat.",
		tips: [
			"Cook a big batch of rice + protein + frozen veg",
			"Invest in 4 matching containers",
			"Keep it simple: sheet pan meals, stir-fries, pasta bakes",
			"Prep snacks too: cut fruit, portion nuts",
			"If Sunday doesnt work, try Wednesday evening"
		],
		review_questions: [
			"Did you actually eat the prepped food, or did it go to waste?",
			"What recipes worked best for prepping?",
			"Did prepping reduce your stress about food during the week?",
			"Is this sustainable, or does it need to be simpler?"
		]
	},
	{
		month_number: 5,
		title: "Move Daily",
		focus_area: "Exercise",
		sub_area: "Walking",
		description: "20 minutes of walking per day. That's it. Walk to the shop, walk around the block, walk during a phone call. No gym required.",
		tips: [
			"Pair it with something you already do (phone call, podcast, audiobook)",
			"Park further away",
			"Get off the bus one stop early",
			"Walking meetings count",
			"Rain? Mall walking counts"
		],
		review_questions: [
			"Did you walk most days? What time worked best?",
			"Did you notice changes in mood or energy?",
			"What made you skip a day? How can you prevent that?",
			"Is 20 minutes enough, or do you want to do more?"
		]
	},
	{
		month_number: 6,
		title: "Add Strength",
		focus_area: "Exercise",
		sub_area: "Resistance",
		description: "Keep walking. Now add 2x per week of bodyweight exercises. Push-ups, squats, lunges, planks. 15 minutes. Build muscle to boost metabolism.",
		tips: [
			"Start with 5 minutes if 15 feels like too much",
			"YouTube has thousands of free routines",
			"Do it right after walking (already in运动 mode)",
			"Track reps — seeing progress is motivating",
			"Resistance bands are cheap and effective"
		],
		review_questions: [
			"Did you do 2 sessions most weeks?",
			"Did you notice any strength improvement?",
			"What exercise did you enjoy most?",
			"Do you want to progress to weights, or stick with bodyweight?"
		]
	},
	{
		month_number: 7,
		title: "Sleep Routine",
		focus_area: "Sleep",
		sub_area: "Hygiene",
		description: "Your sleep apnea makes sleep quality extra important. Set a fixed bedtime alarm. No screens 30 min before. Cool, dark room. Same time every day — weekends too.",
		tips: [
			"Set a bedtime alarm, not just a wake alarm",
			"Charge phone outside bedroom",
			"Read a physical book instead of scrolling",
			"Keep bedroom cool (18-20C)",
			"If you cant sleep after 20 min, get up and do something boring"
		],
		review_questions: [
			"Did you maintain a consistent bedtime?",
			"How did your sleep quality feel?",
			"Did the 30-min screen buffer help?",
			"Are you still using CPAP or positional therapy?"
		]
	},
	{
		month_number: 8,
		title: "Stress Less",
		focus_area: "Mental Health",
		sub_area: "Breathing",
		description: "5 minutes of box breathing daily. Inhale 4s, hold 4s, exhale 4s, hold 4s. Do it before bed, or when you feel overwhelmed. Simple, free, effective.",
		tips: [
			"Use an app like Box Breathing or Insight Timer",
			"Do it in bed before sleep — doubles as wind-down",
			"4-7-8 breathing also works well",
			"Even 1 minute helps in a stressful moment",
			"Pair with the sleep routine from Month 7"
		],
		review_questions: [
			"Did you do breathing exercises most days?",
			"When did you find it most useful — morning, night, or during stress?",
			"Did you notice a difference in anxiety or sleep?",
			"What technique worked best for you?"
		]
	},
	{
		month_number: 9,
		title: "Social Fuel",
		focus_area: "Social",
		sub_area: "Connection",
		description: "One meaningful social interaction per week. Not texting — actual conversation. Coffee, walk, phone call, dinner. Loneliness is a health risk as real as smoking.",
		tips: [
			"Schedule it like a medical appointment",
			"Start with people you already like",
			"Quality over quantity — one real conversation beats 10 small talks",
			"Join something: class, group, club",
			"If social anxiety is a barrier, start with 1-on-1, not groups"
		],
		review_questions: [
			"Did you have at least one meaningful conversation per week?",
			"Did social connection affect your mood or motivation?",
			"What held you back from reaching out?",
			"Who do you want to see more of?"
		]
	},
	{
		month_number: 10,
		title: "Review & Reflect",
		focus_area: "Integration",
		sub_area: "Self-Assessment",
		description: "Look back at months 1-9. What stuck? What didnt? What do you want to keep? This month is about consolidating, not adding more.",
		tips: [
			"Re-read your food photos from Month 1 — notice the difference",
			"Which habits are now automatic? Which still need effort?",
			"Drop anything that felt like punishment",
			"Keep anything that felt like progress",
			"You don't have to be perfect — consistent beats perfect"
		],
		review_questions: [
			"Which habit from months 1-9 do you want to keep forever?",
			"Which habit didnt work for you, and why?",
			"What was the biggest surprise about this process?",
			"What would you tell yourself on Day 1?"
		]
	},
	{
		month_number: 11,
		title: "Medical Follow-up",
		focus_area: "Medical",
		sub_area: "Action Items",
		description: "Time to follow up on everything. Book the appointments you've been putting off. Get the blood tests. See the specialists. You've built the habits — now use them.",
		tips: [
			"Book GP for follow-up bloods (platelets, neutrophils, lipids)",
			"Follow up on stress echocardiogram results",
			"Get Mental Health Plan appointment",
			"Collect family health history from parents",
			"Request blood results via HotDoc or email"
		],
		review_questions: [
			"Did you book and attend all pending appointments?",
			"What results are you still waiting on?",
			"Did you discuss the full picture with your GP?",
			"Are there any referrals you still need?"
		]
	},
	{
		month_number: 12,
		title: "Your New Normal",
		focus_area: "Maintenance",
		sub_area: "Sustainability",
		description: "You've done 12 months. Now: what does your life look like when these habits are just... how you live? Define your minimum viable routine.",
		tips: [
			"Write down your non-negotiables: the 3-5 things you do every week",
			"Accept that some weeks will be messy — that's fine",
			"The goal is progress, not perfection",
			"Schedule a 6-month check-in with yourself",
			"You're not starting over — you're continuing"
		],
		review_questions: [
			"What are your 3-5 non-negotiable health habits?",
			"How has your life changed in the last 12 months?",
			"What would you do differently if you started again?",
			"What is your biggest health goal for the next year?"
		]
	}
];
var seed_post_default = defineEventHandler(async () => {
	await sql`DELETE FROM health_plan`;
	for (const item of PLAN) await sql`
      INSERT INTO health_plan (month_number, title, focus_area, sub_area, description, tips, review_questions, status)
      VALUES (
        ${item.month_number},
        ${item.title},
        ${item.focus_area},
        ${item.sub_area},
        ${item.description},
        ${item.tips},
        ${item.review_questions},
        ${item.month_number === 1 ? "current" : "upcoming"}
      )
    `;
	const { rows } = await sql`SELECT * FROM health_plan ORDER BY month_number ASC`;
	return rows;
});
//#endregion
export { seed_post_default as default };
