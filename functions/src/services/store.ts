import axios from "axios";
import {bucket} from "./firebase";
import {logger} from "firebase-functions/v1";

const prefixImagePath = "images";

const getBufferData = async (url: string) => {
  return await axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => Buffer.from(response.data, "binary"));
};

const uploadFile = async (bufferData: Buffer, middle: string, dest: string) => {
  await bucket
    .file(`${prefixImagePath}/${middle}/${dest}`)
    .save(bufferData);
};

export const saveMadoriImage = async (dateStr: string, roomId: string, madoriImage: string) => {
  const bufferData = await getBufferData(madoriImage);

  const filename = `${roomId}/${dateStr}.gif`;

  logger.debug({
    type: "saveMadoriImage",
    status: "process",
    filename,
  });

  await uploadFile(bufferData, "madori", filename);
};
