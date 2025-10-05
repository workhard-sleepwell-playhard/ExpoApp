# Ready Player Me Setup Guide

## 1. Get Your API Key

1. Go to [Ready Player Me Developers](https://readyplayer.me/developers)
2. Sign up or log in to your account
3. Create a new project
4. Copy your API key

## 2. Set Environment Variable

Create a `.env` file in your project root with:

```
EXPO_PUBLIC_READY_PLAYER_ME_API_KEY=your_actual_api_key_here
```

## 3. Test the Integration

The app will automatically:
- Generate a realistic male avatar when you open the profile tab
- Display the 3D model in the avatar area
- Show loading states while generating

## 4. Avatar Options

Current configuration:
- **Body Type**: `male`
- **Outfit Gender**: `masculine` 
- **Style**: `realistic`

## 5. API Endpoint

The integration uses:
- **POST** `https://api.readyplayer.me/v1/avatars`
- **Headers**: `Authorization: Bearer YOUR_API_KEY`
- **Body**: `{ "bodyType": "male", "outfitGender": "masculine", "style": "realistic" }`

## 6. Generated Avatar

The service will:
1. Call RPM API to generate avatar
2. Get the avatar ID from response
3. Construct GLB URL: `https://models.readyplayer.me/{avatarId}.glb`
4. Load the 3D model in the Avatar3DRenderer

