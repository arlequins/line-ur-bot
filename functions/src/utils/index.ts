import {createHmac} from "crypto";

export const webhookValidation = (
  {
    headerSignature,
    channelSecret,
    body,
  }: {
    headerSignature: string;
    channelSecret: string;
    body: string;
  },
) => {
  if (!body) {
    return false;
  }

  const signature = createHmac("SHA256", channelSecret)
    .update(body, "utf-8")
    .digest("base64");

  // Compare x-line-signature request header and the signature
  return headerSignature === signature;
};

export const objectEqual = <T, X> (obj1: T, obj2: X) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const objectEqualLength = <T, X> (obj1: T, obj2: X) => {
  return JSON.stringify(obj1).length === JSON.stringify(obj2).length;
};
