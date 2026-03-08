'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Supabase Client ────────────────────────────────────────────────────────
// npm install @supabase/supabase-js
// .env.local: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=...
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) supabase = createClient(url, key);
} catch(e) { /* Supabase not installed yet */ }
// ────────────────────────────────────────────────────────────────────────────

// MHA' Story Dog DNA Quiz Platform - Gamification v2
export default function MhaStoryApp() {
  const [screen, setScreen] = useState('landing');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ name: '', contact: '', dogName: '', breed: '', email: '' });
  const [swipeDir, setSwipeDir] = useState(null);
  const [revealStep, setRevealStep] = useState(0);
  const [completedTopics, setCompletedTopics] = useState({});
  const [leadStep, setLeadStep] = useState(0);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [customBreed, setCustomBreed] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // ─── Auth / Supabase States ──────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authStep, setAuthStep] = useState(1); // 1=credentials, 2=dog profile
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  // ─────────────────────────────────────────────────────────────────────────

  // Refs for LINE browser compatibility (prevents losing focus on every keystroke)
  const dogNameRef = useRef(null);
  const ownerNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const customBreedRef = useRef(null);

  // Popular dog breeds
  const dogBreeds = [
    'ปอมเมอเรเนียน', 'ชิวาวา', 'พุดเดิ้ล', 'โกลเด้น รีทรีฟเวอร์', 
    'ลาบราดอร์', 'ชิบะ อินุ', 'บีเกิ้ล', 'บูลด็อก', 
    'ไซบีเรียน ฮัสกี้', 'คอร์กี้', 'ชิสุ', 'มอลทีส',
    'แจ็ค รัสเซล', 'บางแก้ว', 'ไทยหลังอาน', 'พันทาง/มิกซ์',
    'อื่นๆ (กรอกเอง)'
  ];
  const [viewingResult, setViewingResult] = useState(null);

  // All Topics Data
  const allTopics = [
    { 
      id: 1, 
      name: 'The Stare Code', 
      emoji: '👁️', 
      dimension: 'BOND',
      dimensionEmoji: '💛',
      color: '#FF6B6B',
      island: 1,
      shortDesc: 'ค้นพบความลึกของสายตาที่เชื่อมโยงหัวใจ',
      fullDesc: 'ทดสอบว่าน้องหมาของคุณใช้การสบตาในการสื่อสารความรักและความผูกพันอย่างไร การสบตากระตุ้น Oxytocin ทั้งในคนและน้องหมา!',
      scienceFact: 'การสบตากับน้องหมาช่วยกระตุ้นการหลั่ง Oxytocin เหมือนกับความรักระหว่างแม่กับลูก',
      reference: 'Nagasawa et al. (2015), Science',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 2, 
      name: 'Empathy DNA', 
      emoji: '😢', 
      dimension: 'BOND',
      dimensionEmoji: '💛',
      color: '#FF8E53',
      island: 1,
      shortDesc: 'น้องหมารับรู้อารมณ์คุณได้แค่ไหน?',
      fullDesc: 'ทดสอบว่าน้องหมาของคุณมีความสามารถในการอ่านและตอบสนองต่ออารมณ์ของคุณอย่างไร',
      scienceFact: 'สุนัขสามารถแยกแยะสีหน้าที่แสดงอารมณ์ของมนุษย์ได้ และตอบสนองด้วยความเห็นอกเห็นใจ',
      reference: 'Custance & Mayer (2012), Animal Cognition',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 3, 
      name: '6th Sense Test', 
      emoji: '🚪', 
      dimension: 'MIND',
      dimensionEmoji: '🧠',
      color: '#4ECDC4',
      island: 1,
      shortDesc: 'น้องหมารู้ล่วงหน้าก่อนคุณทำอะไร?',
      fullDesc: 'ทดสอบความสามารถในการคาดการณ์และอ่าน pattern พฤติกรรมของเจ้าของ',
      scienceFact: 'สุนัขสามารถจดจำ routine และคาดการณ์เหตุการณ์ล่วงหน้าได้อย่างแม่นยำ',
      reference: 'Sheldrake & Smart (2000), Journal of Scientific Exploration',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 4, 
      name: 'Food Blueprint', 
      emoji: '🍖', 
      dimension: 'DRIVE',
      dimensionEmoji: '⚡',
      color: '#FF6B6B',
      island: 2,
      shortDesc: 'อาหารมีอิทธิพลต่อน้องหมาแค่ไหน?',
      fullDesc: 'ทดสอบ Food Motivation และพฤติกรรมการกินที่บ่งบอกถึง DRIVE dimension',
      scienceFact: 'ยีน POMC มีผลต่อความอยากอาหารและน้ำหนักในสุนัข โดยเฉพาะ Labrador Retriever',
      reference: 'Raffan et al. (2016), Cell Metabolism',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 5, 
      name: 'Play Personality', 
      emoji: '🎾', 
      dimension: 'DRIVE',
      dimensionEmoji: '⚡',
      color: '#FFD93D',
      island: 2,
      shortDesc: 'น้องหมาชอบเล่นแบบไหน?',
      fullDesc: 'ค้นพบสไตล์การเล่นที่บอกถึงพลังงานและแรงขับของน้องหมา',
      scienceFact: 'รูปแบบการเล่นเชื่อมโยงกับ attachment style และความสัมพันธ์กับเจ้าของ',
      reference: 'Rooney & Bradshaw (2003), Applied Animal Behaviour Science',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 6, 
      name: 'IQ Signal', 
      emoji: '🧠', 
      dimension: 'MIND',
      dimensionEmoji: '🧠',
      color: '#4ECDC4',
      island: 2,
      shortDesc: 'น้องหมาฉลาดแค่ไหน?',
      fullDesc: 'ทดสอบความสามารถในการเรียนรู้และแก้ปัญหาของน้องหมา',
      scienceFact: 'สุนัขมี social cognition skills ที่ใกล้เคียงกับเด็กมนุษย์',
      reference: 'Hare & Tomasello (2005), Trends in Cognitive Sciences',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 7, 
      name: 'Mind Reader', 
      emoji: '🔮', 
      dimension: 'MIND',
      dimensionEmoji: '🧠',
      color: '#9B59B6',
      island: 3,
      shortDesc: 'น้องหมาอ่านใจคุณได้ไหม?',
      fullDesc: 'ทดสอบความสามารถในการอ่านสัญญาณและเจตนาของเจ้าของ',
      scienceFact: 'สุนัขสามารถติดตามสายตาและเข้าใจการชี้ของมนุษย์ ต่างจากหมาป่า',
      reference: 'Miklosi et al. (2003), Current Biology',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 8, 
      name: 'Secret Language', 
      emoji: '🗣️', 
      dimension: 'MIND',
      dimensionEmoji: '🧠',
      color: '#3498DB',
      island: 3,
      shortDesc: 'น้องหมาสื่อสารกับคุณยังไง?',
      fullDesc: 'ค้นพบภาษาลับที่น้องหมาใช้สื่อสารกับคุณ',
      scienceFact: 'เสียงเห่าของสุนัขมีความหมายเฉพาะตัวและแตกต่างกันในแต่ละสถานการณ์',
      reference: 'Yin & McCowan (2004), Animal Behaviour',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 9, 
      name: 'Nerve Map', 
      emoji: '⚡', 
      dimension: 'NERVE',
      dimensionEmoji: '🛡️',
      color: '#E74C3C',
      island: 3,
      shortDesc: 'น้องหมากลัวอะไรบ้าง?',
      fullDesc: 'ทำแผนที่ความกลัวและความวิตกกังวลของน้องหมา',
      scienceFact: 'ความกลัวเสียงดังเป็นปัญหาพฤติกรรมที่พบบ่อยในสุนัข',
      reference: 'Shull et al. (2021), Frontiers in Veterinary Science',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 10, 
      name: 'Alone Index', 
      emoji: '🧳', 
      dimension: 'NERVE',
      dimensionEmoji: '🛡️',
      color: '#E67E22',
      island: 4,
      shortDesc: 'น้องหมาอยู่คนเดียวได้ไหม?',
      fullDesc: 'วัดระดับ Separation Anxiety ของน้องหมา',
      scienceFact: 'Separation anxiety พบได้ใน 20-40% ของสุนัขทั่วโลก',
      reference: 'Flannigan & Dodman (2001), JAVMA',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 11, 
      name: 'Pack Code', 
      emoji: '🐺', 
      dimension: 'WILD',
      dimensionEmoji: '🌍',
      color: '#2ECC71',
      island: 4,
      shortDesc: 'น้องหมาเข้าฝูงยังไง?',
      fullDesc: 'ทดสอบพฤติกรรมทางสังคมกับสุนัขตัวอื่น',
      scienceFact: 'สุนัขมี social hierarchy และพฤติกรรมฝูงที่สืบทอดมาจากหมาป่า',
      reference: 'Barrera et al. (2011), Behavioural Processes',
      duration: '3 นาที',
      questions: 10
    },
    { 
      id: 12, 
      name: 'Wild Signal', 
      emoji: '🌿', 
      dimension: 'WILD',
      dimensionEmoji: '🌍',
      color: '#1ABC9C',
      island: 4,
      shortDesc: 'สัญชาตญาณดั้งเดิมของน้องหมา',
      fullDesc: 'ค้นพบพฤติกรรมสัญชาตญาณที่ซ่อนอยู่ใน DNA',
      scienceFact: 'พฤติกรรมเช่น การวนก่อนนอน และการขุดดิน เป็นสัญชาตญาณดั้งเดิม',
      reference: 'Coppinger & Coppinger (2001), Dogs: A Startling New Understanding',
      duration: '3 นาที',
      questions: 10
    }
  ];

  const islands = [
    { id: 1, name: 'Heart Bond', emoji: '🐾', color: '#FFD93D', topics: [1, 2, 3] },
    { id: 2, name: 'Energy Drive', emoji: '🐾', color: '#FF6B6B', topics: [4, 5, 6] },
    { id: 3, name: 'Mind Power', emoji: '🐾', color: '#4ECDC4', topics: [7, 8, 9] },
    { id: 4, name: 'Wild Instinct', emoji: '🐾', color: '#9B59B6', topics: [10, 11, 12] }
  ];

  // Dimension Info for popup
  const dimensionInfo = [
    { 
      name: 'BOND', 
      emoji: '💛', 
      color: '#FFD93D', 
      gene: 'OXTR — Oxytocin Receptor',
      desc: 'วัดระดับความผูกพันและความรักที่น้องหมามีต่อเจ้าของ ยีน OXTR ควบคุมการหลั่ง Oxytocin (ฮอร์โมนแห่งความรัก) ซึ่งส่งผลต่อความใกล้ชิดและความไว้วางใจ'
    },
    { 
      name: 'DRIVE', 
      emoji: '⚡', 
      color: '#FF6B6B', 
      gene: 'POMC — Energy & Appetite',
      desc: 'วัดระดับพลังงาน แรงจูงใจ และความกระตือรือร้น ยีน POMC มีผลต่อความอยากอาหารและระดับพลังงาน พบว่ามีความแตกต่างชัดเจนในสายพันธุ์ต่างๆ'
    },
    { 
      name: 'MIND', 
      emoji: '🧠', 
      color: '#4ECDC4', 
      gene: 'WBSCR17 — Social Cognition',
      desc: 'วัดความฉลาดทางสังคมและความสามารถในการอ่านใจคน ยีน WBSCR17 เกี่ยวข้องกับความสามารถในการเข้าใจท่าทางและอารมณ์ของมนุษย์'
    },
    { 
      name: 'NERVE', 
      emoji: '🛡️', 
      color: '#9B59B6', 
      gene: 'SLC6A4 — Serotonin Transporter',
      desc: 'วัดความมั่นคงทางอารมณ์และการรับมือกับความเครียด ยีน SLC6A4 ควบคุมระดับ Serotonin ซึ่งส่งผลต่อความวิตกกังวลและความกลัว'
    },
    { 
      name: 'WILD', 
      emoji: '🌍', 
      color: '#2ECC71', 
      gene: 'DRD4 — Dopamine Receptor',
      desc: 'วัดระดับสัญชาตญาณดั้งเดิมและความรักในการผจญภัย ยีน DRD4 เกี่ยวข้องกับพฤติกรรมแสวงหาสิ่งใหม่และความอยากรู้อยากเห็น'
    }
  ];

  const [showDimensionPopup, setShowDimensionPopup] = useState(false);

  // Quiz questions for Topic 1
  // Quiz Questions for all 12 Topics
  const topicQuestions = {
    1: [
      { q: 'น้องจ้องคุณระหว่างที่คุณกินข้าวไหม?', emoji: '🍽️' },
      { q: 'น้องตามคุณเข้าทุกห้องในบ้านไหม?', emoji: '🚪' },
      { q: 'น้อง slow-blink เวลาสบตาคุณไหม?', emoji: '😌' },
      { q: 'น้องมองหน้าคุณก่อนจะทำอะไรไหม?', emoji: '🤔' },
      { q: 'น้องสบตาคุณนานกว่า 5 วินาทีได้ไหม?', emoji: '⏱️' },
      { q: 'น้องมองตาเวลาคุณพูดกับมันไหม?', emoji: '💬' },
      { q: 'น้องหันมามองเมื่อคุณเรียกชื่อไหม?', emoji: '📢' },
      { q: 'น้องจ้องตาคุณเวลาต้องการอะไรไหม?', emoji: '🙏' },
      { q: 'น้องรักษา eye contact ได้โดยไม่กลัวไหม?', emoji: '💪' },
      { q: 'น้องมองตาคุณตอนเล่นด้วยกันไหม?', emoji: '🎾' }
    ],
    2: [
      { q: 'น้องเข้ามาหาเวลาคุณร้องไห้ไหม?', emoji: '😢' },
      { q: 'น้องรู้สึกเมื่อคุณเครียดไหม?', emoji: '😰' },
      { q: 'น้องเลียหน้าคุณเวลาคุณเศร้าไหม?', emoji: '👅' },
      { q: 'น้องนั่งข้างๆ เวลาคุณไม่สบายไหม?', emoji: '🤒' },
      { q: 'น้องหงอยตามเวลาคุณไม่มีความสุขไหม?', emoji: '😔' },
      { q: 'น้องตื่นเต้นเวลาคุณกลับบ้านไหม?', emoji: '🏠' },
      { q: 'น้องสังเกตเห็นเมื่อคุณโกรธไหม?', emoji: '😠' },
      { q: 'น้องพยายามปลอบคุณเวลามีเรื่องไหม?', emoji: '🤗' },
      { q: 'น้องรู้ก่อนว่าคุณกำลังจะออกจากบ้านไหม?', emoji: '🚶' },
      { q: 'น้องดูเหมือนเข้าใจน้ำเสียงของคุณไหม?', emoji: '🎵' }
    ],
    3: [
      { q: 'น้องรู้ก่อนว่ามีคนจะมาถึงบ้านไหม?', emoji: '🚗' },
      { q: 'น้องตื่นก่อนนาฬิกาปลุกคุณไหม?', emoji: '⏰' },
      { q: 'น้องรู้ว่าจะไปหาหมอก่อนถึงคลินิกไหม?', emoji: '🏥' },
      { q: 'น้องรู้สึกถึงแผ่นดินไหวก่อนคุณไหม?', emoji: '🌍' },
      { q: 'น้องรู้ว่าใครเป็นมิตรหรือศัตรูไหม?', emoji: '🤝' },
      { q: 'น้องทำนายพายุหรือฝนได้ไหม?', emoji: '🌧️' },
      { q: 'น้องรู้เวลาที่คุณกำลังจะกลับบ้านไหม?', emoji: '🏠' },
      { q: 'น้องมีปฏิกิริยากับพลังงานของคนไหม?', emoji: '✨' },
      { q: 'น้องเคยเตือนคุณเรื่องอันตรายไหม?', emoji: '⚠️' },
      { q: 'น้องรู้สึกได้ถึงอารมณ์คนรอบข้างไหม?', emoji: '👥' }
    ],
    4: [
      { q: 'น้องตื่นเต้นมากเวลาเห็นอาหารไหม?', emoji: '🤩' },
      { q: 'น้องกินอาหารหมดจานเสมอไหม?', emoji: '🍽️' },
      { q: 'น้องขออาหารจากโต๊ะคุณไหม?', emoji: '🙏' },
      { q: 'น้องจำได้ว่าขนมอยู่ที่ไหนไหม?', emoji: '🧠' },
      { q: 'น้องกินเร็วมากไหม?', emoji: '⚡' },
      { q: 'น้องยอมทำ trick เพื่อขนมไหม?', emoji: '🎪' },
      { q: 'น้องเลือกกินเฉพาะบางอย่างไหม?', emoji: '🤔' },
      { q: 'น้องรู้เวลาอาหารแม่นยำไหม?', emoji: '⏰' },
      { q: 'น้องแย่งอาหารจากน้องหมาตัวอื่นไหม?', emoji: '🐕' },
      { q: 'น้องมีอาหารโปรดที่ชัดเจนไหม?', emoji: '❤️' }
    ],
    5: [
      { q: 'น้องเล่นได้นานโดยไม่เหนื่อยไหม?', emoji: '💪' },
      { q: 'น้องชอบเล่นดึงเชือกไหม?', emoji: '🪢' },
      { q: 'น้องเอาของเล่นมาให้คุณเล่นด้วยไหม?', emoji: '🧸' },
      { q: 'น้องชอบไล่จับมากกว่าถูกไล่ไหม?', emoji: '🏃' },
      { q: 'น้องเล่นหยาบ (rough play) ไหม?', emoji: '🤼' },
      { q: 'น้องรู้จักหยุดเวลาเหนื่อยไหม?', emoji: '😮‍💨' },
      { q: 'น้องชอบเล่นกับน้องหมาตัวอื่นไหม?', emoji: '🐕‍🦺' },
      { q: 'น้องเล่นของเล่นคนเดียวได้ไหม?', emoji: '🎯' },
      { q: 'น้องตื่นเต้นเมื่อเห็นสายจูงไหม?', emoji: '🦮' },
      { q: 'น้องมีของเล่นชิ้นโปรดไหม?', emoji: '🌟' }
    ],
    6: [
      { q: 'น้องเรียนรู้คำสั่งใหม่เร็วไหม?', emoji: '📚' },
      { q: 'น้องแก้ปัญหาเพื่อเอาขนมได้ไหม?', emoji: '🧩' },
      { q: 'น้องเปิดประตูหรือลิ้นชักเป็นไหม?', emoji: '🚪' },
      { q: 'น้องจำชื่อของเล่นแต่ละชิ้นได้ไหม?', emoji: '🏷️' },
      { q: 'น้องรู้จักหลอกล่อคุณไหม?', emoji: '🎭' },
      { q: 'น้องเข้าใจท่าทางมือของคุณไหม?', emoji: '👆' },
      { q: 'น้องรู้จักใช้จังหวะในการขออะไรไหม?', emoji: '⏱️' },
      { q: 'น้องจำเส้นทางเดินได้ไหม?', emoji: '🗺️' },
      { q: 'น้องแยกแยะคนในครอบครัวได้ไหม?', emoji: '👨‍👩‍👧' },
      { q: 'น้องเรียนรู้จากการดูน้องหมาตัวอื่นไหม?', emoji: '👀' }
    ],
    7: [
      { q: 'น้องรู้ก่อนว่าคุณจะพาไปเดินเล่นไหม?', emoji: '🚶' },
      { q: 'น้องเดาได้ว่าคุณคิดอะไรอยู่ไหม?', emoji: '💭' },
      { q: 'น้องรู้ว่าคุณจะหยิบอะไรให้ไหม?', emoji: '🎁' },
      { q: 'น้องตอบสนองกับความคิดคุณไหม?', emoji: '🧠' },
      { q: 'น้องรู้ว่าวันนี้เป็นวันหยุดไหม?', emoji: '📅' },
      { q: 'น้องรู้สึกได้ถึงแผนการของคุณไหม?', emoji: '📋' },
      { q: 'น้องเตรียมตัวก่อนที่คุณจะบอกไหม?', emoji: '🎯' },
      { q: 'น้องรู้ว่าคุณกำลังจะโทรหาใครไหม?', emoji: '📱' },
      { q: 'น้องคาดเดาการเคลื่อนไหวของคุณได้ไหม?', emoji: '🔄' },
      { q: 'น้องรู้ก่อนว่าจะมีแขกมาไหม?', emoji: '🔔' }
    ],
    8: [
      { q: 'น้องมีเสียงเห่าหลายแบบไหม?', emoji: '🔊' },
      { q: 'น้องใช้ตาสื่อสารกับคุณไหม?', emoji: '👀' },
      { q: 'น้องมีท่าทางเฉพาะเวลาต้องการอะไรไหม?', emoji: '🙋' },
      { q: 'น้องกระดิกหางต่างกันตามอารมณ์ไหม?', emoji: '🐕' },
      { q: 'น้องส่งเสียงครางเวลาอยากได้อะไรไหม?', emoji: '😩' },
      { q: 'น้องมีคำศัพท์ที่เข้าใจหลายคำไหม?', emoji: '📖' },
      { q: 'น้องใช้อุ้งเท้าแตะคุณเพื่อสื่อสารไหม?', emoji: '🐾' },
      { q: 'น้องแสดงสีหน้าชัดเจนไหม?', emoji: '😀' },
      { q: 'น้องเข้าใจน้ำเสียงต่างๆ ของคุณไหม?', emoji: '🎵' },
      { q: 'คุณรู้สึกว่าคุยกับน้องได้ไหม?', emoji: '💬' }
    ],
    9: [
      { q: 'น้องตกใจเสียงดังไหม?', emoji: '💥' },
      { q: 'น้องกลัวพลุหรือฟ้าร้องไหม?', emoji: '🎆' },
      { q: 'น้องสงบในสถานการณ์ใหม่ๆ ไหม?', emoji: '🆕' },
      { q: 'น้องผ่อนคลายเมื่อมีคนแปลกหน้าไหม?', emoji: '👤' },
      { q: 'น้องปรับตัวกับการเปลี่ยนแปลงได้เร็วไหม?', emoji: '🔄' },
      { q: 'น้องกล้าเข้าหาสิ่งใหม่ๆ ไหม?', emoji: '🌟' },
      { q: 'น้องนอนหลับสบายในที่แปลกไหม?', emoji: '😴' },
      { q: 'น้องไม่หวาดกลัวเมื่อไปหาหมอไหม?', emoji: '🏥' },
      { q: 'น้องเล่นกับเด็กได้อย่างใจเย็นไหม?', emoji: '👶' },
      { q: 'น้องฟื้นตัวจากความกลัวได้เร็วไหม?', emoji: '⚡' }
    ],
    10: [
      { q: 'น้องอยู่บ้านคนเดียวได้สบายไหม?', emoji: '🏠' },
      { q: 'น้องร้องหรือหอนเมื่อคุณออกไปไหม?', emoji: '😭' },
      { q: 'น้องทำลายของเมื่ออยู่คนเดียวไหม?', emoji: '💔' },
      { q: 'น้องเครียดเมื่อคุณเตรียมออกจากบ้านไหม?', emoji: '😰' },
      { q: 'น้องติดตามคุณไปทุกที่ในบ้านไหม?', emoji: '🚶' },
      { q: 'น้องต้องนอนในห้องเดียวกับคุณไหม?', emoji: '🛏️' },
      { q: 'น้องตื่นเต้นเกินเมื่อคุณกลับบ้านไหม?', emoji: '🎉' },
      { q: 'น้องสงบลงได้เองเมื่ออยู่คนเดียวไหม?', emoji: '😌' },
      { q: 'น้องเล่นของเล่นคนเดียวได้ไหม?', emoji: '🧸' },
      { q: 'น้องนอนสบายเมื่อคุณไม่อยู่ห้องไหม?', emoji: '💤' }
    ],
    11: [
      { q: 'น้องเป็นผู้นำในกลุ่มน้องหมาไหม?', emoji: '👑' },
      { q: 'น้องยอมให้น้องหมาตัวอื่นนำไหม?', emoji: '🤝' },
      { q: 'น้องปกป้องอาหารของตัวเองไหม?', emoji: '🍖' },
      { q: 'น้องเข้ากับน้องหมาตัวใหม่ได้ง่ายไหม?', emoji: '🐕' },
      { q: 'น้องมีลำดับชั้นกับน้องหมาในบ้านไหม?', emoji: '📊' },
      { q: 'น้องแสดงอำนาจเหนือน้องหมาตัวอื่นไหม?', emoji: '💪' },
      { q: 'น้องแบ่งปันของเล่นกับน้องหมาตัวอื่นไหม?', emoji: '🧸' },
      { q: 'น้องเล่นตามกฎกับน้องหมาตัวอื่นไหม?', emoji: '📜' },
      { q: 'น้องปกป้องครอบครัวจากน้องหมาแปลกหน้าไหม?', emoji: '🛡️' },
      { q: 'น้องอยู่ในกลุ่มน้องหมาได้อย่างสงบไหม?', emoji: '☮️' }
    ],
    12: [
      { q: 'น้องไล่จับสัตว์เล็กๆ ไหม?', emoji: '🐿️' },
      { q: 'น้องขุดดินบ่อยไหม?', emoji: '🕳️' },
      { q: 'น้องหอนเหมือนหมาป่าไหม?', emoji: '🌙' },
      { q: 'น้องชอบดมกลิ่นทุกอย่างไหม?', emoji: '👃' },
      { q: 'น้องตื่นตัวกับเสียงในธรรมชาติไหม?', emoji: '🌲' },
      { q: 'น้องชอบเล่นน้ำหรือโคลนไหม?', emoji: '💦' },
      { q: 'น้องเคี้ยวกิ่งไม้หรือของธรรมชาติไหม?', emoji: '🪵' },
      { q: 'น้องมีสัญชาตญาณล่าเหยื่อสูงไหม?', emoji: '🎯' },
      { q: 'น้องชอบอยู่กลางแจ้งมากกว่าในบ้านไหม?', emoji: '☀️' },
      { q: 'น้องกลิ้งบนหญ้าหรือพื้นดินไหม?', emoji: '🌀' }
    ]
  };
  
  // Get questions for current topic
  const quizQuestions = currentTopic ? topicQuestions[currentTopic.id] || topicQuestions[1] : topicQuestions[1];

  // Topic-specific personality configs
  const topicPersonalityConfig = {
    1: { name: 'The Stare Code', dimension: 'BOND', gene: 'OXTR', types: { high: 'Soul Gazer', medium: 'Heart Reader', low: 'Casual Connector', veryLow: 'Independent Spirit' }, emojis: { high: '🌟', medium: '💕', low: '🤝', veryLow: '🦊' } },
    2: { name: 'Empathy DNA', dimension: 'BOND', gene: 'Mirror Neuron', types: { high: 'Emotion Sponge', medium: 'Comfort Buddy', low: 'Chill Observer', veryLow: 'Zen Master' }, emojis: { high: '🫂', medium: '🤗', low: '😎', veryLow: '🧘' } },
    3: { name: '6th Sense', dimension: 'BOND', gene: 'Sensory Genes', types: { high: 'Psychic Pup', medium: 'Keen Observer', low: 'Easy Going', veryLow: 'Chill Dude' }, emojis: { high: '🔮', medium: '🦉', low: '😊', veryLow: '😴' } },
    4: { name: 'Food Blueprint', dimension: 'DRIVE', gene: 'POMC', types: { high: 'Food Fanatic', medium: 'Balanced Eater', low: 'Picky Eater', veryLow: 'Food Skeptic' }, emojis: { high: '🤤', medium: '🍽️', low: '🤔', veryLow: '🙄' } },
    5: { name: 'Play Personality', dimension: 'DRIVE', gene: 'DRD4', types: { high: 'Play Monster', medium: 'Active Player', low: 'Couch Potato', veryLow: 'Zen Sleeper' }, emojis: { high: '🎉', medium: '🐕', low: '🛋️', veryLow: '😴' } },
    6: { name: 'IQ Signal', dimension: 'DRIVE', gene: 'Brain Dev', types: { high: 'Genius Pup', medium: 'Smart Cookie', low: 'Sweet Simpleton', veryLow: 'Lovable Goofball' }, emojis: { high: '🎓', medium: '🍪', low: '🥰', veryLow: '🤪' } },
    7: { name: 'Mind Reader', dimension: 'MIND', gene: 'Visual Processing', types: { high: 'Telepathic', medium: 'Intuitive', low: 'Present Moment', veryLow: 'Surprise Lover' }, emojis: { high: '🧿', medium: '💫', low: '🌸', veryLow: '🎁' } },
    8: { name: 'Secret Language', dimension: 'MIND', gene: 'Vocal Range', types: { high: 'Communicator', medium: 'Expressive', low: 'Silent Type', veryLow: 'Mystery Dog' }, emojis: { high: '📢', medium: '🎭', low: '🤫', veryLow: '🎭' } },
    9: { name: 'Nerve Map', dimension: 'NERVE', gene: 'SLC6A4', types: { high: 'Fearless', medium: 'Balanced', low: 'Sensitive', veryLow: 'Anxious' }, emojis: { high: '🦸', medium: '⚖️', low: '🌸', veryLow: '😰' } },
    10: { name: 'Alone Index', dimension: 'NERVE', gene: 'Attachment', types: { high: 'Independent', medium: 'Adaptable', low: 'Clingy', veryLow: 'Shadow' }, emojis: { high: '🦅', medium: '🔄', low: '🤗', veryLow: '🥺' } },
    11: { name: 'Pack Code', dimension: 'WILD', gene: 'Social Hierarchy', types: { high: 'Alpha', medium: 'Team Player', low: 'Submissive', veryLow: 'Lone Wolf' }, emojis: { high: '👑', medium: '🤝', low: '🐾', veryLow: '🐺' } },
    12: { name: 'Wild Signal', dimension: 'WILD', gene: 'Ancient DNA', types: { high: 'Wild Heart', medium: 'Nature Lover', low: 'City Dog', veryLow: 'Couch Companion' }, emojis: { high: '🐺', medium: '🌳', low: '🏙️', veryLow: '🛋️' } }
  };

  // Personality Results - Enhanced with Story, Science, How-To
  const getPersonality = (score, topicId = 1) => {
    const config = topicPersonalityConfig[topicId] || topicPersonalityConfig[1];
    const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : score >= 40 ? 'low' : 'veryLow';
    
    const basePersonality = {
      type: config.types[level],
      emoji: config.emojis[level],
      oxytocin: score,
      topicName: config.name,
      dimension: config.dimension,
      gene: config.gene
    };

    // Topic 1: The Stare Code
    if (topicId === 1) {
      if (score >= 80) return {
        ...basePersonality,
        tagline: 'น้องหมาที่อ่านใจคุณได้',
        description: 'น้องหมาของคุณมีความผูกพันระดับลึกสุด! การสบตาของน้องไม่ใช่แค่การมอง แต่เป็นการสื่อสารทางจิตวิญญาณ',
        traits: ['อ่านใจเจ้าของเก่ง', 'ผูกพันลึกซึ้ง', 'ไวต่ออารมณ์', 'ต้องการความใกล้ชิด'],
        rarity: 'หายาก — 12%',
        storyInsight: { title: 'ทำไมน้องหมาบางตัวถึง "อ่านใจ" ได้?', content: 'ในปี 2015 นักวิทยาศาสตร์ญี่ปุ่นค้นพบว่า เมื่อน้องหมาสบตากับเจ้าของนาน 30 นาที ระดับ Oxytocin เพิ่มขึ้นถึง 130%!' },
        scienceSecret: { title: 'ความลับของยีน OXTR', gene: 'OXTR (Oxytocin Receptor)', content: 'น้องหมาที่มียีน OXTR แบบ high expression จะรู้สึกผูกพันได้ลึกกว่า', funFact: '🧠 น้องหมาสามารถแยกแยะสีหน้า "ยิ้ม" กับ "โกรธ" ได้!' },
        howToGuide: { title: 'วิธีเสริมสร้าง BOND', tips: [{ icon: '👁️', title: 'Eye Contact Ritual', desc: 'สบตาน้องหมา 5-10 นาทีต่อวัน' }, { icon: '🤲', title: 'Slow Touch Massage', desc: 'ลูบไล้น้องหมาช้าๆ ลด Cortisol' }, { icon: '🗣️', title: 'Talk Like a Friend', desc: 'พูดกับน้องหมาเหมือนคุยกับเพื่อน' }, { icon: '🏠', title: 'Safe Space', desc: 'จัดมุมพิเศษให้น้องหมาอยู่ใกล้คุณ' }] },
        warnings: { title: 'สิ่งที่ควรระวัง', items: ['อาจมี Separation Anxiety', 'อาจเครียดตามเมื่อเห็นคุณเครียด', 'ต้องการความสม่ำเสมอ'] },
        activities: { title: 'กิจกรรมที่แนะนำ', items: [{ emoji: '🧘', name: 'นั่งสมาธิด้วยกัน', desc: 'น้องจะนั่งเงียบๆ ข้างคุณ' }, { emoji: '📺', name: 'ดูหนังด้วยกัน', desc: 'ให้น้องนอนข้างๆ' }, { emoji: '🚶', name: 'เดินเล่นช้าๆ', desc: 'ไม่เร่งรีบ ให้เวลาสำรวจ' }] },
        advice: 'ลองใช้เวลา 10 นาทีต่อวันสบตาและพูดคุยกับน้อง!'
      };
      if (score >= 60) return { ...basePersonality, tagline: 'น้องหมาที่รู้ใจคุณเสมอ', description: 'น้องหมาของคุณมีความสามารถในการอ่านอารมณ์สูงมาก!', traits: ['เข้าใจอารมณ์', 'ห่วงใยเจ้าของ', 'ชอบอยู่ใกล้ๆ'], rarity: 'พบได้บ่อย — 35%', storyInsight: { title: 'น้องหมารู้ได้ยังไงว่าคุณเศร้า?', content: 'น้องหมาสามารถอ่านสีหน้าและน้ำเสียงได้พร้อมกัน!' }, scienceSecret: { title: 'Emotional Contagion', gene: 'Mirror Neuron System', content: 'น้องหมามีระบบ Mirror Neuron คล้ายมนุษย์', funFact: '🐕 น้องหมาดมกลิ่นความเครียดได้!' }, howToGuide: { title: 'วิธีดูแล', tips: [{ icon: '😊', title: 'Manage Your Mood', desc: 'น้องจะรับอารมณ์คุณ' }, { icon: '🎉', title: 'Celebrate Together', desc: 'แสดงความดีใจให้น้องเห็น!' }] }, warnings: { title: 'สิ่งที่ควรระวัง', items: ['น้องอาจเครียดตามถ้าบ้านตึงเครียด'] }, activities: { title: 'กิจกรรมที่แนะนำ', items: [{ emoji: '🎾', name: 'เล่น Fetch', desc: 'ส่งพลังบวกให้น้อง' }] }, advice: 'ลองหากิจกรรมใหม่ๆ ทำด้วยกัน!' };
      if (score >= 40) return { ...basePersonality, tagline: 'น้องหมาที่รักอิสระแต่ยังรักคุณ', description: 'น้องมีความสมดุลระหว่างอิสระและความผูกพัน', traits: ['มั่นใจในตัวเอง', 'รักอิสระ', 'ผูกพันแบบสบายๆ'], rarity: 'พบได้ทั่วไป — 40%', storyInsight: { title: 'ทำไมบางตัว "ไม่ติด" เจ้าของ?', content: 'ความ "ไม่ติด" ไม่ได้แปลว่าไม่รัก!' }, scienceSecret: { title: 'Secure Attachment', gene: 'DRD4 & OXTR Balance', content: 'น้องมีสมดุลระหว่างความอยากสำรวจและความผูกพัน', funFact: '🦮 น้องหมาที่ไม่ติดเจ้าของมักมี Separation Anxiety น้อยกว่า!' }, howToGuide: { title: 'วิธีเชื่อมต่อ', tips: [{ icon: '🎯', title: 'Activity-Based Bonding', desc: 'สร้าง bond ผ่านกิจกรรม' }] }, warnings: { title: 'สิ่งที่ควรระวัง', items: ['อย่าตีความว่าน้องไม่รัก'] }, activities: { title: 'กิจกรรมที่แนะนำ', items: [{ emoji: '🏃', name: 'วิ่งด้วยกัน', desc: 'กิจกรรมที่มีเป้าหมายร่วม' }] }, advice: 'ให้โอกาสน้องได้สำรวจโลกด้วยตัวเอง' };
      return { ...basePersonality, tagline: 'น้องหมาผู้รักอิสระ', description: 'น้องหมามีจิตวิญญาณอิสระสูง!', traits: ['อิสระ', 'มั่นใจ', 'ฉลาดและรอบคอบ'], rarity: 'ไม่ค่อยพบ — 13%', storyInsight: { title: 'DNA ของหมาป่าที่ยังคงอยู่', content: 'บางตัวมียีนใกล้เคียงหมาป่ามากกว่า' }, scienceSecret: { title: 'Ancient Dog DNA', gene: 'DRD4 Long Allele', content: 'น้องมักมี DRD4 แบบ long allele', funFact: '🐺 Basenji แทบไม่เห่าเพราะ DNA ใกล้หมาป่า!' }, howToGuide: { title: 'วิธีเข้าถึงใจ', tips: [{ icon: '🤫', title: 'Let Them Come to You', desc: 'ให้น้องเข้ามาหาเอง' }] }, warnings: { title: 'สิ่งที่ควรระวัง', items: ['ระวังการหนีออกจากบ้าน'] }, activities: { title: 'กิจกรรมที่แนะนำ', items: [{ emoji: '👃', name: 'Scent Games', desc: 'ซ่อนขนมให้หา' }] }, advice: 'สังเกตพฤติกรรมเล็กๆ น้อยๆ ของน้อง' };
    }

    // Generic personality for other topics
    const taglines = {
      high: `น้องหมาของคุณมีคะแนน ${config.name} สูงมาก!`,
      medium: `น้องหมาของคุณมีความสมดุลใน ${config.name}`,
      low: `น้องหมาของคุณมีคะแนน ${config.name} ต่ำกว่าปกติ`,
      veryLow: `น้องหมาของคุณเป็นแบบอิสระใน ${config.name}`
    };

    const descriptions = {
      high: `น้องหมาของคุณแสดงออกถึง ${config.name} อย่างชัดเจน! นี่คือลักษณะพิเศษที่หาได้ยาก`,
      medium: `น้องหมาของคุณมีความสมดุลที่ดีในด้าน ${config.name}`,
      low: `น้องหมาของคุณไม่ได้แสดงออกถึง ${config.name} มากนัก ซึ่งก็มีข้อดีของมัน`,
      veryLow: `น้องหมาของคุณมีลักษณะที่แตกต่างใน ${config.name} ซึ่งเป็นเอกลักษณ์`
    };

    const traits = {
      high: ['พลังงานสูง', 'กระตือรือร้น', 'มีไหวพริบ'],
      medium: ['สมดุล', 'ปรับตัวได้', 'เข้าสังคมดี'],
      low: ['สงบ', 'ใจเย็น', 'ไม่วิตก'],
      veryLow: ['อิสระ', 'มั่นใจ', 'ต้องการพื้นที่']
    };

    const rarities = {
      high: 'หายาก — 15%',
      medium: 'พบได้บ่อย — 45%',
      low: 'พบได้ทั่วไป — 30%',
      veryLow: 'หายาก — 10%'
    };

    return {
      ...basePersonality,
      tagline: taglines[level],
      description: descriptions[level],
      traits: traits[level],
      rarity: rarities[level],
      storyInsight: { 
        title: `เรื่องน่ารู้เกี่ยวกับ ${config.name}`, 
        content: `น้องหมาแต่ละตัวมีความแตกต่างในด้าน ${config.name} ซึ่งเกิดจากพันธุกรรมและสิ่งแวดล้อม` 
      },
      scienceSecret: { 
        title: `ยีน ${config.gene}`, 
        gene: config.gene, 
        content: `ยีนนี้มีผลต่อพฤติกรรมด้าน ${config.name} ของน้องหมา`, 
        funFact: `🧬 ${config.dimension} เป็นหนึ่งใน 5 มิติหลักของบุคลิกภาพน้องหมา!` 
      },
      howToGuide: { 
        title: `วิธีดูแลน้องหมาแบบ ${config.types[level]}`, 
        tips: [
          { icon: '✨', title: 'เข้าใจความต้องการ', desc: 'สังเกตและเรียนรู้ว่าน้องต้องการอะไร' },
          { icon: '🎯', title: 'กิจกรรมที่เหมาะสม', desc: 'เลือกกิจกรรมที่เข้ากับบุคลิกภาพน้อง' },
          { icon: '💚', title: 'ความอดทน', desc: 'ให้เวลาน้องหมาปรับตัว' }
        ] 
      },
      warnings: { title: 'สิ่งที่ควรระวัง', items: ['ทุกบุคลิกภาพมีข้อดีและข้อควรระวัง', 'สังเกตพฤติกรรมของน้องอยู่เสมอ'] },
      activities: { 
        title: 'กิจกรรมที่แนะนำ', 
        items: [
          { emoji: '🎾', name: 'เล่นด้วยกัน', desc: 'กิจกรรมที่สร้างความสัมพันธ์' },
          { emoji: '🚶', name: 'เดินเล่น', desc: 'ออกกำลังกายและสำรวจโลก' }
        ] 
      },
      advice: `น้องหมาของคุณเป็น ${config.types[level]} ลองปรับวิธีดูแลให้เข้ากับบุคลิกภาพของน้อง!`
    };
  };

  const handleSwipe = (direction) => {
    setSwipeDir(direction);
    setTimeout(() => {
      const newAnswers = [...answers, direction === 'right' ? 1 : 0];
      setAnswers(newAnswers);
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setLeadStep(0);
        setSelectedBreed('');
        setShowLeadGate(true);
      }
      setSwipeDir(null);
    }, 300);
  };

  const submitLead = () => {
    setShowLeadGate(false);
    const score = Math.round((answers.reduce((a, b) => a + b, 0) / answers.length) * 100);
    const finalBreed = selectedBreed === 'อื่นๆ (กรอกเอง)' ? customBreed : selectedBreed;
    setLeadInfo({...leadInfo, breed: finalBreed});
    const updatedTopics = {
      ...completedTopics,
      [currentTopic.id]: { score, answers: [...answers], completedAt: new Date() }
    };
    setCompletedTopics(updatedTopics);
    // Auto-save to Supabase if logged in
    if (user) saveToSupabase(currentTopic.id, score, [...answers]);
    setScreen('result');
    setRevealStep(0);
    [1, 2, 3, 4, 5].forEach((step, i) => {
      setTimeout(() => setRevealStep(step), (i + 1) * 600);
    });
  };

  const getScore = () => {
    if (viewingResult) {
      return completedTopics[viewingResult.id]?.score || 0;
    }
    return Math.round((answers.reduce((a, b) => a + b, 0) / answers.length) * 100);
  };

  const isTopicCompleted = (topicId) => !!completedTopics[topicId];
  
  // TEST MODE: All topics unlocked for testing
  const isTopicUnlocked = (topicId) => {
    return true; // All topics accessible
  };

  // ─── Supabase Auth Functions ──────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfileFromSupabase(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfileFromSupabase = async (userId) => {
    if (!supabase) return;
    try {
      const { data: profile } = await supabase
        .from('dog_profiles').select('*').eq('user_id', userId).single();
      if (profile) {
        setLeadInfo({ name: profile.owner_name, contact: profile.phone || '', dogName: profile.dog_name, breed: profile.breed, email: profile.email || '' });
        setSelectedBreed(profile.breed);
      }
      const { data: results } = await supabase
        .from('test_results').select('*').eq('user_id', userId);
      if (results?.length) {
        const map = {};
        results.forEach(r => { map[r.topic_id] = { score: r.score, answers: r.answers }; });
        setCompletedTopics(map);
      }
    } catch(e) { console.warn('Load error:', e); }
  };

  const saveToSupabase = async (topicId, score, answersArr) => {
    if (!supabase || !user) return;
    setIsSaving(true);
    try {
      // Upsert profile
      await supabase.from('dog_profiles').upsert({
        user_id: user.id,
        owner_name: leadInfo.name,
        dog_name: leadInfo.dogName,
        breed: selectedBreed === 'อื่นๆ (กรอกเอง)' ? customBreed : selectedBreed,
        email: leadInfo.email,
        phone: leadInfo.contact,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      // Insert test result
      await supabase.from('test_results').upsert({
        user_id: user.id,
        topic_id: topicId,
        score,
        answers: answersArr,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,topic_id' });
      setSaveMsg('✅ บันทึกแล้ว!');
    } catch(e) { setSaveMsg('❌ บันทึกไม่สำเร็จ'); }
    setIsSaving(false);
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleAuthSubmit = async () => {
    if (!supabase) { setAuthError('⚠️ ยังไม่ได้ตั้งค่า Supabase'); return; }
    if (!authEmail || !authPassword) { setAuthError('กรอก Email และ Password ด้วยนะคะ'); return; }
    setAuthLoading(true); setAuthError('');
    try {
      if (authMode === 'register') {
        if (authStep === 1) { setAuthStep(2); setAuthLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user) {
          await supabase.from('dog_profiles').insert({
            user_id: data.user.id,
            owner_name: leadInfo.name,
            dog_name: leadInfo.dogName,
            breed: selectedBreed === 'อื่นๆ (กรอกเอง)' ? customBreed : selectedBreed,
            email: authEmail,
            phone: leadInfo.contact,
          });
          setUser(data.user);
          setScreen('dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setUser(data.user);
        await loadProfileFromSupabase(data.user.id);
        setScreen('dashboard');
      }
    } catch(e) { setAuthError(e.message || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'); }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setLeadInfo({ name: '', contact: '', dogName: '', breed: '', email: '' });
    setCompletedTopics({});
    setScreen('landing');
  };
  // ──────────────────────────────────────────────────────────────────────────
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Prompt', 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    lightContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFF5E6 0%, #FFE4CC 100%)',
      fontFamily: "'Prompt', 'Segoe UI', sans-serif",
    },
    content: {
      position: 'relative',
      zIndex: 1,
      maxWidth: 420,
      margin: '0 auto',
      padding: '20px 16px',
      minHeight: '100vh'
    },
    glowOrb: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      opacity: 0.4,
      pointerEvents: 'none'
    },
    card: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 24,
      padding: 24,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    darkCard: {
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: 20,
      border: '1px solid rgba(255,255,255,0.1)'
    },
    btn: {
      width: '100%',
      padding: '18px 24px',
      borderRadius: 16,
      border: 'none',
      fontSize: 17,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFC107 100%)',
      color: 'white',
      boxShadow: '0 8px 30px rgba(255,107,107,0.5)'
    },
    btnGhost: {
      background: 'transparent',
      color: 'white',
      border: '2px solid rgba(255,255,255,0.3)'
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      borderRadius: 14,
      border: '2px solid #E8E8E8',
      fontSize: 16,
      outline: 'none',
      background: '#F8F9FA',
      color: '#333',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    badge: {
      width: 56,
      height: 56,
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 100
    }
  };

  // Landing Screen
  const LandingScreen = () => (
    <div style={styles.container}>
      <div style={{...styles.glowOrb, width: 300, height: 300, background: '#FF6B6B', top: -100, right: -100}} />
      <div style={{...styles.glowOrb, width: 400, height: 400, background: '#4ECDC4', bottom: -150, left: -150}} />
      
      <div style={styles.content}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 14, letterSpacing: 4, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
            🐾 MHA' STORY
          </div>

          {/* Logo & Tagline */}
          <div style={{ 
            fontSize: 56, 
            marginBottom: 12,
            filter: 'drop-shadow(0 0 30px rgba(255,107,107,0.5))'
          }}>
            🧬
          </div>
          <div style={{ 
            fontSize: 28, 
            fontWeight: 800, 
            color: 'white',
            marginBottom: 4,
            letterSpacing: 1
          }}>
            Dog Profile
          </div>
          <div style={{ 
            fontSize: 16, 
            color: 'rgba(255,255,255,0.6)',
            fontStyle: 'italic',
            letterSpacing: 2,
            marginBottom: 24
          }}>
            Science & Secret
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>
            น้องหมาของคุณ<br/>
            <span style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              อ่านใจคุณได้แค่ไหน?
            </span>
          </h1>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 28 }}>
            น้องหมาทุกตัวมี 'บุคลิกภาพ' ที่ซ่อนอยู่ใน DNA<br/>
            MHA' Story จะช่วยให้คุณค้นพบความลับนั้น<br/>
            <span style={{ color: '#FFD93D' }}>เพื่อความเข้าใจที่ลึกซึ้ง และความรักที่เติบโต</span>
          </p>

          {/* Science Badge */}
          <div style={{ ...styles.darkCard, padding: 16, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: 'linear-gradient(135deg, #FF6B6B22, #FFD93D22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>🔬</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>
                  Based on Real Science
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                  12 Topics • 5 Dimensions • 8 Archetypes
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28 }}>
            {[{ num: '12', label: 'Tests' }, { num: '5', label: 'Dimensions' }, { num: 'FREE', label: '' }].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 24, fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>{stat.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <button 
            style={{ ...styles.btn, ...styles.btnPrimary, marginBottom: 12 }}
            onClick={() => setScreen('overview')}
          >
            🚀 เริ่มทดสอบเลย — ฟรี!
          </button>

          {user ? (
            <div>
              <button 
                style={{ ...styles.btn, ...styles.btnGhost, marginBottom: 8 }}
                onClick={() => setScreen('dashboard')}
              >
                🐕 {leadInfo.dogName || 'Dog Profile'} — Dashboard
              </button>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                เข้าสู่ระบบในฐานะ {user.email} •{' '}
                <span style={{ cursor: 'pointer', color: '#FF6B6B', textDecoration: 'underline' }} onClick={handleSignOut}>ออกจากระบบ</span>
              </div>
            </div>
          ) : (
            <div>
              <button 
                style={{ ...styles.btn, ...styles.btnGhost, marginBottom: 8 }}
                onClick={() => { setAuthMode('login'); setAuthStep(1); setAuthError(''); setScreen('auth'); }}
              >
                🔐 เข้าสู่ระบบ / บันทึกผล
              </button>
              <button 
                style={{ ...styles.btn, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '8px 0' }}
                onClick={() => setScreen('dashboard')}
              >
                ดู Dashboard ก่อน (ไม่ login)
              </button>
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'center', gap: 16 }}>
            <span>✓ ไม่ต้องสมัคร</span>
            <span>✓ ฟรี 100%</span>
            <span>✓ ดูผลได้ทันที</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Overview Screen - Show all 12 DNA Tests
  const OverviewScreen = () => {
    const dimensions = [
      { name: 'BOND', emoji: '💛', color: '#FFD93D', desc: 'ความผูกพัน' },
      { name: 'DRIVE', emoji: '⚡', color: '#FF6B6B', desc: 'แรงขับ' },
      { name: 'MIND', emoji: '🧠', color: '#4ECDC4', desc: 'สติปัญญา' },
      { name: 'NERVE', emoji: '🛡️', color: '#9B59B6', desc: 'ความมั่นคง' },
      { name: 'WILD', emoji: '🌍', color: '#2ECC71', desc: 'สัญชาตญาณ' }
    ];

    return (
      <div style={styles.container}>
        <div style={{...styles.glowOrb, width: 300, height: 300, background: '#FF6B6B', top: -50, right: -100}} />
        <div style={{...styles.glowOrb, width: 300, height: 300, background: '#4ECDC4', bottom: 100, left: -100}} />
        <div style={{...styles.glowOrb, width: 200, height: 200, background: '#9B59B6', top: '50%', right: -50}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <button onClick={() => setScreen('landing')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white' }}>←</button>
            <div style={{ flex: 1 }} />
            <div style={{ width: 24 }} />
          </div>

          {/* Logo & Tagline */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 8,
              filter: 'drop-shadow(0 0 30px rgba(255,107,107,0.5))'
            }}>
              🧬
            </div>
            <div style={{ 
              fontSize: 24, 
              fontWeight: 800, 
              color: 'white',
              marginBottom: 4
            }}>
              Dog Profile
            </div>
            <div style={{ 
              fontSize: 14, 
              color: 'rgba(255,255,255,0.6)',
              fontStyle: 'italic',
              letterSpacing: 2
            }}>
              Science & Secret
            </div>
          </div>

          {/* 5 Dimensions with Info Button */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12 
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                5 DNA DIMENSIONS
              </span>
              <button
                onClick={() => setShowDimensionPopup(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                ?
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              {dimensions.map((dim) => (
                <div key={dim.name} style={{
                  background: `${dim.color}22`,
                  border: `1px solid ${dim.color}44`,
                  borderRadius: 10,
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span style={{ fontSize: 14 }}>{dim.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: dim.color }}>{dim.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 6, lineHeight: 1.3 }}>
              ค้นพบ <span style={{ color: '#FFD93D' }}>12 Tests</span> ใน <span style={{ color: '#4ECDC4' }}>4 Paw Sequences</span>
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              แต่ละ Test จะเปิดเผยความลับใน DNA ของน้องหมา
            </p>
          </div>

          {/* 4 Paw Sequences with Badge Grid */}
          {islands.map((paw) => {
            const pawTopics = allTopics.filter(t => paw.topics.includes(t.id));
            
            return (
              <div key={paw.id} style={{ marginBottom: 24 }}>
                {/* Paw Sequence Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${paw.color}, ${paw.color}CC)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    boxShadow: `0 4px 15px ${paw.color}44`
                  }}>
                    {paw.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                      Paw Sequence {paw.id}: {paw.name}
                    </div>
                  </div>
                </div>

                {/* Badge Grid for this Paw Sequence */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 12 
                }}>
                  {pawTopics.map((topic) => {
                    const isCompleted = isTopicCompleted(topic.id);
                    const isUnlocked = isTopicUnlocked(topic.id);
                    
                    return (
                      <div
                        key={topic.id}
                        onClick={() => { setSelectedBadge(topic); setShowBadgeModal(true); }}
                        style={{
                          background: isCompleted 
                            ? `linear-gradient(135deg, ${topic.color}, ${topic.color}CC)` 
                            : isUnlocked 
                              ? `${topic.color}22` 
                              : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${isCompleted ? topic.color : isUnlocked ? `${topic.color}66` : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 16,
                          padding: 16,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          position: 'relative',
                          opacity: isUnlocked ? 1 : 0.6,
                          boxShadow: isCompleted ? `0 4px 20px ${topic.color}44` : 'none'
                        }}
                      >
                        {/* Badge Icon */}
                        <div style={{
                          fontSize: 32,
                          textAlign: 'center',
                          marginBottom: 8,
                          filter: isUnlocked ? 'none' : 'grayscale(100%)'
                        }}>
                          {topic.emoji}
                        </div>

                        {/* Topic Name */}
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isCompleted ? 'white' : isUnlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                          textAlign: 'center',
                          lineHeight: 1.3
                        }}>
                          {topic.name}
                        </div>

                        {/* Green Checkmark for Completed */}
                        {isCompleted && (
                          <div style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(46,204,113,0.5)',
                            border: '2px solid white'
                          }}>
                            <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>
                          </div>
                        )}

                        {/* Lock Icon for Locked */}
                        {!isUnlocked && (
                          <div style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}>
                            <span style={{ fontSize: 10 }}>🔒</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* What You'll Get */}
          <div style={{
            ...styles.darkCard,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,107,107,0.1))',
            border: '1px solid rgba(255,215,0,0.2)',
            marginBottom: 20
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFD700', marginBottom: 14, textAlign: 'center' }}>
              🎁 สิ่งที่คุณจะได้รับเมื่อทำครบ 12 Tests
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { emoji: '🧬', text: 'DNA Radar Chart 5 มิติ' },
                { emoji: '🏆', text: 'Dog Archetype (1 ใน 8)' },
                { emoji: '💡', text: 'คำแนะนำเฉพาะบุคคล' },
                { emoji: '🎴', text: 'Share Card สวยๆ' },
                { emoji: '❤️', text: 'Bond Match กับเจ้าของ' },
                { emoji: '📊', text: 'Health Risk Flags' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button 
            style={{ ...styles.btn, ...styles.btnPrimary, marginBottom: 12 }}
            onClick={() => {
              setCurrentTopic(allTopics[0]);
              setScreen('topic-intro');
            }}
          >
            🐾 เริ่มจาก Paw Sequence 1
          </button>

          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
            ทำทีละ Test ก็ได้ • ไม่ต้องรีบ • ผลสะสมอัตโนมัติ
          </div>
        </div>
      </div>
    );
  };

  // Dimension Info Popup
  const DimensionPopup = () => (
    <div style={styles.modal} onClick={() => setShowDimensionPopup(false)}>
      <div 
        style={{ 
          ...styles.card, 
          maxWidth: 380, 
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#333' }}>🧬 5 DNA Dimensions</div>
            <div style={{ fontSize: 12, color: '#888' }}>ทำไมเราถึงแบ่งเป็น 5 มิติ?</div>
          </div>
          <button 
            onClick={() => setShowDimensionPopup(false)}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999' }}
          >×</button>
        </div>

        {/* Intro */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF5E6, #FFE8F0)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20
        }}>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>
            งานวิจัยด้านพันธุศาสตร์พฤติกรรมสุนัขพบว่า บุคลิกภาพของน้องหมาถูกควบคุมโดย <strong>5 กลุ่มยีนหลัก</strong> ที่ส่งผลต่อพฤติกรรมและอารมณ์อย่างชัดเจน
          </p>
        </div>

        {/* Each Dimension */}
        {dimensionInfo.map((dim, i) => (
          <div key={dim.name} style={{
            background: `${dim.color}11`,
            border: `1px solid ${dim.color}33`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${dim.color}, ${dim.color}CC)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}>
                {dim.emoji}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>{dim.name}</div>
                <div style={{ fontSize: 10, color: dim.color, fontWeight: 600 }}>{dim.gene}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, margin: 0 }}>
              {dim.desc}
            </p>
          </div>
        ))}

        {/* Source */}
        <div style={{ 
          fontSize: 10, 
          color: '#999', 
          textAlign: 'center',
          padding: '12px 0',
          borderTop: '1px solid #EEE'
        }}>
          📚 อ้างอิงจาก: Nagasawa et al. (2015), Hare & Tomasello (2005),<br/>
          Raffan et al. (2016), และงานวิจัยอื่นๆ
        </div>

        <button
          onClick={() => setShowDimensionPopup(false)}
          style={{ ...styles.btn, background: '#333', color: 'white' }}
        >
          เข้าใจแล้ว! 👍
        </button>
      </div>
    </div>
  );

  // Topic Intro Screen
  const TopicIntroScreen = () => (
    <div style={styles.container}>
      <div style={{...styles.glowOrb, width: 300, height: 300, background: currentTopic.color, top: 50, right: -100}} />
      
      <div style={styles.content}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={() => setScreen('overview')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white' }}>←</button>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            🐾 Paw {currentTopic.island} • Test {currentTopic.id}
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{
            width: 120, height: 120, borderRadius: 30,
            background: `linear-gradient(135deg, ${currentTopic.color}33, ${currentTopic.color}11)`,
            border: `3px solid ${currentTopic.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56, margin: '0 auto 24px',
            boxShadow: `0 0 60px ${currentTopic.color}44`
          }}>
            {currentTopic.emoji}
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8 }}>
            {currentTopic.name}
          </h1>

          <div style={{
            display: 'inline-block', padding: '8px 16px',
            background: `${currentTopic.color}22`, borderRadius: 20,
            fontSize: 14, color: currentTopic.color, fontWeight: 600, marginBottom: 24
          }}>
            {currentTopic.dimensionEmoji} {currentTopic.dimension} Dimension
          </div>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 24 }}>
            {currentTopic.fullDesc}
          </p>

          {/* Science Fact */}
          <div style={{ ...styles.darkCard, textAlign: 'left', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🔬</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: currentTopic.color }}>Science Fact</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>
              {currentTopic.scienceFact}
            </p>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
              📚 {currentTopic.reference}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '24px 0', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            <span>📝 {currentTopic.questions} คำถาม</span>
            <span>⏱️ {currentTopic.duration}</span>
          </div>

          <button
            onClick={() => { setCurrentQuestion(0); setAnswers([]); setScreen('quiz'); }}
            style={{ ...styles.btn, ...styles.btnPrimary, fontSize: 18 }}
          >
            🧬 เริ่มค้นหา DNA บุคลิกภาพ
          </button>
        </div>
      </div>
    </div>
  );

  // Quiz Screen
  const QuizScreen = () => (
    <div style={styles.container}>
      <div style={{...styles.glowOrb, width: 200, height: 200, background: currentTopic.color, top: 100, left: -80}} />
      
      <div style={styles.content}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => setScreen('topic-intro')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white' }}>←</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: 20 }}>{currentTopic.emoji}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{currentTopic.name}</span>
          </div>
          <span style={{ background: currentTopic.color, color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
            {currentQuestion + 1}/10
          </span>
        </div>

        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 40, overflow: 'hidden' }}>
          <div style={{
            width: `${((currentQuestion + 1) / 10) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${currentTopic.color}, #FFD93D)`,
            borderRadius: 3, transition: 'width 0.5s ease',
            boxShadow: `0 0 20px ${currentTopic.color}`
          }} />
        </div>

        <div style={{
          ...styles.card, textAlign: 'center',
          transform: swipeDir === 'left' ? 'translateX(-100px) rotate(-10deg)' : 
                     swipeDir === 'right' ? 'translateX(100px) rotate(10deg)' : 'none',
          opacity: swipeDir ? 0.5 : 1, transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>{quizQuestions[currentQuestion].emoji}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#333', lineHeight: 1.4, marginBottom: 40, minHeight: 60 }}>
            {quizQuestions[currentQuestion].q}
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
            <button onClick={() => handleSwipe('left')} style={{
              width: 90, height: 90, borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #FFE4E4, #FFCCCC)',
              fontSize: 40, cursor: 'pointer', boxShadow: '0 8px 25px rgba(255,107,107,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>😅</button>
            <button onClick={() => handleSwipe('right')} style={{
              width: 90, height: 90, borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #E4FFE4, #CCFFCC)',
              fontSize: 40, cursor: 'pointer', boxShadow: '0 8px 25px rgba(76,175,80,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>😍</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#888', padding: '0 20px' }}>
            <span>ไม่ใช่เลย</span>
            <span>ใช่เลย!</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Lead Gate Modal
  // Lead Gate Modal - Step by Step
  const LeadGateModal = () => {
    // Using refs to prevent LINE browser re-render issues
    const goNextStep = () => {
      if (leadStep === 0) {
        const val = dogNameRef.current?.value || '';
        if (val.trim()) {
          setLeadInfo({...leadInfo, dogName: val});
          setLeadStep(1);
        }
      } else if (leadStep === 1) {
        if (selectedBreed === 'อื่นๆ (กรอกเอง)') {
          const val = customBreedRef.current?.value || '';
          if (val.trim()) {
            setCustomBreed(val);
            setLeadStep(2);
          }
        } else if (selectedBreed) {
          setLeadStep(2);
        }
      } else if (leadStep === 2) {
        const val = ownerNameRef.current?.value || '';
        if (val.trim()) {
          setLeadInfo({...leadInfo, name: val});
          setLeadStep(3);
        }
      } else if (leadStep === 3) {
        const emailVal = emailRef.current?.value || '';
        const phoneVal = phoneRef.current?.value || '';
        if (emailVal.includes('@')) {
          setLeadInfo({...leadInfo, email: emailVal, contact: phoneVal});
          submitLead();
        }
      }
    };

    return (
      <div style={styles.modal}>
        <div style={{ ...styles.card, maxWidth: 380, width: '100%' }}>
          {/* Progress Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[0, 1, 2, 3].map((step) => (
              <div key={step} style={{
                width: step === leadStep ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: step <= leadStep ? 'linear-gradient(135deg, #FF6B6B, #FFD93D)' : '#E0E0E0',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>

          {/* Step 0: Dog Name */}
          {leadStep === 0 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🐕</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 8 }}>
                  น้องหมาชื่ออะไร?
                </h2>
                <p style={{ fontSize: 13, color: '#888' }}>
                  บอกชื่อน้องเพื่อดูผล DNA ส่วนตัว
                </p>
              </div>

              <input
                type="text"
                placeholder="พิมพ์ชื่อน้องหมา..."
                ref={dogNameRef}
                defaultValue={leadInfo.dogName}
                onBlur={(e) => setLeadInfo({...leadInfo, dogName: e.target.value})}
                onKeyPress={(e) => { if (e.key === 'Enter') goNextStep(); }}
                style={{
                  ...styles.input,
                  fontSize: 18,
                  textAlign: 'center',
                  marginBottom: 20
                }}
              />

              <button 
                onClick={goNextStep}
                style={{ ...styles.btn, ...styles.btnPrimary }}
              >
                ถัดไป →
              </button>
            </div>
          )}

          {/* Step 1: Breed */}
          {leadStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🐾</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 8 }}>
                  {leadInfo.dogName} เป็นพันธุ์อะไร?
                </h2>
                <p style={{ fontSize: 13, color: '#888' }}>
                  เลือกสายพันธุ์ที่ใกล้เคียงที่สุด
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 8,
                maxHeight: selectedBreed === 'อื่นๆ (กรอกเอง)' ? 200 : 280,
                overflowY: 'auto',
                marginBottom: 12,
                padding: 4
              }}>
                {dogBreeds.map((breed) => (
                  <button
                    key={breed}
                    onClick={() => { setSelectedBreed(breed); if (breed !== 'อื่นๆ (กรอกเอง)') setCustomBreed(''); }}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 12,
                      border: selectedBreed === breed ? '2px solid #FF6B6B' : '2px solid #E8E8E8',
                      background: selectedBreed === breed ? '#FFF0F0' : 'white',
                      fontSize: 13,
                      fontWeight: selectedBreed === breed ? 600 : 400,
                      color: selectedBreed === breed ? '#FF6B6B' : '#555',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {breed}
                  </button>
                ))}
              </div>

              {/* Custom breed input */}
              {selectedBreed === 'อื่นๆ (กรอกเอง)' && (
                <input
                  type="text"
                  placeholder="พิมพ์สายพันธุ์..."
                  ref={customBreedRef}
                  defaultValue={customBreed}
                  onBlur={(e) => setCustomBreed(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') goNextStep(); }}
                  style={{
                    ...styles.input,
                    fontSize: 14,
                    textAlign: 'center',
                    marginBottom: 12
                  }}
                />
              )}

              <button 
                onClick={goNextStep}
                style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 8 }}
              >
                ถัดไป →
              </button>
            </div>
          )}

          {/* Step 2: Owner Name */}
          {leadStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>👤</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 8 }}>
                  คุณชื่ออะไร?
                </h2>
                <p style={{ fontSize: 13, color: '#888' }}>
                  พ่อ/แม่ของ {leadInfo.dogName} ({selectedBreed === 'อื่นๆ (กรอกเอง)' ? customBreed : selectedBreed})
                </p>
              </div>

              <input
                type="text"
                placeholder="พิมพ์ชื่อคุณ..."
                ref={ownerNameRef}
                defaultValue={leadInfo.name}
                onBlur={(e) => setLeadInfo({...leadInfo, name: e.target.value})}
                onKeyPress={(e) => { if (e.key === 'Enter') goNextStep(); }}
                style={{
                  ...styles.input,
                  fontSize: 18,
                  textAlign: 'center',
                  marginBottom: 20
                }}
              />

              <button 
                onClick={goNextStep}
                style={{ ...styles.btn, ...styles.btnPrimary }}
              >
                ถัดไป →
              </button>
            </div>
          )}

          {/* Step 3: Email + Phone */}
          {leadStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>📧</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 8 }}>
                  ส่งผล DNA ไปที่ไหนดี?
                </h2>
                <p style={{ fontSize: 13, color: '#888' }}>
                  เพื่อรับผลวิเคราะห์ของ {leadInfo.dogName}
                </p>
              </div>

              {/* Email (Required) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>
                  Email <span style={{ color: '#FF6B6B' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  ref={emailRef}
                  defaultValue={leadInfo.email || ''}
                  onBlur={(e) => setLeadInfo({...leadInfo, email: e.target.value})}
                  style={{
                    ...styles.input,
                    fontSize: 16,
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* Phone (Optional) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>
                  เบอร์โทรศัพท์ <span style={{ color: '#999', fontWeight: 400 }}>(ไม่บังคับ)</span>
                </label>
                <input
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  ref={phoneRef}
                  defaultValue={leadInfo.contact}
                  onBlur={(e) => setLeadInfo({...leadInfo, contact: e.target.value})}
                  style={{
                    ...styles.input,
                    fontSize: 16,
                    textAlign: 'center'
                  }}
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 6, textAlign: 'center' }}>
                  💬 เพื่อรับ tips ดูแลน้องหมาผ่าน LINE
                </div>
              </div>

              {/* Preview Card */}
              <div style={{
                background: 'linear-gradient(135deg, #FFF5F5, #FFF0E6)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>พร้อมดูผลของ</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#333' }}>
                  🐕 {leadInfo.dogName}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {selectedBreed === 'อื่นๆ (กรอกเอง)' ? customBreed : selectedBreed} • เจ้าของ: {leadInfo.name}
                </div>
              </div>

              <button 
                onClick={goNextStep}
                style={{ ...styles.btn, ...styles.btnPrimary, fontSize: 18 }}
              >
                🧬 ดูผล DNA บุคลิกภาพ!
              </button>

              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#999' }}>
                🔒 ข้อมูลปลอดภัย ไม่แชร์กับบุคคลที่ 3
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Badge Preview Modal
  const BadgePreviewModal = () => {
    const topic = selectedBadge;
    const isCompleted = isTopicCompleted(topic.id);
    const isUnlocked = isTopicUnlocked(topic.id);
    const result = completedTopics[topic.id];

    return (
      <div style={styles.modal} onClick={() => setShowBadgeModal(false)}>
        <div style={{ ...styles.card, maxWidth: 380, width: '100%' }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{
              width: 70, height: 70, borderRadius: 20,
              background: isCompleted ? `linear-gradient(135deg, ${topic.color}, ${topic.color}CC)` : 
                         isUnlocked ? `${topic.color}22` : '#F0F0F0',
              border: `3px solid ${isCompleted ? topic.color : isUnlocked ? topic.color : '#E0E0E0'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              boxShadow: isCompleted ? `0 8px 25px ${topic.color}44` : 'none'
            }}>
              {isCompleted ? '✓' : isUnlocked ? topic.emoji : '🔒'}
            </div>
            <button onClick={() => setShowBadgeModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#999' }}>×</button>
          </div>

          {/* Topic Info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{topic.emoji}</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#333', margin: 0 }}>{topic.name}</h2>
            </div>
            <div style={{
              display: 'inline-block', padding: '4px 12px',
              background: `${topic.color}22`, borderRadius: 12,
              fontSize: 12, color: topic.color, fontWeight: 600
            }}>
              {topic.dimensionEmoji} {topic.dimension} Dimension
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
            {topic.fullDesc}
          </p>

          {/* Science Fact */}
          <div style={{ background: '#F8F9FA', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span>🔬</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: topic.color }}>Science Fact</span>
            </div>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{topic.scienceFact}</p>
            <div style={{ fontSize: 10, color: '#999', marginTop: 8 }}>📚 {topic.reference}</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20, color: '#888', fontSize: 13 }}>
            <span>📝 {topic.questions} คำถาม</span>
            <span>⏱️ {topic.duration}</span>
          </div>

          {/* Result (if completed) */}
          {isCompleted && result && (
            <div style={{
              background: `linear-gradient(135deg, ${topic.color}11, ${topic.color}22)`,
              borderRadius: 16, padding: 16, marginBottom: 20,
              border: `2px solid ${topic.color}44`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#888' }}>คะแนนของคุณ</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: topic.color }}>{result.score}%</div>
                </div>
                <div style={{ fontSize: 40 }}>{getPersonality(result.score, topic.id).emoji}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginTop: 8 }}>
                {getPersonality(result.score, topic.id).type}
              </div>
            </div>
          )}

          {/* Action Button */}
          {isCompleted ? (
            <button
              onClick={() => {
                setViewingResult(topic);
                setShowBadgeModal(false);
                setScreen('result');
                setRevealStep(5);
              }}
              style={{ ...styles.btn, background: topic.color, color: 'white' }}
            >
              📊 ดูผลลัพธ์เต็ม
            </button>
          ) : isUnlocked ? (
            <button
              onClick={() => {
                setCurrentTopic(topic);
                setShowBadgeModal(false);
                setScreen('topic-intro');
              }}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              🚀 เริ่มทำ Quiz
            </button>
          ) : (
            <button style={{ ...styles.btn, background: '#E0E0E0', color: '#999', cursor: 'not-allowed' }}>
              🔒 ทำ Topic ก่อนหน้าให้ครบก่อน
            </button>
          )}
        </div>
      </div>
    );
  };

  // Result Screen
  const ResultScreen = () => {
    const topicToShow = viewingResult || currentTopic;
    const score = viewingResult ? completedTopics[viewingResult.id]?.score : getScore();
    const personality = getPersonality(score, topicToShow.id);
    const dogName = leadInfo.dogName || 'น้องหมา';

    return (
      <div style={{...styles.container, background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)'}}>
        <div style={{...styles.glowOrb, width: 400, height: 400, background: topicToShow.color, top: -100, left: '50%', transform: 'translateX(-50%)'}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <button onClick={() => { setViewingResult(null); setScreen('dashboard'); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white' }}>←</button>
            <button style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: 20,
              fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>📤 แชร์ผล</button>
          </div>

          {/* Topic Badge */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', background: `${topicToShow.color}22`,
              borderRadius: 20, border: `2px solid ${topicToShow.color}`
            }}>
              <span style={{ fontSize: 20 }}>{topicToShow.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: topicToShow.color }}>{topicToShow.name}</span>
            </div>
          </div>

          {/* Personality Reveal */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ opacity: revealStep >= 1 ? 1 : 0, transform: revealStep >= 1 ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.8s ease' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{dogName} คือ...</div>
              <div style={{ fontSize: 80, marginBottom: 8, filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))' }}>{personality.emoji}</div>
              <h1 style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #FFD700, #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
                {personality.type}
              </h1>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>"{personality.tagline}"</div>
            </div>
          </div>

          {/* Score Ring */}
          <div style={{ opacity: revealStep >= 2 ? 1 : 0, transform: revealStep >= 2 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            <div style={{ ...styles.darkCard, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `conic-gradient(${topicToShow.color} ${score}%, rgba(255,255,255,0.1) ${score}%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 30px ${topicToShow.color}44`
              }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{score}%</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{topicToShow.dimensionEmoji} {topicToShow.dimension}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Oxytocin: {personality.oxytocin}%</div>
                <div style={{ fontSize: 12, color: topicToShow.color, marginTop: 4 }}>⭐ {personality.rarity}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ opacity: revealStep >= 3 ? 1 : 0, transform: revealStep >= 3 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            <div style={{ ...styles.darkCard, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: topicToShow.color, marginBottom: 12 }}>🧬 DNA Analysis</div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0 }}>{personality.description}</p>
            </div>
          </div>

          {/* Traits */}
          <div style={{ opacity: revealStep >= 4 ? 1 : 0, transform: revealStep >= 4 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            <div style={{ ...styles.darkCard, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#4ECDC4', marginBottom: 12 }}>✨ บุคลิกภาพเด่น</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {personality.traits.map((trait, i) => (
                  <span key={i} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: 'rgba(78,205,196,0.15)', color: '#4ECDC4', border: '1px solid rgba(78,205,196,0.3)'
                  }}>{trait}</span>
                ))}
              </div>
            </div>
          </div>

          {/* NEW: Story Insight */}
          <div style={{ opacity: revealStep >= 5 ? 1 : 0, transform: revealStep >= 5 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            {personality.storyInsight && (
              <div style={{ ...styles.darkCard, marginBottom: 16, background: 'linear-gradient(135deg, rgba(155,89,182,0.15), rgba(142,68,173,0.1))', border: '1px solid rgba(155,89,182,0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#9B59B6', marginBottom: 12 }}>🎭 Story Insight</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 10 }}>{personality.storyInsight.title}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, margin: 0 }}>{personality.storyInsight.content}</p>
              </div>
            )}

            {/* NEW: Science Secret */}
            {personality.scienceSecret && (
              <div style={{ ...styles.darkCard, marginBottom: 16, background: 'linear-gradient(135deg, rgba(52,152,219,0.15), rgba(41,128,185,0.1))', border: '1px solid rgba(52,152,219,0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#3498DB', marginBottom: 12 }}>🔬 Science Secret</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 6 }}>{personality.scienceSecret.title}</div>
                <div style={{ fontSize: 11, color: '#3498DB', marginBottom: 12, fontFamily: 'monospace' }}>Gene: {personality.scienceSecret.gene}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, margin: 0 }}>{personality.scienceSecret.content}</p>
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(52,152,219,0.2)', borderRadius: 12 }}>
                  <p style={{ fontSize: 12, color: '#3498DB', margin: 0, lineHeight: 1.6 }}>{personality.scienceSecret.funFact}</p>
                </div>
              </div>
            )}

            {/* NEW: How-To Guide */}
            {personality.howToGuide && (
              <div style={{ ...styles.darkCard, marginBottom: 16, background: 'linear-gradient(135deg, rgba(46,204,113,0.15), rgba(39,174,96,0.1))', border: '1px solid rgba(46,204,113,0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#2ECC71', marginBottom: 16 }}>💡 {personality.howToGuide.title}</div>
                {personality.howToGuide.tips.map((tip, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    gap: 12, 
                    marginBottom: i < personality.howToGuide.tips.length - 1 ? 16 : 0,
                    paddingBottom: i < personality.howToGuide.tips.length - 1 ? 16 : 0,
                    borderBottom: i < personality.howToGuide.tips.length - 1 ? '1px solid rgba(46,204,113,0.2)' : 'none'
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(46,204,113,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18
                    }}>{tip.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 4 }}>{tip.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NEW: Warnings */}
            {personality.warnings && (
              <div style={{ ...styles.darkCard, marginBottom: 16, background: 'linear-gradient(135deg, rgba(231,76,60,0.15), rgba(192,57,43,0.1))', border: '1px solid rgba(231,76,60,0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E74C3C', marginBottom: 12 }}>⚠️ {personality.warnings.title}</div>
                {personality.warnings.items.map((item, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 10, 
                    marginBottom: i < personality.warnings.items.length - 1 ? 10 : 0 
                  }}>
                    <span style={{ color: '#E74C3C', fontSize: 12 }}>•</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* NEW: Recommended Activities */}
            {personality.activities && (
              <div style={{ ...styles.darkCard, marginBottom: 16, background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,193,7,0.1))', border: '1px solid rgba(255,215,0,0.3)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FFD700', marginBottom: 16 }}>🎯 {personality.activities.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {personality.activities.items.map((item, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,215,0,0.1)',
                      borderRadius: 12,
                      padding: 12,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{item.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ ...styles.darkCard, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>
                นี่แค่ 1 ใน 12 Tests!
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                ค้นพบ DNA เพิ่มเติมใน 4 Paw Sequences
              </div>
              <button onClick={() => { setViewingResult(null); setScreen('dashboard'); }} style={{ ...styles.btn, ...styles.btnPrimary }}>
                🧬 ทำ Test ต่อ
              </button>
            </div>

            {/* Share Button */}
            <button style={{ ...styles.btn, ...styles.btnGhost, marginBottom: 24 }}>
              📤 แชร์ผลให้เพื่อน
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Auth Screen ──────────────────────────────────────────────────────────
  const AuthScreen = () => {
    const emailRef2 = useRef(null);
    const passRef = useRef(null);
    const dogNameRef2 = useRef(null);
    const ownerRef2 = useRef(null);

    return (
      <div style={styles.container}>
        <div style={{...styles.glowOrb, width: 300, height: 300, background: '#4ECDC4', top: -100, left: -100}} />
        <div style={{...styles.glowOrb, width: 250, height: 250, background: '#FF6B6B', bottom: -80, right: -80}} />
        
        <div style={styles.content}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <button onClick={() => setScreen('landing')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white' }}>←</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: 14, letterSpacing: 3, color: 'rgba(255,255,255,0.5)' }}>🐾 MHA' STORY</span>
            </div>
            <div style={{ width: 24 }} />
          </div>

          <div style={{ ...styles.darkCard }}>
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                {authMode === 'register' ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {authMode === 'register' ? 'บันทึกผลทดสอบ DNA ของน้องหมา' : 'ดูผลทดสอบและ Dog Profile ของคุณ'}
              </div>
            </div>

            {/* Step indicator for register */}
            {authMode === 'register' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
                {[1,2].map(s => (
                  <div key={s} style={{
                    width: s === authStep ? 32 : 12, height: 8, borderRadius: 4,
                    background: s <= authStep ? 'linear-gradient(90deg, #FF6B6B, #FFD93D)' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s'
                  }} />
                ))}
              </div>
            )}

            {/* Step 1: Credentials */}
            {authStep === 1 && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>📧 Email</div>
                  <input
                    ref={emailRef2}
                    type="email"
                    defaultValue={authEmail}
                    onBlur={e => setAuthEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.07)', color: 'white',
                      fontSize: 15, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>🔑 Password</div>
                  <input
                    ref={passRef}
                    type="password"
                    defaultValue={authPassword}
                    onBlur={e => setAuthPassword(e.target.value)}
                    placeholder={authMode === 'register' ? 'ตั้งรหัสผ่าน (6+ ตัวอักษร)' : 'รหัสผ่าน'}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.07)', color: 'white',
                      fontSize: 15, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Dog Profile (Register only) */}
            {authMode === 'register' && authStep === 2 && (
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, textAlign: 'center' }}>
                  บอกเราเพิ่มเติมเกี่ยวกับน้องหมาของคุณ 🐕
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>ชื่อน้องหมา</div>
                  <input
                    ref={dogNameRef2}
                    type="text"
                    defaultValue={leadInfo.dogName}
                    onBlur={e => setLeadInfo({...leadInfo, dogName: e.target.value})}
                    placeholder="เช่น บัตเตอร์, ช็อกโกแลต"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.07)', color: 'white',
                      fontSize: 15, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>ชื่อเจ้าของ</div>
                  <input
                    ref={ownerRef2}
                    type="text"
                    defaultValue={leadInfo.name}
                    onBlur={e => setLeadInfo({...leadInfo, name: e.target.value})}
                    placeholder="ชื่อของคุณ"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.07)', color: 'white',
                      fontSize: 15, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>สายพันธุ์</div>
                  <select
                    value={selectedBreed}
                    onChange={e => setSelectedBreed(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      background: 'rgba(40,40,80,0.9)', color: selectedBreed ? 'white' : 'rgba(255,255,255,0.4)',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    <option value="">เลือกสายพันธุ์</option>
                    {dogBreeds.map(b => <option key={b} value={b} style={{ background: '#1a1a2e' }}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Error */}
            {authError && (
              <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#FF8E8E' }}>
                {authError}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAuthSubmit}
              disabled={authLoading}
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: authLoading ? 0.7 : 1 }}
            >
              {authLoading ? '⏳ กำลังดำเนินการ...' : 
               authMode === 'register' && authStep === 1 ? 'ถัดไป →' :
               authMode === 'register' ? '✨ สร้างบัญชี' : '🚀 เข้าสู่ระบบ'}
            </button>

            {/* Skip Supabase warning */}
            {!supabase && (
              <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,200,100,0.8)', textAlign: 'center', lineHeight: 1.6 }}>
                ⚠️ ยังไม่ได้ตั้งค่า Supabase<br/>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>npm install @supabase/supabase-js<br/>ตั้งค่า .env.local ก่อนนะคะ</span>
              </div>
            )}

            {/* Toggle login/register */}
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
              {authMode === 'login' ? (
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  ยังไม่มีบัญชี?{' '}
                  <span style={{ color: '#FFD93D', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => { setAuthMode('register'); setAuthStep(1); setAuthError(''); }}>
                    สมัครสมาชิก
                  </span>
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  มีบัญชีแล้ว?{' '}
                  <span style={{ color: '#4ECDC4', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => { setAuthMode('login'); setAuthStep(1); setAuthError(''); }}>
                    เข้าสู่ระบบ
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // ──────────────────────────────────────────────────────────────────────────

  // Dashboard Screen — DNA Helix Milestone
  const DashboardScreen = () => {
    const completedCount = Object.keys(completedTopics).length;

    // DNA Helix sinusoidal layout
    const maxRungWidth = 220;
    const minRungWidth = 40;

    return (
      <div style={styles.container}>
        <div style={{...styles.glowOrb, width: 300, height: 300, background: '#FF6B6B', top: -100, right: -100}} />
        <div style={{...styles.glowOrb, width: 200, height: 200, background: '#4ECDC4', bottom: 100, left: -80}} />
        
        <div style={styles.content}>
          {/* Header with Back + Auth */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => setScreen('landing')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'white' }}>←</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: 14, letterSpacing: 3, color: 'rgba(255,255,255,0.5)' }}>🐾 MHA' STORY</span>
            </div>
            {user ? (
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }} title="ออกจากระบบ">🚪</button>
            ) : (
              <button onClick={() => { setAuthMode('login'); setAuthStep(1); setScreen('auth'); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 8px', fontSize: 11, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Login</button>
            )}
          </div>

          {/* Save Status Toast */}
          {saveMsg && (
            <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 13, color: saveMsg.includes('✅') ? '#2ECC71' : '#FF6B6B' }}>
              {saveMsg}
            </div>
          )}

          {/* Profile Header */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🐕</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              {leadInfo.dogName || 'น้องหมา'}'s DNA Profile
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              Level {Math.floor(completedCount / 3) + 1} ⭐ • {completedCount}/12 Tests Completed
            </div>
            {user && (
              <div style={{ fontSize: 11, color: 'rgba(100,255,180,0.7)', marginTop: 4 }}>
                ☁️ Saved — {user.email}
              </div>
            )}
            {!user && completedCount > 0 && (
              <button
                onClick={() => { setAuthMode('register'); setAuthStep(1); setScreen('auth'); }}
                style={{ marginTop: 8, padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(255,211,61,0.5)', background: 'rgba(255,211,61,0.1)', color: '#FFD93D', fontSize: 12, cursor: 'pointer' }}
              >
                💾 บันทึกผลด้วย Account
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${(completedCount / 12) * 100}%`, height: '100%',
                background: 'linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4)',
                borderRadius: 4, transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <span>0%</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{Math.round((completedCount / 12) * 100)}% Complete</span>
              <span>100%</span>
            </div>
          </div>

          {/* ─── DNA HELIX MILESTONE ─── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🧬 DNA Helix Milestones
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Tap to view</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {allTopics.map((topic, index) => {
                const isCompleted = isTopicCompleted(topic.id);
                const isUnlocked = isTopicUnlocked(topic.id);
                const pawGroup = islands.find(i => i.topics.includes(topic.id));
                const isFirstInGroup = pawGroup?.topics[0] === topic.id;
                const isLastInGroup = pawGroup?.topics[pawGroup.topics.length - 1] === topic.id;

                // Helix wave: 2 full rotations over 12 rungs
                const angle = (index / 12) * Math.PI * 4;
                const widthFactor = (Math.sin(angle) + 1) / 2;
                const rungWidth = Math.round(minRungWidth + (maxRungWidth - minRungWidth) * widthFactor);
                const isLeftFront = Math.sin(angle) >= 0;
                const nodeSize = isLeftFront ? 40 : 32;
                const nodeSize2 = isLeftFront ? 32 : 40;

                return (
                  <div key={topic.id} style={{ width: '100%' }}>
                    {/* Paw Group Label */}
                    {isFirstInGroup && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 10, marginTop: index === 0 ? 0 : 16,
                        justifyContent: 'center'
                      }}>
                        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${pawGroup.color}55)` }} />
                        <div style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: 2,
                          color: pawGroup.color, padding: '3px 10px',
                          border: `1px solid ${pawGroup.color}44`,
                          borderRadius: 20, background: `${pawGroup.color}11`
                        }}>
                          {pawGroup.emoji} {pawGroup.name}
                        </div>
                        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${pawGroup.color}55, transparent)` }} />
                      </div>
                    )}

                    {/* Helix Rung Row */}
                    <div
                      onClick={() => { setSelectedBadge(topic); setShowBadgeModal(true); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: 54, cursor: 'pointer',
                        marginBottom: 2
                      }}
                    >
                      {/* Left Node */}
                      <div style={{
                        width: nodeSize, height: nodeSize, borderRadius: '50%', flexShrink: 0,
                        background: isCompleted
                          ? `radial-gradient(circle at 35% 35%, ${topic.color}FF, ${topic.color}99)`
                          : isUnlocked ? `${topic.color}22` : 'rgba(255,255,255,0.07)',
                        border: `2px solid ${isCompleted ? topic.color : isUnlocked ? `${topic.color}55` : 'rgba(255,255,255,0.12)'}`,
                        boxShadow: isCompleted ? `0 0 14px ${topic.color}88, 0 0 28px ${topic.color}44` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: nodeSize > 36 ? 18 : 14,
                        filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)',
                        zIndex: isLeftFront ? 2 : 1,
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}>
                        {isUnlocked ? topic.emoji : '🔒'}
                        {isCompleted && (
                          <div style={{
                            position: 'absolute', top: -3, right: -3,
                            width: 14, height: 14, borderRadius: '50%',
                            background: '#2ECC71', border: '1.5px solid #1a1a2e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, color: 'white', fontWeight: 700
                          }}>✓</div>
                        )}
                      </div>

                      {/* Connecting Rung */}
                      <div style={{
                        height: 3, flexShrink: 0,
                        width: Math.max(rungWidth - nodeSize - nodeSize2 - 4, 6),
                        background: isCompleted
                          ? `linear-gradient(90deg, ${topic.color}CC, ${topic.color}55, ${topic.color}CC)`
                          : 'rgba(255,255,255,0.1)',
                        borderRadius: 2, position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap',
                          background: '#1a1a2e', padding: '1px 5px', borderRadius: 4,
                          color: isCompleted ? topic.color : 'rgba(255,255,255,0.3)',
                          border: `1px solid ${isCompleted ? topic.color + '55' : 'rgba(255,255,255,0.08)'}`
                        }}>
                          {isCompleted ? `${completedTopics[topic.id]?.score || 0}%` : `T${topic.id}`}
                        </div>
                      </div>

                      {/* Right Node */}
                      <div style={{
                        width: nodeSize2, height: nodeSize2, borderRadius: '50%', flexShrink: 0,
                        background: isCompleted
                          ? `radial-gradient(circle at 65% 35%, ${topic.color}BB, ${topic.color}66)`
                          : isUnlocked ? `${topic.color}15` : 'rgba(255,255,255,0.04)',
                        border: `2px solid ${isCompleted ? `${topic.color}99` : isUnlocked ? `${topic.color}33` : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isCompleted ? `0 0 10px ${topic.color}55` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700,
                        color: isCompleted ? 'white' : 'rgba(255,255,255,0.3)',
                        filter: isUnlocked ? 'none' : 'opacity(0.4)',
                        zIndex: isLeftFront ? 1 : 2,
                        transition: 'all 0.3s'
                      }}>
                        {topic.dimension}
                      </div>
                    </div>

                    {/* Vertical strand connector between rungs (within same paw group) */}
                    {!isLastInGroup && (
                      <div style={{
                        display: 'flex', justifyContent: 'center',
                        height: 8, gap: rungWidth - 8
                      }}>
                        <div style={{ width: 2, background: isCompleted ? `${topic.color}55` : 'rgba(255,255,255,0.08)', borderRadius: 1 }} />
                        <div style={{ width: 2, background: isCompleted ? `${topic.color}33` : 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action */}
          {completedCount < 12 && (
            <button
              onClick={() => {
                const nextTopic = allTopics.find(t => isTopicUnlocked(t.id) && !isTopicCompleted(t.id));
                if (nextTopic) {
                  setCurrentTopic(nextTopic);
                  setScreen('topic-intro');
                }
              }}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              🐾 ทำ Test ถัดไป
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {screen === 'landing' && <LandingScreen />}
      {screen === 'overview' && <OverviewScreen />}
      {screen === 'topic-intro' && <TopicIntroScreen />}
      {screen === 'quiz' && <QuizScreen />}
      {screen === 'result' && <ResultScreen />}
      {screen === 'auth' && <AuthScreen />}
      {screen === 'dashboard' && <DashboardScreen />}
      
      {showLeadGate && <LeadGateModal />}
      {showBadgeModal && selectedBadge && <BadgePreviewModal />}
      {showDimensionPopup && <DimensionPopup />}
    </>
  );
}
