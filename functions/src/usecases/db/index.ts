import {logger} from "firebase-functions/v1";
import {db} from "../../services/firebase";

// Each batch of writes can write to a maximum of 500 documents.
const limit = 500;

export const saveBatchCommit = async<A extends FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>, T extends {
  docId: string
  data: A
}> (
  collection: string,
  list: T[],
): Promise<T[]> => {
  let total = 0;

  if (list.length === 0) {
    return [];
  }

  try {
    let batch = db.batch();

    for (const info of list) {
      total++;

      const id = info.docId;

      const docRef = db.collection(collection).doc(id);
      batch.set(docRef, info.data);

      if (total % limit === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
    await batch.commit();

    return list;
  } catch (error) {
    logger.error(error);
    return [];
  }
};
