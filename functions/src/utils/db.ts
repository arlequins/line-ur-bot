import { db } from "../services/db";

export const setDocument = async<T extends FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>>({
  collection,
  id,
  data,
}: {
  collection: string
  id: string
  data: T
}) => {
  await db.collection(collection).doc(id).set(data);
}

export const getDocument = async<T>({
  collection,
  id,
}: {
  collection: string
  id: string
}) => {
  const readSnapshot = await db.collection(collection).doc(id).get();
  const readData = readSnapshot.data() as T;

  return readData
}
