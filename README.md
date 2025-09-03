# RAG Assistant Frontend

A sophisticated TypeScript React frontend for the RAG API, featuring a modern chat interface, document management, and comprehensive settings configuration.

## 🚀 Features

### 💬 **Advanced Chat Interface**
- **Real-time messaging** with RAG-powered responses
- **Chat history persistence** using local storage with session management
- **Message metadata display** showing documents retrieved, processing time, and search type
- **Auto-scrolling** and typing indicators
- **Responsive design** for all device sizes

### 📚 **Document Management**
- **Drag & drop file upload** with visual feedback
- **Multiple file format support**: PDF, DOCX, TXT, MD
- **File validation** with size and type checking
- **Upload progress tracking** and status management
- **Bulk operations** for document management

### ⚙️ **Comprehensive Settings**
- **OpenAI Model Selection**: Choose from GPT-4o, GPT-4o Mini, and GPT-3.5 Turbo
- **Temperature Control**: Fine-tune creativity with slider and preset options
- **Search Strategy**: Configure hybrid, semantic, or keyword search
- **Real-time preview** of current configuration
- **Settings persistence** across sessions

### 🔄 **Session Management**
- **Multiple chat sessions** with independent settings
- **Session export/import** functionality
- **Session statistics** and metadata
- **Easy session switching** and management

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful icons
- **React Dropzone** for file uploads
- **React Hot Toast** for notifications
- **Date-fns** for date manipulation
- **Modern ES2020+** features

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.tsx     # Navigation and session management
│   │   ├── ChatInterface.tsx # Main chat functionality
│   │   ├── DocumentManager.tsx # Document upload and management
│   │   └── SettingsPanel.tsx # Settings configuration
│   ├── services/           # API and storage services
│   │   ├── api.ts         # Backend API communication
│   │   └── chatStorage.ts # Local storage management
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All interfaces and types
│   ├── constants/         # Application constants
│   │   └── index.ts       # Models, search types, etc.
│   ├── utils/             # Utility functions
│   │   └── index.ts       # Helper functions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend RAG API running on localhost:8000

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

### API Proxy

The development server is configured to proxy API requests to your backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 📱 Features in Detail

### Chat Interface
- **Message Types**: User and assistant messages with distinct styling
- **Metadata Display**: Shows processing time, documents retrieved, and search type
- **Auto-resize Input**: Textarea that grows with content
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Loading States**: Visual feedback during API calls

### Document Management
- **File Validation**: Checks file type and size before upload
- **Progress Tracking**: Visual upload progress indicators
- **Status Management**: Processing, ready, and error states
- **Bulk Operations**: Select and delete multiple documents
- **Drag & Drop**: Intuitive file upload interface

### Settings Panel
- **Model Selection**: Radio button interface with descriptions
- **Temperature Control**: Slider with preset options and descriptions
- **Search Strategy**: Visual selection with explanations
- **Real-time Preview**: Current configuration summary
- **Change Tracking**: Visual indicators for unsaved changes

### Session Management
- **Session Creation**: Easy creation of new chat sessions
- **Session Switching**: Quick navigation between sessions
- **Session Export**: Download chat history as JSON
- **Session Import**: Restore chat history from JSON files
- **Session Statistics**: Overview of total sessions and messages

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions and highlights
- **Secondary**: Gray shades for text and borders
- **Success**: Green for positive actions
- **Warning**: Yellow for caution states
- **Error**: Red for error states

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across device sizes

### Components
- **Cards**: Consistent border radius and shadows
- **Buttons**: Hover states and focus indicators
- **Inputs**: Focus rings and validation states
- **Animations**: Smooth transitions and micro-interactions

## 🔌 API Integration

### Backend Communication
- **Health Checks**: Monitors API connectivity
- **RAG Queries**: Sends conversation transcripts for AI responses
- **Search Type Updates**: Configures backend search strategies
- **Status Monitoring**: Tracks system health and configuration

### Error Handling
- **Network Errors**: Graceful fallbacks and user notifications
- **Validation Errors**: Clear feedback for invalid inputs
- **API Errors**: User-friendly error messages
- **Retry Logic**: Automatic retry for failed requests

## 📊 Performance Features

- **Code Splitting**: Lazy loading of components
- **Optimized Bundles**: Tree shaking and minification
- **Efficient Rendering**: React 18 concurrent features
- **Local Storage**: Fast access to chat history
- **Debounced Input**: Optimized user input handling

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (via ESLint)
- **Husky**: Git hooks for quality checks

## 🚀 Deployment

### Build Output
The build process creates optimized static files in the `dist/` directory.

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Container**: Docker with nginx
- **Server**: Node.js with serve package

### Environment Configuration
Ensure your production environment has the correct API URL:

```env
VITE_API_URL=https://your-api-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the browser console for errors
2. Verify backend API connectivity
3. Review the API documentation
4. Check environment variable configuration

---

**Built with ❤️ using modern web technologies**
