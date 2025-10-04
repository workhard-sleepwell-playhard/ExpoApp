import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Asset } from 'expo-asset';
import { ThemedText } from '@/components/themed-text';


interface Avatar3DRendererProps {
  avatarUrl?: string;
  accessToken?: string; // Add access token for authentication
  size?: number;
  style?: any;
  showBackground?: boolean;
  isLoading?: boolean;
  onLoadComplete?: () => void;
  onLoadError?: (error: string) => void;
}

export const Avatar3DRenderer: React.FC<Avatar3DRendererProps> = ({
  avatarUrl,
  accessToken,
  size = 200,
  style,
  showBackground = true,
  isLoading = false,
  onLoadComplete,
  onLoadError,
}) => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Initialize the 3D scene
  const onContextCreate = async (gl: any) => {
    try {
      // Create renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0);
      // Note: Shadow map properties may not be available in expo-three
      // renderer.shadowMap.enabled = true;
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      // Note: castShadow may not be available in expo-three
      // directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Add background if requested
      if (showBackground) {
        const backgroundGeometry = new THREE.SphereGeometry(10, 32, 32);
        const backgroundMaterial = new THREE.MeshBasicMaterial({
          color: 0xf0f0f0,
          side: THREE.BackSide,
        });
        const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        scene.add(background);
      }

      // Load model if URL is provided
      if (avatarUrl) {
        await loadModel(avatarUrl);
      }

      // Start render loop
      const render = () => {
        try {
          if (sceneRef.current && cameraRef.current && rendererRef.current) {
            // Rotate the model slowly
            if (modelRef.current) {
              modelRef.current.rotation.y += 0.01;
            }
            
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            animationIdRef.current = requestAnimationFrame(render);
          }
        } catch (renderError) {
          console.error('❌ Avatar3DRenderer - Render loop error:', renderError);
          console.error('❌ Avatar3DRenderer - Render error stack:', renderError.stack);
          
          // Stop the animation loop
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
          }
          
          // Set error state to stop further rendering attempts
          setLoadError('3D rendering failed due to shader error');
          setIsModelLoading(false);
          onLoadError?.('3D rendering failed due to shader error');
        }
      };
      render();

    } catch (error) {
      console.error('Error initializing 3D scene:', error);
      setLoadError('Failed to initialize 3D scene');
      onLoadError?.('Failed to initialize 3D scene');
    }
  };

  // Load 3D model from URL
  const loadModel = async (url: string) => {
    try {
      console.log('🔍 Avatar3DRenderer - Starting loadModel with URL:', url);
      console.log('🔍 Avatar3DRenderer - Access token available:', !!accessToken);
      setIsModelLoading(true);
      setLoadError(null);

      let asset;
      // TEST: Try direct URL approach (skip blob creation)
      console.log('🔍 Avatar3DRenderer - TEST: Using direct URL approach');
      console.log('🔍 Avatar3DRenderer - Direct URL:', url);
      asset = Asset.fromURI(url);

      console.log('🔍 Avatar3DRenderer - Asset created:', {
        uri: asset.uri,
        localUri: asset.localUri,
        name: asset.name
      });

      console.log('🔍 Avatar3DRenderer - Starting asset download...');
      await asset.downloadAsync();
      console.log('🔍 Avatar3DRenderer - Asset download completed');

      // Create GLTFLoader
      console.log('🔍 Avatar3DRenderer - Creating GLTFLoader...');
      const loader = new GLTFLoader();
      
      // Load the model
      console.log('🔍 Avatar3DRenderer - Starting GLTFLoader.load with:', asset.localUri || asset.uri);
      loader.load(
        asset.localUri || asset.uri,
        (gltf) => {
          console.log('✅ Avatar3DRenderer - GLTF model loaded successfully:', gltf);
          
          // Remove existing model
          if (modelRef.current && sceneRef.current) {
            sceneRef.current.remove(modelRef.current);
          }

          // Add new model
          modelRef.current = gltf.scene;
          
          // Scale the model to fit nicely in the view
          const box = new THREE.Box3().setFromObject(modelRef.current);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          
          modelRef.current.scale.setScalar(scale);
          modelRef.current.position.sub(center.multiplyScalar(scale));
          
          sceneRef.current?.add(modelRef.current);
          
          setIsModelLoading(false);
          onLoadComplete?.();
        },
        (progress) => {
          console.log('🔍 Avatar3DRenderer - Loading progress:', {
            loaded: progress.loaded,
            total: progress.total,
            percentage: (progress.loaded / progress.total) * 100 + '%'
          });
        },
        (error) => {
          console.error('❌ Avatar3DRenderer - Error loading GLTF model:', error);
          console.error('❌ Avatar3DRenderer - Error details:', {
            message: error.message,
            type: error.type,
            target: error.target,
            url: asset.localUri || asset.uri
          });
          setLoadError('Failed to load 3D model');
          setIsModelLoading(false);
          onLoadError?.('Failed to load 3D model');
        }
      );

    } catch (error: any) {
      console.error('❌ Avatar3DRenderer - Catch block error:', error);
      console.error('❌ Avatar3DRenderer - Error stack:', error.stack);
      setLoadError('Failed to load 3D model');
      setIsModelLoading(false);
      onLoadError?.('Failed to load 3D model');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Load model when URL changes
  useEffect(() => {
    console.log('🔍 Avatar3DRenderer - useEffect triggered with:', {
      avatarUrl,
      hasScene: !!sceneRef.current,
      hasCamera: !!cameraRef.current
    });
    
    if (avatarUrl && sceneRef.current && cameraRef.current) {
      console.log('🔍 Avatar3DRenderer - Calling loadModel with URL:', avatarUrl);
      loadModel(avatarUrl);
    } else {
      console.log('🔍 Avatar3DRenderer - Not calling loadModel because:', {
        hasAvatarUrl: !!avatarUrl,
        hasScene: !!sceneRef.current,
        hasCamera: !!cameraRef.current
      });
    }
  }, [avatarUrl]);

  if (isLoading || isModelLoading) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading 3D Avatar...</ThemedText>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <ThemedText style={styles.errorText}>Failed to load 3D model</ThemedText>
        <ThemedText style={styles.errorSubtext}>{loadError}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
        msaaSamples={4}
        enableExperimentalWorkletSupport={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
