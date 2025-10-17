import type { User } from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getFirebaseFirestore, isFirebaseConfigured } from './firebase';

const FALLBACK_COLLECTION_NAME = 'pushTokens';

const configuredCollectionName =
  typeof process.env.NEXT_PUBLIC_FIREBASE_TOKENS_COLLECTION === 'string'
    ? process.env.NEXT_PUBLIC_FIREBASE_TOKENS_COLLECTION.trim()
    : undefined;

const collectionName = configuredCollectionName?.length
  ? configuredCollectionName
  : FALLBACK_COLLECTION_NAME;

function ensureFirestore() {
  if (!isFirebaseConfigured) {
    return undefined;
  }

  return getFirebaseFirestore();
}

export async function persistPushToken(token: string, user: User | null): Promise<boolean> {
  const firestore = ensureFirestore();
  if (!firestore) {
    return false;
  }

  if (!token) {
    return false;
  }

  try {
    const ref = doc(firestore, collectionName, token);
    await setDoc(
      ref,
      {
        token,
        updatedAt: serverTimestamp(),
        user: user
          ? {
              uid: user.uid,
              email: user.email ?? null,
              displayName: user.displayName ?? null,
            }
          : null,
      },
      { merge: true },
    );
    return true;
  } catch (error) {
    console.error('Failed to persist Firebase messaging token', error);
    return false;
  }
}

export async function deletePushToken(token: string): Promise<boolean> {
  const firestore = ensureFirestore();
  if (!firestore) {
    return false;
  }

  if (!token) {
    return false;
  }

  try {
    const ref = doc(firestore, collectionName, token);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Failed to delete Firebase messaging token', error);
    return false;
  }
}
