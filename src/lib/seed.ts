// Sample data, copied from the desktop app (src/lib/seed.ts) so both apps look the same.
import { format, subDays, addDays } from 'date-fns'
import type { AppData, Area, Topic, TopicStatus } from './types'
import { uid } from './utils'

export const DEFAULT_SETTINGS: AppData['settings'] = {
  theme: 'system',
  name: '',
  weeklyGoalHours: 8,
  accent: 'periwinkle'
}

const ROADMAP: { area: Omit<Area, 'id'>; topics: [string, TopicStatus][] }[] = [
  {
    area: { name: 'Networking', icon: 'network', color: 'var(--c-slate)', description: 'How computers talk to each other.' },
    topics: [
      ['OSI and TCP/IP models', 'done'],
      ['IP addresses and subnets', 'done'],
      ['TCP, UDP and ports', 'learning'],
      ['DNS, DHCP and HTTP', 'learning'],
      ['Wireshark packet analysis', 'todo'],
      ['Firewalls, NAT and VPNs', 'todo']
    ]
  },
  {
    area: { name: 'Linux', icon: 'linux', color: 'var(--c-sand)', description: 'The command line and the OS most servers run.' },
    topics: [
      ['Files, folders and navigation', 'done'],
      ['Users, groups and permissions', 'done'],
      ['Processes and services', 'learning'],
      ['Package managers', 'done'],
      ['SSH and remote access', 'learning'],
      ['Logs and journalctl', 'todo']
    ]
  },
  {
    area: { name: 'Web security', icon: 'web', color: 'var(--c-rose)', description: 'Find and fix bugs in websites and APIs.' },
    topics: [
      ['HTTP requests and cookies', 'done'],
      ['OWASP Top 10', 'learning'],
      ['SQL injection', 'learning'],
      ['Cross-site scripting (XSS)', 'todo'],
      ['Authentication and sessions', 'todo'],
      ['Burp Suite basics', 'todo']
    ]
  },
  {
    area: { name: 'Cryptography', icon: 'crypto', color: 'var(--c-mauve)', description: 'Keep data secret and prove who you are.' },
    topics: [
      ['Encoding vs hashing vs encryption', 'done'],
      ['Symmetric encryption (AES)', 'todo'],
      ['Public key crypto (RSA, ECC)', 'todo'],
      ['TLS and certificates', 'todo'],
      ['Password hashing and cracking', 'todo']
    ]
  },
  {
    area: { name: 'Pentesting', icon: 'pentest', color: 'var(--c-clay)', description: 'Attack systems (with permission) to find weak spots.' },
    topics: [
      ['Methodology and scope', 'learning'],
      ['Recon and Nmap', 'done'],
      ['Enumeration', 'todo'],
      ['Exploitation with Metasploit', 'todo'],
      ['Linux privilege escalation', 'todo'],
      ['Windows privilege escalation', 'todo'],
      ['Report writing', 'todo']
    ]
  },
  {
    area: { name: 'Blue team / SOC', icon: 'blue', color: 'var(--c-periwinkle)', description: 'Detect, investigate and respond to attacks.' },
    topics: [
      ['Security monitoring basics', 'todo'],
      ['SIEM (Splunk / Elastic)', 'todo'],
      ['Log analysis', 'todo'],
      ['Incident response steps', 'todo'],
      ['Threat intelligence and MITRE ATT&CK', 'todo']
    ]
  },
  {
    area: { name: 'Cloud security', icon: 'cloud', color: 'var(--c-teal)', description: 'Secure AWS, Azure and other cloud platforms.' },
    topics: [
      ['Cloud basics and shared responsibility', 'todo'],
      ['IAM: users, roles, policies', 'todo'],
      ['Storage buckets and leaks', 'todo'],
      ['Cloud logging and monitoring', 'todo']
    ]
  },
  {
    area: { name: 'Scripting', icon: 'code', color: 'var(--c-olive)', description: 'Python and Bash to automate your work.' },
    topics: [
      ['Bash basics and pipes', 'done'],
      ['Python basics', 'learning'],
      ['Python for networking (sockets, requests)', 'todo'],
      ['Write a simple port scanner', 'todo'],
      ['Regex for log parsing', 'todo']
    ]
  }
]

export function createRoadmap(withProgress: boolean): { areas: Area[]; topics: Topic[] } {
  const areas: Area[] = []
  const topics: Topic[] = []
  const now = new Date().toISOString()
  for (const r of ROADMAP) {
    const area: Area = { ...r.area, id: uid(), sample: true }
    areas.push(area)
    for (const [title, status] of r.topics) {
      topics.push({
        id: uid(),
        areaId: area.id,
        title,
        status: withProgress ? status : 'todo',
        notes: '',
        updatedAt: now,
        sample: true
      })
    }
  }
  return { areas, topics }
}

const d = (n: number): string => format(subDays(new Date(), n), 'yyyy-MM-dd')
const f = (n: number): string => format(addDays(new Date(), n), 'yyyy-MM-dd')

export function createSampleData(): AppData {
  const { areas, topics } = createRoadmap(true)
  const area = (name: string): string | undefined => areas.find((a) => a.name === name)?.id
  const topic = (title: string): string | undefined => topics.find((t) => t.title === title)?.id
  const now = new Date().toISOString()

  const logs: AppData['logs'] = [
    {
      date: d(0),
      title: 'SQL injection: UNION attacks',
      minutes: 75,
      tags: ['web', 'portswigger'],
      topicId: topic('SQL injection'),
      body: `## What I did\n- Did 2 PortSwigger labs about **UNION** attacks\n- Learned how to find the number of columns with \`ORDER BY\`\n\n## Key idea\n\`\`\`sql\n' UNION SELECT username, password FROM users--\n\`\`\`\n\n## Next\n- [ ] Try the blind SQLi labs\n- [x] Write notes about comments in different databases`
    },
    {
      date: d(1),
      title: 'Bandit levels 8 to 12',
      minutes: 60,
      tags: ['linux', 'overthewire'],
      topicId: topic('Processes and services'),
      body: `Used \`sort\`, \`uniq -u\`, \`strings\` and \`base64 -d\`.\n\n> Tip: \`tr 'A-Za-z' 'N-ZA-Mn-za-m'\` is ROT13.`
    },
    {
      date: d(2),
      title: 'Subnetting practice',
      minutes: 45,
      tags: ['networking'],
      topicId: topic('IP addresses and subnets'),
      body: `Practised /24, /26 and /28 networks.\n\n| CIDR | Hosts |\n|---|---|\n| /24 | 254 |\n| /26 | 62 |\n| /28 | 14 |`
    },
    {
      date: d(3),
      title: 'Nmap scan types',
      minutes: 90,
      tags: ['pentest', 'tryhackme'],
      topicId: topic('Recon and Nmap'),
      body: `- \`-sS\` SYN scan (needs root)\n- \`-sV\` service versions\n- \`-sC\` default scripts\n- \`-p-\` all ports`
    },
    {
      date: d(4),
      title: 'Python basics: lists and loops',
      minutes: 40,
      tags: ['python'],
      topicId: topic('Python basics'),
      body: 'Finished chapter 4 of *Automate the Boring Stuff*.'
    },
    {
      date: d(6),
      title: 'Linux permissions deep dive',
      minutes: 50,
      tags: ['linux'],
      topicId: topic('Users, groups and permissions'),
      body: 'SUID, SGID and the sticky bit. `find / -perm -4000 2>/dev/null` finds SUID files.'
    },
    {
      date: d(8),
      title: 'OWASP Top 10 overview',
      minutes: 35,
      tags: ['web', 'owasp'],
      topicId: topic('OWASP Top 10'),
      body: 'Read the list. Broken access control is number 1.'
    },
    {
      date: d(9),
      title: 'Hashing vs encryption',
      minutes: 30,
      tags: ['crypto'],
      topicId: topic('Encoding vs hashing vs encryption'),
      body: 'Hashing is one way. Encryption can be reversed with the key. Base64 is only encoding!'
    },
    {
      date: d(11),
      title: 'TCP three-way handshake',
      minutes: 55,
      tags: ['networking', 'wireshark'],
      topicId: topic('TCP, UDP and ports'),
      body: 'SYN → SYN/ACK → ACK. Looked at it in Wireshark.'
    },
    {
      date: d(13),
      title: 'Security+ chapter 1',
      minutes: 70,
      tags: ['security+'],
      body: 'CIA triad, AAA, and security controls.'
    },
    {
      date: d(16),
      title: 'Bash pipes and redirects',
      minutes: 40,
      tags: ['bash'],
      topicId: topic('Bash basics and pipes'),
      body: '`>`, `>>`, `2>&1`, `|` and `xargs`.'
    },
    {
      date: d(19),
      title: 'Started my journey',
      minutes: 25,
      tags: ['planning'],
      body: '# Day one\nI made a plan and set up a Kali VM. Let us go!'
    }
  ].map((l) => ({ ...l, id: uid(), createdAt: now, sample: true }))

  const resources: AppData['resources'] = [
    {
      title: 'TryHackMe',
      kind: 'platform',
      url: 'https://tryhackme.com',
      status: 'doing',
      areaId: area('Pentesting'),
      free: true,
      notes: 'Guided rooms. Start with the Pre Security path.'
    },
    {
      title: 'Hack The Box',
      kind: 'platform',
      url: 'https://www.hackthebox.com',
      status: 'todo',
      areaId: area('Pentesting'),
      free: true,
      notes: 'Harder boxes. Try Starting Point first.'
    },
    {
      title: 'PortSwigger Web Security Academy',
      kind: 'course',
      url: 'https://portswigger.net/web-security',
      status: 'doing',
      areaId: area('Web security'),
      free: true,
      notes: 'Best free web security labs.'
    },
    {
      title: 'OverTheWire: Bandit',
      kind: 'platform',
      url: 'https://overthewire.org/wargames/bandit/',
      status: 'doing',
      areaId: area('Linux'),
      free: true,
      notes: 'Learn Linux by playing.'
    },
    { title: 'picoCTF', kind: 'platform', url: 'https://picoctf.org', status: 'todo', free: true, notes: 'Beginner CTF practice.' },
    {
      title: 'Professor Messer Security+ (SY0-701)',
      kind: 'video',
      url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/',
      status: 'doing',
      free: true,
      notes: 'Free video course for Security+.'
    },
    {
      title: 'The Linux Command Line',
      kind: 'book',
      url: 'https://linuxcommand.org/tlcl.php',
      status: 'todo',
      areaId: area('Linux'),
      free: true,
      notes: 'Free book by William Shotts.'
    },
    {
      title: 'Automate the Boring Stuff with Python',
      kind: 'book',
      url: 'https://automatetheboringstuff.com',
      status: 'doing',
      areaId: area('Scripting'),
      free: true,
      notes: 'Free to read online.'
    },
    {
      title: 'OWASP Top 10',
      kind: 'article',
      url: 'https://owasp.org/www-project-top-ten/',
      status: 'done',
      areaId: area('Web security'),
      free: true,
      notes: ''
    },
    {
      title: 'CyberChef',
      kind: 'tool',
      url: 'https://gchq.github.io/CyberChef/',
      status: 'done',
      areaId: area('Cryptography'),
      free: true,
      notes: 'Encode, decode and convert data.'
    },
    {
      title: 'GTFOBins',
      kind: 'tool',
      url: 'https://gtfobins.github.io',
      status: 'todo',
      areaId: area('Pentesting'),
      free: true,
      notes: 'Linux binaries for privilege escalation.'
    },
    {
      title: 'CyberDefenders',
      kind: 'platform',
      url: 'https://cyberdefenders.org',
      status: 'todo',
      areaId: area('Blue team / SOC'),
      free: true,
      notes: 'Blue team labs.'
    },
    {
      title: 'flAWS.cloud',
      kind: 'platform',
      url: 'http://flaws.cloud',
      status: 'todo',
      areaId: area('Cloud security'),
      free: true,
      notes: 'Learn AWS mistakes.'
    }
  ].map((r) => ({ ...(r as Omit<AppData['resources'][number], 'id' | 'createdAt'>), id: uid(), createdAt: now, sample: true }))

  const labs: AppData['labs'] = [
    {
      name: 'Bandit levels 0–12',
      platform: 'OverTheWire',
      difficulty: 'easy',
      status: 'done',
      url: 'https://overthewire.org/wargames/bandit/',
      tags: ['linux'],
      areaId: area('Linux'),
      minutes: 180,
      date: d(1),
      writeup:
        '## Summary\nBasic Linux commands.\n\n## Useful commands\n- `find . -type f -size 1033c`\n- `grep -r millionth`\n- `ssh -i key bandit14@localhost -p 2220`'
    },
    {
      name: 'Nmap',
      platform: 'TryHackMe',
      difficulty: 'easy',
      status: 'done',
      url: 'https://tryhackme.com',
      tags: ['recon'],
      areaId: area('Pentesting'),
      minutes: 90,
      date: d(3),
      writeup: ''
    },
    {
      name: 'Linux Fundamentals 1–3',
      platform: 'TryHackMe',
      difficulty: 'easy',
      status: 'done',
      url: 'https://tryhackme.com',
      tags: ['linux'],
      areaId: area('Linux'),
      minutes: 150,
      date: d(7),
      writeup: ''
    },
    {
      name: 'SQLi UNION attack: find columns',
      platform: 'PortSwigger',
      difficulty: 'medium',
      status: 'done',
      url: 'https://portswigger.net/web-security/sql-injection/union-attacks',
      tags: ['sqli'],
      areaId: area('Web security'),
      minutes: 40,
      date: d(0),
      writeup: "## Steps\n1. Intercept the category request in Burp\n2. Add `' ORDER BY 1--` and count up\n3. Error at 4 → **3 columns**"
    },
    {
      name: 'Blue',
      platform: 'TryHackMe',
      difficulty: 'easy',
      status: 'doing',
      url: 'https://tryhackme.com',
      tags: ['windows', 'eternalblue'],
      areaId: area('Pentesting'),
      minutes: 45,
      writeup: 'Found MS17-010 with nmap scripts. Next: Metasploit.'
    },
    {
      name: 'General Skills pack',
      platform: 'picoCTF',
      difficulty: 'easy',
      status: 'doing',
      url: 'https://picoctf.org',
      tags: ['ctf'],
      minutes: 60,
      writeup: ''
    },
    {
      name: 'Lame',
      platform: 'Hack The Box',
      difficulty: 'easy',
      status: 'todo',
      url: 'https://www.hackthebox.com',
      tags: ['linux', 'smb'],
      areaId: area('Pentesting'),
      minutes: 0,
      writeup: ''
    },
    {
      name: 'Blind SQLi with conditional responses',
      platform: 'PortSwigger',
      difficulty: 'hard',
      status: 'todo',
      url: 'https://portswigger.net/web-security/sql-injection/blind',
      tags: ['sqli'],
      areaId: area('Web security'),
      minutes: 0,
      writeup: ''
    }
  ].map((l) => ({ ...(l as Omit<AppData['labs'][number], 'id' | 'createdAt'>), id: uid(), createdAt: now, sample: true }))

  const certs: AppData['certs'] = [
    {
      name: 'CompTIA Security+',
      provider: 'CompTIA',
      targetDate: f(120),
      progress: 35,
      status: 'studying',
      url: 'https://www.comptia.org/certifications/security',
      notes: 'Exam SY0-701. 90 questions, 90 minutes.'
    },
    { name: 'eJPT', provider: 'INE', targetDate: f(200), progress: 10, status: 'planned', url: 'https://ine.com', notes: 'Practical junior pentester exam.' },
    { name: 'OSCP', provider: 'OffSec', progress: 0, status: 'planned', url: 'https://www.offsec.com', notes: 'Long-term goal.' }
  ].map((c) => ({ ...(c as Omit<AppData['certs'][number], 'id'>), id: uid(), sample: true }))

  const goals: AppData['goals'] = [
    { title: 'Finish Bandit levels 13–20', deadline: f(5), done: false, areaId: area('Linux') },
    { title: 'Do 5 PortSwigger SQL injection labs', deadline: f(12), done: false, areaId: area('Web security') },
    { title: 'Write a port scanner in Python', deadline: f(21), done: false, areaId: area('Scripting') },
    { title: 'Book the Security+ exam', deadline: f(60), done: false },
    { title: 'Set up a Kali Linux VM', deadline: d(18), done: true, doneAt: d(19) }
  ].map((g) => ({ ...(g as Omit<AppData['goals'][number], 'id' | 'createdAt'>), id: uid(), createdAt: now, sample: true }))

  return { version: 1, settings: { ...DEFAULT_SETTINGS }, areas, topics, logs, resources, labs, certs, goals }
}
