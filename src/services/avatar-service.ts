import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  query, 
  orderByChild, 
  equalTo, 
  serverTimestamp 
} from 'firebase/database';
import { realtimeDb } from '../utils/firebase/config';

// Avatar data structure
export interface AvatarBase {
  skinTone: string;
  bodyType: string;
}

export interface AvatarLayer {
  asset: string;
  color: string;
  position?: { x: number; y: number };
}

export interface AvatarFace {
  eyes?: AvatarLayer;
  mouth?: AvatarLayer;
  eyebrows?: AvatarLayer;
}

export interface AvatarClothing {
  top?: AvatarLayer;
  bottom?: AvatarLayer;
  shoes?: AvatarLayer;
}

export interface AvatarLayers {
  hair?: AvatarLayer;
  face?: AvatarFace;
  clothing?: AvatarClothing;
  accessories?: AvatarLayer[];
}

export interface AvatarData {
  userId: string;
  avatarId: string;
  base: AvatarBase;
  layers: AvatarLayers;
  version: string;
  lastUpdated: any;
}

// Default avatar configuration
export const DEFAULT_AVATAR: AvatarData = {
  userId: '',
  avatarId: '',
  base: {
    skinTone: 'medium',
    bodyType: 'average'
  },
  layers: {
    hair: {
      asset: 'default_hair',
      color: '#8B4513'
    },
    face: {
      eyes: {
        asset: 'default_eyes',
        color: '#4A90E2'
      },
      mouth: {
        asset: 'default_mouth',
        color: '#E91E63'
      }
    },
    clothing: {
      top: {
        asset: 'default_shirt',
        color: '#FFFFFF'
      },
      bottom: {
        asset: 'default_pants',
        color: '#CCCCCC'
      }
    },
    accessories: []
  },
  version: '1.0',
  lastUpdated: null
};

export class AvatarService {
  private static instance: AvatarService;
  
  static getInstance(): AvatarService {
    if (!AvatarService.instance) {
      AvatarService.instance = new AvatarService();
    }
    return AvatarService.instance;
  }

  /**
   * Create a new avatar for a user
   */
  async createAvatar(userId: string, customLayers?: Partial<AvatarLayers>): Promise<AvatarData> {
    const avatarId = `avatar_${userId}_${Date.now()}`;
    
    const avatarData: AvatarData = {
      ...DEFAULT_AVATAR,
      userId,
      avatarId,
      layers: {
        ...DEFAULT_AVATAR.layers,
        ...customLayers
      },
      lastUpdated: serverTimestamp()
    };

    try {
      await set(ref(realtimeDb, `avatars/${avatarId}`), avatarData);
      console.log('✅ Avatar created:', avatarId);
      return avatarData;
    } catch (error) {
      console.error('❌ Error creating avatar:', error);
      throw error;
    }
  }

  /**
   * Get avatar data by avatarId
   */
  async getAvatar(avatarId: string): Promise<AvatarData | null> {
    try {
      const avatarRef = ref(realtimeDb, `avatars/${avatarId}`);
      const snapshot = await get(avatarRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val() as AvatarData;
        console.log('✅ Avatar fetched:', avatarId);
        return data;
      } else {
        console.log('⚠️ Avatar not found:', avatarId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching avatar:', error);
      throw error;
    }
  }

  /**
   * Update avatar layers
   */
  async updateAvatarLayers(avatarId: string, layers: Partial<AvatarLayers>): Promise<void> {
    try {
      const avatarRef = ref(realtimeDb, `avatars/${avatarId}`);
      await update(avatarRef, {
        layers: layers,
        lastUpdated: serverTimestamp()
      });
      console.log('✅ Avatar layers updated:', avatarId);
    } catch (error) {
      console.error('❌ Error updating avatar layers:', error);
      throw error;
    }
  }

  /**
   * Update specific layer (hair, clothing, etc.)
   */
  async updateLayer(avatarId: string, layerType: keyof AvatarLayers, layerData: any): Promise<void> {
    try {
      const avatarRef = ref(realtimeDb, `avatars/${avatarId}`);
      const updateData: any = {
        [`layers/${layerType}`]: layerData,
        lastUpdated: serverTimestamp()
      };
      
      await update(avatarRef, updateData);
      console.log(`✅ Avatar ${layerType} updated:`, avatarId);
    } catch (error) {
      console.error(`❌ Error updating avatar ${layerType}:`, error);
      throw error;
    }
  }

  /**
   * Listen to avatar changes in real-time
   */
  listenToAvatar(avatarId: string, callback: (avatar: AvatarData | null) => void): () => void {
    const avatarRef = ref(realtimeDb, `avatars/${avatarId}`);
    
    return onValue(avatarRef, (snapshot) => {
      if (snapshot.exists()) {
        const avatarData = snapshot.val() as AvatarData;
        callback(avatarData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('❌ Avatar listener error:', error);
      callback(null);
    });
  }

  /**
   * Get avatar by userId (assuming one avatar per user for now)
   */
  async getAvatarByUserId(userId: string): Promise<AvatarData | null> {
    try {
      const avatarsRef = ref(realtimeDb, 'avatars');
      const q = query(avatarsRef, orderByChild('userId'), equalTo(userId));
      
      const snapshot = await get(q);
      
      if (snapshot.exists()) {
        const avatars = snapshot.val();
        const avatarId = Object.keys(avatars)[0];
        const avatarData = avatars[avatarId] as AvatarData;
        console.log('✅ Avatar found for user:', userId);
        return avatarData;
      } else {
        console.log('⚠️ No avatar found for user:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching avatar by userId:', error);
      throw error;
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(avatarId: string): Promise<void> {
    try {
      const avatarRef = ref(realtimeDb, `avatars/${avatarId}`);
      await remove(avatarRef);
      console.log('✅ Avatar deleted:', avatarId);
    } catch (error) {
      console.error('❌ Error deleting avatar:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const avatarService = AvatarService.getInstance();
