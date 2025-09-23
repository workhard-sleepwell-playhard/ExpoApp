const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDocs, deleteDoc, addDoc, setDoc } = require('firebase/firestore');

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyAUlkrFLVoOHY_C4f29egp0IFtw57876z4",
  authDomain: "finishit-c324d.firebaseapp.com",
  projectId: "finishit-c324d",
  storageBucket: "finishit-c324d.firebasestorage.app",
  messagingSenderId: "197633895426",
  appId: "1:197633895426:web:93c6d590262769ed108b1b",
  measurementId: "G-7B72X70Q1P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to clear a collection
async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  console.log(`✅ Cleared ${snapshot.docs.length} documents from ${collectionName}`);
}

// Initialize categories with updated structure
async function initializeCategories() {
  const categories = [
    {
      name: 'Work',
      icon: '💼',
      color: '#007AFF',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Personal',
      icon: '🏠',
      color: '#34C759',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Health',
      icon: '💪',
      color: '#FF3B30',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Learning',
      icon: '📚',
      color: '#FF9500',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Finance',
      icon: '💰',
      color: '#FFCC00',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Other',
      icon: '📝',
      color: '#8E8E93',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    }
  ];

  console.log('Initializing categories...');
  for (const category of categories) {
    try {
      const categoryRef = doc(collection(db, 'categories'));
      await setDoc(categoryRef, category);
      console.log(`✓ Category "${category.name}" created with ID: ${categoryRef.id}`);
    } catch (error) {
      console.error(`✗ Error creating category "${category.name}":`, error);
    }
  }
}

// Initialize tags with updated structure
async function initializeTags() {
  const tags = [
    {
      name: 'urgent',
      color: '#FF3B30',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'important',
      color: '#FF9500',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'not important',
      color: '#FF9500',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'break',
      color: '#FF9500',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'review',
      color: '#007AFF',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'meeting',
      color: '#34C759',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'presentation',
      color: '#8E8E93',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    }
  ];

  console.log('Initializing tags...');
  for (const tag of tags) {
    try {
      const tagRef = doc(collection(db, 'tags'));
      await setDoc(tagRef, tag);
      console.log(`✓ Tag "${tag.name}" created with ID: ${tagRef.id}`);
    } catch (error) {
      console.error(`✗ Error creating tag "${tag.name}":`, error);
    }
  }
}

// Initialize achievement badges with updated structure
async function initializeAchievementBadges() {
  const achievementBadges = [
    {
      title: 'First Task',
      description: 'Complete your first task',
      icon: '🎯',
      category: 'task',
      rarity: 'common',
      points: 10,
      badgeType: 'completion',
      badgeProgressTarget: 1,
      createdAt: new Date()
    },
    {
      title: 'Task Master',
      description: 'Complete 100 tasks',
      icon: '🏆',
      category: 'task',
      rarity: 'rare',
      points: 100,
      badgeType: 'milestone',
      badgeProgressTarget: 100,
      createdAt: new Date()
    },
    {
      title: 'Streak Master',
      description: 'Maintain a 7-day task completion streak',
      icon: '🔥',
      category: 'streak',
      rarity: 'epic',
      points: 50,
      badgeType: 'streak',
      badgeProgressTarget: 7,
      createdAt: new Date()
    },
    {
      title: 'Early Bird',
      description: 'Complete 5 tasks before 9 AM',
      icon: '🌅',
      category: 'productivity',
      rarity: 'rare',
      points: 30,
      badgeType: 'time-based',
      badgeProgressTarget: 5,
      createdAt: new Date()
    },
    {
      title: 'Social Butterfly',
      description: 'Make 10 posts in the community',
      icon: '🦋',
      category: 'social',
      rarity: 'common',
      points: 25,
      badgeType: 'social',
      badgeProgressTarget: 10,
      createdAt: new Date()
    }
  ];

  console.log('Initializing achievement badges...');
  for (const badge of achievementBadges) {
    try {
      const badgeRef = doc(collection(db, 'achievementBadges'));
      await setDoc(badgeRef, badge);
      console.log(`✓ Achievement badge "${badge.title}" created with ID: ${badgeRef.id}`);
    } catch (error) {
      console.error(`✗ Error creating achievement badge "${badge.title}":`, error);
    }
  }
}

// Main cleanup and reinitialize function
async function cleanupAndReinit() {
  try {
    console.log('🚀 Starting Firebase cleanup and reinitialize...\n');
    
    // Clear existing collections
    await clearCollection('categories');
    await clearCollection('tags');
    await clearCollection('achievementBadges');
    
    console.log('');
    
    // Reinitialize with clean data
    await initializeCategories();
    console.log('');
    
    await initializeTags();
    console.log('');
    
    await initializeAchievementBadges();
    console.log('');
    
    console.log('✅ Firebase cleanup and reinitialize completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup and reinitialize:', error);
    process.exit(1);
  }
}

// Run the cleanup and reinitialize
cleanupAndReinit();
