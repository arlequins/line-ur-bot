import {create, isAxiosError} from "axios";
import {logger} from "firebase-functions/v1";
import {UR_BASE_API_URL} from "../../constants/ur";
import {LeadTimeSearchOptions} from "../../constants";
import {PayloadUrAreaList, PayloadUrRoomList, ResponseLeadTime} from "../../types/api";

const instance = create({
  baseURL: UR_BASE_API_URL,
  timeout: 10_000,
});

export const fetchAreaList = async<T>(payload: PayloadUrAreaList) => {
  try {
    logger.info({
      message: "fetchAreaList request",
      base: UR_BASE_API_URL,
      url: "/bukken/search/list_bukken/",
      payload,
    });

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
    logger.info({
      message: "fetchRoomList request",
      base: UR_BASE_API_URL,
      url: "/room/list/",
      payload,
    });

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

export const fetchLeadTimeList = async (search: LeadTimeSearchOptions): Promise<ResponseLeadTime[] | null> => {
  try {
    const params = new URLSearchParams();
    params.append("rent_low", "");
    params.append("rent_high", `${search.rentHigh}`);
    search.rooms.forEach((room) => params.append("room", room));
    params.append("walk", "");
    params.append("floorspace_low", "");
    params.append("floorspace_high", "");
    params.append("years", search.year);
    if (search.requiresUnderfloorHeating) {
      params.append("facility_hotfloor", "1");
    }
    params.append("mode", "leadtime");
    params.append("block", "kanto");
    search.prefectureCodes.forEach((prefectureCode) => params.append("tdfk", prefectureCode));
    params.append("rireki_tdfk", "13");
    params.append("orderByField", "1");
    params.append("pageSize", "10");
    params.append("pageIndex", "0");
    params.append("danchi", "");
    params.append("shikibetu", "");
    params.append("pageIndexRoom", "0");
    params.append("sp", "");

    const fetchPage = async (pageIndex: number) => {
      const pageParams = new URLSearchParams(params);
      pageParams.set("pageIndex", `${pageIndex}`);
      const response = await instance.post("/bukken/result/bukken_result/", pageParams);
      return response.data as ResponseLeadTime[];
    };

    const firstPage = await fetchPage(0);
    const pageMax = Number.parseInt(firstPage[0]?.pageMax ?? "1", 10);

    const pageCount = Math.min(pageMax, search.maximumPages);

    if (!Number.isInteger(pageCount) || pageCount <= 1) {
      return firstPage;
    }

    const remainingPages = await Promise.all(
      Array.from({length: pageCount - 1}, (_, index) => fetchPage(index + 1))
    );

    return firstPage.concat(...remainingPages);
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
