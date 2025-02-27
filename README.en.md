# PBI - AI-Powered Business Intelligence Platform

PBI is a modern business intelligence platform that combines natural language processing with traditional database operations to make data analysis more intuitive and accessible.

## 🏗️ Tech Stack

### Frontend Technologies
- Next.js 13+ (App Router)
- TypeScript
- Ant Design & Ant Design Charts
- TailwindCSS
- ECharts
- ReactFlow
- PocketBase Client

### Key Features
- Natural Language to SQL Query
- Intelligent Data Visualization
- Database Schema Visualization
- Multi-Database Support (MySQL, PostgreSQL)
- Smart Question Recommendations
- Internationalization Support

## 📁 Project Structure

```
next/pbi/
├── src/
│   ├── app/                      # Next.js 13+ App Router Pages
│   │   ├── layout.tsx           # Root Layout Component
│   │   ├── client-layout.tsx    # Client Layout Component
│   │   ├── page.tsx            # Homepage
│   │   ├── api/                # API Routes
│   │   ├── login/              # Login Related Pages
│   │   ├── user/               # User Related Pages
│   │   ├── data/               # Data Management Pages
│   │   └── chart-analysis/     # Chart Analysis Pages
│   │
│   ├── components/              # Reusable Components
│   │   ├── ui/                 # Base UI Components
│   │   │   ├── LoadingButton.tsx  # Loading State Button
│   │   │   ├── PasteText.tsx      # Text Paste Component
│   │   │   ├── PulsingText.tsx    # Pulsing Animation Text
│   │   │   └── TextStream.tsx     # Text Streaming Display
│   │   │
│   │   ├── data/               # Data Related Components
│   │   │   ├── flow/           # Data Flow Diagrams
│   │   │   ├── DataBaseCard.tsx        # Database Card
│   │   │   ├── DataCSVCard.tsx         # CSV Data Card
│   │   │   ├── DataDatabaseCard.tsx    # Database Details Card
│   │   │   ├── DataSetCard.tsx         # Dataset Card
│   │   │   ├── DataSourceCard.tsx      # Data Source Card
│   │   │   ├── DatabaseSchemaCard.tsx  # Database Schema Card
│   │   │   └── DataSider.tsx           # Data Sidebar
│   │   │
│   │   ├── chat/               # Chat Related Components
│   │   │   ├── chatPipelines/  # Chat Processing Pipelines
│   │   │   ├── chatMessages/   # Message Type Components
│   │   │   ├── Chat.tsx              # Main Chat Component
│   │   │   ├── ChatInput.tsx         # Chat Input Box
│   │   │   ├── ChatMessage.tsx       # Chat Message
│   │   │   ├── ChatMessageContainer.tsx # Message Container
│   │   │   ├── QuickActionBar.tsx    # Quick Action Bar
│   │   │   └── type.tsx              # Type Definitions
│   │   │
│   │   ├── modals/             # Modal Components
│   │   │   ├── CreateDataSourceModal.tsx  # Create Data Source
│   │   │   ├── EditDataSourceModal.tsx    # Edit Data Source
│   │   │   ├── ImportCSVModal.tsx         # Import CSV
│   │   │   └── ShareModal.tsx             # Sharing Feature
│   │   │
│   │   ├── forms/              # Form Components
│   │   │   ├── DataSourceForm.tsx    # Data Source Form
│   │   │   ├── LoginForm.tsx         # Login Form
│   │   │   └── RegisterForm.tsx      # Registration Form
│   │   │
│   │   ├── LanguageSwitcher.tsx # Language Switcher
│   │   └── PageSider.tsx       # Page Sidebar Navigation
│   │
│   ├── contexts/               # React Contexts
│   │   ├── AuthContext.tsx     # Authentication Context
│   │   └── ThemeContext.tsx    # Theme Context
│   │
│   ├── hooks/                  # Custom Hooks
│   │   ├── useAuth.ts          # Authentication Hooks
│   │   ├── useDatabase.ts      # Database Operation Hooks
│   │   └── useChart.ts         # Chart Related Hooks
│   │
│   ├── locales/                # Internationalization Files
│   │   ├── en/                 # English Translations
│   │   └── zh/                 # Chinese Translations
│   │
│   └── utils/                  # Utility Functions
│       ├── api.ts              # API Request Wrapper
│       ├── auth.ts             # Authentication Utils
│       └── chart.ts            # Chart Utils
│
├── public/                     # Static Assets
└── package.json               # Project Dependencies
```

## 🔄 Core Feature Flows

### 1. Authentication Flow
- `app/login` → `components/forms/LoginForm` → `contexts/AuthContext`
- Uses PocketBase for user authentication
- Authentication state managed globally through AuthContext

### 2. Data Management Flow
- `app/data/page` → `components/data/DatabaseList`
- Database Connection Management: `components/modals/DatabaseModal`
- Table Browsing: `components/data/TableViewer`
- Uses hooks/useDatabase for database operations

### 3. Chart Analysis Flow
- `app/chart-analysis/page` → `components/chat/AnalysisChat`
- Natural Language Processing: `components/chat/QueryInput` → API
- Chart Generation: `components/chart/ChartRenderer`
- Uses ECharts and Ant Design Charts for visualization

### 4. Internationalization Implementation
- Uses i18n for translation management
- `components/LanguageSwitcher` handles language switching
- Translation files stored in `locales` directory

### 5. Data Flow
```
User Input → Natural Language Processing
    ↓
SQL Generation → Database Query
    ↓
Data Processing → Chart Recommendation
    ↓
Chart Rendering → User Interaction
```

## 🔄 Component Functionality

### UI Base Components
- `LoadingButton`: Button with loading state for async operations
- `PasteText`: Text input component with paste and formatting support
- `PulsingText`: Text component with pulse animation effect
- `TextStream`: Text component with streaming support for AI responses

### Data Management Components
- `DataBaseCard`: Basic display component for database connections
- `DataCSVCard`: CSV file import and preview component
- `DataDatabaseCard`: Detailed database information and operations
- `DataSetCard`: Dataset management and display
- `DatabaseSchemaCard`: Database schema visualization

### Chat System Components
- `Chat`: Core chat interface integrating all chat-related features
- `ChatInput`: Smart input box with autocompletion and suggestions
- `ChatMessage`: Chat message display supporting multiple message types
- `QuickActionBar`: Quick access bar for common functions

### Modal Components
- `CreateDataSourceModal`: Form interface for creating new data sources
- `EditDataSourceModal`: Configuration for existing data sources
- `ImportCSVModal`: CSV file import wizard
- `ShareModal`: Data and chart sharing functionality

## 🚀 Getting Started

### Requirements
- Node.js 18+
- MySQL 8.0+ or PostgreSQL 14+
- PocketBase (for metadata storage)

### Installation Steps

1. Clone the repository and switch to the new branch:
```bash
git clone [repository-url]
cd pbi
git checkout clean-up
cd next/pbi
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000

## 🔧 Development Guide

### Code Standards
- Use TypeScript for type checking
- Use ESLint for code standard checking
- Use Prettier for code formatting

### Building for Production
```bash
pnpm build
pnpm start
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers. 