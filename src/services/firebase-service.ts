import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface User {
  userId: string;
  email: string;
  displayName: string;
  avatar?: string;
  username?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    privacy: 'public' | 'private';
    language: string;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    totalPoints: number;
    level: number;
    experience: number;
  };
  settings: {
    pomodoroLength: number;
    shortBreak: number;
    longBreak: number;
    dailyGoal: number;
    workHours: {
      start: string;
      end: string;
    };
  };
}

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: Timestamp;
  dueTime?: string;
  tags?: string[];
  subtasks?: Subtask[];
  timeSpent: number;
  estimatedTime?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  isSelected: boolean;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
}

export interface Post {
  postId: string;
  userId: string;
  content: string;
  type: 'general' | 'achievement' | 'task' | 'question';
  images?: string[];
  videos?: string[];
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  hashtags?: string[];
  mentions?: string[];
  relatedTaskId?: string;
  achievementId?: string;
}

export interface Category {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isDefault: boolean;
  userId?: string;
  createdAt: Timestamp;
}

export interface Tag {
  tagId: string;
  name: string;
  color: string;
  userId?: string;
  usageCount: number;
  createdAt: Timestamp;
}

// User Service
export class UserService {
  static async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as User) : null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async listenToUser(userId: string, callback: (user: User | null) => void): Promise<() => void> {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      callback(doc.exists() ? (doc.data() as User) : null);
    });
  }
}

// Task Service
export class TaskService {
  static async createTask(taskData: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getTask(taskId: string): Promise<Task | null> {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    return taskSnap.exists() ? { taskId, ...taskSnap.data() } as Task : null;
  }

  static async getTasksByUser(userId: string, limitCount: number = 50): Promise<Task[]> {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() } as Task));
  }

  static async getTasksByCategory(userId: string, category: string): Promise<Task[]> {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() } as Task));
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  }

  static listenToUserTasks(userId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({ taskId: doc.id, ...doc.data() } as Task));
      callback(tasks);
    });
  }
}

// Post Service
export class PostService {
  static async createPost(postData: Omit<Post, 'postId' | 'createdAt' | 'updatedAt' | 'engagement'>): Promise<string> {
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      ...postData,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getPosts(limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  static async getPostsByUser(userId: string, limitCount: number = 20): Promise<Post[]> {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
  }

  static listenToPosts(callback: (posts: Post[]) => void): () => void {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
      callback(posts);
    });
  }
}

// Category Service
export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const q = query(
      categoriesRef,
      orderBy('isDefault', 'desc'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ categoryId: doc.id, ...doc.data() } as Category));
  }

  static async getDefaultCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const q = query(
      categoriesRef,
      where('isDefault', '==', true),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ categoryId: doc.id, ...doc.data() } as Category));
  }
}

// Tag Service
export class TagService {
  static async getTags(): Promise<Tag[]> {
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, orderBy('usageCount', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ tagId: doc.id, ...doc.data() } as Tag));
  }

  static async getPopularTags(limitCount: number = 20): Promise<Tag[]> {
    const tagsRef = collection(db, 'tags');
    const q = query(
      tagsRef,
      orderBy('usageCount', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ tagId: doc.id, ...doc.data() } as Tag));
  }
}

// Utility functions
export const FirebaseUtils = {
  // Convert Firestore timestamp to JavaScript Date
  timestampToDate: (timestamp: Timestamp): Date => timestamp.toDate(),
  
  // Convert JavaScript Date to Firestore timestamp
  dateToTimestamp: (date: Date): Timestamp => Timestamp.fromDate(date),
  
  // Get current timestamp
  getCurrentTimestamp: (): Timestamp => Timestamp.now(),
  
  // Format timestamp for display
  formatTimestamp: (timestamp: Timestamp): string => {
    return timestamp.toDate().toLocaleDateString();
  }
};
