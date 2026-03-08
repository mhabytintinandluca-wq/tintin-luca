"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════════════
// MHA' STORY — Dog DNA Quiz Platform v8
// Stack: Next.js + Supabase + Vercel
// Features: 12 Quiz Topics, DNA Helix Dashboard, Dog Profile, Supabase Auth
// ═══════════════════════════════════════════════════════════════════════════

// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── TEST MODE ─────────────────────────────────────────────────────────────
const TEST_MODE = true; // Set false for production (lock topics)

// ─── BREED LIST ────────────────────────────────────────────────────────────
const BREEDS = [
  "Golden Retriever", "Labrador Retriever", "Poodle", "French Bulldog", "Bulldog",
  "German Shepherd", "Beagle", "Rottweiler", "Dachshund", "Corgi",
  "Shiba Inu", "Siberian Husky", "Border Collie", "Chihuahua", "Pomeranian",
  "Yorkshire Terrier", "Maltese", "Shih Tzu", "Pug", "Boxer",
  "Doberman", "Great Dane", "Cavalier King Charles", "Boston Terrier", "Akita",
  "Bernese Mountain Dog", "Samoyed", "Thai Bangkaew", "Thai Ridgeback",
  "Mixed / ลูกผสม", "อื่นๆ (กรอกเอง)"
];

// ─── 5 DIMENSIONS ──────────────────────────────────────────────────────────
const DIMENSIONS = {
  BOND: { name: "BOND", icon: "💕", color: "#FF6B9D", label: "ความผูกพัน" },
  DRIVE: { name: "DRIVE", icon: "⚡", color: "#FFD93D", label: "แรงขับ" },
  MIND: { name: "MIND", icon: "🧠", color: "#6BCB77", label: "สติปัญญา" },
  NERVE: { name: "NERVE", icon: "🛡️", color: "#4D96FF", label: "ความมั่นคง" },
  WILD: { name: "WILD", icon: "🐺", color: "#9B59B6", label: "สัญชาตญาณ" }
};

// ─── DIMENSION THEME FOR RESULT SCREEN ─────────────────────────────────────
const dimensionTheme = {
  BOND: { bg: "linear-gradient(135deg, #2D1B3D 0%, #1A1025 100%)", accent: "#FF6B9D", glow: "rgba(255,107,157,0.3)" },
  DRIVE: { bg: "linear-gradient(135deg, #2D2B1B 0%, #1A1910 100%)", accent: "#FFD93D", glow: "rgba(255,217,61,0.3)" },
  MIND: { bg: "linear-gradient(135deg, #1B2D1F 0%, #101A12 100%)", accent: "#6BCB77", glow: "rgba(107,203,119,0.3)" },
  NERVE: { bg: "linear-gradient(135deg, #1B2535 0%, #0F1620 100%)", accent: "#4D96FF", glow: "rgba(77,150,255,0.3)" },
  WILD: { bg: "linear-gradient(135deg, #2B1B35 0%, #18101F 100%)", accent: "#9B59B6", glow: "rgba(155,89,182,0.3)" }
};

// ─── 12 QUIZ TOPICS ────────────────────────────────────────────────────────
const allTopics = [
  // BOND Dimension
  { id: 1, dimension: "BOND", title: "The Stare Code", subtitle: "ถอดรหัสสายตา", emoji: "👁️", unlockAt: 0, quizType: "choice" },
  { id: 2, dimension: "BOND", title: "Empathy Radar", subtitle: "เรดาร์ความเห็นอกเห็นใจ", emoji: "💓", unlockAt: 1, quizType: "choice" },
  { id: 3, dimension: "BOND", title: "6th Sense", subtitle: "สัมผัสที่หก", emoji: "✨", unlockAt: 2, quizType: "choice" },
  // DRIVE Dimension
  { id: 4, dimension: "DRIVE", title: "Food Soul", subtitle: "จิตวิญญาณนักกิน", emoji: "🍖", unlockAt: 3, quizType: "swipe" },
  { id: 5, dimension: "DRIVE", title: "Play DNA", subtitle: "ยีนนักเล่น", emoji: "🎾", unlockAt: 4, quizType: "slider" },
  { id: 6, dimension: "DRIVE", title: "Energy Core", subtitle: "แกนพลังงาน", emoji: "⚡", unlockAt: 5, quizType: "slider" },
  // MIND Dimension
  { id: 7, dimension: "MIND", title: "Problem Solver", subtitle: "นักแก้ปัญหา", emoji: "🧩", unlockAt: 6, quizType: "choice" },
  { id: 8, dimension: "MIND", title: "Memory Bank", subtitle: "คลังความจำ", emoji: "💾", unlockAt: 7, quizType: "choice" },
  { id: 9, dimension: "MIND", title: "Focus Mode", subtitle: "โหมดจดจ่อ", emoji: "🎯", unlockAt: 8, quizType: "slider" },
  // NERVE Dimension
  { id: 10, dimension: "NERVE", title: "Brave Heart", subtitle: "หัวใจกล้าหาญ", emoji: "🦁", unlockAt: 9, quizType: "choice" },
  { id: 11, dimension: "NERVE", title: "Chill Factor", subtitle: "ระดับความชิล", emoji: "😎", unlockAt: 10, quizType: "slider" },
  // WILD Dimension
  { id: 12, dimension: "WILD", title: "Primal Instinct", subtitle: "สัญชาตญาณดั้งเดิม", emoji: "🐺", unlockAt: 11, quizType: "choice" }
];

// ─── TOPIC PERSONALITY CONFIG ──────────────────────────────────────────────
const topicPersonalityConfig = {
  1: { dimension: "BOND", gene: "OXTR rs53576", types: { high: "Soul Gazer", medium: "Heart Reader", low: "Gentle Watcher", veryLow: "Independent Spirit" }, emojis: { high: "✨", medium: "💫", low: "🌙", veryLow: "🌟" } },
  2: { dimension: "BOND", gene: "SLC6A4", types: { high: "Empath Master", medium: "Mood Mirror", low: "Calm Observer", veryLow: "Zen Master" }, emojis: { high: "💓", medium: "💗", low: "💜", veryLow: "🤍" } },
  3: { dimension: "BOND", gene: "DRD4", types: { high: "Psychic Pup", medium: "Intuition Guide", low: "Grounded Soul", veryLow: "Present Mind" }, emojis: { high: "🔮", medium: "✨", low: "🌿", veryLow: "🪨" } },
  4: { dimension: "DRIVE", gene: "MC4R", types: { high: "Food Champion", medium: "Selective Soul", low: "Protein Hunter", veryLow: "Little Grazer" }, emojis: { high: "🏆", medium: "🍽️", low: "🥩", veryLow: "🌱" } },
  5: { dimension: "DRIVE", gene: "DRD2", types: { high: "Play Legend", medium: "Fun Seeker", low: "Chill Player", veryLow: "Zen Companion" }, emojis: { high: "🎯", medium: "🎾", low: "🎈", veryLow: "☁️" } },
  6: { dimension: "DRIVE", gene: "PPARGC1A", types: { high: "Turbo Dog", medium: "Active Paw", low: "Balanced Buddy", veryLow: "Couch Potato" }, emojis: { high: "⚡", medium: "🔥", low: "🌤️", veryLow: "🛋️" } },
  7: { dimension: "MIND", gene: "KIBRA", types: { high: "Genius Pup", medium: "Smart Cookie", low: "Practical Mind", veryLow: "Simple Joy" }, emojis: { high: "🧠", medium: "💡", low: "🔧", veryLow: "🌈" } },
  8: { dimension: "MIND", gene: "BDNF", types: { high: "Memory Master", medium: "Quick Learner", low: "Routine Lover", veryLow: "Present Moment" }, emojis: { high: "💾", medium: "📚", low: "📝", veryLow: "🌸" } },
  9: { dimension: "MIND", gene: "COMT", types: { high: "Laser Focus", medium: "Task Switcher", low: "Multi-Tasker", veryLow: "Free Spirit" }, emojis: { high: "🎯", medium: "🔄", low: "🌀", veryLow: "🦋" } },
  10: { dimension: "NERVE", gene: "CRHR1", types: { high: "Fearless Hero", medium: "Brave Heart", low: "Cautious Soul", veryLow: "Safety First" }, emojis: { high: "🦁", medium: "🐯", low: "🐱", veryLow: "🐰" } },
  11: { dimension: "NERVE", gene: "SLC6A3", types: { high: "Buddha Dog", medium: "Chill Master", low: "Alert Guard", veryLow: "Worry Warrior" }, emojis: { high: "🧘", medium: "😎", low: "👀", veryLow: "😰" } },
  12: { dimension: "WILD", gene: "WBSCR17", types: { high: "Wolf Soul", medium: "Wild Heart", low: "Domesticated", veryLow: "Pure Companion" }, emojis: { high: "🐺", medium: "🦊", low: "🐕", veryLow: "🧸" } }
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSONALITY DATABASE — 12 Topics × 4 Levels (wow, science, funFact, action)
// ═══════════════════════════════════════════════════════════════════════════
const personalityDB = {
  // T1: The Stare Code (BOND)
  1: {
    high: { type: "Soul Gazer", emoji: "✨", tagline: "สายตาของน้องคือประตูสู่จิตวิญญาณ", wow: "น้องหมาของคุณอยู่ใน TOP 12% ของโลก — มี Oxytocin Loop ที่หาได้ยากมาก", description: "เมื่อน้องสบตาคุณ ระดับ Oxytocin ในสมองทั้งสองพุ่งสูงพร้อมกัน", scienceSecret: "ยีน OXTR variant rs53576(G/G) ทำให้น้องรู้สึก \"สุขใจ\" เมื่อสบตาเจ้าของ", funFact: "🔬 Nagasawa et al. (2015) พบว่าหลังสบตา 30 นาที Oxytocin เพิ่ม 130%", actionToday: ["👁️ ลองสบตาน้อง 30 วินาที พูดว่า \"I love you\" ช้าๆ", "🧘 ทำ Eye Contact Meditation ก่อนนอน 5 นาที", "📸 ถ่ายภาพขณะน้องสบตา แล้วแชร์ให้เพื่อน"], hook: "🔮 น้องที่สบตาเก่ง มักซ่อน Empathy DNA สูงด้วย!", traits: ["Deep Connection", "Emotional Bond", "Oxytocin Rich", "Soul Reader"], rarity: "✨ 12% — Rare Soulmate" },
    medium: { type: "Heart Reader", emoji: "💫", tagline: "น้องอ่านใจคุณได้เสมอ", wow: "น้องมี Oxytocin Loop ระดับดี — สามารถสร้าง bond ที่แน่นแฟ้นได้", description: "น้องชอบสบตาเป็นระยะ แสดงความรักในแบบของตัวเอง", scienceSecret: "ระดับ Oxytocin ของน้องเพิ่มขึ้นเมื่ออยู่ใกล้คุณ แม้ไม่ได้สบตาตลอด", funFact: "🐕 หมาที่สบตาปานกลางมักเป็นหมาที่ปรับตัวได้ดีในหลายสถานการณ์", actionToday: ["💕 ชวนน้องเล่นเกมสบตา แล้วให้รางวัลเมื่อมองตา", "🎾 เล่นด้วยกัน 10 นาที เพื่อเพิ่ม bonding"], hook: "น้องอาจซ่อนความสามารถในการอ่านอารมณ์ไว้!", traits: ["Adaptive Bond", "Gentle Connection", "Balanced Love"], rarity: "💫 35% — Common Heart" },
    low: { type: "Gentle Watcher", emoji: "🌙", tagline: "น้องแสดงความรักในแบบเงียบๆ", wow: "น้องรักคุณแบบไม่ต้องสบตาตลอด — ความรักไม่จำเป็นต้องแสดงออกเสมอ", description: "น้องอาจมาจากสายพันธุ์ที่ไม่ถนัดสบตา แต่รักคุณเต็มที่", scienceSecret: "บางสายพันธุ์เช่น Shiba, Akita ถูกเลี้ยงมาให้หลีกเลี่ยงการสบตาตรง", funFact: "🐺 หมาป่ามองตาตรงหมายถึงท้าทาย — น้องอาจยังมีสัญชาตญาณนี้อยู่", actionToday: ["🌿 อย่าบังคับสบตา ให้น้องมาหาเอง", "🍖 ให้ treat เมื่อน้องมองหน้าคุณเอง"], hook: "ลองทำ Test 12 ดูว่าน้องมี Wild DNA มากแค่ไหน!", traits: ["Independent Love", "Quiet Affection", "Self-Sufficient"], rarity: "🌙 30% — Independent Soul" },
    veryLow: { type: "Independent Spirit", emoji: "🌟", tagline: "น้องรักอิสระ แต่ยังรักคุณ", wow: "น้องคือหมาที่มีความเป็นตัวเองสูง — หายากในยุคนี้!", description: "น้องไม่ต้องการการยืนยันความรักผ่านสายตา แต่รู้ว่าคุณรักมัน", scienceSecret: "อาจมี OXTR variant ที่ต่างออกไป ทำให้ผูกพันในรูปแบบอื่น", funFact: "🐕‍🦺 หมาทำงานหลายสายพันธุ์ถูกเลี้ยงมาให้โฟกัสงาน ไม่ใช่สบตา", actionToday: ["🎯 หากิจกรรมที่ทำด้วยกันแทนการสบตา", "🦮 พาเดินด้วยกันเป็น bonding activity"], hook: "น้องอาจเป็น Problem Solver ตัวยง — ลอง Test 7!", traits: ["Self-Reliant", "Task-Focused", "Calm Independence"], rarity: "🌟 23% — Free Spirit" }
  },
  // T2: Empathy Radar (BOND)
  2: {
    high: { type: "Empath Master", emoji: "💓", tagline: "น้องรู้สึกทุกอย่างที่คุณรู้สึก", wow: "น้องมี Mirror Neuron ระดับสูงมาก — สามารถ \"รับ\" อารมณ์คุณได้จริง", description: "เมื่อคุณเศร้า น้องเศร้าด้วย เมื่อคุณดีใจ น้องกระดิกหางทันที", scienceSecret: "ยีน SLC6A4 variant ทำให้น้องไวต่อ Serotonin — รับรู้อารมณ์ได้ละเอียด", funFact: "🧪 งานวิจัยพบว่าหมาสามารถดมกลิ่น Cortisol (ฮอร์โมนเครียด) ในเหงื่อคนได้", actionToday: ["😢 ครั้งหน้าที่เศร้า ลองสังเกตว่าน้องทำอะไร", "🎵 เปิดเพลงผ่อนคลายให้น้องฟังด้วยกัน"], hook: "น้อง Empath มักมี 6th Sense ด้วย — ทำ Test 3!", traits: ["Emotional Mirror", "Stress Detector", "Comfort Giver"], rarity: "💓 15% — Rare Empath" },
    medium: { type: "Mood Mirror", emoji: "💗", tagline: "น้องปรับอารมณ์ตามคุณได้ดี", wow: "น้องมีความสามารถรับรู้อารมณ์ในระดับปกติ — ซึ่งก็เก่งมากแล้ว!", description: "น้องจะสังเกตเห็นเมื่อคุณมีอารมณ์รุนแรง แต่ไม่ถึงกับรู้ทุกเรื่อง", scienceSecret: "น้องใช้การอ่านสีหน้า ท่าทาง และกลิ่นในการประเมินอารมณ์คุณ", funFact: "🐶 หมาสามารถแยกแยะสีหน้ามนุษย์ได้มากกว่า 100 แบบ", actionToday: ["😊 ฝึกแสดงสีหน้าชัดเจนเมื่อสื่อสารกับน้อง", "🤗 กอดน้องเมื่อคุณรู้สึกดี — มันจะจำได้"], hook: "ลองดูว่าน้องมี Memory Bank แค่ไหนใน Test 8!", traits: ["Face Reader", "Mood Adaptive", "Social Intelligence"], rarity: "💗 40% — Balanced Reader" },
    low: { type: "Calm Observer", emoji: "💜", tagline: "น้องมั่นคงไม่ว่าอะไรจะเกิดขึ้น", wow: "น้องคือ \"หิน\" ที่คุณพึ่งพาได้ — ไม่หวั่นไหวง่าย", description: "น้องไม่ค่อยได้รับผลกระทบจากอารมณ์คุณ ซึ่งอาจเป็นข้อดีในบางสถานการณ์", scienceSecret: "อาจมี SLC6A4 variant ที่ทำให้มี emotional stability สูง", funFact: "🦮 หมานำทาง, หมาบำบัด มักถูกเลือกจากลักษณะนี้", actionToday: ["🧘‍♀️ ใช้น้องเป็น grounding buddy เมื่อเครียด", "🎯 ชื่นชมความมั่นคงของน้อง"], hook: "น้องอาจมี Chill Factor สูงมาก — ลอง Test 11!", traits: ["Emotional Anchor", "Steady Presence", "Unshakeable"], rarity: "💜 30% — Calm Soul" },
    veryLow: { type: "Zen Master", emoji: "🤍", tagline: "น้องอยู่ในโลกของตัวเอง", wow: "น้องมีความสงบภายในที่หาได้ยาก — ไม่ถูกกระทบจากอารมณ์รอบข้าง", description: "น้องไม่ได้ไม่รักคุณ แต่มีวิธีแสดงความรักที่ต่างออกไป", scienceSecret: "บางสายพันธุ์ถูกเพาะพันธุ์มาเพื่อทำงานอิสระ ไม่ต้องอ่านอารมณ์คน", funFact: "🐕‍🦺 หมาล่าสัตว์มักมีลักษณะนี้ — โฟกัสที่งานไม่ใช่อารมณ์", actionToday: ["🎾 สื่อสารผ่านการเล่นแทนอารมณ์", "🍖 ใช้อาหารและกิจกรรมเป็น bonding"], hook: "ลองดู Primal Instinct ใน Test 12!", traits: ["Inner Peace", "Self-Contained", "Task-Oriented"], rarity: "🤍 15% — Zen State" }
  },
  // T3: 6th Sense (BOND)
  3: {
    high: { type: "Psychic Pup", emoji: "🔮", tagline: "น้องรู้ก่อนที่คุณจะบอก", wow: "น้องมี Intuition ระดับสูงผิดปกติ — สังเกตสิ่งที่คนอื่นพลาด", description: "น้องดูเหมือนรู้ว่าคุณจะกลับบ้านก่อนได้ยินเสียง หรือรู้ว่าคุณไม่สบาย", scienceSecret: "ยีน DRD4 variant อาจเกี่ยวข้องกับการรับรู้สิ่งเร้าที่ละเอียดอ่อน", funFact: "🔬 มีรายงานว่าหมาสามารถดมกลิ่นมะเร็งได้แม่นยำถึง 97%", actionToday: ["🕐 สังเกตว่าน้องรู้ตัวก่อนคุณกลับบ้านกี่นาที", "📝 จดบันทึกพฤติกรรม \"รู้ล่วงหน้า\" ของน้อง"], hook: "น้อง Psychic มักมี Memory Bank ดีเยี่ยม — Test 8!", traits: ["Intuitive", "Hyper-Aware", "Precognitive"], rarity: "🔮 10% — Rare Gift" },
    medium: { type: "Intuition Guide", emoji: "✨", tagline: "น้องมีสัญชาตญาณที่ดี", wow: "น้องสังเกตเห็นรูปแบบและรายละเอียดที่คนอื่นพลาด", description: "น้องจะรู้สึกเมื่อมีอะไรผิดปกติ แม้คุณจะไม่ได้บอก", scienceSecret: "หมาใช้ประสาทสัมผัสหลายอย่างรวมกันในการประเมินสถานการณ์", funFact: "👃 หมามีตัวรับกลิ่นมากกว่าคน 40 เท่า!", actionToday: ["🎯 ฝึกให้น้องหาของซ่อน เพื่อพัฒนาประสาทสัมผัส", "🧩 เล่น puzzle toys กับน้อง"], hook: "ลองทดสอบ Problem Solver ใน Test 7!", traits: ["Pattern Recognition", "Alert", "Observant"], rarity: "✨ 35% — Good Instincts" },
    low: { type: "Grounded Soul", emoji: "🌿", tagline: "น้องอยู่กับปัจจุบันเสมอ", wow: "น้องไม่ overthink — มีความสุขกับสิ่งที่เห็นตรงหน้า", description: "น้องไม่ค่อยสังเกตสิ่งที่ยังไม่เกิดขึ้น แต่ enjoy ทุกช่วงเวลา", scienceSecret: "น้องอาจมีระดับ Dopamine ที่สมดุล ไม่ต้องหา stimulation ตลอด", funFact: "🧘 หมาแบบนี้มักเป็น therapy dog ที่ดี เพราะสงบและ stable", actionToday: ["🌸 ชื่นชมความสงบของน้อง", "🎈 เล่นเกมง่ายๆ ที่ไม่ต้องคิดมาก"], hook: "น้องอาจมี Chill Factor สูง — Test 11!", traits: ["Present-Focused", "Content", "Peaceful"], rarity: "🌿 35% — Peaceful Mind" },
    veryLow: { type: "Present Mind", emoji: "🪨", tagline: "น้องอยู่กับตรงนี้ ตรงนี้เท่านั้น", wow: "น้องมีความสามารถอยู่กับปัจจุบันที่คนส่วนใหญ่ทำไม่ได้", description: "น้องไม่สนใจอดีตหรืออนาคต — มีความสุขกับตอนนี้", scienceSecret: "อาจเป็นลักษณะที่ถูกเพาะพันธุ์มาเพื่อความมั่นคงทางอารมณ์", funFact: "🐶 หมาประเภทนี้มักไม่ค่อย anxiety หรือ stressed", actionToday: ["😊 เรียนรู้การอยู่กับปัจจุบันจากน้อง", "🍖 ให้รางวัลน้องบ่อยๆ"], hook: "ดูว่าน้องมี Brave Heart แค่ไหนใน Test 10!", traits: ["Mindful", "Stress-Free", "Simple Joy"], rarity: "🪨 20% — Zen Master" }
  },
  // T4: Food Soul (DRIVE) — Swipe Quiz
  4: {
    high: { type: "Food Champion", emoji: "🏆", tagline: "น้องคือนักกินตัวยง", wow: "น้องมี Food Drive ระดับสูงมาก — ใช้อาหารในการฝึกได้ผลเยี่ยม!", description: "น้องตื่นเต้นกับอาหารทุกครั้ง ไม่ว่าจะอิ่มแค่ไหน", scienceSecret: "ยีน MC4R อาจทำให้น้องรู้สึกหิวบ่อยกว่าปกติ", funFact: "🔬 งานวิจัยพบว่า Labrador มี gene mutation ที่ทำให้หิวตลอด", actionToday: ["🍖 ใช้อาหารเป็น training reward ได้ผลดีมาก", "⚖️ ระวังน้ำหนัก! แบ่งอาหารเป็นมื้อเล็กๆ"], hook: "น้อง Food Champion มักมี Energy สูงด้วย — Test 6!", traits: ["Food Motivated", "Easy to Train", "Enthusiastic Eater"], rarity: "🏆 25% — Food Lover" },
    medium: { type: "Selective Soul", emoji: "🍽️", tagline: "น้องรู้จักเลือกกิน", wow: "น้องมี taste ที่ดี — ไม่กินทุกอย่างที่เห็น", description: "น้องจะกินเมื่อหิวจริง และเลือกอาหารที่ชอบ", scienceSecret: "น้องมี satiety signals ที่ทำงานดี — รู้ตัวเมื่ออิ่ม", funFact: "🐕 หมาบางตัวมี taste receptors สำหรับหวาน-เค็มต่างกัน", actionToday: ["🎯 หาอาหารที่น้องชอบจริงๆ เพื่อใช้ใน training", "🥗 ลองอาหารใหม่ๆ ให้น้องได้เลือก"], hook: "ดู Play DNA ว่าน้องชอบเล่นแบบไหน — Test 5!", traits: ["Discerning Palate", "Healthy Appetite", "Quality Over Quantity"], rarity: "🍽️ 35% — Balanced Eater" },
    low: { type: "Protein Hunter", emoji: "🥩", tagline: "น้องชอบเนื้อมากกว่าอย่างอื่น", wow: "น้องมีความชอบที่ชัดเจน — รู้ว่าตัวเองต้องการอะไร", description: "น้องอาจไม่สนใจ treats ทั่วไป แต่จะตื่นเต้นกับเนื้อจริง", scienceSecret: "หมามี taste receptors สำหรับ amino acids มากกว่าคน", funFact: "🐺 บรรพบุรุษหมาป่ากินเนื้อเป็นหลัก — ยังอยู่ใน DNA", actionToday: ["🥩 ลอง freeze-dried meat เป็น high-value treat", "🦴 ให้กระดูกแทะ (ที่ปลอดภัย) เป็นรางวัล"], hook: "น้องอาจมี Primal Instinct สูง — Test 12!", traits: ["Carnivore Heart", "Picky But Passionate", "Knows What It Wants"], rarity: "🥩 25% — Meat Lover" },
    veryLow: { type: "Little Grazer", emoji: "🌱", tagline: "น้องกินน้อยแต่มีความสุข", wow: "น้องไม่ถูกขับเคลื่อนด้วยอาหาร — หายากในโลกหมา!", description: "น้องกินเมื่อจำเป็น ไม่ได้ตื่นเต้นกับอาหารมาก", scienceSecret: "น้องอาจมี metabolism ที่ต่ำ หรือ satiety signals ที่แรง", funFact: "🐶 หมาบางสายพันธุ์ เช่น Basenji กินน้อยตามธรรมชาติ", actionToday: ["🎾 ใช้ของเล่นแทนอาหารเป็น reward", "❤️ ใช้ affection เป็น reinforcement"], hook: "ดูว่าอะไรขับเคลื่อนน้อง — Play DNA Test 5!", traits: ["Not Food Driven", "Needs Other Motivators", "Light Eater"], rarity: "🌱 15% — Rare Grazer" }
  },
  // T5: Play DNA (DRIVE)
  5: {
    high: { type: "Play Legend", emoji: "🎯", tagline: "น้องคือนักเล่นระดับตำนาน", wow: "น้องมี Play Drive ที่สูงมาก — พลังงานไม่มีหมด!", description: "น้องพร้อมเล่นตลอดเวลา ไม่ว่าจะเหนื่อยแค่ไหน", scienceSecret: "ยีน DRD2 variant ทำให้น้องได้ Dopamine จากการเล่นมากกว่าปกติ", funFact: "🎾 หมาที่เล่นบ่อยมีอายุยืนกว่าหมาที่ไม่ค่อยเล่นถึง 2 ปี", actionToday: ["⚽ เล่นกับน้องอย่างน้อย 30 นาทีต่อวัน", "🧩 หา puzzle toys มาให้น้องเล่น"], hook: "น้อง Play Legend มักมี Energy Core สูงด้วย — Test 6!", traits: ["Endless Energy", "Play Obsessed", "Joy Machine"], rarity: "🎯 20% — Play Master" },
    medium: { type: "Fun Seeker", emoji: "🎾", tagline: "น้องรักการเล่นแต่รู้จักพัก", wow: "น้องมี balance ที่ดีระหว่างเล่นและพัก", description: "น้องชอบเล่นเป็นช่วงๆ แล้วก็พักผ่อน", scienceSecret: "น้องมี arousal regulation ที่ดี — รู้จักปรับระดับพลังงาน", funFact: "🐕 หมาที่เล่นสมดุลมักมี stress level ต่ำกว่า", actionToday: ["🎈 เล่น 15-20 นาที แล้วให้พัก", "🦴 สลับระหว่าง active play กับ calm activities"], hook: "ดู Focus Mode ว่าน้องจดจ่อได้นานแค่ไหน — Test 9!", traits: ["Balanced Play", "Knows When to Rest", "Adaptable"], rarity: "🎾 40% — Balanced Player" },
    low: { type: "Chill Player", emoji: "🎈", tagline: "น้องเล่นเบาๆ สบายๆ", wow: "น้องไม่ต้องการ stimulation มาก — มีความสุขง่าย", description: "น้องชอบเล่นช้าๆ หรือนอนเล่นมากกว่าวิ่ง", scienceSecret: "น้องอาจมี Dopamine baseline ที่สูง ไม่ต้องหา stimulation เพิ่ม", funFact: "🛋️ หมาบางสายพันธุ์ถูกเพาะพันธุ์มาเป็นเพื่อน ไม่ใช่นักกีฬา", actionToday: ["🧸 หาของเล่นนุ่มๆ ให้น้องนอนเล่น", "🌿 เดินเล่นช้าๆ แทนวิ่ง"], hook: "ดู Chill Factor ใน Test 11 ว่าน้องชิลแค่ไหน!", traits: ["Low-Key Fun", "Gentle Play", "Content Soul"], rarity: "🎈 25% — Gentle Player" },
    veryLow: { type: "Zen Companion", emoji: "☁️", tagline: "น้องมีความสุขแค่อยู่ด้วยกัน", wow: "น้องไม่ต้องการเล่นเพื่อมีความสุข — แค่อยู่ด้วยก็พอ", description: "น้องชอบนั่งข้างๆ มากกว่าเล่น เป็นเพื่อนที่สงบ", scienceSecret: "น้องได้ Oxytocin จากการอยู่ใกล้คุณ ไม่ต้องเล่น", funFact: "🐶 หมาบางตัวเป็น \"velcro dogs\" ที่ต้องการแค่ความใกล้ชิด", actionToday: ["💕 ใช้เวลานั่งด้วยกันเงียบๆ", "🎵 เปิดเพลงเบาๆ ฟังด้วยกัน"], hook: "ลองดู Stare Code ว่าน้องสื่อสารผ่านตาไหม — Test 1!", traits: ["Cuddle Master", "Presence > Play", "Calm Companion"], rarity: "☁️ 15% — Zen Master" }
  },
  // T6: Energy Core (DRIVE)
  6: {
    high: { type: "Turbo Dog", emoji: "⚡", tagline: "น้องคือพายุลูกน้อย", wow: "น้องมี Energy Level ที่สูงมาก — ต้องการ exercise มาก!", description: "น้องมีพลังงานไม่จำกัด ต้องออกกำลังกายทุกวัน", scienceSecret: "ยีน PPARGC1A variant ทำให้กล้ามเนื้อน้องมี endurance สูง", funFact: "🏃 Border Collie สามารถวิ่งได้ 50+ กม./วัน!", actionToday: ["🏃‍♂️ พาน้องวิ่งหรือเล่น 1-2 ชั่วโมง/วัน", "🧠 เพิ่ม mental exercise ด้วย puzzle"], hook: "น้อง Turbo มักเป็น Problem Solver ด้วย — Test 7!", traits: ["Endless Stamina", "Needs Exercise", "High Drive"], rarity: "⚡ 15% — Turbo Mode" },
    medium: { type: "Active Paw", emoji: "🔥", tagline: "น้องชอบเคลื่อนไหวแต่รู้จักพัก", wow: "น้องมี energy ที่ดี แต่ไม่ถึงกับต้องออกกำลังตลอด", description: "น้องต้องการ exercise ปานกลาง เดินเล่นวันละ 30-60 นาที", scienceSecret: "น้องมี energy management ที่ดี — รู้จักเก็บพลังงาน", funFact: "🐕 หมาส่วนใหญ่ต้องการ exercise 30-60 นาที/วัน", actionToday: ["🦮 เดินเล่น 30-45 นาที เช้า-เย็น", "🎾 เล่น fetch เป็นครั้งคราว"], hook: "ดู Focus Mode ใน Test 9!", traits: ["Good Energy", "Adaptable Activity", "Balanced"], rarity: "🔥 40% — Active Life" },
    low: { type: "Balanced Buddy", emoji: "🌤️", tagline: "น้องพอดีๆ ไม่มากไม่น้อย", wow: "น้องมี energy ที่เหมาะกับชีวิต condo/apartment", description: "น้องไม่ต้องการ exercise มาก เดินเล่นวันละ 20-30 นาทีก็พอ", scienceSecret: "น้องมี metabolism ที่สมดุล ไม่กิน calories เยอะ", funFact: "🏠 หมา energy ต่ำเหมาะกับชีวิตในเมืองมาก", actionToday: ["🌸 เดินเล่นเบาๆ 20-30 นาที", "🛋️ อย่ารู้สึกผิดที่น้องนอนเยอะ"], hook: "น้องอาจมี Chill Factor สูง — Test 11!", traits: ["Easy to Manage", "Apartment Friendly", "Calm Energy"], rarity: "🌤️ 30% — Balanced Life" },
    veryLow: { type: "Couch Potato", emoji: "🛋️", tagline: "น้องรักโซฟามากที่สุด", wow: "น้องคือเพื่อนที่ perfect สำหรับคนชอบอยู่บ้าน", description: "น้องไม่ค่อยต้องการ exercise แค่เดินเล่นสั้นๆ ก็พอ", scienceSecret: "บางสายพันธุ์ เช่น Bulldog, Basset Hound ถูกเพาะพันธุ์มาให้ใช้ energy น้อย", funFact: "🛋️ Bulldog นอนวันละ 12-14 ชั่วโมง!", actionToday: ["🚶 เดินสั้นๆ 10-15 นาที ก็พอ", "💕 Cuddle time สำคัญกว่า exercise"], hook: "ดูว่าน้องมี Brave Heart ไหม — Test 10!", traits: ["Low Maintenance", "Perfect Couch Buddy", "Sleep Master"], rarity: "🛋️ 15% — Couch King" }
  },
  // T7: Problem Solver (MIND)
  7: {
    high: { type: "Genius Pup", emoji: "🧠", tagline: "น้องฉลาดจนน่าตกใจ", wow: "น้องอยู่ใน TOP 10% ของหมาทั้งหมดในด้านความฉลาด!", description: "น้องแก้ปัญหาได้เร็ว เรียนรู้ tricks ใหม่ภายในไม่กี่ครั้ง", scienceSecret: "ยีน KIBRA variant เกี่ยวข้องกับ working memory และ problem solving", funFact: "🧩 Border Collie ชื่อ Chaser จำชื่อของเล่นได้ 1,022 ชิ้น!", actionToday: ["🧩 ให้ puzzle feeders ทุกมื้อ", "🎓 สอน trick ใหม่ทุกสัปดาห์"], hook: "น้อง Genius มักมี Memory Bank ดีเยี่ยม — Test 8!", traits: ["Quick Learner", "Puzzle Master", "Innovative Thinker"], rarity: "🧠 10% — Genius Level" },
    medium: { type: "Smart Cookie", emoji: "💡", tagline: "น้องฉลาดในแบบของตัวเอง", wow: "น้องมีความสามารถในการเรียนรู้ที่ดี", description: "น้องเรียนรู้ได้ดีเมื่อมีแรงจูงใจที่ถูกต้อง", scienceSecret: "น้องใช้ทั้ง observational learning และ trial & error", funFact: "🐕 หมาเรียนรู้จากการดูคนมากกว่าที่คิด!", actionToday: ["🍖 หา high-value treat สำหรับ training", "📚 ฝึก 5-10 นาที/วัน consistently"], hook: "ดู Focus Mode ว่าน้องจดจ่อได้นานไหม — Test 9!", traits: ["Good Learner", "Motivated", "Practical Intelligence"], rarity: "💡 40% — Smart Average" },
    low: { type: "Practical Mind", emoji: "🔧", tagline: "น้องฉลาดในเรื่องที่สำคัญ", wow: "น้องไม่ได้โง่ — แค่เลือกที่จะสนใจเรื่องที่เกี่ยวข้องกับตัวเอง", description: "น้องเรียนรู้ช้ากว่า แต่จำได้นานเมื่อเรียนแล้ว", scienceSecret: "น้องอาจเป็น \"selective learner\" เลือกเรียนเรื่องที่มีประโยชน์", funFact: "🐕 หมาบางตัว \"แกล้งโง่\" เพื่อหลีกเลี่ยงงาน!", actionToday: ["⏰ ฝึกซ้ำบ่อยๆ ด้วย positive reinforcement", "🎯 เน้น 1-2 commands ที่สำคัญ"], hook: "ดูว่าน้องมี Brave Heart ไหม — Test 10!", traits: ["Selective Learning", "Long Memory", "Practical Skills"], rarity: "🔧 35% — Practical Learner" },
    veryLow: { type: "Simple Joy", emoji: "🌈", tagline: "น้องมีความสุขง่ายๆ ไม่ต้องคิดเยอะ", wow: "น้องไม่ต้องการ mental stimulation มาก — มีความสุขกับสิ่งง่ายๆ", description: "น้องอาจไม่เก่ง tricks แต่เป็นเพื่อนที่น่ารักมาก", scienceSecret: "บางสายพันธุ์ถูกเพาะพันธุ์มาเป็นเพื่อน ไม่ใช่นักคิด", funFact: "🐶 ความฉลาดไม่ได้หมายถึงความรัก — หมา \"โง่\" ก็รักเจ้าของเท่าๆ กัน", actionToday: ["💕 ชื่นชมความเรียบง่ายของน้อง", "🎈 เล่นเกมง่ายๆ ที่ไม่ต้องคิดมาก"], hook: "ดู Empathy Radar ว่าน้องอ่านอารมณ์เก่งไหม — Test 2!", traits: ["Simple Pleasures", "Loyal Heart", "Easy Going"], rarity: "🌈 15% — Pure Heart" }
  },
  // T8: Memory Bank (MIND)
  8: {
    high: { type: "Memory Master", emoji: "💾", tagline: "น้องจำได้ทุกอย่าง", wow: "น้องมี long-term memory ที่ยอดเยี่ยม!", description: "น้องจำคน สถานที่ และ routines ได้แม่นยำมาก", scienceSecret: "ยีน BDNF variant เกี่ยวข้องกับ memory consolidation", funFact: "🧠 หมาจำหน้าเจ้าของได้แม้ไม่เจอกันหลายปี!", actionToday: ["🎓 สอนชื่อของเล่นแต่ละชิ้น", "📍 พาไปที่เดิมๆ ให้น้องจำ landmarks"], hook: "น้อง Memory Master มักเป็น Genius Pup ด้วย — ลอง Test 7!", traits: ["Excellent Recall", "Recognizes Patterns", "Never Forgets"], rarity: "💾 15% — Memory Expert" },
    medium: { type: "Quick Learner", emoji: "📚", tagline: "น้องเรียนรู้และจำได้ดี", wow: "น้องมี memory ในระดับปกติ — ซึ่งก็ดีมากแล้ว!", description: "น้องจำ routines และ commands หลักๆ ได้ดี", scienceSecret: "น้องใช้ repetition และ association ในการจำ", funFact: "🐕 หมาจำได้ดีเมื่อ learning มาพร้อมกับ positive emotions", actionToday: ["🔄 ทบทวน commands เก่าเป็นระยะ", "🍖 ใช้ treats ช่วยสร้าง positive memory"], hook: "ดู Focus Mode ใน Test 9!", traits: ["Good Memory", "Learns Well", "Retains Commands"], rarity: "📚 40% — Normal Memory" },
    low: { type: "Routine Lover", emoji: "📝", tagline: "น้องชอบความคุ้นเคย", wow: "น้องจำได้ดีเมื่อเป็น routine ที่ทำซ้ำๆ", description: "น้องอาจลืม tricks ที่ไม่ได้ฝึกบ่อย แต่จำ routine ได้แม่น", scienceSecret: "น้องอาจพึ่ง procedural memory มากกว่า declarative memory", funFact: "🔁 หมาชอบ routine เพราะทำให้รู้สึกปลอดภัย", actionToday: ["📅 สร้าง daily routine ที่ consistent", "🔄 ทบทวน commands ทุกวัน"], hook: "ดู Chill Factor ใน Test 11!", traits: ["Routine-Dependent", "Needs Consistency", "Procedural Memory"], rarity: "📝 30% — Routine Based" },
    veryLow: { type: "Present Moment", emoji: "🌸", tagline: "น้องอยู่กับปัจจุบัน", wow: "น้องไม่ยึดติดกับอดีต — มีความสุขกับตอนนี้", description: "น้องอาจลืมไวหน่อย แต่ก็หมายความว่าไม่ค่อยจำเรื่องไม่ดีด้วย", scienceSecret: "น้องอาจมี hippocampus ที่ทำงานต่างจากหมาทั่วไป", funFact: "🐶 หมาที่ลืมเร็วมักไม่ค่อย traumatized จากประสบการณ์ร้าย", actionToday: ["⏰ ฝึกสั้นๆ บ่อยๆ แทนฝึกนานๆ ครั้งเดียว", "💕 อย่าคาดหวังว่าน้องจะจำ tricks ซับซ้อน"], hook: "ลอง 6th Sense ใน Test 3!", traits: ["Lives Now", "Quick to Forgive", "Short Memory"], rarity: "🌸 15% — Present Focused" }
  },
  // T9: Focus Mode (MIND)
  9: {
    high: { type: "Laser Focus", emoji: "🎯", tagline: "น้องจดจ่อได้อย่างน่าทึ่ง", wow: "น้องมี attention span ที่ยาวกว่าหมาทั่วไปมาก!", description: "น้องสามารถโฟกัสที่งานหนึ่งได้นานโดยไม่วอกแวก", scienceSecret: "ยีน COMT variant อาจทำให้ Dopamine ในสมองส่วนหน้าสมดุล", funFact: "🎯 หมา working line เช่น Border Collie มี focus สูงมาก", actionToday: ["🧩 ให้งานที่ท้าทายและต้องใช้ focus", "🎓 ฝึก advanced obedience"], hook: "น้อง Laser Focus มักเป็น Genius Pup — Test 7!", traits: ["Intense Concentration", "Task-Oriented", "Undistractible"], rarity: "🎯 15% — Laser Sharp" },
    medium: { type: "Task Switcher", emoji: "🔄", tagline: "น้องปรับตัวได้ดี", wow: "น้องมี focus ในระดับปกติ — สมดุลดี", description: "น้องจดจ่อได้พอสมควร แต่ก็วอกแวกบ้างเป็นธรรมชาติ", scienceSecret: "น้องมี arousal regulation ที่ดี — ปรับระดับ attention ได้", funFact: "🐕 หมาส่วนใหญ่มี attention span ประมาณ 5-10 นาที", actionToday: ["⏰ ฝึก 5-10 นาทีต่อ session", "🎈 เปลี่ยน activities บ่อยๆ"], hook: "ดู Memory Bank ใน Test 8!", traits: ["Adaptable Focus", "Normal Attention", "Flexible"], rarity: "🔄 40% — Balanced Focus" },
    low: { type: "Multi-Tasker", emoji: "🌀", tagline: "น้องสนใจทุกอย่างรอบตัว", wow: "น้องมี awareness กว้าง — ไม่พลาดอะไรเลย!", description: "น้องวอกแวกง่าย แต่ก็หมายความว่า alert ต่อสิ่งแวดล้อมดี", scienceSecret: "น้องอาจมี novelty-seeking trait ที่สูง", funFact: "🐕‍🦺 หมาล่าสัตว์มักมี attention กว้าง เพื่อจับการเคลื่อนไหว", actionToday: ["🏠 ฝึกในที่เงียบๆ ก่อน แล้วค่อยเพิ่ม distractions", "🍖 ใช้ high-value treats เพื่อดึง attention"], hook: "น้องอาจมี 6th Sense ดี — Test 3!", traits: ["Wide Awareness", "Easily Distracted", "Alert to Environment"], rarity: "🌀 30% — Broad Awareness" },
    veryLow: { type: "Free Spirit", emoji: "🦋", tagline: "น้องเป็นอิสระไม่ถูกจำกัด", wow: "น้องมีจิตวิญญาณเสรี — ไม่ชอบถูกบังคับ", description: "น้องวอกแวกง่ายมาก แต่ก็มีเสน่ห์ในความเป็นตัวเอง", scienceSecret: "น้องอาจมี DRD4 variant ที่ทำให้ต้องการ novelty สูง", funFact: "🐶 หมาบางตัวถูกเพาะพันธุ์มาให้ทำงานอิสระ ไม่ใช่รอคำสั่ง", actionToday: ["⏰ ฝึกสั้นมากๆ 1-2 นาที", "🎈 ทำให้ training เป็นเกมสนุก"], hook: "ดู Wild Instinct ใน Test 12!", traits: ["Independent Mind", "Cannot Be Boxed", "Natural Explorer"], rarity: "🦋 15% — Free Soul" }
  },
  // T10: Brave Heart (NERVE)
  10: {
    high: { type: "Fearless Hero", emoji: "🦁", tagline: "น้องกล้าหาญไม่กลัวอะไร", wow: "น้องมีความกล้าในระดับที่หาได้ยาก!", description: "น้องเผชิญสถานการณ์ใหม่ด้วยความมั่นใจ ไม่หวั่นไหว", scienceSecret: "ยีน CRHR1 variant อาจทำให้ stress response ต่ำกว่าปกติ", funFact: "🦸 หมากู้ภัยต้องผ่านการคัดเลือกจากความกล้า", actionToday: ["🌍 พาน้องไปสำรวจที่ใหม่ๆ", "🎉 expose น้องกับประสบการณ์หลากหลาย"], hook: "ดู Wild Instinct ใน Test 12!", traits: ["No Fear", "Confident Explorer", "Brave Soul"], rarity: "🦁 15% — Fearless" },
    medium: { type: "Brave Heart", emoji: "🐯", tagline: "น้องกล้าในระดับที่ดี", wow: "น้องมีความกล้าที่สมดุล — ระวังแต่ไม่กลัวเกินไป", description: "น้องอาจลังเลแป๊บนึงก่อนสถานการณ์ใหม่ แต่ก็ปรับตัวได้", scienceSecret: "น้องมี stress response ที่เหมาะสม — adaptive fear", funFact: "🐕 ความกลัวที่พอดีช่วยให้หมาปลอดภัย", actionToday: ["👍 ชมน้องเมื่อเผชิญสิ่งใหม่", "🐢 ค่อยๆ expose ทีละน้อย"], hook: "ดู Chill Factor ใน Test 11!", traits: ["Healthy Caution", "Adaptable", "Balanced Fear"], rarity: "🐯 40% — Balanced Brave" },
    low: { type: "Cautious Soul", emoji: "🐱", tagline: "น้องระวังตัวเป็นพิเศษ", wow: "น้องฉลาดพอที่จะระวังตัว — survival instinct ดี", description: "น้องกลัวสิ่งใหม่ในตอนแรก แต่จะค่อยๆ ปรับตัว", scienceSecret: "น้องอาจมี amygdala ที่ sensitive กว่าปกติ", funFact: "🐕 หมาที่ระวังตัวมักอายุยืนกว่าในธรรมชาติ", actionToday: ["🏠 ให้ safe space ที่น้องหนีไปได้", "🍖 ใช้ treats สร้าง positive association"], hook: "ดู Chill Factor ว่าน้อง stressed ง่ายไหม — Test 11!", traits: ["Smart Caution", "Needs Time", "Safety First"], rarity: "🐱 30% — Cautious Mind" },
    veryLow: { type: "Safety First", emoji: "🐰", tagline: "น้องต้องการความปลอดภัย", wow: "น้องต้องการ environment ที่ปลอดภัยและคาดเดาได้", description: "น้องกลัวง่ายและต้องการเวลาในการปรับตัว", scienceSecret: "น้องอาจมี genetic predisposition ต่อ anxiety", funFact: "🏠 หมาที่กลัวง่ายตอบสนองดีมากกับ positive reinforcement", actionToday: ["🧘 สร้าง routine ที่คาดเดาได้", "💊 ปรึกษาสัตวแพทย์เรื่อง anxiety management"], hook: "ดู Empathy Radar — น้องอาจรับอารมณ์คุณมาด้วย Test 2!", traits: ["Needs Security", "Sensitive Soul", "Requires Patience"], rarity: "🐰 15% — Sensitive Heart" }
  },
  // T11: Chill Factor (NERVE)
  11: {
    high: { type: "Buddha Dog", emoji: "🧘", tagline: "น้องสงบเหมือนพระ", wow: "น้องมี stress tolerance ที่สูงมาก — หาได้ยาก!", description: "น้องไม่ค่อย stressed ไม่ว่าอะไรจะเกิดขึ้น", scienceSecret: "ยีน SLC6A3 variant อาจทำให้ Dopamine regulation ดีเยี่ยม", funFact: "🧘 หมา therapy มักถูกเลือกจากความสงบ", actionToday: ["💕 ขอบคุณน้องที่เป็น calming presence", "🏥 น้องอาจเหมาะเป็น therapy dog!"], hook: "น้อง Buddha มักมี 6th Sense ดี — Test 3!", traits: ["Unshakeable Calm", "Stress-Proof", "Inner Peace"], rarity: "🧘 10% — Zen Master" },
    medium: { type: "Chill Master", emoji: "😎", tagline: "น้องชิลในระดับที่ดี", wow: "น้องมี stress management ที่ดี — ปรับตัวได้", description: "น้อง stressed บ้างในบางสถานการณ์ แต่ recover เร็ว", scienceSecret: "น้องมี cortisol regulation ที่ดี — stress ขึ้นแต่ก็ลงเร็ว", funFact: "🐕 หมาส่วนใหญ่ recover จาก stress ภายใน 15-30 นาที", actionToday: ["🎵 เปิดเพลง calming เมื่อน้อง stressed", "🏠 มี safe space ให้น้องได้พัก"], hook: "ดู Brave Heart ใน Test 10!", traits: ["Good Recovery", "Adaptable", "Balanced Stress"], rarity: "😎 40% — Chill Vibes" },
    low: { type: "Alert Guard", emoji: "👀", tagline: "น้องตื่นตัวเสมอ", wow: "น้องมี alertness สูง — ไม่พลาดอะไร!", description: "น้อง stressed ง่ายกว่าปกติ ต้องการ environment ที่สงบ", scienceSecret: "น้องอาจมี cortisol baseline ที่สูงกว่าปกติ", funFact: "🐕‍🦺 หมาที่ alert สูงมักเป็น guard dog ที่ดี", actionToday: ["🏠 ลด stimulation ใน environment", "🧘 ฝึก relaxation exercises"], hook: "ดู Empathy Radar — น้องอาจรับอารมณ์มา Test 2!", traits: ["High Alert", "Sensitive", "Needs Calm Environment"], rarity: "👀 35% — Alert Soul" },
    veryLow: { type: "Worry Warrior", emoji: "😰", tagline: "น้องกังวลง่าย", wow: "น้องต้องการการดูแลพิเศษในเรื่อง anxiety", description: "น้อง stressed ง่ายและ recover ช้า ต้องการ routine ที่ชัดเจน", scienceSecret: "น้องอาจมี genetic predisposition ต่อ anxiety disorders", funFact: "🐕 1 ใน 4 ของหมามี separation anxiety ในระดับใดระดับหนึ่ง", actionToday: ["💊 ปรึกษาสัตวแพทย์เรื่อง anxiety management", "🧸 ให้ของเล่นที่ calming เช่น snuffle mat"], hook: "ดู Empathy Radar — น้องอาจรับอารมณ์คุณ Test 2!", traits: ["Needs Support", "Anxiety Prone", "Requires Patience"], rarity: "😰 15% — Sensitive Soul" }
  },
  // T12: Primal Instinct (WILD)
  12: {
    high: { type: "Wolf Soul", emoji: "🐺", tagline: "จิตวิญญาณหมาป่ายังอยู่", wow: "น้องมี primal instincts ที่แรงมาก — ใกล้ชิดบรรพบุรุษ!", description: "น้องมีสัญชาตญาณล่า เฝ้า และสำรวจที่แรงกล้า", scienceSecret: "ยีน WBSCR17 อาจยังคงรูปแบบเดียวกับหมาป่า", funFact: "🐺 DNA หมาต่างจากหมาป่าแค่ 0.2%!", actionToday: ["🦴 ให้กิจกรรมที่ใช้ instincts เช่น nose work", "🏃 ให้ outlet สำหรับพลังงาน"], hook: "ดู Food Soul — น้องอาจเป็น carnivore ตัวจริง Test 4!", traits: ["Strong Instincts", "Prey Drive", "Pack Mentality"], rarity: "🐺 10% — Wolf Heart" },
    medium: { type: "Wild Heart", emoji: "🦊", tagline: "น้องมีความ wild ซ่อนอยู่", wow: "น้องมี instincts ที่ดี แต่ก็เชื่องพอ", description: "น้องมี hunting และ guarding instincts แต่ควบคุมได้", scienceSecret: "น้องมี balance ระหว่าง wild และ domesticated genes", funFact: "🦊 หมาถูก domesticate มาประมาณ 15,000-40,000 ปี", actionToday: ["🎾 เล่น fetch หรือ tug ให้ outlet สำหรับ prey drive", "🧩 ให้ puzzle toys กระตุ้น hunting instincts"], hook: "ดู Energy Core ใน Test 6!", traits: ["Balanced Instincts", "Controlled Wild", "Adaptable"], rarity: "🦊 30% — Balanced Wild" },
    low: { type: "Domesticated", emoji: "🐕", tagline: "น้องเป็นหมาบ้านตัวจริง", wow: "น้องถูกเลี้ยงมาให้เป็นเพื่อนที่สมบูรณ์แบบ", description: "น้องไม่ค่อยมี hunting หรือ guarding instincts — เป็นมิตรกับทุกคน", scienceSecret: "น้องมี genes ที่ถูก select มาสำหรับความเชื่อง", funFact: "🐕 Cavalier King Charles Spaniel ถูกเพาะพันธุ์มาเพื่อนั่งตัก!", actionToday: ["💕 ชื่นชมความอ่อนโยนของน้อง", "🐕‍🦺 น้องเหมาะกับบ้านที่มีเด็กหรือสัตว์อื่น"], hook: "ดู Empathy Radar ว่าน้องอ่านอารมณ์เก่งไหม Test 2!", traits: ["Gentle Soul", "People-Oriented", "Easy Going"], rarity: "🐕 40% — True Companion" },
    veryLow: { type: "Pure Companion", emoji: "🧸", tagline: "น้องคือเพื่อนที่บริสุทธิ์", wow: "น้องถูกเลี้ยงมาเพื่อความรักล้วนๆ", description: "น้องไม่มี aggression หรือ hunting drive — รักทุกคน", scienceSecret: "น้องมี oxytocin genes ที่แรงมาก — bonding สูง", funFact: "🧸 หมาบางสายพันธุ์ไม่เคยถูกใช้ทำงาน — เป็นเพื่อนอย่างเดียว", actionToday: ["🤗 cuddle น้องเยอะๆ", "👨‍👩‍👧‍👦 น้องเหมาะกับทุก lifestyle"], hook: "ดู Stare Code — น้องคงสบตาเก่งมาก Test 1!", traits: ["Pure Love", "Zero Aggression", "Ultimate Companion"], rarity: "🧸 20% — Pure Heart" }
  }
};

export default function MhaStoryApp() {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [authStep, setAuthStep] = useState(1);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  
  // Lead Info (Dog Profile)
  const [leadInfo, setLeadInfo] = useState({
    dogName: "",
    breed: "",
    customBreed: "",
    age: "",
    ownerName: ""
  });
  
  // Quiz State
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Completed Topics & Results
  const [completedTopics, setCompletedTopics] = useState({});
  
  // Refs for LINE Browser fix
  const dogNameRef = useRef(null);
  const customBreedRef = useRef(null);
  const ownerNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);


  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ QUESTIONS — 12 Topics × 10 Questions Each
  // ═══════════════════════════════════════════════════════════════════════════
  const quizQuestions = {
    // T1: The Stare Code
    1: [
      { q: "เมื่อคุณกลับถึงบ้าน น้องหมาสบตาคุณแบบไหน?", a: ["จ้องมองไม่กระพริบ เหมือนรอคุณมานาน", "มองแป๊บแล้ววิ่งมาหา", "มองผ่านๆ แล้วก็ทำธุระต่อ", "ไม่ค่อยสนใจ ยังนอนต่อ"], s: [4, 3, 2, 1] },
      { q: "ระหว่างกินข้าว น้องหมาทำอะไร?", a: ["นั่งจ้องหน้าคุณตลอดมื้อ", "มองเป็นระยะๆ หวังได้กิน", "ไม่ค่อยสนใจ เล่นของตัวเอง", "นอนหลับ"], s: [4, 3, 2, 1] },
      { q: "เวลาคุณเศร้า น้องหมาทำยังไง?", a: ["มานั่งข้างๆ สบตา เหมือนเข้าใจ", "มาเลีย/แนบตัว", "มาเล่นด้วยเหมือนจะให้หายเศร้า", "ไม่ค่อยสังเกต"], s: [4, 3, 2, 1] },
      { q: "ขณะเดินเล่น น้องหมาหันมามองคุณบ่อยแค่ไหน?", a: ["ทุกๆ ไม่กี่ก้าว check in ตลอด", "เป็นระยะๆ", "นานๆ ครั้ง", "แทบไม่หันมาเลย สนใจกลิ่น"], s: [4, 3, 2, 1] },
      { q: "เมื่อคุณพูดชื่อน้อง ปฏิกิริยาเป็นยังไง?", a: ["หูตั้ง สบตาทันที", "หันมามอง", "แค่กระดิกหู", "ไม่ค่อยตอบสนอง"], s: [4, 3, 2, 1] },
      { q: "ถ้าคุณร้องไห้ น้องหมาจะ?", a: ["มาเลียน้ำตา สบตาเป็นห่วง", "มานั่งใกล้ๆ แนบตัว", "มาดมๆ แล้วก็ไป", "ไม่ค่อยสังเกต"], s: [4, 3, 2, 1] },
      { q: "เวลาคุณกำลังจะออกจากบ้าน น้องทำยังไง?", a: ["จ้องมองทุกการเคลื่อนไหว ตาเศร้า", "ตามไปที่ประตู", "มองดูบ้าง", "ไม่ค่อยสนใจ"], s: [4, 3, 2, 1] },
      { q: "ขณะนั่งทำงาน/ดูทีวี น้องอยู่ไหน?", a: ["นั่งมองหน้าคุณ", "นอนข้างๆ แอบมองเป็นระยะ", "อยู่ในห้องเดียวกันแต่ทำอย่างอื่น", "ไปอยู่ที่อื่น"], s: [4, 3, 2, 1] },
      { q: "เมื่อมีคนแปลกหน้ามาบ้าน น้องทำยังไง?", a: ["มองคุณก่อนเพื่อดู reaction", "วิ่งไปหาคนแปลกหน้าเลย", "เห่า/ระวังตัว", "ไม่ค่อยสนใจ"], s: [4, 3, 2, 1] },
      { q: "ก่อนนอน น้องหมาทำอะไรสุดท้าย?", a: ["สบตาคุณแล้วค่อยหลับ", "มานอนข้างๆ", "ไปนอนที่ของตัวเอง", "นอนไปแล้วก่อนหน้านั้น"], s: [4, 3, 2, 1] }
    ],
    // T2: Empathy Radar
    2: [
      { q: "เมื่อคุณเครียด น้องหมาทำยังไง?", a: ["รู้ทันที มาปลอบ", "สังเกตได้ถ้าเครียดมาก", "ไม่ค่อยสังเกต", "ไม่สนใจ"], s: [4, 3, 2, 1] },
      { q: "ถ้าคุณโกรธ (ไม่ใช่โกรธน้อง) น้องทำยังไง?", a: ["หลบๆ เหมือนรู้ว่าอารมณ์ไม่ดี", "มานั่งใกล้ๆ ปลอบ", "ทำเหมือนปกติ", "ไม่สังเกตเลย"], s: [4, 3, 2, 1] },
      { q: "เมื่อคุณดีใจ/ตื่นเต้น น้องตอบสนองไหม?", a: ["ตื่นเต้นตามทันที กระดิกหาง", "มาร่วมวงด้วย", "ดูสนใจบ้าง", "เฉยๆ"], s: [4, 3, 2, 1] },
      { q: "ถ้าคุณไม่สบาย น้องทำยังไง?", a: ["นอนเฝ้าไม่ไปไหน", "มาเช็คเป็นระยะๆ", "ทำเหมือนปกติ", "ไม่สังเกต"], s: [4, 3, 2, 1] },
      { q: "เมื่อมีการทะเลาะในบ้าน น้องทำยังไง?", a: ["วิ่งหนี/หลบ ดูเครียด", "พยายามแทรกกลาง", "นั่งดู ไม่เข้าใจ", "ไม่สนใจ"], s: [4, 3, 2, 1] },
      { q: "ถ้าคุณร้องเพลงดีใจ น้องทำยังไง?", a: ["หอน/ร้องตาม ร่วมวง", "กระดิกหาง ดูสนใจ", "มองงงๆ", "เฉยๆ"], s: [4, 3, 2, 1] },
      { q: "เมื่อคุณนั่งสมาธิ/สงบ น้องทำยังไง?", a: ["นั่ง/นอนเงียบๆ ด้วย", "มานั่งใกล้แต่ไม่รบกวน", "มาเล่นด้วย", "ไม่สนใจ ทำอย่างอื่น"], s: [4, 3, 2, 1] },
      { q: "ถ้าคุณหัวเราะลั่น น้องทำยังไง?", a: ["ตื่นเต้นตาม กระดิกหาง", "มาดูว่าเกิดอะไรขึ้น", "มองบ้าง", "ไม่สนใจ"], s: [4, 3, 2, 1] },
      { q: "เมื่อคุณกังวล (เช่น ก่อนสอบ/ประชุม) น้องรู้ไหม?", a: ["มาแนบตัว ดูเข้าใจ", "อยู่ใกล้กว่าปกติ", "ทำเหมือนปกติ", "ไม่สังเกต"], s: [4, 3, 2, 1] },
      { q: "ถ้าคุณดีใจมากๆ (เช่น ได้เลื่อนขั้น) น้องฉลองด้วยไหม?", a: ["วิ่งวนกระดิกหาง ตื่นเต้นมาก", "มาร่วมวง", "ดูสนใจบ้าง", "เฉยๆ"], s: [4, 3, 2, 1] }
    ],
    // T3: 6th Sense
    3: [
      { q: "น้องหมาเคย 'รู้ล่วงหน้า' ว่าคุณจะกลับบ้านไหม?", a: ["ใช่ ไปรอที่ประตูก่อนได้ยินเสียง", "บางครั้ง", "ไม่ค่อย", "ไม่เคยสังเกต"], s: [4, 3, 2, 1] },
      { q: "น้องเคยเห่าก่อนโทรศัพท์ดังไหม?", a: ["ใช่ บ่อยมาก", "บางครั้ง", "แทบไม่เคย", "ไม่เคย"], s: [4, 3, 2, 1] },
      { q: "น้องรู้ตัวไหมเมื่อคุณกำลังจะพาไปหาหมอ?", a: ["รู้ทันที ไม่ต้องบอก", "เริ่มรู้ตอนจับสายจูง", "รู้ตอนขึ้นรถ", "ไม่รู้จนถึงคลินิก"], s: [4, 3, 2, 1] },
      { q: "น้องเคยแสดงพฤติกรรมแปลกๆ ก่อนเหตุการณ์ไม่ดีไหม?", a: ["ใช่ หลายครั้ง", "เคย 1-2 ครั้ง", "ไม่แน่ใจ", "ไม่เคย"], s: [4, 3, 2, 1] },
      { q: "น้องรู้ไหมว่าคุณกำลังจะออกไปข้างนอก (ก่อนแต่งตัว)?", a: ["รู้ตั้งแต่คิด", "รู้ตอนเริ่มแต่งตัว", "รู้ตอนหยิบกุญแจ", "รู้ตอนเปิดประตู"], s: [4, 3, 2, 1] },
      { q: "น้องเคย 'รู้' ว่าใครกำลังจะมาเยี่ยมไหม?", a: ["ใช่ ตื่นเต้นก่อนกดออด", "บางครั้ง", "ไม่ค่อย", "ไม่เคย"], s: [4, 3, 2, 1] },
      { q: "น้องตอบสนองกับเสียงที่คุณยังไม่ได้ยินไหม?", a: ["บ่อยมาก หูไวกว่า", "บางครั้ง", "แทบไม่เคย", "ไม่เคย"], s: [4, 3, 2, 1] },
      { q: "น้องเคยหลีกเลี่ยงคน/สถานที่บางอย่างโดยไม่มีเหตุผลชัดเจนไหม?", a: ["ใช่ หลายครั้ง และถูกด้วย", "เคยบ้าง", "ไม่ค่อย", "ไม่เคย"], s: [4, 3, 2, 1] },
      { q: "น้องรู้ไหมว่าใครในบ้านกำลังป่วย?", a: ["รู้ ไปเฝ้าคนนั้น", "ดูเหมือนรู้บ้าง", "ไม่แน่ใจ", "ไม่รู้"], s: [4, 3, 2, 1] },
      { q: "น้องเคยปลุกคุณก่อนนาฬิกาปลุกดังไหม?", a: ["ใช่ บ่อย ตรงเวลามาก", "บางครั้ง", "แทบไม่เคย", "ไม่เคย"], s: [4, 3, 2, 1] }
    ],
    // T4-T12 จะเพิ่มใน Part ถัดไป
  };

  // Swipe Quiz Questions (T4: Food Soul)
  const swipeQuestions = {
    4: [
      { item: "ไก่ต้ม", emoji: "🍗", desc: "โปรตีนคลาสสิค" },
      { item: "ผักโขม", emoji: "🥬", desc: "ไฟเบอร์สูง" },
      { item: "ตับไก่", emoji: "🫀", desc: "วิตามินเพียบ" },
      { item: "แครอท", emoji: "🥕", desc: "เบต้าแคโรทีน" },
      { item: "เนื้อวัว", emoji: "🥩", desc: "โปรตีนพรีเมียม" },
      { item: "แอปเปิ้ล", emoji: "🍎", desc: "หวานธรรมชาติ" },
      { item: "ปลาแซลมอน", emoji: "🍣", desc: "โอเมก้า 3" },
      { item: "บลูเบอร์รี่", emoji: "🫐", desc: "แอนตี้ออกซิแดนท์" },
      { item: "ไข่ต้ม", emoji: "🥚", desc: "โปรตีนครบ" },
      { item: "ฟักทอง", emoji: "🎃", desc: "ไฟเบอร์ดี" }
    ]
  };

  // Slider Quiz Questions (T5, T6, T9, T11)
  const sliderQuestions = {
    5: [
      { q: "น้องตื่นเต้นแค่ไหนเมื่อเห็นลูกบอล?", min: "เฉยๆ", max: "บ้าเลย!" },
      { q: "น้องเล่นได้นานแค่ไหนก่อนเหนื่อย?", min: "5 นาที", max: "ไม่มีหมด" },
      { q: "น้องชวนคุณเล่นบ่อยแค่ไหน?", min: "ไม่เคย", max: "ตลอดเวลา" },
      { q: "น้องตื่นเต้นกับของเล่นใหม่แค่ไหน?", min: "เฉยๆ", max: "บ้าคลั่ง" },
      { q: "น้องเล่นกับหมาตัวอื่นยังไง?", min: "ไม่สนใจ", max: "แอคทีฟมาก" },
      { q: "น้องชอบเกมไล่จับไหม?", min: "ไม่เลย", max: "ชอบมาก" },
      { q: "น้องทำลายของเล่นเร็วแค่ไหน?", min: "ไม่เคย", max: "วันเดียวพัง" },
      { q: "น้องเล่น tug-of-war แรงแค่ไหน?", min: "อ่อนๆ", max: "ดุเดือด" },
      { q: "น้องต้องการ playtime ต่อวันเท่าไหร่?", min: "5 นาที", max: "2+ ชม." },
      { q: "น้องมีพลังงานหลังเล่นยังไง?", min: "หมด", max: "ยังฟิต" }
    ],
    6: [
      { q: "น้องต้องการออกกำลังกายต่อวันเท่าไหร่?", min: "แทบไม่ต้อง", max: "2+ ชม." },
      { q: "น้องตื่นเช้าพร้อมพลังงานขนาดไหน?", min: "งัวเงีย", max: "พุ่งทันที" },
      { q: "น้องเหนื่อยง่ายแค่ไหนตอนเดินเล่น?", min: "เร็วมาก", max: "ไม่เคยเหนื่อย" },
      { q: "น้องนอนกลางวันบ่อยแค่ไหน?", min: "ตลอด", max: "ไม่เคย" },
      { q: "น้อง hyperactive ตอนเย็นไหม?", min: "ไม่เลย", max: "บ้าเลย" },
      { q: "น้องวิ่งแบบ 'zoomies' บ่อยแค่ไหน?", min: "ไม่เคย", max: "ทุกวัน" },
      { q: "น้องต้องการกิจกรรมหลังกินข้าวไหม?", min: "นอนเลย", max: "พร้อมเล่น" },
      { q: "น้องนิ่งอยู่กับที่ได้นานแค่ไหน?", min: "ไม่ได้เลย", max: "หลายชม." },
      { q: "พลังงานน้องเทียบกับหมาตัวอื่นยังไง?", min: "ต่ำมาก", max: "สูงสุด" },
      { q: "น้องต้องการ mental exercise ไหม?", min: "ไม่จำเป็น", max: "ทุกวัน" }
    ],
    9: [
      { q: "น้องจดจ่อกับ treat ได้นานแค่ไหน?", min: "แป๊บเดียว", max: "จนกว่าจะได้" },
      { q: "น้องวอกแวกง่ายแค่ไหนตอนฝึก?", min: "ง่ายมาก", max: "ไม่วอกแวก" },
      { q: "น้องทำตาม command ได้กี่ครั้งติด?", min: "1 ครั้ง", max: "10+ ครั้ง" },
      { q: "น้องสนใจ puzzle toy นานแค่ไหน?", min: "ไม่สนใจ", max: "จนกว่าจะเสร็จ" },
      { q: "น้องมองตามวัตถุเคลื่อนที่ได้นานไหม?", min: "แป๊บเดียว", max: "นานมาก" },
      { q: "น้องรอ treat ได้นานแค่ไหน?", min: "ไม่ได้เลย", max: "หลายนาที" },
      { q: "น้องฟัง command ในที่มีสิ่งรบกวนได้ไหม?", min: "ไม่ได้", max: "ได้ดีมาก" },
      { q: "น้องจำ routine ได้ดีแค่ไหน?", min: "ไม่จำ", max: "จำได้หมด" },
      { q: "น้องสนใจ training session นานแค่ไหน?", min: "1 นาที", max: "30+ นาที" },
      { q: "น้องหยุดทำอะไรเมื่อคุณบอกได้ไหม?", min: "ไม่ได้", max: "ทันที" }
    ],
    11: [
      { q: "น้องตอบสนองกับเสียงดังยังไง?", min: "ตกใจมาก", max: "ไม่สน" },
      { q: "น้องผ่อนคลายในสถานที่ใหม่เร็วแค่ไหน?", min: "นานมาก", max: "ทันที" },
      { q: "น้อง stressed เมื่ออยู่คนเดียวไหม?", min: "มาก", max: "ไม่เลย" },
      { q: "น้องนอนหลับสนิทไหม?", min: "ตื่นง่าย", max: "หลับลึก" },
      { q: "น้องกังวลเรื่องอาหารไหม?", min: "กังวลมาก", max: "ชิลมาก" },
      { q: "น้องตอบสนองกับสัตว์แปลกหน้ายังไง?", min: "ตื่นกลัว", max: "ชิลๆ" },
      { q: "น้อง recover จาก stress เร็วแค่ไหน?", min: "ช้ามาก", max: "เร็วมาก" },
      { q: "น้องนิ่งในรถได้ไหม?", min: "กระวนกระวาย", max: "นอนหลับ" },
      { q: "น้องจัดการกับการเปลี่ยนแปลงยังไง?", min: "ยาก", max: "ง่าย" },
      { q: "โดยรวม น้องเป็นหมาแบบไหน?", min: "วิตกกังวล", max: "สงบมาก" }
    ]
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const isTopicUnlocked = (topicId) => {
    if (TEST_MODE) return true;
    const topic = allTopics.find(t => t.id === topicId);
    return Object.keys(completedTopics).length >= topic.unlockAt;
  };

  const isTopicCompleted = (topicId) => {
    return completedTopics[topicId] !== undefined;
  };

  const getPersonality = (score, topicId = 1) => {
    const config = topicPersonalityConfig[topicId] || topicPersonalityConfig[1];
    const level = score >= 80 ? "high" : score >= 60 ? "medium" : score >= 40 ? "low" : "veryLow";
    const db = personalityDB[topicId]?.[level] || {};
    return {
      type: db.type || config.types[level],
      emoji: db.emoji || config.emojis[level],
      tagline: db.tagline || "",
      oxytocin: score,
      rarity: db.rarity || "",
      description: db.description || "",
      traits: db.traits || [],
      wow: db.wow || "",
      scienceSecret: db.scienceSecret || "",
      funFact: db.funFact || "",
      actionToday: db.actionToday || [],
      hook: db.hook || ""
    };
  };

  const getDimensionScores = () => {
    const scores = { BOND: [], DRIVE: [], MIND: [], NERVE: [], WILD: [] };
    Object.entries(completedTopics).forEach(([topicId, data]) => {
      const topic = allTopics.find(t => t.id === parseInt(topicId));
      if (topic) {
        scores[topic.dimension].push(data.score);
      }
    });
    const avgScores = {};
    Object.entries(scores).forEach(([dim, arr]) => {
      avgScores[dim] = arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    });
    return avgScores;
  };

  const getArchetype = () => {
    const dimScores = getDimensionScores();
    const sorted = Object.entries(dimScores).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if (sorted.length < 2) return null;
    
    const [primary] = sorted[0];
    const [secondary] = sorted[1];
    
    const archetypes = {
      "BOND-DRIVE": { name: "The Enthusiastic Lover", desc: "รักอย่างทุ่มเท พลังงานเต็มเปี่ยม" },
      "BOND-MIND": { name: "The Soul Reader", desc: "อ่านใจเก่ง ฉลาดล้ำ" },
      "BOND-NERVE": { name: "The Steady Heart", desc: "รักมั่นคง ใจนิ่ง" },
      "BOND-WILD": { name: "The Loyal Wolf", desc: "ซื่อสัตย์แต่ยังมีสัญชาตญาณ" },
      "DRIVE-BOND": { name: "The Active Companion", desc: "เพื่อนเล่นที่รักคุณ" },
      "DRIVE-MIND": { name: "The Smart Athlete", desc: "ฉลาดและแอคทีฟ" },
      "DRIVE-NERVE": { name: "The Confident Player", desc: "มั่นใจและชอบเล่น" },
      "DRIVE-WILD": { name: "The Primal Hunter", desc: "นักล่าผู้กล้า" },
      "MIND-BOND": { name: "The Emotional Genius", desc: "ฉลาดและเข้าใจอารมณ์" },
      "MIND-DRIVE": { name: "The Problem Solver", desc: "แก้ปัญหาไม่หยุด" },
      "MIND-NERVE": { name: "The Wise Sage", desc: "นิ่งและรอบรู้" },
      "MIND-WILD": { name: "The Cunning Fox", desc: "ฉลาดและมีไหวพริบ" },
      "NERVE-BOND": { name: "The Calm Lover", desc: "รักอย่างสงบ" },
      "NERVE-DRIVE": { name: "The Balanced Warrior", desc: "สมดุลและกล้าหาญ" },
      "NERVE-MIND": { name: "The Zen Master", desc: "สงบและรอบรู้" },
      "NERVE-WILD": { name: "The Silent Guardian", desc: "เฝ้าระวังอย่างสงบ" },
      "WILD-BOND": { name: "The Devoted Wolf", desc: "ภักดีต่อฝูง" },
      "WILD-DRIVE": { name: "The Untamed Spirit", desc: "จิตวิญญาณอิสระ" }
    };
    
    const key = `${primary}-${secondary}`;
    return { ...archetypes[key], primary, secondary, primaryScore: sorted[0][1], secondaryScore: sorted[1][1] };
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // SUPABASE AUTH
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("dog_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (data && !error) {
        setLeadInfo(data.lead_info || {});
        setCompletedTopics(data.completed_topics || {});
        setSaveMsg("☁️ Data loaded!");
        setTimeout(() => setSaveMsg(""), 2000);
      }
    } catch (e) {
      console.log("No saved data yet");
    }
  };

  const saveUserData = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("dog_profiles")
        .upsert({
          user_id: user.id,
          lead_info: leadInfo,
          completed_topics: completedTopics,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      
      if (!error) {
        setSaveMsg("✅ Saved!");
        setTimeout(() => setSaveMsg(""), 2000);
      }
    } catch (e) {
      setSaveMsg("❌ Save failed");
    }
  };

  const handleSignUp = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setScreen("dashboard");
    }
  };

  const handleSignIn = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setScreen("dashboard");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCompletedTopics({});
    setLeadInfo({ dogName: "", breed: "", customBreed: "", age: "", ownerName: "" });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const startQuiz = (topic) => {
    setCurrentTopic(topic);
    setCurrentQ(0);
    setAnswers([]);
    setShowResult(false);
    setQuizScore(0);
    setScreen("quiz");
  };

  const handleAnswer = (answerIndex, score) => {
    const newAnswers = [...answers, { q: currentQ, a: answerIndex, s: score }];
    setAnswers(newAnswers);
    
    if (currentQ < 9) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate score
      const totalScore = newAnswers.reduce((sum, ans) => sum + ans.s, 0);
      const maxScore = 40; // 10 questions × 4 max
      const percentage = Math.round((totalScore / maxScore) * 100);
      setQuizScore(percentage);
      
      // Save result
      const newCompleted = {
        ...completedTopics,
        [currentTopic.id]: {
          score: percentage,
          completedAt: new Date().toISOString(),
          personality: getPersonality(percentage, currentTopic.id).type
        }
      };
      setCompletedTopics(newCompleted);
      setShowResult(true);
      
      if (user) saveUserData();
    }
  };

  const handleSliderSubmit = (values) => {
    const totalScore = values.reduce((sum, v) => sum + v, 0);
    const maxScore = 50; // 10 questions × 5 max
    const percentage = Math.round((totalScore / maxScore) * 100);
    setQuizScore(percentage);
    
    const newCompleted = {
      ...completedTopics,
      [currentTopic.id]: {
        score: percentage,
        completedAt: new Date().toISOString(),
        personality: getPersonality(percentage, currentTopic.id).type
      }
    };
    setCompletedTopics(newCompleted);
    setShowResult(true);
    
    if (user) saveUserData();
  };

  const handleSwipeComplete = (likes) => {
    const percentage = Math.round((likes / 10) * 100);
    setQuizScore(percentage);
    
    const newCompleted = {
      ...completedTopics,
      [currentTopic.id]: {
        score: percentage,
        completedAt: new Date().toISOString(),
        personality: getPersonality(percentage, currentTopic.id).type
      }
    };
    setCompletedTopics(newCompleted);
    setShowResult(true);
    
    if (user) saveUserData();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════════════════════
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #1a1025 0%, #2d1b3d 50%, #1a1025 100%)",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    },
    content: {
      maxWidth: "400px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1
    },
    glowOrb: {
      position: "absolute",
      borderRadius: "50%",
      filter: "blur(80px)",
      opacity: 0.3,
      pointerEvents: "none"
    },
    card: {
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "20px",
      marginBottom: "16px"
    },
    btn: {
      width: "100%",
      padding: "16px 24px",
      borderRadius: "16px",
      border: "none",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontFamily: "inherit"
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)",
      color: "#1a1025"
    },
    btnSecondary: {
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)"
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      fontSize: "16px",
      marginBottom: "12px",
      fontFamily: "inherit",
      outline: "none"
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Landing Screen
  const LandingScreen = () => (
    <div style={styles.container}>
      <div style={{...styles.glowOrb, width: 300, height: 300, background: "#FF6B9D", top: -100, right: -100}} />
      <div style={{...styles.glowOrb, width: 200, height: 200, background: "#FFD93D", bottom: 100, left: -80}} />
      
      <div style={styles.content}>
        <div style={{ textAlign: "center", paddingTop: "60px" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🐕</div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
            MHA' STORY
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "40px" }}>
            ถอดรหัส DNA บุคลิกภาพน้องหมาของคุณ
          </p>
          
          <div style={styles.card}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>🧬</div>
            <h3 style={{ color: "white", fontSize: "18px", marginBottom: "8px" }}>12 Tests • 5 Dimensions</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>BOND • DRIVE • MIND • NERVE • WILD</p>
          </div>
          
          <button onClick={() => setScreen("onboarding")} style={{...styles.btn, ...styles.btnPrimary}}>
            🚀 เริ่มต้นเลย!
          </button>
          
          {user ? (
            <p style={{ color: "rgba(100,255,180,0.7)", fontSize: "12px", marginTop: "16px" }}>
              ☁️ Logged in: {user.email}
            </p>
          ) : (
            <button onClick={() => { setAuthMode("login"); setScreen("auth"); }}
              style={{...styles.btn, ...styles.btnSecondary, marginTop: "12px"}}>
              🔐 Login / Register
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Onboarding Screen
  const OnboardingScreen = () => {
    const [step, setStep] = useState(1);
    
    return (
      <div style={styles.container}>
        <div style={{...styles.glowOrb, width: 250, height: 250, background: "#6BCB77", top: 50, left: -100}} />
        <div style={styles.content}>
          <button onClick={() => step > 1 ? setStep(step - 1) : setScreen("landing")}
            style={{ background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer", marginBottom: "20px" }}>
            ←
          </button>
          
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  width: i === step ? "24px" : "8px", height: "8px",
                  borderRadius: "4px", background: i === step ? "#FF6B9D" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s"
                }} />
              ))}
            </div>
          </div>
          
          {step === 1 && (
            <div style={styles.card}>
              <h3 style={{ color: "white", fontSize: "18px", marginBottom: "16px" }}>🐕 น้องหมาชื่ออะไร?</h3>
              <input
                ref={dogNameRef}
                type="text"
                placeholder="ชื่อน้องหมา"
                value={leadInfo.dogName}
                onChange={(e) => setLeadInfo({...leadInfo, dogName: e.target.value})}
                style={styles.input}
              />
              <button onClick={() => leadInfo.dogName && setStep(2)}
                disabled={!leadInfo.dogName}
                style={{...styles.btn, ...styles.btnPrimary, opacity: leadInfo.dogName ? 1 : 0.5}}>
                ถัดไป →
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div style={styles.card}>
              <h3 style={{ color: "white", fontSize: "18px", marginBottom: "16px" }}>🦴 น้อง {leadInfo.dogName} เป็นพันธุ์อะไร?</h3>
              <select
                value={leadInfo.breed}
                onChange={(e) => setLeadInfo({...leadInfo, breed: e.target.value})}
                style={{...styles.input, cursor: "pointer"}}
              >
                <option value="">เลือกสายพันธุ์</option>
                {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {leadInfo.breed === "อื่นๆ (กรอกเอง)" && (
                <input
                  ref={customBreedRef}
                  type="text"
                  placeholder="กรอกสายพันธุ์"
                  value={leadInfo.customBreed}
                  onChange={(e) => setLeadInfo({...leadInfo, customBreed: e.target.value})}
                  style={styles.input}
                />
              )}
              <button onClick={() => leadInfo.breed && setStep(3)}
                disabled={!leadInfo.breed}
                style={{...styles.btn, ...styles.btnPrimary, opacity: leadInfo.breed ? 1 : 0.5}}>
                ถัดไป →
              </button>
            </div>
          )}
          
          {step === 3 && (
            <div style={styles.card}>
              <h3 style={{ color: "white", fontSize: "18px", marginBottom: "16px" }}>🎂 น้อง {leadInfo.dogName} อายุเท่าไหร่?</h3>
              <select
                value={leadInfo.age}
                onChange={(e) => setLeadInfo({...leadInfo, age: e.target.value})}
                style={{...styles.input, cursor: "pointer"}}
              >
                <option value="">เลือกช่วงอายุ</option>
                <option value="puppy">Puppy (0-1 ปี)</option>
                <option value="young">Young (1-3 ปี)</option>
                <option value="adult">Adult (3-7 ปี)</option>
                <option value="senior">Senior (7+ ปี)</option>
              </select>
              <button onClick={() => leadInfo.age && setScreen("dashboard")}
                disabled={!leadInfo.age}
                style={{...styles.btn, ...styles.btnPrimary, opacity: leadInfo.age ? 1 : 0.5}}>
                🧬 เริ่มถอดรหัส DNA!
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Auth Screen
  const AuthScreen = () => (
    <div style={styles.container}>
      <div style={{...styles.glowOrb, width: 200, height: 200, background: "#4D96FF", top: 100, right: -50}} />
      <div style={styles.content}>
        <button onClick={() => setScreen("landing")}
          style={{ background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer", marginBottom: "20px" }}>
          ←
        </button>
        
        <div style={styles.card}>
          <h3 style={{ color: "white", fontSize: "20px", marginBottom: "20px", textAlign: "center" }}>
            {authMode === "login" ? "🔐 Login" : "📝 Register"}
          </h3>
          
          {authError && (
            <div style={{ background: "rgba(255,100,100,0.2)", padding: "10px", borderRadius: "8px", marginBottom: "16px", color: "#FF6B6B", fontSize: "13px" }}>
              {authError}
            </div>
          )}
          
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            style={styles.input}
          />
          <input
            ref={passwordRef}
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            style={styles.input}
          />
          
          <button onClick={authMode === "login" ? handleSignIn : handleSignUp}
            style={{...styles.btn, ...styles.btnPrimary}}>
            {authMode === "login" ? "Login" : "Register"}
          </button>
          
          <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            style={{...styles.btn, ...styles.btnSecondary, marginTop: "12px"}}>
            {authMode === "login" ? "ยังไม่มีบัญชี? Register" : "มีบัญชีแล้ว? Login"}
          </button>
        </div>
      </div>
    </div>
  );


  // Dashboard Screen — DNA Helix Milestone
  const DashboardScreen = () => {
    const completedCount = Object.keys(completedTopics).length;
    const dimScores = getDimensionScores();

    return (
      <div style={styles.container}>
        <div style={{...styles.glowOrb, width: 300, height: 300, background: "#FF6B9D", top: -100, right: -100}} />
        <div style={{...styles.glowOrb, width: 200, height: 200, background: "#4ECDC4", bottom: 100, left: -80}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={() => setScreen("landing")} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "white" }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: "14px", letterSpacing: "3px", color: "rgba(255,255,255,0.5)" }}>🐾 MHA' STORY</span>
            </div>
            {user ? (
              <button onClick={handleSignOut} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }} title="ออกจากระบบ">🚪</button>
            ) : (
              <button onClick={() => { setAuthMode("login"); setScreen("auth"); }} 
                style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "4px 8px", fontSize: "11px", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                Login
              </button>
            )}
          </div>

          {/* Save Status */}
          {saveMsg && (
            <div style={{ textAlign: "center", marginBottom: "8px", fontSize: "13px", color: saveMsg.includes("✅") ? "#2ECC71" : "#FF6B6B" }}>
              {saveMsg}
            </div>
          )}

          {/* Profile Header */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🐕</div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "4px" }}>
              {leadInfo.dogName || "น้องหมา"}'s DNA Profile
            </h2>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
              Level {Math.floor(completedCount / 3) + 1} ⭐ • {completedCount}/12 Tests
            </div>
            {user && (
              <div style={{ fontSize: "11px", color: "rgba(100,255,180,0.7)", marginTop: "4px" }}>
                ☁️ Saved — {user.email}
              </div>
            )}
          </div>

          {/* DNA Helix Visual */}
          <div style={{ ...styles.card, padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ color: "white", fontSize: "16px", marginBottom: "16px", textAlign: "center" }}>🧬 DNA Helix Progress</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allTopics.map((topic, idx) => {
                const isCompleted = isTopicCompleted(topic.id);
                const isUnlocked = isTopicUnlocked(topic.id);
                const score = completedTopics[topic.id]?.score || 0;
                const dim = DIMENSIONS[topic.dimension];
                const offset = Math.sin(idx * 0.5) * 30;
                
                return (
                  <div key={topic.id} style={{ 
                    display: "flex", alignItems: "center", gap: "12px",
                    paddingLeft: `${50 + offset}px`, transition: "all 0.3s"
                  }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: isCompleted ? dim.color : isUnlocked ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", border: `2px solid ${isCompleted ? dim.color : "rgba(255,255,255,0.1)"}`,
                      cursor: isUnlocked ? "pointer" : "default",
                      opacity: isUnlocked ? 1 : 0.4,
                      boxShadow: isCompleted ? `0 0 20px ${dim.color}50` : "none"
                    }} onClick={() => isUnlocked && !isCompleted && startQuiz(topic)}>
                      {isCompleted ? "✓" : topic.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{topic.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
                        {isCompleted ? `${score}% — ${completedTopics[topic.id]?.personality}` : topic.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dimension Bars */}
          <div style={{ ...styles.card, padding: "20px" }}>
            <h3 style={{ color: "white", fontSize: "16px", marginBottom: "16px" }}>📊 Dimension Scores</h3>
            {Object.entries(DIMENSIONS).map(([key, dim]) => (
              <div key={key} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "white", fontSize: "12px" }}>{dim.icon} {dim.name}</span>
                  <span style={{ color: dim.color, fontSize: "12px" }}>{dimScores[key] || 0}%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${dimScores[key] || 0}%`, height: "100%", background: dim.color, borderRadius: "3px", transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {completedCount < 12 && (
            <button
              onClick={() => {
                const next = allTopics.find(t => isTopicUnlocked(t.id) && !isTopicCompleted(t.id));
                if (next) startQuiz(next);
              }}
              style={{ ...styles.btn, ...styles.btnPrimary, marginTop: "16px" }}
            >
              🧬 ทำ Test ถัดไป
            </button>
          )}
          
          {completedCount > 0 && (
            <button onClick={() => setScreen("profile")} style={{ ...styles.btn, ...styles.btnSecondary, marginTop: "12px" }}>
              👤 ดู Dog Profile
            </button>
          )}
        </div>
      </div>
    );
  };


  // Dog Profile Screen — DNA Radar + Archetype
  const DogProfileScreen = () => {
    const completedCount = Object.keys(completedTopics).length;
    const dimScores = getDimensionScores();
    const archetype = getArchetype();
    const dims = Object.keys(DIMENSIONS);
    
    // SVG Radar Chart
    const radarSize = 200;
    const center = radarSize / 2;
    const maxRadius = 80;
    
    const getPoint = (index, value) => {
      const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    };
    
    const radarPoints = dims.map((dim, i) => getPoint(i, dimScores[dim] || 0));
    const radarPath = radarPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    return (
      <div style={styles.container}>
        <div style={{...styles.glowOrb, width: 300, height: 300, background: "#9B59B6", top: -100, left: -100}} />
        <div style={{...styles.glowOrb, width: 200, height: 200, background: "#6BCB77", bottom: 50, right: -80}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={() => setScreen("dashboard")} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "white" }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: "14px", letterSpacing: "3px", color: "rgba(255,255,255,0.5)" }}>🧬 DNA PROFILE</span>
            </div>
          </div>

          {/* Profile Header */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "8px" }}>🐕</div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "white", marginBottom: "4px" }}>
              {leadInfo.dogName || "น้องหมา"}
            </h2>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
              {leadInfo.breed === "อื่นๆ (กรอกเอง)" ? leadInfo.customBreed : leadInfo.breed} • {leadInfo.age}
            </div>
          </div>

          {/* DNA Radar Chart */}
          <div style={{ ...styles.card, padding: "20px", textAlign: "center" }}>
            <h3 style={{ color: "white", fontSize: "16px", marginBottom: "16px" }}>🧬 DNA Radar</h3>
            <svg width={radarSize} height={radarSize} style={{ margin: "0 auto", display: "block" }}>
              {/* Grid */}
              {[20, 40, 60, 80, 100].map(v => (
                <polygon key={v}
                  points={dims.map((_, i) => {
                    const p = getPoint(i, v);
                    return `${p.x},${p.y}`;
                  }).join(" ")}
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"
                />
              ))}
              {/* Axes */}
              {dims.map((dim, i) => {
                const p = getPoint(i, 100);
                return (
                  <g key={dim}>
                    <line x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text x={getPoint(i, 115).x} y={getPoint(i, 115).y} fill={DIMENSIONS[dim].color} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                      {DIMENSIONS[dim].icon}
                    </text>
                  </g>
                );
              })}
              {/* Data */}
              <path d={radarPath} fill="rgba(255,107,157,0.3)" stroke="#FF6B9D" strokeWidth="2" />
              {radarPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={DIMENSIONS[dims[i]].color} />
              ))}
            </svg>
            
            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
              {dims.map(dim => (
                <div key={dim} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                  <span style={{ color: DIMENSIONS[dim].color }}>{DIMENSIONS[dim].icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{dimScores[dim] || 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Archetype */}
          {archetype && (
            <div style={{ ...styles.card, padding: "20px", background: `linear-gradient(135deg, ${DIMENSIONS[archetype.primary].color}20, ${DIMENSIONS[archetype.secondary].color}20)` }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏆</div>
                <h3 style={{ color: "white", fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>
                  {archetype.name}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "12px" }}>
                  {archetype.desc}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "12px" }}>
                  <span style={{ color: DIMENSIONS[archetype.primary].color }}>
                    {DIMENSIONS[archetype.primary].icon} {archetype.primary} {archetype.primaryScore}%
                  </span>
                  <span style={{ color: DIMENSIONS[archetype.secondary].color }}>
                    {DIMENSIONS[archetype.secondary].icon} {archetype.secondary} {archetype.secondaryScore}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={{ ...styles.card, padding: "20px" }}>
            <h3 style={{ color: "white", fontSize: "16px", marginBottom: "16px" }}>📅 Test History</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(completedTopics).map(([topicId, data]) => {
                const topic = allTopics.find(t => t.id === parseInt(topicId));
                if (!topic) return null;
                return (
                  <div key={topicId} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px"
                  }}>
                    <div style={{ fontSize: "24px" }}>{topic.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{topic.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{data.personality}</div>
                    </div>
                    <div style={{ color: DIMENSIONS[topic.dimension].color, fontSize: "14px", fontWeight: "700" }}>
                      {data.score}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setScreen("dashboard")} style={{ ...styles.btn, ...styles.btnSecondary, marginTop: "16px" }}>
            ← กลับไป Dashboard
          </button>
        </div>
      </div>
    );
  };


  // Quiz Screen — Multiple Choice
  const QuizScreen = () => {
    const questions = quizQuestions[currentTopic?.id] || quizQuestions[1];
    const q = questions[currentQ];
    const dim = DIMENSIONS[currentTopic?.dimension || "BOND"];
    
    if (!q) return null;

    return (
      <div style={{...styles.container, background: dimensionTheme[currentTopic?.dimension || "BOND"].bg}}>
        <div style={{...styles.glowOrb, width: 250, height: 250, background: dim.color, top: -80, right: -80, opacity: 0.2}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <button onClick={() => setScreen("dashboard")} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "white" }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: dim.color }}>{currentTopic?.emoji} {currentTopic?.title}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{currentQ + 1}/10</span>
          </div>

          {/* Progress */}
          <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ width: `${(currentQ + 1) * 10}%`, height: "100%", background: dim.color, transition: "width 0.3s" }} />
          </div>

          {/* Question */}
          <div style={{ ...styles.card, marginBottom: "20px" }}>
            <p style={{ color: "white", fontSize: "16px", lineHeight: "1.6", textAlign: "center" }}>
              {q.q}
            </p>
          </div>

          {/* Answers */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {q.a.map((answer, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx, q.s[idx])}
                style={{
                  ...styles.btn, ...styles.btnSecondary,
                  textAlign: "left", padding: "16px",
                  display: "flex", alignItems: "center", gap: "12px"
                }}>
                <span style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "12px"
                }}>
                  {["A", "B", "C", "D"][idx]}
                </span>
                <span style={{ flex: 1, fontSize: "14px" }}>{answer}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Slider Quiz Screen
  const SliderQuizScreen = () => {
    const [sliderValues, setSliderValues] = useState(Array(10).fill(3));
    const [currentSlide, setCurrentSlide] = useState(0);
    const questions = sliderQuestions[currentTopic?.id] || sliderQuestions[5];
    const dim = DIMENSIONS[currentTopic?.dimension || "DRIVE"];
    
    const handleSliderChange = (value) => {
      const newValues = [...sliderValues];
      newValues[currentSlide] = value;
      setSliderValues(newValues);
    };

    const nextSlide = () => {
      if (currentSlide < 9) {
        setCurrentSlide(currentSlide + 1);
      } else {
        handleSliderSubmit(sliderValues);
      }
    };

    return (
      <div style={{...styles.container, background: dimensionTheme[currentTopic?.dimension || "DRIVE"].bg}}>
        <div style={{...styles.glowOrb, width: 250, height: 250, background: dim.color, top: -80, left: -80, opacity: 0.2}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <button onClick={() => setScreen("dashboard")} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "white" }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: dim.color }}>{currentTopic?.emoji} {currentTopic?.title}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{currentSlide + 1}/10</span>
          </div>

          {/* Progress */}
          <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ width: `${(currentSlide + 1) * 10}%`, height: "100%", background: dim.color, transition: "width 0.3s" }} />
          </div>

          {/* Question */}
          <div style={{ ...styles.card, marginBottom: "24px" }}>
            <p style={{ color: "white", fontSize: "16px", lineHeight: "1.6", textAlign: "center" }}>
              {questions[currentSlide]?.q}
            </p>
          </div>

          {/* Slider */}
          <div style={{ padding: "0 20px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{questions[currentSlide]?.min}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{questions[currentSlide]?.max}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
              {["😴", "😐", "🙂", "😊", "⚡"].map((emoji, i) => (
                <button key={i} onClick={() => handleSliderChange(i + 1)}
                  style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: sliderValues[currentSlide] === i + 1 ? dim.color : "rgba(255,255,255,0.1)",
                    border: "none", fontSize: "24px", cursor: "pointer",
                    transform: sliderValues[currentSlide] === i + 1 ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.2s"
                  }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button onClick={nextSlide} style={{...styles.btn, ...styles.btnPrimary}}>
            {currentSlide < 9 ? "ถัดไป →" : "ดูผลลัพธ์ 🎉"}
          </button>
        </div>
      </div>
    );
  };

  // Swipe Quiz Screen
  const SwipeQuizScreen = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [likes, setLikes] = useState(0);
    const items = swipeQuestions[currentTopic?.id] || swipeQuestions[4];
    const dim = DIMENSIONS[currentTopic?.dimension || "DRIVE"];
    
    const handleSwipe = (liked) => {
      if (liked) setLikes(likes + 1);
      
      if (currentCard < 9) {
        setCurrentCard(currentCard + 1);
      } else {
        handleSwipeComplete(likes + (liked ? 1 : 0));
      }
    };

    const item = items[currentCard];

    return (
      <div style={{...styles.container, background: dimensionTheme[currentTopic?.dimension || "DRIVE"].bg}}>
        <div style={{...styles.glowOrb, width: 250, height: 250, background: dim.color, bottom: 100, right: -80, opacity: 0.2}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <button onClick={() => setScreen("dashboard")} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "white" }}>←</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: dim.color }}>{currentTopic?.emoji} {currentTopic?.title}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{currentCard + 1}/10</span>
          </div>

          {/* Progress */}
          <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ width: `${(currentCard + 1) * 10}%`, height: "100%", background: dim.color, transition: "width 0.3s" }} />
          </div>

          {/* Card */}
          <div style={{
            ...styles.card, padding: "40px 20px", textAlign: "center",
            minHeight: "200px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", marginBottom: "24px"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>{item?.emoji}</div>
            <h3 style={{ color: "white", fontSize: "24px", marginBottom: "8px" }}>{item?.item}</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>{item?.desc}</p>
          </div>

          {/* Swipe Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
            <button onClick={() => handleSwipe(false)}
              style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "rgba(255,100,100,0.2)", border: "2px solid #FF6B6B",
                fontSize: "28px", cursor: "pointer"
              }}>
              👎
            </button>
            <button onClick={() => handleSwipe(true)}
              style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "rgba(100,255,100,0.2)", border: "2px solid #6BCB77",
                fontSize: "28px", cursor: "pointer"
              }}>
              👍
            </button>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "16px" }}>
            น้องหมาชอบกินไหม?
          </p>
        </div>
      </div>
    );
  };


  // Result Screen
  const ResultScreen = () => {
    const personality = getPersonality(quizScore, currentTopic?.id);
    const dim = DIMENSIONS[currentTopic?.dimension || "BOND"];
    const theme = dimensionTheme[currentTopic?.dimension || "BOND"];

    return (
      <div style={{...styles.container, background: theme.bg}}>
        <div style={{...styles.glowOrb, width: 300, height: 300, background: theme.accent, top: -100, right: -100, opacity: 0.3}} />
        <div style={{...styles.glowOrb, width: 200, height: 200, background: theme.accent, bottom: 100, left: -80, opacity: 0.2}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", color: theme.accent, marginBottom: "8px" }}>
              {currentTopic?.emoji} {currentTopic?.title}
            </div>
            <h2 style={{ fontSize: "28px", color: "white", fontWeight: "700" }}>
              Result
            </h2>
          </div>

          {/* Score Circle */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "140px", height: "140px", borderRadius: "50%",
              background: `conic-gradient(${theme.accent} ${quizScore}%, rgba(255,255,255,0.1) ${quizScore}%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto", position: "relative"
            }}>
              <div style={{
                width: "110px", height: "110px", borderRadius: "50%",
                background: "#1a1025", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: "36px", fontWeight: "700", color: theme.accent }}>{quizScore}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>%</span>
              </div>
            </div>
          </div>

          {/* Personality Card */}
          <div style={{ ...styles.card, padding: "24px", borderColor: theme.accent, marginBottom: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>{personality.emoji}</div>
              <h3 style={{ fontSize: "22px", color: theme.accent, fontWeight: "700", marginBottom: "8px" }}>
                {personality.type}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                {personality.tagline}
              </p>
              {personality.rarity && (
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>
                  {personality.rarity}
                </div>
              )}
            </div>
            
            {/* Traits */}
            {personality.traits && personality.traits.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
                {personality.traits.map((trait, i) => (
                  <span key={i} style={{
                    padding: "6px 12px", borderRadius: "20px",
                    background: `${theme.accent}20`, color: theme.accent,
                    fontSize: "11px", fontWeight: "500"
                  }}>
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Wow Fact */}
          {personality.wow && (
            <div style={{ ...styles.card, padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>✨</span>
                <div>
                  <div style={{ color: theme.accent, fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>WOW FACT</div>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: "1.5" }}>
                    {personality.wow}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Science Secret */}
          {personality.scienceSecret && (
            <div style={{ ...styles.card, padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>🔬</span>
                <div>
                  <div style={{ color: theme.accent, fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>SCIENCE SECRET</div>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: "1.5" }}>
                    {personality.scienceSecret}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fun Fact */}
          {personality.funFact && (
            <div style={{ ...styles.card, padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>💡</span>
                <div>
                  <div style={{ color: theme.accent, fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>FUN FACT</div>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: "1.5" }}>
                    {personality.funFact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Today */}
          {personality.actionToday && personality.actionToday.length > 0 && (
            <div style={{ ...styles.card, padding: "16px", marginBottom: "16px" }}>
              <div style={{ color: theme.accent, fontSize: "12px", fontWeight: "600", marginBottom: "12px" }}>
                🎯 ACTION TODAY
              </div>
              {personality.actionToday.map((action, i) => (
                <div key={i} style={{ 
                  display: "flex", alignItems: "flex-start", gap: "8px", 
                  marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "13px" 
                }}>
                  <span>•</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hook */}
          {personality.hook && (
            <div style={{ 
              padding: "16px", borderRadius: "16px",
              background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}10)`,
              border: `1px dashed ${theme.accent}50`, marginBottom: "20px"
            }}>
              <p style={{ color: "white", fontSize: "13px", textAlign: "center" }}>
                {personality.hook}
              </p>
            </div>
          )}

          {/* Buttons */}
          <button onClick={() => setScreen("dashboard")} style={{...styles.btn, ...styles.btnPrimary}}>
            🧬 กลับไป Dashboard
          </button>
          
          <button onClick={() => setScreen("profile")} style={{...styles.btn, ...styles.btnSecondary, marginTop: "12px"}}>
            👤 ดู Dog Profile
          </button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Determine which quiz type to show
  const renderQuiz = () => {
    if (showResult) return <ResultScreen />;
    
    const quizType = currentTopic?.quizType || "choice";
    switch (quizType) {
      case "slider":
        return <SliderQuizScreen />;
      case "swipe":
        return <SwipeQuizScreen />;
      default:
        return <QuizScreen />;
    }
  };

  return (
    <>
      {screen === "landing" && <LandingScreen />}
      {screen === "onboarding" && <OnboardingScreen />}
      {screen === "auth" && <AuthScreen />}
      {screen === "dashboard" && <DashboardScreen />}
      {screen === "profile" && <DogProfileScreen />}
      {screen === "quiz" && renderQuiz()}
    </>
  );
}
