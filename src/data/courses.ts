import { CourseData, FinancialBackground } from '../types/game';

export const COURSES: CourseData[] = [
  // ==========================================
  // Faculty 1: Arts and Humanities
  // ==========================================
  {
    id: 'eng_lit',
    name: 'English and Literary Studies',
    faculty: 'Arts and Humanities',
    durationYears: 4,
    totalLevels: 8,
    codePrefix: 'ENG',
    description: 'A comprehensive four-year academic discipline bridging linguistics and literary criticism. Students study African oral traditions, pre-colonial and post-colonial African literature (Chinua Achebe, Wole Soyinka, Flora Nwapa, Ngũgĩ wa Thiong\'o), alongside classical European drama, Elizabethan poetry, and modern world literatures. The linguistic component covers English phonetics and phonology, syntax, morphology, sociolinguistics in multilingual Nigeria, semantic analysis, and advanced discourse theory. Practical departmental seminars require students to present critical textual essays, dramatic performances, and original creative writing portfolios.',
    careerPaths: ['Author / Novelist', 'Diplomatic Communications Officer', 'University Academic', 'Broadcast Journalist', 'Publisher & Editor'],
    firstYearCourses: [
      {
        code: 'ENG 101',
        title: 'Introduction to Nigerian Literature',
        credits: 3,
        lecturer: 'Prof. Adeyemi Adeleke',
        venue: 'Faculty of Arts Theatre A',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'Who is the author of the celebrated classic "Things Fall Apart" set in pre-colonial Igboland?',
          options: ['Wole Soyinka', 'Chinua Achebe', 'Chimamanda Ngozi Adichie', 'Flora Nwapa'],
          correctIndex: 1,
          explanation: 'Chinua Achebe published Things Fall Apart in 1958, capturing traditional Igbo society during colonial arrival.'
        }
      },
      {
        code: 'ENG 103',
        title: 'Elements of English Grammar and Phonetics',
        credits: 2,
        lecturer: 'Dr. (Mrs) Nkechi Okonkwo',
        venue: 'Arts Block Hall 4',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'Which of the following contains a pure monophthong vowel sound in English phonetics?',
          options: ['Boy /ɔɪ/', 'Bite /aɪ/', 'Bead /i:/', 'Boat /əʊ/'],
          correctIndex: 2,
          explanation: 'The sound /i:/ in "bead" is a long monophthong (single steady vowel).'
        }
      },
      {
        code: 'ENG 105',
        title: 'African Oral Poetry and Folklore Traditions',
        credits: 2,
        lecturer: 'Prof. Gabriel Okon',
        venue: 'Faculty of Arts Theatre B',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'In traditional Yoruba oral literature, what is the chant poetry recited in praise of lineages and deities?',
          options: ['Oriki', 'Ijasa', 'Apala', 'Waka'],
          correctIndex: 0,
          explanation: 'Oriki is the traditional Yoruba genre of praise poetry celebrating lineage and heritage.'
        }
      },
      {
        code: 'ENG 107',
        title: 'Critical Reading, Composition & Rhetoric',
        credits: 2,
        lecturer: 'Dr. Stella Briggs',
        venue: 'Arts Block Seminar Room 2',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'Which rhetorical device is used when an author appeals primarily to an audience\'s emotions?',
          options: ['Pathos', 'Ethos', 'Logos', 'Kairos'],
          correctIndex: 0,
          explanation: 'Aristotelian rhetoric defines Pathos as the appeal to an audience’s emotions.'
        }
      },
      {
        code: 'ENG 109',
        title: 'African Drama and Performance Theatre',
        credits: 3,
        lecturer: 'Prof. Wole Bamgbose',
        venue: 'Campus Arts Amphitheatre',
        timeSlot: '13:00 - 14:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'Which Nigerian dramatist won the Nobel Prize in Literature in 1986?',
          options: ['Wole Soyinka', 'Femi Osofisan', 'J.P. Clark', 'Ola Rotimi'],
          correctIndex: 0,
          explanation: 'Wole Soyinka made history in 1986 as the first sub-Saharan African to receive the Nobel Prize in Literature.'
        }
      }
    ]
  },
  {
    id: 'hist_int',
    name: 'History and International Studies',
    faculty: 'Arts and Humanities',
    durationYears: 4,
    totalLevels: 8,
    codePrefix: 'HIS',
    description: 'An exhaustive four-year programme covering Nigerian political history from early civilizations (Nok culture, Oyo Empire, Benin Kingdom, Kanem-Bornu) through the British colonial amalgamation of 1914, nationalist struggle, and the First Republic to modern post-civil war federalism. The international studies curriculum explores pan-Africanism, the African Union, ECOWAS regional integration, the Cold War, Middle Eastern geopolitics, international treaty frameworks, strategic diplomatic negotiations, and archival research methodologies. Seminars train students in primary source analysis, historical historiography, and foreign policy evaluation.',
    careerPaths: ['Diplomat & Foreign Service Officer', 'International Relations Analyst', 'Intelligence Officer', 'Museum Curator', 'Historical Consultant'],
    firstYearCourses: [
      {
        code: 'HIS 101',
        title: 'Nigeria from 1500 to 1900 AD',
        credits: 3,
        lecturer: 'Dr. Usman Danjuma',
        venue: 'Faculty of Arts Theatre B',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'In which year did the British colonial amalgamation of the Northern and Southern Protectorates of Nigeria take place?',
          options: ['1960', '1914', '1900', '1948'],
          correctIndex: 1,
          explanation: 'Lord Frederick Lugard amalgamated the Northern and Southern protectorates in 1914.'
        }
      },
      {
        code: 'HIS 103',
        title: 'Pre-Colonial Kingdoms of West Africa',
        credits: 3,
        lecturer: 'Prof. Chioma Obioma',
        venue: 'Faculty of Arts Theatre A',
        timeSlot: '08:30 - 10:00',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'The renowned ancient Nok terracotta heads excavated in Central Nigeria date back to approximately:',
          options: ['500 BC to 200 AD', '1500 AD', '1000 BC only', '1800 AD'],
          correctIndex: 0,
          explanation: 'The Nok culture flourished from around 500 BC to 200 AD with master iron smelting and terracotta art.'
        }
      },
      {
        code: 'HIS 105',
        title: 'Foundations of Global Diplomacy',
        credits: 2,
        lecturer: 'Prof. Balarabe Musa',
        venue: 'Senate Lecture Hall',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'The Peace of Westphalia (1648) is globally recognized for establishing the principle of:',
          options: ['State sovereignty', 'Nuclear non-proliferation', 'Free trade zones', 'Global currency'],
          correctIndex: 0,
          explanation: 'Westphalian sovereignty established nation-state borders and non-interference.'
        }
      },
      {
        code: 'HIS 107',
        title: 'Pan-African Movements & Liberation Struggles',
        credits: 2,
        lecturer: 'Dr. Kwame Afolabi',
        venue: 'Arts Block Hall 3',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'Which Pan-Africanist leader championed the founding of the Organization of African Unity (OAU) in 1963?',
          options: ['Kwame Nkrumah', 'Nelson Mandela', 'Jomo Kenyatta', 'Patrice Lumumba'],
          correctIndex: 0,
          explanation: 'Dr. Kwame Nkrumah of Ghana was a leading pioneer in establishing the OAU in Addis Ababa in 1963.'
        }
      },
      {
        code: 'HIS 109',
        title: 'International Law and Treaty Conventions',
        credits: 2,
        lecturer: 'Prof. Veronica Kalu',
        venue: 'Senate Seminar Room 1',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'The primary judicial organ of the United Nations headquartered in The Hague is the:',
          options: ['International Court of Justice (ICJ)', 'International Maritime Court', 'Geneva Convention Council', 'Interpol'],
          correctIndex: 0,
          explanation: 'The ICJ sits in The Hague, Netherlands, resolving sovereign legal disputes.'
        }
      }
    ]
  },

  // ==========================================
  // Faculty 2: Commerce and Management
  // ==========================================
  {
    id: 'accounting',
    name: 'Accounting',
    faculty: 'Commerce and Management',
    durationYears: 4,
    totalLevels: 8,
    codePrefix: 'ACC',
    description: 'A rigorous four-year professional business curriculum aligning with ICAN (Institute of Chartered Accountants of Nigeria) and ACCA educational standards. Courses progress from foundational double-entry bookkeeping and business mathematics to advanced corporate financial accounting, forensic auditing, International Financial Reporting Standards (IFRS), public sector accounting, Nigerian tax laws (CITA, PITA, VAT), cost accounting, and strategic managerial finance. Students master ledger reconciliation, company balance sheets, cash flow modeling, auditing ethics, and computerized accounting packages.',
    careerPaths: ['Chartered Accountant (FCA/ACA)', 'Forensic Auditor', 'Chief Financial Officer (CFO)', 'Tax Consultant', 'Investment Banker'],
    firstYearCourses: [
      {
        code: 'ACC 101',
        title: 'Principles of Financial Accounting I',
        credits: 3,
        lecturer: 'Chief (Dr.) Kenneth Onyema (FCA)',
        venue: 'Management Science Block Room 102',
        timeSlot: '08:30 - 10:00',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'According to the fundamental accounting equation, which statement is always true?',
          options: ['Assets = Liabilities + Equity', 'Assets = Liabilities - Equity', 'Liabilities = Assets + Equity', 'Equity = Cash + Debts'],
          correctIndex: 0,
          explanation: 'Assets must always equal the sum of Liabilities and Owner’s Equity.'
        }
      },
      {
        code: 'ACC 103',
        title: 'Business Mathematics & Financial Statistics',
        credits: 3,
        lecturer: 'Dr. Folashade Bakare',
        venue: 'Commerce Lecture Hall 1',
        timeSlot: '13:00 - 14:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'In double-entry bookkeeping, what is the effect of an increase in an expense account?',
          options: ['Debit entry', 'Credit entry', 'Contra entry', 'No entry'],
          correctIndex: 0,
          explanation: 'Expenses and assets are increased with a Debit (Dr) entry.'
        }
      },
      {
        code: 'ACC 105',
        title: 'Cost and Management Accounting Foundations',
        credits: 3,
        lecturer: 'Prof. Aliyu Bello',
        venue: 'Commerce Auditorium',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'In cost accounting, prime cost is the combination of direct materials and:',
          options: ['Direct labor', 'Factory overheads', 'Administrative expenses', 'Selling commission'],
          correctIndex: 0,
          explanation: 'Prime Cost = Direct Materials + Direct Labor + Direct Expenses.'
        }
      },
      {
        code: 'ACC 107',
        title: 'Commercial Law and Contract Obligations',
        credits: 2,
        lecturer: 'Barrister (Mrs) Toyin Peters',
        venue: 'Commerce Room 201',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'An essential ingredient of a valid contract in Nigerian commercial law that represents the price paid is called:',
          options: ['Consideration', 'Invitation to treat', 'Tortious liability', 'Warranty'],
          correctIndex: 0,
          explanation: 'Consideration is something of economic value exchanged between contracting parties.'
        }
      },
      {
        code: 'ACC 109',
        title: 'Business Ethics & ICAN Professional Conduct',
        credits: 2,
        lecturer: 'Dr. Michael Adeyemo',
        venue: 'Commerce Seminar Room 3',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'Which fundamental principle of the ICAN code of ethics requires accountants to be straightforward and honest?',
          options: ['Integrity', 'Objectivity', 'Confidentiality', 'Professional competence'],
          correctIndex: 0,
          explanation: 'Integrity mandates honesty, truthfulness, and fair dealing in all professional relationships.'
        }
      }
    ]
  },
  {
    id: 'bus_admin',
    name: 'Business Administration',
    faculty: 'Commerce and Management',
    durationYears: 4,
    totalLevels: 8,
    codePrefix: 'BUS',
    description: 'A multi-faceted four-year management programme designed to examine the organizational dynamics of public and private enterprises in emerging African economies. The curriculum covers organizational behavior, Nigerian company law (CAMA 2020), corporate governance, strategic operations management, supply chain logistics, consumer psychology, human resource administration, and business entrepreneurship. Case study workshops simulate enterprise turnaround strategies, labor union negotiations, investment appraisal, and new venture business plan defenses before departmental academic panels.',
    careerPaths: ['Business Executive', 'Management Consultant', 'Entrepreneur / Founder', 'Supply Chain Director', 'Human Resources Manager'],
    firstYearCourses: [
      {
        code: 'BUS 101',
        title: 'Introduction to Business Organization',
        credits: 3,
        lecturer: 'Prof. Ibrahim Sanusi',
        venue: 'Faculty of Commerce Auditorium',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'A Sole Proprietorship business in Nigeria offers which primary legal characteristic regarding liability?',
          options: ['Unlimited liability', 'Limited by guarantee', 'Limited liability', 'Exemption from tax'],
          correctIndex: 0,
          explanation: 'Sole proprietors have unlimited personal liability for business debts.'
        }
      },
      {
        code: 'BUS 103',
        title: 'Microeconomics for Managers & Decision Makers',
        credits: 3,
        lecturer: 'Dr. Emeka Madu',
        venue: 'Management Science Block Room 104',
        timeSlot: '08:30 - 10:00',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'When the price of a normal good increases, what typically happens to the quantity demanded?',
          options: ['It decreases (Law of Demand)', 'It increases infinitely', 'It remains identical', 'It doubles immediately'],
          correctIndex: 0,
          explanation: 'The Law of Demand states that ceteris paribus, higher prices lead to lower quantity demanded.'
        }
      },
      {
        code: 'BUS 104',
        title: 'Principles of Marketing in Emerging Markets',
        credits: 2,
        lecturer: 'Dr. Ngozi Eze',
        venue: 'Commerce Room 204',
        timeSlot: '12:00 - 13:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'The classic "4 Ps" of the marketing mix are Product, Price, Promotion, and:',
          options: ['People', 'Place', 'Profit', 'Process'],
          correctIndex: 1,
          explanation: 'The original 4 Ps formulated by E. Jerome McCarthy are Product, Price, Place, Promotion.'
        }
      },
      {
        code: 'BUS 106',
        title: 'Organizational Behavior and Leadership',
        credits: 2,
        lecturer: 'Prof. Rasheed Bakare',
        venue: 'Commerce Lecture Hall 2',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'In Maslow\'s Hierarchy of Needs, which level forms the foundational physiological base?',
          options: ['Food, water, and shelter', 'Self-actualization', 'Esteem and status', 'Love and belonging'],
          correctIndex: 0,
          explanation: 'Physiological needs (food, water, sleep, warmth) constitute the base of Maslow’s pyramid.'
        }
      },
      {
        code: 'BUS 108',
        title: 'Entrepreneurship and Innovation in Africa',
        credits: 2,
        lecturer: 'Dr. Angela Chukwu',
        venue: 'Commerce Innovation Lab',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'A business model canvas is primarily designed to visualize:',
          options: ['How an enterprise creates, delivers, and captures value', 'Only tax audit requirements', 'Staff attendance records', 'Factory machinery maintenance'],
          correctIndex: 0,
          explanation: 'A business model canvas maps value propositions, customer segments, channels, and revenue streams.'
        }
      }
    ]
  },

  // ==========================================
  // Faculty 3: Engineering and Technology
  // ==========================================
  {
    id: 'ece',
    name: 'Electronic and Computer Engineering',
    faculty: 'Engineering and Technology',
    durationYears: 5,
    totalLevels: 10,
    codePrefix: 'ECE',
    description: 'An intensive five-year professional engineering degree combining electrical hardware engineering with computer systems architecture. Foundational years focus on advanced engineering mathematics, circuit theory, analog and digital electronics, electromagnetics, and workshop practice. Upper levels delve into microprocessors, embedded system design, telecommunications, digital signal processing (DSP), control systems, VLSI circuits, and network engineering. Includes mandatory six-month Students Industrial Work Experience Scheme (SIWES) placements in telecoms or industrial automation, culminating in a prototype hardware-software capstone engineering project.',
    careerPaths: ['Embedded Systems Architect', 'Telecommunications Engineer', 'Hardware Firmware Developer', 'Automation & Robotics Engineer', 'VLSI Design Engineer'],
    firstYearCourses: [
      {
        code: 'ECE 101',
        title: 'Introduction to Electrical & Electronic Circuits',
        credits: 3,
        lecturer: 'Engr. Prof. Chike Obi',
        venue: 'Faculty of Engineering LT 1',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'According to Ohm’s Law, if voltage across a 10Ω resistor is 50V, what is the current flowing through it?',
          options: ['5 Amperes', '500 Amperes', '0.2 Amperes', '25 Amperes'],
          correctIndex: 0,
          explanation: 'I = V / R = 50 / 10 = 5 A.'
        }
      },
      {
        code: 'ECE 103',
        title: 'Digital Logic Design and Boolean Algebra',
        credits: 3,
        lecturer: 'Engr. Dr. Samuel Agbo',
        venue: 'Faculty of Engineering LT 2',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'Which logic gate outputs TRUE only when both inputs are binary 1?',
          options: ['AND gate', 'OR gate', 'XOR gate', 'NOR gate'],
          correctIndex: 0,
          explanation: 'An AND gate produces high output (1) exclusively when all inputs are high.'
        }
      },
      {
        code: 'ENG 102',
        title: 'Engineering Workshop Practice & Safety',
        credits: 2,
        lecturer: 'Engr. (Dr.) Tunde Lawal',
        venue: 'Central Engineering Workshop',
        timeSlot: '14:00 - 16:00',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'Which instrument is primarily used to measure the waveform, amplitude, and frequency of electronic signals?',
          options: ['Oscilloscope', 'Hydrometer', 'Barometer', 'Micrometer screw gauge'],
          correctIndex: 0,
          explanation: 'An oscilloscope plots electrical voltage variation as a graphical function of time.'
        }
      },
      {
        code: 'ECE 105',
        title: 'Applied Engineering Mathematics I (Calculus & Vectors)',
        credits: 3,
        lecturer: 'Prof. Sunday Babatunde',
        venue: 'Faculty of Engineering LT 1',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'What is the derivative of sin(x) with respect to x?',
          options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec²(x)'],
          correctIndex: 0,
          explanation: 'd/dx [sin(x)] = cos(x).'
        }
      },
      {
        code: 'ECE 107',
        title: 'Semiconductor Physics and Electronic Devices',
        credits: 2,
        lecturer: 'Engr. (Mrs) Fatima Yusuf',
        venue: 'Engineering Electronics Lab',
        timeSlot: '13:00 - 14:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'In a forward-biased silicon P-N junction diode, the typical barrier voltage drop is approximately:',
          options: ['0.7 Volts', '5.0 Volts', '0.0 Volts', '12.0 Volts'],
          correctIndex: 0,
          explanation: 'Silicon p-n junction diodes have an intrinsic barrier potential of approximately 0.7V.'
        }
      }
    ]
  },
  {
    id: 'mech_eng',
    name: 'Mechanical Engineering',
    faculty: 'Engineering and Technology',
    durationYears: 5,
    totalLevels: 10,
    codePrefix: 'MEE',
    description: 'A five-year accredited engineering curriculum investigating thermo-fluids, mechanical design, and material sciences. Students master statics, dynamics, mechanics of machines, engineering thermodynamics, fluid mechanics, heat transfer, metallurgy, CAD/CAM drafting, and manufacturing technology. Laboratory workshops provide hands-on experience in lathe machining, welding, engine diagnostics, and tensile material testing. Students complete mandatory SIWES industrial training in power generation, oil and gas, or manufacturing facilities before defending an original machine fabrication project.',
    careerPaths: ['Automotive Engineer', 'HVAC Systems Specialist', 'Power Plant Engineer', 'Manufacturing Plant Manager', 'Aerospace Design Consultant'],
    firstYearCourses: [
      {
        code: 'MEE 101',
        title: 'Engineering Mechanics (Statics & Dynamics)',
        credits: 3,
        lecturer: 'Engr. Dr. Mustapha Garba',
        venue: 'Faculty of Engineering LT 2',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'Newton’s First Law of Motion states that an object will remain at rest or in uniform motion unless acted upon by:',
          options: ['An external resultant force', 'Gravitational pull only', 'Friction', 'Magnetic resistance'],
          correctIndex: 0,
          explanation: 'An unbalanced external net force is required to alter an object’s velocity.'
        }
      },
      {
        code: 'MEE 103',
        title: 'Applied Engineering Drawing with CAD',
        credits: 2,
        lecturer: 'Engr. Victoria Alabi',
        venue: 'Engineering Drawing Studio',
        timeSlot: '13:00 - 15:00',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'In first-angle orthographic projection, where is the plan (top view) positioned relative to the front elevation?',
          options: ['Below the front view', 'Above the front view', 'To the left side', 'In the rear'],
          correctIndex: 0,
          explanation: 'In first-angle projection, the view from above (plan) is projected onto the bottom surface below the elevation.'
        }
      },
      {
        code: 'MEE 105',
        title: 'Introduction to Thermodynamics & Energy Conversion',
        credits: 3,
        lecturer: 'Prof. Ahmed Jalingo',
        venue: 'Faculty of Engineering LT 1',
        timeSlot: '08:30 - 10:00',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'The First Law of Thermodynamics is essentially a restatement of the principle of:',
          options: ['Conservation of Energy', 'Entropy increase', 'Zero gravity', 'Absolute temperature'],
          correctIndex: 0,
          explanation: 'Energy can neither be created nor destroyed, only transformed from one form to another.'
        }
      },
      {
        code: 'MEE 107',
        title: 'Engineering Materials Science and Metallurgy',
        credits: 2,
        lecturer: 'Dr. Joseph Ekwunife',
        venue: 'Materials Testing Lab',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'Which property describes a metal\'s ability to undergo significant plastic deformation before fracturing?',
          options: ['Ductility', 'Brittleness', 'Hardness', 'Conductivity'],
          correctIndex: 0,
          explanation: 'Ductility allows materials (like copper and mild steel) to stretch under tensile stress without rupture.'
        }
      },
      {
        code: 'MEE 109',
        title: 'Manufacturing Technology & Machine Shop Operations',
        credits: 2,
        lecturer: 'Engr. Kolawole Adeleke',
        venue: 'Mechanical Machine Shop',
        timeSlot: '10:00 - 12:00',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'Which machine tool is primarily used for generating cylindrical workpieces by rotating the material against a cutting bit?',
          options: ['Lathe machine', 'Surface grinder', 'Shaping machine', 'Punch press'],
          correctIndex: 0,
          explanation: 'The lathe rotates the workpiece about an axis of rotation to perform turning and boring.'
        }
      }
    ]
  },

  // ==========================================
  // Faculty 4: Medicine and Health Sciences
  // ==========================================
  {
    id: 'med_surg',
    name: 'Medicine and Surgery',
    faculty: 'Medicine and Health Sciences',
    durationYears: 6,
    totalLevels: 12,
    codePrefix: 'MED',
    description: 'A prestigious six-year professional medical training leading to the MBBS degree. Pre-clinical years (Levels 1–4) encompass rigorous cadaveric gross anatomy dissections, neuroanatomy, medical embryology, human physiology, and medical biochemistry. Successful completion of the first professional MB examinations transitions students into clinical hospital clerkships across internal medicine, general surgery, pediatrics, obstetrics and gynecology, pathology, pharmacology, and community health. Clinical postings require bedside ward rounds, theatre surgical observations, emergency room calls, and diagnostic patient workups.',
    careerPaths: ['Consultant Surgeon', 'Cardiologist', 'Medical Director', 'Public Health Epidemiologist', 'Clinical Researcher'],
    firstYearCourses: [
      {
        code: 'MED 101',
        title: 'Gross Anatomy and Human Osteology',
        credits: 4,
        lecturer: 'Prof. (Dr.) Emeka Okpara (FWACS)',
        venue: 'College of Health Sciences Dissecting Hall',
        timeSlot: '08:30 - 10:30',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'What is the longest, strongest, and heaviest bone in the human skeleton?',
          options: ['Femur (thigh bone)', 'Humerus', 'Tibia', 'Fibula'],
          correctIndex: 0,
          explanation: 'The femur is the longest and strongest bone in the human body, bearing weight and locomotion.'
        }
      },
      {
        code: 'MED 103',
        title: 'Human Physiology & Cellular Homeostasis',
        credits: 3,
        lecturer: 'Dr. Fatima Bawa',
        venue: 'Faculty of Medicine LT 1',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'Which blood cell type lacks a nucleus in its mature human form to maximize oxygen transport?',
          options: ['Erythrocyte (Red Blood Cell)', 'Lymphocyte', 'Neutrophil', 'Monocyte'],
          correctIndex: 0,
          explanation: 'Mature human erythrocytes extrude their nuclei to maximize space for hemoglobin molecules.'
        }
      },
      {
        code: 'MED 105',
        title: 'Medical Biochemistry & Enzymatic Pathways',
        credits: 3,
        lecturer: 'Prof. Kayode Ogundipe',
        venue: 'Medical Sciences Lecture Hall A',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'Which cellular organelle is universally termed the powerhouse of the cell due to ATP generation via oxidative phosphorylation?',
          options: ['Mitochondria', 'Golgi apparatus', 'Endoplasmic reticulum', 'Lysosome'],
          correctIndex: 0,
          explanation: 'Mitochondria produce over 90% of cellular ATP via the electron transport chain.'
        }
      },
      {
        code: 'MED 107',
        title: 'Medical Embryology and Developmental Genetics',
        credits: 2,
        lecturer: 'Dr. (Mrs) Ngozi Madueke',
        venue: 'Anatomy Demonstration Room 2',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'Which primary germ layer gives rise to the human central nervous system and epidermis?',
          options: ['Ectoderm', 'Mesoderm', 'Endoderm', 'Blastocyst'],
          correctIndex: 0,
          explanation: 'The ectoderm differentiates into nervous tissues, brain, spinal cord, and epidermal skin.'
        }
      },
      {
        code: 'MED 109',
        title: 'Medical Ethics, Humanities & Community Health',
        credits: 2,
        lecturer: 'Dr. Haruna Aliyu',
        venue: 'College of Health Sciences Auditorium',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'The historical oath traditionally taken by physicians establishing medical confidentiality and non-maleficence is:',
          options: ['Hippocratic Oath', 'Nuremberg Code', 'Helsinki Declaration', 'Belmont Report'],
          correctIndex: 0,
          explanation: 'The Hippocratic Oath is the foundational ethics code for medical practitioners.'
        }
      }
    ]
  },
  {
    id: 'med_lab',
    name: 'Medical Laboratory Science',
    faculty: 'Medicine and Health Sciences',
    durationYears: 5,
    totalLevels: 10,
    codePrefix: 'MLS',
    description: 'A five-year clinical diagnostic science programme accredited by the Medical Laboratory Science Council of Nigeria (MLSCN). Students undergo rigorous theoretical and practical laboratory training across four core medical pillars: Clinical Chemistry (organ function profiles and enzyme assays), Medical Microbiology & Parasitology (bacterial cultures and antimicrobial susceptibility), Hematology & Blood Transfusion Science (blood grouping, crossmatching, and coagulation studies), and Histopathology (tissue processing and biopsy examination). Practical sessions emphasize quality control, clinical instrumentation, and hospital laboratory internship.',
    careerPaths: ['Licensed Medical Laboratory Scientist', 'Biomedical Diagnostic Specialist', 'Forensic Toxicologist', 'Transfusion Safety Officer', 'Research Laboratory Director'],
    firstYearCourses: [
      {
        code: 'MLS 101',
        title: 'Clinical Laboratory Instrumentation & Quality Control',
        credits: 3,
        lecturer: 'Dr. Chinedu Nwankwo',
        venue: 'Medical Sciences Lab Complex Room 3',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'A spectrophotometer in clinical laboratory analysis measures:',
          options: ['The intensity of light absorbed or transmitted by a sample', 'The electric voltage of ions', 'The viscosity of blood plasma', 'The blood pressure in capillaries'],
          correctIndex: 0,
          explanation: 'Spectrophotometry quantifies light absorption across specific wavelengths to measure chemical concentration.'
        }
      },
      {
        code: 'MLS 103',
        title: 'General Clinical Parasitology & Helminthology',
        credits: 3,
        lecturer: 'Prof. Comfort Bassey',
        venue: 'College of Health Sciences Lab 1',
        timeSlot: '08:30 - 10:00',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'Which species of protozoan parasite causes the most lethal form of falciparum malaria in Nigeria?',
          options: ['Plasmodium falciparum', 'Plasmodium vivax', 'Plasmodium malariae', 'Plasmodium ovale'],
          correctIndex: 0,
          explanation: 'Plasmodium falciparum is the deadliest malaria species responsible for severe complications.'
        }
      },
      {
        code: 'MLS 105',
        title: 'Hematology and Blood Transfusion Science',
        credits: 3,
        lecturer: 'Dr. (Mrs) Halima Gwandu',
        venue: 'MLS Hematology Laboratory',
        timeSlot: '13:00 - 14:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'Which anticoagulant is standardly used in purple-top vacutainer tubes for Full Blood Count (FBC)?',
          options: ['EDTA (Ethylenediaminetetraacetic acid)', 'Heparin', 'Sodium citrate', 'Potassium oxalate'],
          correctIndex: 0,
          explanation: 'EDTA chelates calcium ions to prevent clotting while preserving blood cell morphology for counting.'
        }
      },
      {
        code: 'MLS 107',
        title: 'Histotechnology and Tissue Processing Techniques',
        credits: 2,
        lecturer: 'Dr. Samuel Ekanem',
        venue: 'Histopathology Prep Room',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'What is the primary chemical fixative routinely used for preserving biopsy tissues in histology?',
          options: ['10% Neutral Buffered Formalin', 'Pure Ethanol', 'Liquid Nitrogen', 'Distilled water'],
          correctIndex: 0,
          explanation: '10% neutral buffered formalin preserves tissue architecture by crosslinking proteins.'
        }
      },
      {
        code: 'MLS 109',
        title: 'Clinical Chemistry and Organ Function Assays',
        credits: 2,
        lecturer: 'Dr. Folake Odusanya',
        venue: 'Clinical Chemistry Lab 2',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'Elevated serum levels of Alanine Aminotransferase (ALT) and Aspartate Aminotransferase (AST) indicate damage to:',
          options: ['Liver hepatocytes', 'Renal glomeruli', 'Pulmonary alveoli', 'Skeletal bone marrow'],
          correctIndex: 0,
          explanation: 'ALT and AST enzymes leak into blood circulation upon acute or chronic liver cell injury.'
        }
      }
    ]
  },

  // ==========================================
  // Faculty 5: Science and Computing
  // ==========================================
  {
    id: 'comp_sci',
    name: 'Computer Science',
    faculty: 'Science and Computing',
    durationYears: 4,
    totalLevels: 8,
    codePrefix: 'CSC',
    description: 'A modern four-year computing curriculum grounding students in theoretical computer science, algorithmic complexity, and practical software engineering. Coursework spans procedural and object-oriented programming (Python, C++, Java), discrete computational structures, database management systems (SQL & NoSQL), operating system architecture, computer networks, compiler design, cybersecurity principles, and artificial intelligence. Practical computing laboratory sessions involve software development, database schema modeling, algorithm benchmarking, and building a full-stack semester software project.',
    careerPaths: ['Full-Stack Software Engineer', 'Cloud Solutions Architect', 'Data Scientist / AI Engineer', 'Cybersecurity Specialist', 'Database Administrator'],
    firstYearCourses: [
      {
        code: 'CSC 101',
        title: 'Introduction to Computer Programming & Logic',
        credits: 3,
        lecturer: 'Dr. Oladipo Johnson',
        venue: 'Faculty of Science Computing Lab 1',
        timeSlot: '09:00 - 10:30',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
          options: ['O(log n)', 'O(n²)', 'O(1)', 'O(n!)'],
          correctIndex: 0,
          explanation: 'A balanced BST halves the search space each step, giving O(log n) time complexity.'
        }
      },
      {
        code: 'CSC 103',
        title: 'Discrete Structures & Computational Mathematics',
        credits: 3,
        lecturer: 'Prof. Maryam Bello',
        venue: 'Science Block LT B',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'In propositional logic, if P is TRUE and Q is FALSE, what is the truth value of "P implies Q" (P → Q)?',
          options: ['FALSE', 'TRUE', 'Indeterminate', 'Always true'],
          correctIndex: 0,
          explanation: 'A conditional implication (P → Q) is false only when the antecedent is true and the consequent is false.'
        }
      },
      {
        code: 'CSC 105',
        title: 'Object-Oriented Programming (Java / C++)',
        credits: 3,
        lecturer: 'Dr. Chukwuma Onuoha',
        venue: 'Computing Software Lab 2',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'The OOP principle that restricts direct access to object components and bundles data with methods is:',
          options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction'],
          correctIndex: 0,
          explanation: 'Encapsulation safeguards internal state by hiding implementation details behind public interfaces.'
        }
      },
      {
        code: 'CSC 107',
        title: 'Computer Architecture & Assembly Language',
        credits: 2,
        lecturer: 'Prof. Taiwo Shonibare',
        venue: 'Hardware Architecture Studio',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'In the von Neumann architecture, which CPU component performs arithmetic and logical operations?',
          options: ['Arithmetic Logic Unit (ALU)', 'Control Unit (CU)', 'Instruction Register', 'System Bus'],
          correctIndex: 0,
          explanation: 'The ALU executes mathematical calculations (addition, subtraction) and logical tests (AND, OR).'
        }
      },
      {
        code: 'CSC 109',
        title: 'Web Technologies and Internet Protocol Standards',
        credits: 2,
        lecturer: 'Engr. (Mrs) Blessing Danjuma',
        venue: 'Web Innovation Lab',
        timeSlot: '13:00 - 14:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'Which HTTP response status code indicates that a requested resource was successfully found and loaded?',
          options: ['200 OK', '404 Not Found', '500 Server Error', '301 Moved Permanently'],
          correctIndex: 0,
          explanation: 'HTTP 200 signifies standard success for an HTTP GET request.'
        }
      }
    ]
  },
  {
    id: 'microbio',
    name: 'Microbiology',
    faculty: 'Science and Computing',
    durationYears: 4,
    totalLevels: 8,
    codePrefix: 'MCB',
    description: 'A four-year laboratory-centric biological science degree examining microorganisms and their critical roles in human health, agriculture, and industrial biotechnology. The curriculum encompasses bacteriology, virology, mycology, microbial genetics, immunology, food and dairy microbiology, pharmaceutical microbiology, and environmental bioremediation. Laboratory coursework provides direct practical training in aseptic techniques, microbial culture isolation, Gram staining, biochemical identification, autoclave sterilization, and industrial fermentation analysis, preparing students for research and clinical diagnostic applications.',
    careerPaths: ['Microbiologist', 'Quality Assurance Manager in Food / Beverage', 'Pharmaceutical Scientist', 'Environmental Bioremediation Analyst', 'Immunology Research Associate'],
    firstYearCourses: [
      {
        code: 'MCB 101',
        title: 'General Microbiology & Microbial Diversity',
        credits: 3,
        lecturer: 'Prof. (Mrs) Ngozi Ume',
        venue: 'Microbiology Laboratory 2',
        timeSlot: '10:00 - 11:30',
        dayOfWeek: 2, // Tuesday
        sampleQuiz: {
          question: 'In Gram staining, Gram-positive bacteria retain crystal violet dye and appear purple because of their thick layer of:',
          options: ['Peptidoglycan', 'Lipopolysaccharide', 'Cellulose', 'Chitin'],
          correctIndex: 0,
          explanation: 'Thick peptidoglycan layers trap the crystal violet-iodine complex, giving a vivid purple stain.'
        }
      },
      {
        code: 'MCB 103',
        title: 'Introductory Mycology and Industrial Yeast Applications',
        credits: 2,
        lecturer: 'Dr. Ibrahim Sambo',
        venue: 'Science Block LT A',
        timeSlot: '08:30 - 10:00',
        dayOfWeek: 1, // Monday
        sampleQuiz: {
          question: 'Which yeast species is famously used in Nigerian bakeries and commercial brewing of beer?',
          options: ['Saccharomyces cerevisiae', 'Candida albicans', 'Aspergillus niger', 'Penicillium notatum'],
          correctIndex: 0,
          explanation: 'Saccharomyces cerevisiae is baker’s and brewer’s yeast, fermenting sugars to alcohol and CO2.'
        }
      },
      {
        code: 'MCB 105',
        title: 'Sterilization Techniques and Aseptic Methods',
        credits: 2,
        lecturer: 'Dr. Abubakar Jalo',
        venue: 'Science Block Practical Lab',
        timeSlot: '14:00 - 15:30',
        dayOfWeek: 4, // Thursday
        sampleQuiz: {
          question: 'What standard temperature and pressure are required in an autoclave to achieve complete steam sterilization?',
          options: ['121°C at 15 psi for 15-20 mins', '100°C at 0 psi for 5 mins', '200°C at 50 psi for 1 hour', '80°C at 10 psi for 30 mins'],
          correctIndex: 0,
          explanation: '121°C at 15 pounds per square inch of pressurized steam effectively kills endospores.'
        }
      },
      {
        code: 'MCB 107',
        title: 'Bacteriology and Bacterial Cell Physiology',
        credits: 3,
        lecturer: 'Prof. Emmanuel Chukwuma',
        venue: 'Microbiology Lab 1',
        timeSlot: '11:00 - 12:30',
        dayOfWeek: 3, // Wednesday
        sampleQuiz: {
          question: 'Bacteria reproduce asexually primarily through which rapid cellular division process?',
          options: ['Binary fission', 'Mitotic meiosis', 'Budding sporulation', 'Spontaneous generation'],
          correctIndex: 0,
          explanation: 'Binary fission involves DNA replication followed by cellular division into two identical daughter cells.'
        }
      },
      {
        code: 'MCB 109',
        title: 'Environmental Microbiology & Water Sanitation',
        credits: 2,
        lecturer: 'Dr. (Mrs) Amina Bello',
        venue: 'Science Block Seminar Hall 2',
        timeSlot: '13:00 - 14:30',
        dayOfWeek: 5, // Friday
        sampleQuiz: {
          question: 'Which organism serves as the standard coliform indicator for bacteriological quality testing of drinking water?',
          options: ['Escherichia coli', 'Staphylococcus aureus', 'Streptococcus pneumoniae', 'Bacillus subtilis'],
          correctIndex: 0,
          explanation: 'E. coli detection signifies fecal contamination and unsafe public drinking water.'
        }
      }
    ]
  }
];

export const FINANCIAL_BACKGROUNDS: {
  id: FinancialBackground;
  title: string;
  startingBalance: number;
  description: string;
  allowanceAmount: number;
}[] = [
  {
    id: 'stretched',
    title: 'Financially Stretched',
    startingBalance: 250000,
    description: 'Family funds are tight. You need to manage every Naira wisely, work campus student jobs, and watch food spending.',
    allowanceAmount: 20000
  },
  {
    id: 'working_class',
    title: 'Working-Class Family',
    startingBalance: 450000,
    description: 'Hardworking parents supporting your education. Modest allowances arrive when requested with careful budgeting.',
    allowanceAmount: 35000
  },
  {
    id: 'comfortable',
    title: 'Comfortable (Standard)',
    startingBalance: 650000,
    description: 'Stable civil service or business parents. Comfortable starting funds to afford decent housing, books, and transport.',
    allowanceAmount: 50000
  },
  {
    id: 'wealthy',
    title: 'Affluent / High-Earner',
    startingBalance: 1200000,
    description: 'Generous backing, allowing single-room private lodges, frequent keke trips, restaurant dining, and latest gadgets.',
    allowanceAmount: 100000
  }
];
