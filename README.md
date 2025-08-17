# 🍎 CalorieBuddy - AI-Powered Nutrition Tracker

> **Transform your nutrition journey with intelligent food recognition, precise calorie tracking, and personalized insights.**

CalorieBuddy is a cutting-edge web application that combines artificial intelligence, computer vision, and nutrition science to revolutionize how you track and understand your dietary intake. Whether you're bulking, cutting, or maintaining, CalorieBuddy provides the tools you need to achieve your nutrition goals.

![CalorieBuddy Dashboard](https://via.placeholder.com/800x400/4f46e5/ffffff?text=CalorieBuddy+Dashboard)

## ✨ Key Features

### 🤖 **AI-Powered Food Recognition**
- **Smart Image Analysis**: Upload photos of your meals for instant food identification and nutritional breakdown
- **Complex Meal Parsing**: Describe multi-ingredient meals in natural language (e.g., "rice with dal and vegetables")
- **Intelligent Weight Estimation**: AI calculates portions and nutritional values from visual cues

### 📊 **Comprehensive Nutrition Tracking**
- **Calorie & Macro Monitoring**: Track calories, protein, carbs, fat, and fiber with precision
- **Goal-Based Tracking**: Set personalized goals for bulking, cutting, or maintenance
- **Real-Time Progress**: Live updates on daily nutrition goals with visual progress indicators

### 📈 **Advanced Analytics & Insights**
- **Interactive Charts**: Visualize your nutrition trends with beautiful, responsive charts
- **Historical Analysis**: Track progress over 7, 14, or 30-day periods
- **Meal Distribution**: Understand your eating patterns with detailed breakdowns
- **Trend Analysis**: Identify patterns and optimize your nutrition strategy

### 🔐 **Flexible User Experience**
- **Guest Mode**: Start tracking immediately without registration
- **Cloud Sync**: Sign up to sync data across devices and never lose progress
- **Mobile Responsive**: Perfect experience on desktop, tablet, and mobile devices
- **Offline Capable**: Continue tracking even without internet connection

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system for beautiful UI
- **shadcn/ui** component library for consistent, accessible components
- **Recharts** for interactive data visualizations

### **Backend & Services**
- **Supabase** for authentication, database, and real-time features
- **Google Gemini AI** for intelligent food recognition and analysis
- **TanStack Query** for efficient server state management
- **React Router v6** for seamless navigation

### **Development Tools**
- **TypeScript** for enhanced developer experience
- **ESLint** for code quality and consistency
- **PostCSS & Autoprefixer** for cross-browser compatibility

## 🚀 Quick Start Guide

### **Prerequisites**
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### **Installation Steps**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/calorie-buddy.git
   cd calorie-buddy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the environment template
   cp .env.example .env
   ```
   
   **Edit `.env` file with your API keys:**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key
   
   # Email Service (Optional)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   🎉 **Open [http://localhost:5173](http://localhost:5173) in your browser!**

5. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🔑 API Keys Setup

### **Required Services**

#### **1. Supabase (Database & Authentication)**
1. Visit [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API** 
4. Copy your **Project URL** and **anon/public key**

#### **2. Google Gemini AI (Food Recognition)**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Enable the Gemini API for your project

#### **3. Resend (Email - Optional)**
1. Visit [resend.com](https://resend.com) for email notifications
2. Create an account and generate an API key

## 📱 How to Use CalorieBuddy

### **Getting Started**
1. **Welcome Screen**: Enter your name to begin your nutrition journey
2. **Goal Setting**: Set your daily calorie and protein targets
3. **Choose Your Goal**: Select between bulking (gain weight) or cutting (lose weight)

### **Tracking Your Meals**

#### **Method 1: Image Recognition** 📸
1. Click the **camera icon** in the meal section
2. Upload a photo of your food
3. AI automatically identifies and calculates nutrition
4. Review and confirm the results

#### **Method 2: Smart Text Input** ✍️
1. Type your meal description (e.g., "chicken breast with rice and broccoli")
2. AI parses complex meals and calculates individual components
3. Adjust portions using the weight calculator

#### **Method 3: Quick Add** ⚡
1. Use quick suggestions for common foods
2. Enter specific weights for precise tracking
3. Add meals to breakfast, lunch, dinner, or snacks

### **Monitoring Progress**
- **Dashboard**: Real-time view of daily goals and progress
- **Visualize**: Interactive charts showing nutrition trends
- **History**: Complete log of all meals and daily summaries

## 🏗️ Project Architecture

```
calorie-buddy/
├── 📁 public/                 # Static assets
├── 📁 src/
│   ├── 📁 components/         # React components
│   │   ├── 📁 ui/            # Base UI components (shadcn/ui)
│   │   ├── 📄 FoodParser.tsx      # AI meal parsing
│   │   ├── 📄 ImageFoodRecognition.tsx  # Image analysis
│   │   ├── 📄 WeightCalculator.tsx      # Portion calculator
│   │   ├── 📄 VisualizeSection.tsx      # Analytics charts
│   │   └── 📄 HistorySection.tsx        # Meal history
│   ├── 📁 pages/             # Application pages
│   │   ├── 📄 Index.tsx           # Main dashboard
│   │   ├── 📄 Auth.tsx            # Authentication
│   │   └── 📄 NotFound.tsx        # 404 page
│   ├── 📁 services/          # External API integrations
│   │   ├── 📄 geminiService.ts         # AI food analysis
│   │   ├── 📄 inputParsingService.ts   # Text parsing
│   │   └── 📄 supabaseDataService.ts   # Database operations
│   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📄 useAuth.tsx          # Authentication logic
│   │   ├── 📄 use-toast.ts         # Toast notifications
│   │   └── 📄 use-mobile.tsx       # Mobile detection
│   ├── 📁 integrations/      # Third-party integrations
│   │   └── 📁 supabase/           # Supabase configuration
│   ├── 📁 lib/               # Utility functions
│   └── 📁 data/              # Static data and food database
├── 📄 .env.example           # Environment variables template
├── 📄 package.json           # Dependencies and scripts
├── 📄 tailwind.config.js     # Tailwind CSS configuration
├── 📄 vite.config.ts         # Vite build configuration
└── 📄 README.md              # This file
```

## 🎯 Core Features Deep Dive

### **AI Food Recognition Engine**
- **Computer Vision**: Advanced image processing to identify food items
- **Nutritional Database**: Access to comprehensive food nutrition data
- **Portion Estimation**: Smart algorithms to estimate serving sizes from images
- **Multi-Food Detection**: Recognize multiple food items in a single image

### **Smart Meal Parsing**
- **Natural Language Processing**: Understand complex meal descriptions
- **Ingredient Separation**: Break down meals into individual components
- **Cooking Method Recognition**: Account for preparation methods affecting nutrition
- **Quantity Intelligence**: Parse weights, volumes, and serving descriptions

### **Personalized Analytics**
- **Goal Tracking**: Monitor progress toward calorie and protein targets
- **Trend Analysis**: Identify patterns in eating habits over time
- **Meal Distribution**: Understand calorie distribution across meal types
- **Progress Insights**: AI-powered recommendations for goal achievement

### **Data Management**
- **Local Storage**: Guest mode with browser-based data persistence
- **Cloud Sync**: Authenticated users get cross-device synchronization
- **Export Options**: Download your data in various formats
- **Privacy First**: Your data remains secure and private

## 🔒 Security & Privacy

### **Data Protection**
- **Encryption**: All data transmitted using HTTPS/TLS encryption
- **Secure Authentication**: Industry-standard OAuth and JWT tokens
- **Privacy by Design**: Minimal data collection with user consent
- **GDPR Compliant**: Respect for user privacy and data rights

### **API Security**
- **Environment Variables**: Sensitive keys stored securely
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Sanitization of all user inputs
- **Error Handling**: Secure error messages without data leakage

## 🚀 Deployment Guide

### **Development Deployment**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

### **Production Deployment**

#### **Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### **Option 2: Netlify**
```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
# Configure environment variables in Netlify dashboard
```

#### **Option 3: Traditional Hosting**
```bash
# Build for production
npm run build

# Upload dist/ folder to your web server
# Configure environment variables on your server
```

### **Environment Variables for Production**
Ensure these are set in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `RESEND_API_KEY` (optional)

## 🧪 Testing & Development

### **Available Scripts**
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code for errors and style issues
npm run lint

# Type checking
npm run type-check
```

### **Development Workflow**
1. **Feature Development**: Create feature branches from `main`
2. **Code Quality**: Use ESLint and TypeScript for code quality
3. **Testing**: Manual testing across different devices and browsers
4. **Build Verification**: Test production builds before deployment

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Make** your changes with clear, descriptive commits
5. **Test** your changes thoroughly
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Submit** a Pull Request with a clear description

### **Contribution Guidelines**
- **Code Style**: Follow existing TypeScript and React patterns
- **Commits**: Use clear, descriptive commit messages
- **Documentation**: Update README and comments for new features
- **Testing**: Ensure your changes don't break existing functionality

### **Areas for Contribution**
- 🐛 **Bug Fixes**: Help identify and fix issues
- ✨ **New Features**: Add new functionality or improve existing features
- 📚 **Documentation**: Improve guides, comments, and examples
- 🎨 **UI/UX**: Enhance the user interface and experience
- 🔧 **Performance**: Optimize loading times and responsiveness

## 📊 Roadmap

### **Upcoming Features**
- 🍽️ **Recipe Management**: Save and track custom recipes
- 👥 **Social Features**: Share progress with friends and family
- 📱 **Mobile App**: Native iOS and Android applications
- 🏃 **Exercise Integration**: Connect with fitness trackers
- 🥗 **Meal Planning**: AI-powered meal suggestions and planning
- 📈 **Advanced Analytics**: More detailed nutrition insights

### **Long-term Vision**
- 🤖 **Personalized AI Coach**: Custom nutrition recommendations
- 🌍 **Multi-language Support**: Global accessibility
- 🏥 **Health Integration**: Connect with healthcare providers
- 📊 **Advanced Reporting**: Detailed nutrition reports and trends

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What this means:**
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify and adapt the code
- ✅ **Distribution**: Share and distribute the software
- ✅ **Private Use**: Use for personal projects
- ❗ **Attribution**: Include the original license and copyright notice

## 🆘 Support & Community

### **Getting Help**
- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/calorie-buddy/issues) on GitHub
- 💡 **Feature Requests**: [Suggest new features](https://github.com/yourusername/calorie-buddy/issues) via GitHub issues
- 💬 **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/calorie-buddy/discussions)

### **Community Guidelines**
- Be respectful and inclusive
- Provide clear, detailed information when asking for help
- Search existing issues before creating new ones
- Use appropriate labels and templates for issues

## 🙏 Acknowledgments

### **Technologies & Libraries**
- **React Team** for the amazing React framework
- **Vercel** for the incredible Vite build tool
- **Tailwind Labs** for the utility-first CSS framework
- **shadcn** for the beautiful UI component library
- **Supabase** for the backend-as-a-service platform
- **Google** for the Gemini AI API

### **Inspiration**
CalorieBuddy was inspired by the need for a more intelligent, user-friendly approach to nutrition tracking that leverages modern AI capabilities while maintaining simplicity and accessibility.

---

<div align="center">

**Made with ❤️ for a healthier world**

[🌟 Star this project](https://github.com/yourusername/calorie-buddy) • [🐛 Report Bug](https://github.com/yourusername/calorie-buddy/issues) • [✨ Request Feature](https://github.com/yourusername/calorie-buddy/issues)

</div>
