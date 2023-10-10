import {db} from "../services/db";

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
  return data;
};

export const getDocument = async<T>({
  collection,
  id,
}: {
  collection: string
  id: string
}): Promise<T|undefined> => {
  const readSnapshot = await db.collection(collection).doc(id).get();
  const readData = readSnapshot.data() as T;

  return readData;
};

export const getAllDocuments = async<T>({
  collection,
}: {
  collection: string
}): Promise<T[]> => {
  const readSnapshot = await db.collection(collection).get();
  return readSnapshot.docs.map((doc)=> doc.data() as T);
};

export const getDocuments = async<T>({
  collection,
  date,
}: {
  collection: string
  date: string
}): Promise<T[]> => {
  const readSnapshot = await db.collection(collection)
    .where("date", "==", date)
    .get();
  return readSnapshot.docs.map((doc)=> doc.data() as T);
};
