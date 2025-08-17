# Design Document

## Overview

The Enhanced Food Search feature transforms the current multi-step food tracking process into a streamlined, intelligent system that provides instant nutrition data from natural language food descriptions. The system leverages OpenAI GPT-4o with carefully crafted prompts to deliver ChatGPT-quality responses for calorie estimation and meal parsing.

## Architecture

### System Flow
1. **Input Processing**: User enters food description in enhanced search bar
2. **AI Processing**: OpenAI GPT-4o processes input using structured prompt system
3. **Result Display**: Parsed nutrition data displayed with individual items
4. **Quick Add**: One-click addition to daily intake
5. **Edit Functionality**: Post-addition editing with real-time recalculation

### Component Hierarchy
```
Index (Main Dashboard)
├── EnhancedFoodSearch (New Component)
│   ├── SearchInput (Enhanced with tips)
│   ├── NutritionResults (Structured display)
│   └── QuickAddButtons (Per-item addition)
├── MealsList (Enhanced with edit functionality)
│   ├── MealItem (Enhanced with edit button)
│   └── MealEditor (New modal component)
└── DailyTotals (Updated calculation logic)
```

## Components and Interfaces

### 1. Enhanced OpenAI Service

**Purpose**: Implement ChatGPT-quality prompt system for accurate nutrition estimation

**Key Features**:
- Structured system prompt with few-shot examples
- Indian food portion normalization
- Vague input handling with intelligent defaults
- JSON response parsing with error handling

**Interface**:
```typescript
interface NutritionItem {
  name: string;
  quantity: number;
  unit: string;
  estimated_calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

interface NutritionResponse {
  items: NutritionItem[];
  total_calories: number;
  confidence: number;
}

class EnhancedOpenAIService {
  async parseAndEstimateNutrition(input: string): Promise<NutritionResponse>
}
```

### 2. EnhancedFoodSearch Component

**Purpose**: Replace current search functionality with intelligent, instant nutrition lookup

**Key Features**:
- Smart placeholder text with examples
- Real-time nutrition estimation
- Structured result display
- Individual item management

**Props**:
```typescript
interface EnhancedFoodSearchProps {
  onItemsAdded: (items: NutritionItem[], mealType: string) => void;
  selectedMealType: string;
}
```

### 3. MealEditor Component

**Purpose**: Provide editing functionality for already-added meals

**Key Features**:
- Pre-filled current values
- Real-time nutrition recalculation
- Quantity adjustment with unit support
- Save/cancel functionality

**Props**:
```typescript
interface MealEditorProps {
  meal: Meal;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMeal: Meal) => void;
}
```

### 4. Enhanced MealItem Component

**Purpose**: Add edit functionality to existing meal display

**Key Features**:
- Edit button integration
- Visual indicators for edited items
- Consistent styling with existing design

## Data Models

### Enhanced Meal Model
```typescript
interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  type: string;
  quantity: number;
  unit: string;
  originalQuantity?: number; // Track original for edit history
  isEdited?: boolean; // Flag for edited items
  aiEnhanced: boolean;
  timestamp: Date;
}
```

### Nutrition Calculation State
```typescript
interface NutritionState {
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  mealsByType: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
}
```

## Error Handling

### API Error Management
- **Network Failures**: Graceful fallback to cached responses or manual input
- **Rate Limiting**: Queue system with user feedback
- **Invalid Responses**: Fallback parsing with confidence indicators
- **Timeout Handling**: Progressive timeout with retry logic

### User Experience
- **Loading States**: Skeleton loaders during AI processing
- **Error Messages**: Clear, actionable error descriptions
- **Fallback Options**: Manual input when AI fails
- **Offline Support**: Cached common foods for offline use

## Testing Strategy

### Unit Tests
- OpenAI service response parsing
- Nutrition calculation accuracy
- Meal editing logic
- State management functions

### Integration Tests
- End-to-end food search flow
- Meal addition and editing workflow
- Daily totals calculation accuracy
- Cross-component data flow

### User Acceptance Tests
- Natural language input parsing accuracy
- Edit functionality usability
- Performance with various input types
- Mobile responsiveness

## Performance Considerations

### Optimization Strategies
- **Debounced Search**: Prevent excessive API calls during typing
- **Response Caching**: Cache common food combinations
- **Lazy Loading**: Load meal editor only when needed
- **Memoization**: Cache nutrition calculations

### Monitoring
- API response times
- User interaction patterns
- Error rates and types
- Search accuracy feedback

## Security Considerations

### API Key Protection
- Environment variable usage
- Rate limiting implementation
- Request validation
- Error message sanitization

### Data Privacy
- No sensitive data in API requests
- Local storage encryption for cached data
- User consent for AI processing
- Data retention policies