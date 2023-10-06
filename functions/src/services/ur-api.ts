import axios, {isAxiosError} from "axios";
import {PayloadUrAreaList, PayloadUrRoomList} from "../types";
import {logger} from "firebase-functions/v1";

const instance = axios.create({
  baseURL: "https://chintai.sumai.ur-net.go.jp/chintai/api/",
});

export const fetchAreaList = async<T>(payload: PayloadUrAreaList) => {
  try {
    const response = await instance.post("/bukken/search/list_bukken/", payload);

    return response.data as T;
  } catch (error) {
    if (isAxiosError(error)) {
      logger.error({
        name: error.name,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return null;
  }
};

export const fetchRoomList = async<T>(payload: PayloadUrRoomList) => {
  try {
    const response = await instance.post("/room/list/", payload);

    return response.data as T;
  } catch (error) {
    if (isAxiosError(error)) {
      logger.error({
        name: error.name,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return null;
  }
};
