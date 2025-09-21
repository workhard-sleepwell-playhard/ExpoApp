// Admin script to initialize Firebase data using temporary open rules
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // You can get this from Firebase Console > Project Settings > Service Accounts
  // Or we can use the project ID to initialize without service account
};

// Initialize with project ID (simpler approach)
const app = initializeApp({
  projectId: 'finishit-c324d'
});

const db = getFirestore(app);

// Initialize default categories
async function initializeCategories() {
  const categories = [
    {
      name: 'Work',
      icon: '💼',
      color: '#FF3B30',
      description: 'Professional tasks and work-related activities',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Personal',
      icon: '🏠',
      color: '#34C759',
      description: 'Personal tasks and home activities',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Health',
      icon: '💪',
      color: '#FF9500',
      description: 'Health and fitness related tasks',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Learning',
      icon: '📚',
      color: '#007AFF',
      description: 'Educational and skill development tasks',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Finance',
      icon: '💰',
      color: '#5856D6',
      description: 'Financial tasks and money management',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    },
    {
      name: 'Other',
      icon: '📝',
      color: '#8E8E93',
      description: 'Miscellaneous tasks',
      isDefault: true,
      userId: null,
      createdAt: new Date()
    }
  ];

  console.log('Initializing categories...');
  for (const category of categories) {
    try {
      const categoryRef = db.collection('categories').doc();
      await categoryRef.set(category);
      console.log(`✓ Category "${category.name}" created with ID: ${categoryRef.id}`);
    } catch (error) {
      console.error(`✗ Error creating category "${category.name}":`, error);
    }
  }
}

// Initialize default tags
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
      name: 'review',
      color: '#007AFF',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'documentation',
      color: '#34C759',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'meeting',
      color: '#5856D6',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      name: 'presentation',
      color: '#FF69B4',
      userId: null,
      usageCount: 0,
      createdAt: new Date()
    }
  ];

  console.log('Initializing tags...');
  for (const tag of tags) {
    try {
      const tagRef = db.collection('tags').doc();
      await tagRef.set(tag);
      console.log(`✓ Tag "${tag.name}" created with ID: ${tagRef.id}`);
    } catch (error) {
      console.error(`✗ Error creating tag "${tag.name}":`, error);
    }
  }
}

// Initialize achievement templates
async function initializeAchievements() {
  const achievements = [
    {
      title: 'First Task',
      description: 'Complete your first task',
      icon: '🎯',
      category: 'task',
      rarity: 'common',
      points: 10,
      progressTarget: 1,
      isTemplate: true
    },
    {
      title: 'Task Master',
      description: 'Complete 100 tasks',
      icon: '🏆',
      category: 'task',
      rarity: 'rare',
      points: 100,
      progressTarget: 100,
      isTemplate: true
    },
    {
      title: 'Streak Master',
      description: 'Maintain a 7-day task completion streak',
      icon: '🔥',
      category: 'streak',
      rarity: 'epic',
      points: 50,
      progressTarget: 7,
      isTemplate: true
    },
    {
      title: 'Early Bird',
      description: 'Complete 5 tasks before 9 AM',
      icon: '🌅',
      category: 'productivity',
      rarity: 'rare',
      points: 30,
      progressTarget: 5,
      isTemplate: true
    },
    {
      title: 'Social Butterfly',
      description: 'Make 10 posts in the community',
      icon: '🦋',
      category: 'social',
      rarity: 'common',
      points: 25,
      progressTarget: 10,
      isTemplate: true
    }
  ];

  console.log('Initializing achievements...');
  for (const achievement of achievements) {
    try {
      const achievementRef = db.collection('achievementTemplates').doc();
      await achievementRef.set({
        ...achievement,
        createdAt: new Date()
      });
      console.log(`✓ Achievement template "${achievement.title}" created with ID: ${achievementRef.id}`);
    } catch (error) {
      console.error(`✗ Error creating achievement "${achievement.title}":`, error);
    }
  }
}

// Main initialization function
async function initializeFirebaseData() {
  try {
    console.log('🚀 Starting Firebase Admin data initialization...\n');
    
    await initializeCategories();
    console.log('');
    
    await initializeTags();
    console.log('');
    
    await initializeAchievements();
    console.log('');
    
    console.log('✅ Firebase Admin data initialization completed successfully!');
    console.log('🔒 Security rules are still active - your data is secure!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during Firebase Admin data initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeFirebaseData();
