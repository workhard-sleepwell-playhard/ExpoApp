import React from 'react';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import {View, StyleSheet} from 'react-native';
import avatar from '../../assets/images/glb/RPM modle.glb';
interface Avatar3DRendererProps {
  avatarUrl?: string;
  accessToken?: string;
  size?: number;
  style?: any;
  showBackground?: boolean;
  isLoading?: boolean;
  onLoadComplete?: () => void;
  onLoadError?: (error: string) => void;
}

// Simple GLB Model Component
const GLBModel = ({avatar}) =>{
  const { scene } = useGLTF(avatar);
  return <primitive object={scene} />;
}

export const Avatar3DRenderer: React.FC<Avatar3DRendererProps> = ({
  avatarUrl,
  accessToken,
  size = 300,
  style,
  showBackground = true,
  isLoading = false,
  onLoadComplete,
  onLoadError,
}) => {
  console.log('🔍 Avatar3DRenderer - avatarUrl:', avatarUrl);
  console.log('🔍 Avatar3DRenderer - accessToken:', accessToken ? 'Present' : 'Missing');
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
             <Canvas camera={{ position: [0, 0, 0.8], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <GLBModel avatar={avatar}/>
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});