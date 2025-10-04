// Ready Player Me API Configuration
const RPM_API_BASE_URL = 'https://api.readyplayer.me/v1';
const RPM_API_KEY = process.env.EXPO_PUBLIC_READY_PLAYER_ME_API_KEY || 'sk_live_UlLAAbK9BM_RPS6a4LETQzYP5efN_v9QWvJ4';

export interface RPMAvatarOptions {
  bodyType: 'male' | 'female';
  outfitGender: 'masculine' | 'feminine';
  style: 'realistic' | 'cartoon' | 'anime';
  userId: string; // Required by RPM API
}

export interface RPMAvatarResponse {
  id: string;
  url: string;
  thumbnail: string;
  metadata?: any;
  userId: string;
  accessToken: string; // Add access token for GLB fetching
}

class ReadyPlayerMeService {
  private static instance: ReadyPlayerMeService;

  private constructor() {}

  public static getInstance(): ReadyPlayerMeService {
    if (!ReadyPlayerMeService.instance) {
      ReadyPlayerMeService.instance = new ReadyPlayerMeService();
    }
    return ReadyPlayerMeService.instance;
  }

  /**
   * Create an anonymous user and get access token
   */
  async createAnonymousUser(): Promise<{ userId: string; accessToken: string } | null> {
    try {
      console.log('🚀 Creating anonymous user...');

      const response = await fetch(`${RPM_API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'x-api-key': 'sk_live_PG2jrhx34N2KX9ypKFbJaAJfimV_aJWnl1q7',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            applicationId: '68dfd26fc47722eb43316fc7',
            "requestToken": true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RPM Anonymous User Error:', response.status, errorText);
        throw new Error(`Failed to create anonymous user: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Anonymous user created successfully:', data);
      console.log('🔍 Available fields in data.data:', Object.keys(data.data));
      console.log('🔍 Looking for token field:', data.data.token);

      return {
        userId: data.data.id,
        accessToken: data.data.token || data.data.accessToken || data.token || null,
      };
    } catch (error) {
      console.error('❌ Error creating anonymous user:', error);
      return null;
    }
  }

  /**
   * Fetch all possible avatar templates
   */
  async fetchTemplates(accessToken: string): Promise<any[] | null> {
    try {
      console.log('🚀 Fetching avatar templates...');

      const response = await fetch(`${RPM_API_BASE_URL.replace('/v1', '/v2')}/avatars/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RPM Templates Error:', response.status, errorText);
        throw new Error(`Failed to fetch templates: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Templates fetched successfully:', data);

      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      return null;
    }
  }

  /**
   * Fetch avatar GLB file
   */
  async fetchAvatarGLB(avatarId: string): Promise<string | null> {
    try {
      console.log('🚀 Fetching avatar GLB file...');

      // According to docs: GET https://api.readyplayer.me/v2/avatars/[avatar-id].glb?preview=true
      // No authentication required for this endpoint
      const glbUrl = `https://api.readyplayer.me/v2/avatars/${avatarId}.glb?preview=true`;
      console.log('✅ Avatar GLB URL:', glbUrl);

      return glbUrl;
    } catch (error) {
      console.error('❌ Error fetching avatar GLB:', error);
      return null;
    }
  }

  /**
   * Save avatar update using PUT method
   */
  async saveAvatarUpdate(avatarId: string, accessToken: string, updateData: any): Promise<boolean> {
    try {
      console.log('🚀 Saving avatar update...');

      const response = await fetch(`https://api.readyplayer.me/v2/avatars/${avatarId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RPM Save Error:', response.status, errorText);
        throw new Error(`Failed to save avatar: ${response.status} ${errorText}`);
      }

      console.log('✅ Avatar saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving avatar:', error);
      return false;
    }
  }

  /**
   * Fetch final saved avatar GLB file
   */
  async fetchFinalAvatarGLB(avatarId: string): Promise<string | null> {
    try {
      console.log('🚀 Fetching final avatar GLB file...');

      // According to docs: GET https://models.readyplayer.me/[avatar-id].glb
      // No authentication required for this endpoint
      const glbUrl = `https://models.readyplayer.me/${avatarId}.glb`;
      console.log('✅ Final Avatar GLB URL:', glbUrl);

      return glbUrl;
    } catch (error) {
      console.error('❌ Error fetching final avatar GLB:', error);
      return null;
    }
  }

  /**
   * Generate a new avatar using Ready Player Me API
   */
  async generateAvatar(options: RPMAvatarOptions): Promise<RPMAvatarResponse | null> {
    try {
      console.log('🚀 Generating RPM avatar with options:', options);

      // First create anonymous user to get access token
      const userData = await this.createAnonymousUser();
      if (!userData) {
        throw new Error('Failed to create anonymous user');
      }

      // Fetch available templates
      const templates = await this.fetchTemplates(userData.accessToken);
      if (!templates || templates.length === 0) {
        throw new Error('Failed to fetch templates');
      }

      // Select first template (you can modify this logic later)
      const selectedTemplate = templates[0];
      console.log('🎯 Selected template:', selectedTemplate);

      const response = await fetch(`${RPM_API_BASE_URL.replace('/v1', '/v2')}/avatars/templates/${selectedTemplate.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            partner: 'finishit-m3zj13',
            bodyType: 'fullbody'
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RPM API Error:', response.status, errorText);
        throw new Error(`Failed to generate avatar: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ RPM avatar generated successfully:', data);
      console.log('🔍 Raw avatar ID:', data.data.id);
      console.log('🔍 Full response data:', JSON.stringify(data, null, 2));

      return {
        id: data.data.id || `rpm_${Date.now()}`,
        url: data.url || '',
        thumbnail: data.thumbnail || data.url || '',
        metadata: data.metadata,
        userId: data.userId || '',
        accessToken: userData.accessToken,
      };
    } catch (error) {
      console.error('❌ Error generating RPM avatar:', error);
      return null;
    }
  }

  /**
   * Get avatar GLB file URL
   */
  getAvatarGLBUrl(avatarId: string): string {
    return `https://api.readyplayer.me/v2/avatars/${avatarId}.glb?preview=true`;
  }

  /**
   * Get avatar preview URL
   */
  getAvatarPreviewUrl(avatarId: string): string {
    return `https://api.readyplayer.me/v2/avatars/${avatarId}.glb?preview=true`;
  }
}

export const readyPlayerMeService = ReadyPlayerMeService.getInstance();