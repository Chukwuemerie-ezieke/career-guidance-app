# Career Guidance & University Selection App

**The Incubators Secondary Academy Ufuma** — Career Guidance & University Selection App

> *Your Future Starts Here — Discover Your Path*

A comprehensive web application that helps Nigerian SS3 students discover the right university course, JAMB subject combination, and career path based on their interests and academic strengths.

## Features

### Student Input Form (3-Step Process)
- **Step 1 — About You:** First name, class (SS3A-F), top 3 strongest subjects (17 WAEC subjects)
- **Step 2 — Interests:** 10 interest areas with checkboxes (technology, science, business, law, etc.)
- **Step 3 — Preferences:** University type (Federal/State/Private), preferred state (36 states + FCT), WAEC/NECO grade range
- Progress bar / step indicator throughout

### Career & Course Recommendation Engine
When students click "Find My Path," they receive 3 personalised recommendations including:
- Course name, description, and category
- **Why This Suits You** — personalised explanation linking their subjects and interests
- JAMB Subject Combination (Use of English + 3 subjects)
- O'Level Requirements (minimum WAEC/NECO grades)
- JAMB Cut-off Marks (Federal, State, Private — reflecting 2024/2025 policy: 160 min for federal, 140 for state)
- Top 5 Nigerian Universities offering the course (mix of federal, state, private)
- 5-7 Post-Graduate Career Paths
- Estimated Years of Study

### Course Explorer (Browse Mode)
- Browse all 35 Nigerian university courses alphabetically
- Search by course name or career
- Filter by category (Business, Engineering, Medical Sciences, etc.)
- Expandable cards showing full JAMB, O'Level, university, and career details

### Counsellor Dashboard
- Summary statistics: total students, unique courses recommended, top courses
- Filterable table of all student submissions
- Search by name or class
- Filter by recommended course
- Click to view any student's full result

### Save & Print / Share
- **Print PDF:** Browser print with formatted header — "The Incubators Secondary Academy Ufuma — Career Guidance Report"
- **WhatsApp Share:** Share results directly via WhatsApp
- **Copy Link:** Copy shareable result URL

### Design
- Green and white school colour theme
- "Powered by Harmony Digital Consults" branding
- Mobile-responsive for phone use
- Youth-friendly, accessible interface

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Express.js + SQLite (Drizzle ORM)
- **Build:** Vite
- **Fonts:** Plus Jakarta Sans + Nunito (Google Fonts)

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/career-guidance-app.git
cd career-guidance-app
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5000`

### Production Build

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Student input form (3-step wizard) |
| `/results/:id` | Personalised career guidance results |
| `/explore` | Browse all Nigerian university courses |
| `/dashboard` | Counsellor/admin dashboard |

## Course Database

The app includes 35 Nigerian university courses across 10 categories:
- Medical Sciences (Medicine, Pharmacy, Nursing, Dentistry, etc.)
- Engineering (Mechanical, Electrical, Civil, Computer, Petroleum)
- Business (Accounting, Banking & Finance, Marketing, Business Admin)
- Sciences (Biochemistry, Microbiology)
- Social Sciences (Economics, Political Science, Psychology, Sociology)
- Law
- Arts & Humanities (Mass Communication, English & Literary Studies, Fine Arts)
- Environmental Sciences (Architecture, Estate Management, Quantity Surveying, Geography)
- Agriculture
- Education

## Credits

- **School:** The Incubators Secondary Academy Ufuma
- **Developed by:** Harmony Digital Consults Ltd
- **Built with:** Perplexity Computer

## License

MIT
