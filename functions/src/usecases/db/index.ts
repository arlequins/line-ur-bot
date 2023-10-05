import { logger } from "firebase-functions/v1";
import { UrHistory } from "../../types";
import { getDocument, setDocument } from "../../utils/db";

export const saveUrHistory = async({
  collection,
  id,
  data,
}: {
  collection: string,
  id: string,
  data: UrHistory,
}) => {
  const target = {
    collection,
    id,
  }

  await setDocument<UrHistory>({
    ...target,
    data,
  });
}

export const fetchUrHistory = async({
  collection,
  id,
}: {
  collection: string,
  id: string,
}):Promise<UrHistory> => {
  const target = {
    collection,
    id,
  }

  const info = await getDocument<UrHistory>(target);
  logger.debug({
    info
  })

  return info
}
