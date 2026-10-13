/* ==========================================================================
   EDIT THIS FILE to change anything on the site. No build step needed.

   - theme      colours for both the page and the 3D scenes
   - profile    name, email, links
   - sections   one entry per scroll station. The camera flies through them
                in order, so add, remove or reorder entries freely.
   - timeline   the jobs list (also drives the 3D helix)
   - skills     the grouped skills list
   - sphere     the words floating in the 3D skills sphere

   Each section picks a 3D scene with  scene: '<name>'.
   Available scenes:
     phone     Android phone with a live logcat screen
     headset   AR/VR headset, controllers, HUD panels, BLE pulses
     sync      two phones kept in sync by a shared waveform
     chain     ring of linked blockchain blocks
     agentapp  insurance app phone, shield and policy documents
     globe     globe with learner markers and arcs
     apps      four in-house app tiles
     book      open book with rising letters (educational app)
     helix     career helix, one node per timeline entry
     sphere    skills sphere
     toolbox   rotating cube lattice (used for services)
     knot      particle knot
     feed      floating post cards (used for the Notes section)

   Section fields (all optional except id and scene):
     id, nav (label in the top bar), side ('l' or 'r' for the text column),
     eyebrow, title, lede, body[], stats[{value,label}], more[], notes[],
     tags[], cta[{label,href,primary}], mono, sceneOptions{}
   Special types:  type:'hero' | 'timeline' | 'skills' | 'services' | 'projects' | 'testimonials' | 'posts' | 'contact'
   (services, projects and testimonials read the lists of the same name below and
   stay hidden while their list is empty)
   ========================================================================== */
window.PORTFOLIO = {
  theme: {
    ink: '#080c13',
    text: '#e8ecf3',
    mute: '#8d99ab',
    blue: '#4d8dff',
    amber: '#ffb347'
  },

  profile: {
    name: 'Himanshu Upadhyay',
    nameLines: ['Himanshu', 'Upadhyay'],
    role: 'Senior Android Engineer',
    location: 'Bengaluru, India',
    description: 'Senior Android Engineer in Bengaluru. Kotlin, Jetpack Compose, WebRTC and BLE. Previously at Meta and Sony India.',
    /* Your site address once you have a domain, e.g. 'https://himanshuupadhyay.dev'. Used for the RSS feed and sitemap. Leave empty on GitHub Pages: the workflow works it out. */
  siteUrl: '',
  email: 'uhimanshuu@gmail.com',
    emailSubject: 'Android project enquiry',   /* pre-filled subject of the "Email me" button */
    phone: '',                 /* leave empty to keep your number off the public page */
    /* Paste full URLs. Empty ones are hidden. You can add more keys:
       linkedin, github, gitlab, x, medium, youtube, stackoverflow, devto, upwork, toptal, fiverr, behance */
    links: { linkedin: '', github: '', upwork: '' },
    resumeUrl: '',             /* e.g. 'assets/Himanshu_Upadhyay_Resume.pdf' once you add the file */
    bookingUrl: '',            /* e.g. a Calendly or Cal.com link for "Book a call" */
    /* The green pill at the top of the page. Set show to false to hide it. */
    availability: { show: true, text: 'Open to freelance, part-time and full-time work' },
    /* Small facts shown in the contact panel: [label, value] */
    facts: [
      ['Based in', 'Bengaluru, India (IST, UTC+5:30)'],
      ['Languages', 'English, Hindi'],
      ['Engagements', 'Freelance projects, part-time contracts, full-time roles']
    ],
    credit: 'Built with three.js'
  },

  sections: [
    {
      id: 'top', type: 'hero', scene: 'phone', side: 'l',
      eyebrow: 'Android engineer · Bengaluru, India',
      lede: 'I build Android apps that talk to hardware, stream in real time and keep working on a bad connection.',
      tags: ['Kotlin', 'Jetpack Compose', 'WebRTC', 'BLE'],
      cta: [
        { label: 'Work with me', href: '#hire', primary: true },
        { label: 'See the work', href: '#meta' }
      ],
      mono: '7+ years · led a team of 5 · Meta, Sony India',
      sceneOptions: { title: 'Provisioning' }
    },
    {
      id: 'meta', nav: 'Work', scene: 'headset',
      eyebrow: '2024 – 2025 · Accenture, for Meta',
      title: 'Setting up AR/VR devices from a phone',
      body: ['I led Android work on the tooling that provisions and configures AR/VR devices over BLE, Bluetooth and Wi-Fi Direct, written in Kotlin and Jetpack Compose.'],
      stats: [
        { value: '50–100', label: 'device models' },
        { value: '5K–10K', label: 'internal users' },
        { value: '100+', label: 'defects fixed per release' }
      ],
      more: ['I root-caused connectivity bugs across 4 to 5 regions with ADB, logcat and system logs, gated each release on Espresso tests through GitHub Actions and GitLab CI, and ran code reviews for a team of 5.'],
      notes: ['In parallel I delivered the Android module for the Metrolinx travel project with Compose and WorkManager.'],
      sceneOptions: {
        devices: 64,
        panels: [['BLE pairing', ['scan', 'connect', 'configure']], ['Wi-Fi Direct', ['group', 'handoff', 'verify']]]
      }
    },
    {
      id: 'sony', scene: 'sync',
      eyebrow: '2021 – 2024 · Wipro, for Sony India',
      title: 'Watching together, in sync',
      body: ['I shipped cross-device watch-party sync for a live-streaming product and built WebRTC audio and video communication on top of backend REST APIs.'],
      stats: [
        { value: '<150 ms', label: 'sync drift across devices' },
        { value: '12% → 4%', label: 'crash rate after Crashlytics fixes and TDD' }
      ],
      more: ['Offline-first data with Room and WorkManager, key screens moved to Jetpack Compose, TalkBack and contrast fixes, R8 shrinking, and ownership of Play Store releases.']
    },
    {
      id: 'web3', scene: 'chain',
      eyebrow: '2021 – 2024 · Wipro, for Sony India',
      title: 'Digital identity on the blockchain',
      body: ['On the Mocopi NFT project I integrated blockchain-based digital identity features on mobile devices.'],
      more: ['Blockchain also ran through my teaching, where I covered the fundamentals using what I learned in production. I hold the Certified Web3 Associate and Certified Hyperledger certificates.'],
      tags: ['Ethereum', 'Hyperledger', 'NFT'],
      sceneOptions: { labels: ['Ethereum', 'Hyperledger', 'NFT', 'Identity', 'Web3', 'Mocopi'] }
    },
    {
      id: 'fulcrum', scene: 'agentapp',
      eyebrow: '2020 – 2021 · Fulcrum Digital, Pune',
      title: 'An insurance app for field agents',
      body: ['I led end-to-end Android development of the Al Hilal Mobile Agent App, covering medical and life insurance workflows.'],
      stats: [
        { value: '500+', label: 'field agents using the app' }
      ],
      more: ['I built the Kotlin features for real-time data management in online policy processing and owned the API and web-service integration with the backend, which improved data-sync reliability.'],
      sceneOptions: { agents: 500 }
    },
    {
      id: 'trainer', scene: 'globe',
      eyebrow: '2020 · Freelance',
      title: 'Teaching Android to learners worldwide',
      body: ['I ran live Kotlin and Android training and designed the exercises and learning material for hands-on practice.'],
      stats: [
        { value: '500–1,000', label: 'learners' },
        { value: '4–5', label: 'countries' }
      ],
      sceneOptions: {
        /* [latitude, longitude]. The first is the hub, the rest are placeholders:
           set them to where your learners actually joined from. */
        markers: [[12.97, 77.59], [51.5, -0.12], [25.2, 55.27], [40.7, -74.0], [-33.87, 151.2]]
      }
    },
    {
      id: 'netconnect', scene: 'apps',
      eyebrow: '2018 – 2020 · NetConnect, Bengaluru',
      title: 'Internal apps people used every day',
      body: ['I built and maintained 4+ in-house Android apps for attendance, asset tracking, billing and internal operations.'],
      stats: [
        { value: '4+', label: 'in-house apps' },
        { value: '500+', label: 'employees using them' }
      ],
      more: ['I integrated REST APIs, fixed production crashes to improve stability, and shipped new features and UX improvements with backend and product stakeholders.'],
      sceneOptions: {
        apps: [['Attendance', 'calendar'], ['Asset tracking', 'barcode'], ['Billing', 'receipt'], ['Operations', 'gear']]
      }
    },
    {
      id: 'anytime', scene: 'book',
      eyebrow: '2017 – 2018 · Anytime Softcare, Noida',
      title: 'Where it started: Inkpot',
      body: ['I built Inkpot, a native Android educational content delivery app, end to end from scratch, and implemented the core mobile features and design patterns for in-house Android products.']
    },
    {
      id: 'career', type: 'timeline', nav: 'Career', scene: 'helix',
      eyebrow: 'Career',
      title: 'From Inkpot to AR/VR',
      mono: 'B.Tech Computer Science, Dr. APJ Abdul Kalam Technical University, 2016 · Certified Web3 Associate · Certified Hyperledger'
    },
    {
      id: 'skills', type: 'skills', nav: 'Skills', scene: 'sphere',
      eyebrow: 'Toolbox',
      title: 'What I work with'
    },
    /* Latest posts from js/posts.js. Hidden until you have at least one published post. */
    {
      id: 'notes', type: 'posts', nav: 'Notes', scene: 'feed', limit: 3,
      eyebrow: 'Notes',
      title: 'What I am building, month by month',
      body: ['A short log each month: what shipped, what broke, what I learned.'],
      cta: [{ label: 'All posts', href: 'blog.html', primary: true }, { label: 'RSS', href: 'feed.xml' }]
    },
    {
      id: 'hire', type: 'services', nav: 'Hire me', scene: 'toolbox',
      eyebrow: 'Work with me',
      title: 'Freelance, part-time or full-time',
      body: ['I take on Android projects alongside or instead of a day job. Tell me what you need shipped and I will tell you how I would approach it.']
    },
    /* Hidden until the "projects" list below has entries. */
    {
      id: 'projects', type: 'projects', nav: 'Projects', scene: 'phone',
      eyebrow: 'Selected projects',
      title: 'Things you can open and try',
      sceneOptions: { title: 'Projects' }
    },
    /* Hidden until the "testimonials" list below has entries. */
    {
      id: 'kind-words', type: 'testimonials', scene: 'knot',
      eyebrow: 'Kind words',
      title: 'What people say'
    },
    {
      id: 'contact', type: 'contact', nav: 'Contact', scene: 'knot',
      eyebrow: 'Contact',
      title: "Let's build something that ships",
      body: ['Talk to me about Android, real-time streaming or device connectivity.']
    }
  ],

  /* "Work with me" cards. Edit freely. */
  services: [
    { title: 'Android app development', text: 'Kotlin and Jetpack Compose apps with MVVM or MVI, offline-first data and clean architecture, from the first screen to the Play Store release.', tags: ['Kotlin', 'Compose', 'Play Store'] },
    { title: 'Companion apps for hardware', text: 'BLE, Bluetooth and Wi-Fi Direct pairing and provisioning for AR/VR and other connected devices.', tags: ['BLE', 'Wi-Fi Direct'] },
    { title: 'Real-time video and audio', text: 'WebRTC calls, live streaming and multi-device sync, wired to your backend APIs.', tags: ['WebRTC', 'Streaming'] },
    { title: 'Rescue and modernise', text: 'Crash and performance audits, Compose migration, test coverage and CI for an app that already exists.', tags: ['Crashlytics', 'Espresso', 'CI'] },
    { title: 'Training and code review', text: 'Live Kotlin and Android sessions for learners and teams, plus code reviews that raise the standard.', tags: ['Kotlin', 'Mentoring'] }
  ],

  /* Add projects you can show publicly. The section appears as soon as there is one entry.
     Template (copy, paste, fill in):
  projects: [
    { title: 'Compose offline notes', role: 'Personal project', text: 'One sentence on what it does and what was hard.',
      tags: ['Kotlin', 'Compose', 'Room'],
      links: [{ label: 'Code', href: 'https://github.com/you/repo' }, { label: 'Demo video', href: 'https://youtu.be/...' }] }
  ],
  */
  projects: [],

  /* Real quotes only, with permission. The section appears as soon as there is one entry.
     Template:
  testimonials: [
    { quote: 'What they said.', name: 'Their name', role: 'Their role, company' }
  ],
  */
  testimonials: [],

  /* Newest first. "short" is the label on the 3D helix node. */
  timeline: [
    { when: '07/2024 – 11/2025', short: '2024–25', role: 'Lead Android Engineer', org: 'Accenture, client Meta', text: 'AR/VR device provisioning at scale, team of 5.' },
    { when: '12/2021 – 05/2024', short: '2021–24', role: 'Senior Software Engineer', org: 'Wipro, client Sony India', text: 'WebRTC streaming, watch-party sync, Compose migration.' },
    { when: '12/2020 – 12/2021', short: '2020–21', role: 'Software Engineer', org: 'Fulcrum Digital, Pune', text: 'Led the Al Hilal Mobile Agent App for 500+ insurance field agents.' },
    { when: '02/2020 – 12/2020', short: '2020', role: 'Freelance Android Trainer', org: 'Self-employed, Bengaluru', text: 'Live Kotlin and Android training for 500 to 1,000 learners in 4 to 5 countries.' },
    { when: '06/2018 – 02/2020', short: '2018–20', role: 'Android Developer', org: 'NetConnect, Bengaluru', text: '4+ in-house apps used by 500+ employees.' },
    { when: '01/2017 – 01/2018', short: '2017–18', role: 'Android Developer', org: 'Anytime Softcare, Noida', text: 'Built Inkpot, an educational content app, from scratch.' }
  ],

  skills: [
    { group: 'Android', items: 'Kotlin, Java, Jetpack Compose, Room, Navigation, DataStore, WorkManager' },
    { group: 'Architecture', items: 'MVVM, MVI, Clean Architecture, Hilt/Dagger, offline-first design' },
    { group: 'Concurrency', items: 'Coroutines, Flow, LiveData' },
    { group: 'Real time', items: 'WebRTC, live streaming, audio/video sync, BLE, Bluetooth, Wi-Fi Direct' },
    { group: 'Testing', items: 'JUnit, Mockito, Espresso, TDD' },
    { group: 'Quality', items: 'Profiling, memory leaks, ProGuard/R8, security, accessibility' },
    { group: 'Delivery', items: 'Gradle, GitHub Actions, GitLab CI, Play Store releases' },
    { group: 'Cloud, other', items: 'Firebase, Crashlytics, AWS, Node.js, Flutter, React.js, Ethereum, Hyperledger' }
  ],

  sphere: {
    words: ['Kotlin', 'Java', 'Jetpack Compose', 'Coroutines', 'Flow', 'Room', 'Hilt', 'WebRTC', 'BLE', 'Wi-Fi Direct',
            'MVVM', 'MVI', 'Clean Architecture', 'Retrofit', 'WorkManager', 'Espresso', 'Mockito', 'JUnit', 'Firebase',
            'Crashlytics', 'Gradle', 'GitHub Actions', 'GitLab CI', 'AWS', 'Node.js', 'Flutter', 'React.js', 'Blockchain', 'R8', 'TalkBack'],
    hot: ['Kotlin', 'Jetpack Compose', 'WebRTC', 'BLE', 'Clean Architecture']
  }
};
