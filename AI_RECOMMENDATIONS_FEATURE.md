# AI Purchase Recommendations Feature

## Overview

The AI Purchase Recommendations feature uses Claude AI to analyze your current inventory and provide intelligent suggestions for new items to purchase. This helps you:

- **Replenish low stock items** - Get reminded of items that need restocking
- **Fill inventory gaps** - Discover underrepresented categories
- **Find complementary products** - Expand your inventory strategically
- **Make data-driven decisions** - Purchase recommendations based on real inventory data

## How It Works

### 1. Data Collection
The system automatically gathers:
- Total inventory count
- Category distribution and stock levels
- Low stock alerts
- Inventory value by category
- Status breakdown (in stock, low stock, ordered, discontinued)

### 2. AI Analysis
Claude AI analyzes this data to:
- Identify critical gaps in your inventory
- Recognize patterns in stock levels
- Consider market trends and business needs
- Evaluate category balance and diversity

### 3. Smart Recommendations
Each recommendation includes:
- **Item Name**: Specific product suggestion
- **Category**: Product category
- **Priority**: High, Medium, or Low urgency
- **Type**:
  - 🔄 Replenishment - Restock existing items
  - 📈 Expansion - Grow into new categories
  - 🛒 Complementary - Add related products
- **Estimated Price**: Expected price range
- **Reason**: Clear explanation for why this purchase makes sense

## Features

### Real-time Analysis
- Analyzes current inventory state
- Updates recommendations based on latest data
- Considers stock levels and trends

### Priority-Based Sorting
- **High Priority** (Red): Critical restocking needs
- **Medium Priority** (Yellow): Important but not urgent
- **Low Priority** (Green): Strategic expansions

### Smart Caching
- Recommendations cached for 5 minutes
- Reduces API calls and costs
- Manual refresh available anytime

### Visual Interface
- Clean, modern card-based design
- Color-coded priority badges
- Type indicators with icons
- Price range display
- Detailed reasoning for each recommendation

## Usage

### Viewing Recommendations

1. Navigate to the Dashboard
2. Scroll to the "AI Purchase Recommendations" section
3. View automatically generated suggestions

### Refreshing Recommendations

Click the "Refresh" button to get updated recommendations based on current inventory.

### Understanding Recommendations

Each recommendation card shows:
```
[Item Name] [PRIORITY BADGE]
[Type Icon] [Category] [Price Range]
Explanation of why this item is recommended
```

### Acting on Recommendations

While recommendations are informational, you can:
- Use them to plan purchases
- Add suggested items to your inventory
- Track which recommendations you've acted on
- Export recommendations for procurement teams

## Technical Details

### API Endpoint
- **Route**: `/api/ai/recommendations`
- **Method**: GET
- **Response**: JSON array of recommendations
- **Cache**: 5 minutes (stale-while-revalidate)

### AI Model
- **Provider**: Anthropic Claude
- **Model**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Max Tokens**: 2000

### Component
- **Location**: `components/AIRecommendations.tsx`
- **Data Fetching**: SWR (client-side)
- **Updates**: Manual refresh + automatic revalidation

## Configuration

### Environment Variables

Ensure your `.env.local` file includes:
```env
ANTHROPIC_API_KEY=your_claude_api_key
```

Get your API key from: https://console.anthropic.com/

### Cost Considerations

- Each API call costs based on Claude API pricing
- Recommendations are cached for 5 minutes
- Average cost: ~$0.01-0.02 per analysis
- Manual refresh available to control costs

## Example Output

```json
[
  {
    "itemName": "Logitech MX Master 3S Wireless Mouse",
    "category": "Electronics",
    "reason": "Your electronics category is low on peripheral devices, and mice are essential items with consistent demand.",
    "estimatedPrice": "$80-$100",
    "priority": "high",
    "type": "expansion"
  },
  {
    "itemName": "HP 65 Black Ink Cartridge",
    "category": "Office Supplies",
    "reason": "Office supplies show low stock alerts. Printer cartridges are frequently needed items.",
    "estimatedPrice": "$25-$35",
    "priority": "high",
    "type": "replenishment"
  }
]
```

## Benefits

✅ **Save Time** - No manual analysis needed
✅ **Data-Driven** - Based on real inventory metrics
✅ **Proactive** - Identifies needs before stockouts
✅ **Strategic** - Suggests expansion opportunities
✅ **Intelligent** - AI considers market trends
✅ **Actionable** - Clear priorities and reasoning

## Future Enhancements

Potential improvements:
- Integration with online marketplaces for price comparison
- Vendor recommendations based on category
- Historical purchase pattern analysis
- Budget-aware recommendations
- Seasonal trend consideration
- Custom recommendation filters
- Export recommendations to CSV/PDF
- Integration with procurement systems

## Troubleshooting

### No Recommendations Showing
- Ensure you have inventory items in your database
- Check that ANTHROPIC_API_KEY is set correctly
- Verify API key has sufficient credits
- Check browser console for errors

### "Failed to load recommendations" Error
- Verify internet connection
- Check API key validity
- Review API rate limits
- Check Supabase connection

### Recommendations Seem Outdated
- Click the "Refresh" button
- Cache may still be active (5-minute TTL)
- Add/update inventory items to trigger new analysis

## Support

For issues or questions:
- Check the browser console for error messages
- Verify environment variables are set
- Review API logs in Anthropic console
- Check Supabase logs for database issues

---

**Built with ❤️ using Claude AI and Next.js**
