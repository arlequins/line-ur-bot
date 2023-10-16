import axios from "axios";
import {bucket} from "./firebase";
import {setDay} from "../utils/date";
import {DocImageMadoriRoom} from "../types";
import {Dayjs} from "dayjs";
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

export const saveMadoriImage = async (date: Dayjs, dateStr: string, roomId: string, madoriImage: string, docImageMadori?: DocImageMadoriRoom) => {
  if (docImageMadori) {
    const lastSavedDate = docImageMadori.dates[docImageMadori.dates.length - 1];
    const lastDate = setDay(lastSavedDate);

    if (date.diff(lastDate, "days") < 30) {
      logger.debug({
        type: "saveMadoriImage",
        status: "skip",
      });
      return;
    }
  }

  const bufferData = await getBufferData(madoriImage);

  const filename = `${roomId}/${dateStr}.gif`;

  logger.debug({
    type: "saveMadoriImage",
    status: "process",
    filename,
  });

  await uploadFile(bufferData, "madori", filename);
};
