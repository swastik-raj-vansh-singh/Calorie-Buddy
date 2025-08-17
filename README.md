# NutriVision - Smart Food Recognition & Nutrition Tracker
 
A modern web application that combines computer vision and nutrition science to help users track their dietary intake through intelligent food recognition and comprehensive nutritional analysis.

## 🚀 Features

- **Smart Food Recognition**: Upload food images for automatic identification and nutritional analysis
- **Manual Food Entry**: Search and add foods from an extensive nutritional database
- **Weight Calculator**: Calculate nutritional values based on actual food weights
- **Progress Visualization**: Interactive charts showing nutritional trends and goal tracking
- **History Tracking**: Complete meal history with detailed nutritional breakdowns
- **User Authentication**: Secure account management with data persistence
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: React Router v6
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Modern web hosting with CDN

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutriVision
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Ensure Supabase configuration is properly set up
   - Verify API endpoints are accessible

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── FoodParser.tsx  # Food recognition component
│   ├── WeightCalculator.tsx
│   └── ...
├── pages/              # Application pages
├── services/           # API and external service integrations
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── data/               # Static data and configurations
```

## 🎯 Core Components

- **Food Recognition Engine**: Processes food images and identifies nutritional content
- **Nutritional Database**: Comprehensive food database with accurate nutritional information
- **Progress Analytics**: Advanced charting and trend analysis
- **User Management**: Secure authentication and profile management

## 🔒 Security Features

- Secure user authentication
- Data encryption in transit and at rest
- Privacy-focused design with user data protection
- Regular security updates and monitoring

## 🚀 Deployment

The application is optimized for modern web hosting platforms:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables as needed
4. Set up proper domain and SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, questions, or feature requests, please open an issue in the GitHub repository.
