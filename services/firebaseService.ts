import {
    collection,
    doc,
    getDocs,
    setDoc,
    writeBatch,
    deleteDoc,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { LinkItem, TodoItem, Category } from '../types';

// ─── Links ───────────────────────────────────────────────

export const saveLinks = async (links: LinkItem[]): Promise<boolean> => {
    try {
        const batch = writeBatch(db);

        // Get existing docs to delete removed ones
        const snapshot = await getDocs(collection(db, 'links'));
        snapshot.docs.forEach((d) => batch.delete(d.ref));

        // Write all current links
        links.forEach((link) => {
            const ref = doc(db, 'links', link.id);
            batch.set(ref, link);
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Firebase saveLinks error:', error);
        return false;
    }
};

export const loadLinks = async (): Promise<LinkItem[] | null> => {
    try {
        const q = query(collection(db, 'links'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => d.data() as LinkItem);
    } catch (error) {
        console.error('Firebase loadLinks error:', error);
        return null;
    }
};

// ─── Todos ───────────────────────────────────────────────

export const saveTodos = async (todos: TodoItem[]): Promise<boolean> => {
    try {
        const batch = writeBatch(db);
        const snapshot = await getDocs(collection(db, 'todos'));
        snapshot.docs.forEach((d) => batch.delete(d.ref));

        todos.forEach((todo) => {
            const ref = doc(db, 'todos', todo.id);
            batch.set(ref, todo);
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Firebase saveTodos error:', error);
        return false;
    }
};

export const loadTodos = async (): Promise<TodoItem[] | null> => {
    try {
        const q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => d.data() as TodoItem);
    } catch (error) {
        console.error('Firebase loadTodos error:', error);
        return null;
    }
};

// ─── Categories ──────────────────────────────────────────

export const saveCategories = async (categories: Category[]): Promise<boolean> => {
    try {
        const batch = writeBatch(db);
        const snapshot = await getDocs(collection(db, 'categories'));
        snapshot.docs.forEach((d) => batch.delete(d.ref));

        categories.forEach((cat) => {
            const ref = doc(db, 'categories', cat.id);
            batch.set(ref, cat);
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Firebase saveCategories error:', error);
        return false;
    }
};

export const loadCategories = async (): Promise<Category[] | null> => {
    try {
        const snapshot = await getDocs(collection(db, 'categories'));
        if (snapshot.empty) return null;
        return snapshot.docs.map((d) => d.data() as Category);
    } catch (error) {
        console.error('Firebase loadCategories error:', error);
        return null;
    }
};

// ─── Connectivity Check ─────────────────────────────────

export const checkFirebaseConnection = async (): Promise<boolean> => {
    try {
        await getDocs(collection(db, '_health'));
        return true;
    } catch {
        return false;
    }
};
